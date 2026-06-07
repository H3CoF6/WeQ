/**
 * End-to-end tests against the 呜呜呜 sample bytes.
 *
 * Three paths exercised:
 *   1. Raw schema-free decode + SchemaIndex annotation — protolab's path.
 *   2. ProtoMsg(MsgBody).decode — Layer 1 round-trip wire decode.
 *   3. decodeElement — Layer 2 dispatch to TextElement.
 */

import { describe, it, expect } from 'vitest';
import { ProtoMsg } from '../src/core';
import { decode, SchemaIndex, annotate } from '../src/raw';
import { MsgBody } from '../src/proto/msg/common/body';
import { ElementWire } from '../src/proto/msg/common/element';
import { decodeElement, ElementType } from '../src/element';

const SAMPLE = new Uint8Array([
  0x82, 0xf6, 0x13, 0x21, 0xc8, 0xfc, 0x15, 0xa1, 0xd0, 0xe6, 0xa4, 0xd2, 0xb8, 0xb8, 0x80, 0x6a,
  0xd0, 0xfc, 0x15, 0x01, 0xea, 0x82, 0x16, 0x09, 0xe5, 0x91, 0x9c, 0xe5, 0x91, 0x9c, 0xe5, 0x91,
  0x9c, 0xf0, 0x82, 0x16, 0x00,
]);

describe('raw + schema annotation', () => {
  it('annotates the 40800 envelope via MsgBody schema', () => {
    const tree = decode(SAMPLE);
    const index = new SchemaIndex(MsgBody, 'msg/common/body.MsgBody');
    const annotated = annotate(tree, index);

    expect(annotated).toHaveLength(1);
    const env = annotated[0]!;
    expect(env.raw.tag).toBe(40800);
    expect(env.match.kind).toBe('matched');
    if (env.match.kind === 'matched') {
      expect(env.match.info.name).toBe('elements');
    }
    expect(env.children).toBeDefined();
  });

  it('annotates inner fields via ElementWire schema', () => {
    const tree = decode(SAMPLE);
    const index = new SchemaIndex(MsgBody, 'msg/common/body.MsgBody');
    const annotated = annotate(tree, index);

    const inner = annotated[0]!.children!;
    const byTag = new Map(inner.map((c) => [c.raw.tag, c]));

    const elementType = byTag.get(45002)!;
    expect(elementType.match.kind).toBe('matched');
    if (elementType.match.kind === 'matched') {
      expect(elementType.match.info.name).toBe('elementType');
      if (elementType.match.preferredGuess.kind === 'varint-uint64') {
        expect(elementType.match.preferredGuess.value).toBe(1n);
      }
    }

    const textContent = byTag.get(45101)!;
    expect(textContent.match.kind).toBe('matched');
    if (textContent.match.kind === 'matched') {
      expect(textContent.match.info.name).toBe('textContent');
      if (textContent.match.preferredGuess.kind === 'len-utf8') {
        expect(textContent.match.preferredGuess.value).toBe('呜呜呜');
      }
    }
  });
});

describe('typed decode via ProtoMsg + decodeElement', () => {
  it('parses the envelope into ElementWire structs', () => {
    const body = new ProtoMsg(MsgBody).decode(SAMPLE);
    expect(body.elements).toBeDefined();
    expect(body.elements).toHaveLength(1);

    const wire = body.elements![0]!;
    expect(wire.elementType).toBe(1);
    expect(wire.textContent).toBe('呜呜呜');
    expect(wire.elementId).toBe(7638353204859217953n);
    expect(wire.textReserve).toBe(0);
  });

  it('lifts the ElementWire into a TextElement via decodeElement', () => {
    const body = new ProtoMsg(MsgBody).decode(SAMPLE);
    const wire = body.elements![0]!;
    const el = decodeElement(wire);

    expect(el.kind).toBe('text');
    if (el.kind === 'text') {
      expect(el.content).toBe('呜呜呜');
      expect(el.elementId).toBe(7638353204859217953n);
      expect(el.reserve).toBe(0);
    }
  });

  it('falls back to UnknownElement for unregistered elementType', () => {
    const fakeWire = { elementType: 9999, elementId: 42n } as any;
    const el = decodeElement(fakeWire);
    expect(el.kind).toBe('unknown');
    if (el.kind === 'unknown') {
      expect(el.elementType).toBe(9999);
      expect(el.elementId).toBe(42n);
    }
  });
});

describe('ProtoField default behavior', () => {
  it('omits truly optional fields (no default) on encode round-trip', () => {
    const codec = new ProtoMsg(ElementWire);
    const bytes = codec.encode({
      elementId: 1n,
      elementType: ElementType.TEXT,
      textContent: 'hi',
    });
    const back = codec.decode(bytes);
    expect(back.elementType).toBe(1);
    expect(back.textContent).toBe('hi');
    expect(back.roaming).toBeUndefined();
    expect(back.msgSyncFlag).toBeUndefined();
  });
});
