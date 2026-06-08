/**
 * Element codec dispatch table.
 *
 * Decode: look up `wire.elementType` (tag 45002) here and delegate to that
 * codec's `fromWire`. Unknown elementType → UnknownElement wrapping the
 * raw envelope (re-serialize puts it back byte-for-byte).
 *
 * Encode: switch on `el.kind` and delegate to the matching `toWire`, then
 * fill in any category-1 envelope flags the codec listed in
 * `necessaryFields` — pulling their values from the schema's declared
 * `default`. This keeps text-only fields like 45102 from leaking into
 * face/pic/file wire bytes.
 */

import type {
  ProtoDecodeStructType,
  ProtoEncodeStructType,
  ProtoMessageType,
} from '../core';
import { ElementWire } from '../proto/msg/common/element';
import * as text from './text';
import * as pic from './pic';
import * as ptt from './ptt';
import * as face from './face';
import * as gray_tip from './gray_tip';
import * as ark from './ark';
import * as multi_msg from './multi_msg';
import * as call from './call';
import * as online_file from './online_file';
import * as online_folder from './online_folder';
import {
  ElementType,
  type Element,
  type ElementWireField,
  type UnknownElement,
} from './types';

interface ElementCodec<E extends Element> {
  fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): E;
  toWire(el: E): ProtoEncodeStructType<typeof ElementWire>;
  /** Wire fields whose schema-declared default this codec wants auto-filled
   *  when the caller's `toWire` didn't supply a value. */
  necessaryFields: readonly ElementWireField[];
}

const codecsByType: Partial<Record<ElementType, ElementCodec<Element>>> = {
  [ElementType.TEXT]: text as unknown as ElementCodec<Element>,
  [ElementType.PIC]: pic as unknown as ElementCodec<Element>,
  [ElementType.PTT]: ptt as unknown as ElementCodec<Element>,
  [ElementType.FACE]: face as unknown as ElementCodec<Element>,
  [ElementType.GRAY_TIP]: gray_tip as unknown as ElementCodec<Element>,
  [ElementType.ARK]: ark as unknown as ElementCodec<Element>,
  [ElementType.MULTI_MSG]: multi_msg as unknown as ElementCodec<Element>,
  [ElementType.CALL]: call as unknown as ElementCodec<Element>,
  [ElementType.ONLINE_FILE]: online_file as unknown as ElementCodec<Element>,
  [ElementType.ONLINE_FOLDER]: online_folder as unknown as ElementCodec<Element>,
};

const codecsByKind: Record<string, ElementCodec<Element>> = {
  text: text as unknown as ElementCodec<Element>,
  pic: pic as unknown as ElementCodec<Element>,
  ptt: ptt as unknown as ElementCodec<Element>,
  face: face as unknown as ElementCodec<Element>,
  grayTip: gray_tip as unknown as ElementCodec<Element>,
  ark: ark as unknown as ElementCodec<Element>,
  multiMsg: multi_msg as unknown as ElementCodec<Element>,
  call: call as unknown as ElementCodec<Element>,
  onlineFile: online_file as unknown as ElementCodec<Element>,
  onlineFolder: online_folder as unknown as ElementCodec<Element>,
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
  const wire = codec.toWire(el);
  return fillNecessaryDefaults(wire, ElementWire, codec.necessaryFields);
}

/**
 * For each name in `necessary`, if `wire[name]` is undefined and the schema
 * declares a `default` for that field, copy the default in.
 *
 * Returns a shallow-copied object — caller's input is not mutated.
 */
function fillNecessaryDefaults<W>(
  wire: W,
  schema: ProtoMessageType,
  necessary: readonly string[],
): W {
  const out = { ...wire } as Record<string, unknown>;
  for (const name of necessary) {
    if (out[name] !== undefined) continue;
    const field = schema[name];
    if (field?.default !== undefined) out[name] = field.default;
  }
  return out as W;
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
