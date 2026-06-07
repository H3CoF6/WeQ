/**
 * FaceElement codec. Mirrors `text.ts` — read tags 47601/47602/47607 off
 * the wire on decode, write them back on encode. 47603..47606 and 47608+
 * are deliberately undeclared in the wire schema so protobuf-ts skips
 * them as unknown fields rather than failing on type mismatch.
 *
 * Sub-type (tag 45003) is carried through `BaseElementFields.subType` and
 * is meaningful per `FaceSubType`: 1/2 are QQ-built-in (old/new asset sets),
 * 3 is super-emoji (includes dice), 5 is interactive. 4's meaning is
 * unknown.
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import { ElementType, type ElementWireField, type FaceElement } from './types';

/** FACE rows carry no category-1 envelope flags (so far). */
export const necessaryFields: readonly ElementWireField[] = [];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): FaceElement {
  return {
    kind: 'face',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    faceId: wire.faceId ?? 0,
    faceText: wire.faceText ?? '',
    diceValue: wire.diceValue,
  };
}

export function toWire(el: FaceElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.FACE,
    isSender: el.isSender,
    subType: el.subType,
    faceId: el.faceId,
    faceText: el.faceText,
    diceValue: el.diceValue,
  };
}
