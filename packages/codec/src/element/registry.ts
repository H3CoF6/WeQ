/**
 * Element codec dispatch table.
 *
 * Decode path: read elementType (45002) off the wire, look it up here, and
 * delegate to that codec's `fromWire`. Unknown elementType → UnknownElement
 * wrapping the raw envelope (so re-serialize can put it back byte-for-byte).
 *
 * Encode path: switch on `el.kind` and delegate to the matching `toWire`.
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import * as text from './text';
import { ElementType, type Element, type UnknownElement } from './types';

interface ElementCodec<E extends Element> {
  fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): E;
  toWire(el: E): ProtoEncodeStructType<typeof ElementWire>;
}

const codecsByType: Partial<Record<ElementType, ElementCodec<Element>>> = {
  [ElementType.TEXT]: text as unknown as ElementCodec<Element>,
};

const codecsByKind: Record<string, ElementCodec<Element>> = {
  text: text as unknown as ElementCodec<Element>,
};

export function decodeElement(wire: ProtoDecodeStructType<typeof ElementWire>): Element {
  const type = wire.elementType ?? 0;
  const codec = codecsByType[type as ElementType];
  if (codec) return codec.fromWire(wire);
  return makeUnknown(wire, type);
}

export function encodeElement(el: Element): ProtoEncodeStructType<typeof ElementWire> {
  if (el.kind === 'unknown') return el.raw;
  const codec = codecsByKind[el.kind];
  if (!codec) {
    throw new Error(`No encoder registered for element kind: ${el.kind}`);
  }
  return codec.toWire(el);
}

function makeUnknown(
  wire: ProtoDecodeStructType<typeof ElementWire>,
  elementType: number,
): UnknownElement {
  return {
    kind: 'unknown',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    elementType,
    raw: wire as ProtoEncodeStructType<typeof ElementWire>,
  };
}
