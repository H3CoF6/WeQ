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
import { ElementType, type TextElement } from './types';

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
    // textReserve (45102) auto-injected by ProtoMsg.encode via schema default.
  };
}
