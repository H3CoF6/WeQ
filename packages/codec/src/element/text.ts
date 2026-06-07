/**
 * TextElement codec — reference implementation.
 *
 * Pattern to copy when adding face / pic / file / … elements:
 *   1. Declare the element's interface in `types.ts` (`kind` + payload).
 *   2. Add an entry to the `ElementType` enum.
 *   3. Add a sibling file (e.g. `face.ts`) with `fromWire` and `toWire`.
 *   4. Register the pair in `registry.ts`.
 *
 * `fromWire` reads only the fields the upper layer cares about — every
 * other wire field is dropped (category 1 envelope flags get re-injected
 * on encode via the schema's `default`; category 2 fields stay dropped).
 * `toWire` constructs a wire envelope with `elementType` set + the
 * type-specific payload + any common fields the element carries.
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import { ElementType, type ElementWireField, type TextElement } from './types';

/**
 * Wire fields that QQ requires on every TEXT element row but the element
 * model doesn't expose. `encodeElement` reads each name from the schema's
 * declared `default` and injects it when this codec's `toWire` didn't.
 *
 * This is how we keep category-1 fields type-scoped: ElementWire is flat
 * and shared across element types, but only TEXT pulls 45102's default —
 * encoding a FACE never touches `textReserve`.
 */
export const necessaryFields: readonly ElementWireField[] = ['textReserve'];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): TextElement {
  return {
    kind: 'text',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    content: wire.textContent ?? '',
  };
}

export function toWire(el: TextElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.TEXT,
    isSender: el.isSender,
    subType: el.subType,
    textContent: el.content,
    // textReserve (45102) auto-filled by encodeElement via `necessaryFields`.
  };
}
