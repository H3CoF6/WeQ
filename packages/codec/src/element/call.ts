/**
 * CallElement codec — QQ voice/video call and screen sharing messages.
 *
 * subType values represent different call statuses (accepted, rejected,
 * handled on other device, etc.). See CallSubType enum for details.
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import {
  ElementType,
  CallType,
  type CallElement,
  type ElementWireField,
} from './types';

export const necessaryFields: readonly ElementWireField[] = ['callFlag48156'];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): CallElement {
  return {
    kind: 'call',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    callType: wire.callType ?? 0,
    duration: wire.duration ?? 0,
    callMethod: (wire.callMethod ?? CallType.VOICE) as CallType,
    unknownType: wire.callUnknownType,
    summary: wire.callSummary ?? [],
  };
}

export function toWire(el: CallElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.CALL,
    isSender: el.isSender,
    subType: el.subType,
    callType: el.callType,
    duration: el.duration,
    callMethod: el.callMethod,
    callUnknownType: el.unknownType,
    callSummary: el.summary,
  };
}
