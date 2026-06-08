/**
 * MultiMsgElement codec — QQ merged forward messages (合并转发).
 *
 * Wire fields:
 *   48601: resId (server resource ID)
 *   48602: xmlContent (preview XML)
 *   48603: sessionId (upload session identifier)
 *
 * The XML (48602) carries a preview card with message titles and summary.
 * Parse it with an XML parser and map to `MultiMsgXmlPayload` on the
 * upper-layer side. The codec keeps it as a raw string so re-serialize is
 * byte-exact.
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import {
  ElementType,
  type MultiMsgElement,
  type ElementWireField,
} from './types';

export const necessaryFields: readonly ElementWireField[] = [];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): MultiMsgElement {
  return {
    kind: 'multiMsg',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    resId: wire.resId ?? '',
    xmlContent: wire.xmlContent ?? '',
    sessionId: wire.sessionId ?? '',
  };
}

export function toWire(el: MultiMsgElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.MULTI_MSG,
    isSender: el.isSender,
    subType: el.subType,
    resId: el.resId,
    xmlContent: el.xmlContent,
    sessionId: el.sessionId,
  };
}
