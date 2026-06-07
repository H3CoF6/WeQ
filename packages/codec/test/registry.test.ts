/**
 * Demonstrate the full flow: bytes → raw decode → annotate with a schema.
 *
 * Uses the same "呜呜呜" sample but pretends we wrote a (deliberately
 * imperfect) schema for it, to exercise matched / unknown / type-mismatch
 * outcomes in one shot. Also covers the new inElement: false + default
 * fields added to ProtoField.
 */

import { describe, it, expect } from 'vitest';
import { ProtoField, ScalarType } from '../src/core';
import { decode, SchemaIndex, annotate } from '../src/raw';

const SAMPLE = new Uint8Array([
  0x82, 0xf6, 0x13, 0x21, 0xc8, 0xfc, 0x15, 0xa1, 0xd0, 0xe6, 0xa4, 0xd2, 0xb8, 0xb8, 0x80, 0x6a,
  0xd0, 0xfc, 0x15, 0x01, 0xea, 0x82, 0x16, 0x09, 0xe5, 0x91, 0x9c, 0xe5, 0x91, 0x9c, 0xe5, 0x91,
  0x9c, 0xf0, 0x82, 0x16, 0x00,
]);

// A user-written schema, mimicking the workflow:
//   - tag 40800: outer envelope (message)
//   - tag 45001: declared as INT32 — INTENTIONALLY WRONG, value is 9-byte → mismatch
//   - tag 45101: text (string) — should match cleanly
//   - tag 45002: not declared — should show unknown
//   - tag 45102: declared but inElement: false + default 0 (round-trip envelope flag)
const InnerSchema = {
  bigId: ProtoField(45001, ScalarType.INT32, { optional: true }), // wrong type on purpose
  text: ProtoField(45101, ScalarType.STRING, { optional: true }),
  trailingFlag: ProtoField(45102, ScalarType.BOOL, {
    optional: true,
    inElement: false,
    default: false,
  }),
};
const OuterSchema = {
  envelope: ProtoField(40800, () => InnerSchema, { optional: true }),
};

describe('raw + schema annotation', () => {
  it('annotates known, unknown, and mismatched fields', () => {
    const tree = decode(SAMPLE);
    const index = new SchemaIndex(OuterSchema, 'test.OuterSchema');
    const annotated = annotate(tree, index);

    expect(annotated).toHaveLength(1);
    const env = annotated[0]!;
    expect(env.match.kind).toBe('matched');

    expect(env.children).toBeDefined();
    const byTag = new Map(env.children!.map((c) => [c.raw.tag, c]));

    const bigId = byTag.get(45001)!;
    expect(bigId.match.kind).toBe('type-mismatch');
    if (bigId.match.kind === 'type-mismatch') {
      expect(bigId.match.reason).toContain('overflows');
    }

    const text = byTag.get(45101)!;
    expect(text.match.kind).toBe('matched');
    if (text.match.kind === 'matched') {
      expect(text.match.info.name).toBe('text');
      expect(text.match.info.inElement).toBe(true); // default
      expect(text.match.preferredGuess.kind).toBe('len-utf8');
      if (text.match.preferredGuess.kind === 'len-utf8') {
        expect(text.match.preferredGuess.value).toBe('呜呜呜');
      }
    }

    const trailing = byTag.get(45102)!;
    expect(trailing.match.kind).toBe('matched');
    if (trailing.match.kind === 'matched') {
      expect(trailing.match.info.inElement).toBe(false);
      expect(trailing.match.info.default).toBe(false);
      expect(trailing.match.preferredGuess.kind).toBe('varint-bool');
      if (trailing.match.preferredGuess.kind === 'varint-bool') {
        expect(trailing.match.preferredGuess.value).toBe(false);
      }
    }

    const unknown = byTag.get(45002)!;
    expect(unknown.match.kind).toBe('unknown');
  });

  it('defaults inElement to true when not specified', () => {
    const Schema = {
      a: ProtoField(1, ScalarType.STRING, { optional: true }),
    };
    const idx = new SchemaIndex(Schema, 'test.Schema');
    expect(idx.byTag.get(1)!.inElement).toBe(true);
    expect(idx.byTag.get(1)!.default).toBeUndefined();
  });
});
