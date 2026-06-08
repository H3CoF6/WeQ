/**
 * PttElement codec — QQ voice messages (语音消息).
 *
 * subType: 0 = normal voice (other values not observed).
 *
 * PTT reuses most PIC wire tags for file metadata (45402-45518, 45815),
 * and adds voice-specific fields:
 *   45911: voiceChanged (bool)
 *   45925: waveform (bytes)
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import {
  ElementType,
  PttType,
  type PttElement,
  type ElementWireField,
} from './types';

export const necessaryFields: readonly ElementWireField[] = [
  'picTransferState',
  'transferVersion',
  'pttFlag45907',
  'pttFlag45909',
  'pttFlag45922',
];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): PttElement {
  return {
    kind: 'ptt',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    fileName: wire.fileName ?? '',
    filePath: wire.filePath ?? '',
    fileSize: wire.fileSize ?? 0,
    md5Bytes: wire.md5Bytes ?? new Uint8Array(),
    contentHash: wire.contentHash ?? new Uint8Array(),
    isOriginal: wire.isOriginal ?? false,
    md5: wire.md5 ?? '',
    fileToken: wire.fileToken ?? '',
    uploadTime: wire.uploadTime ?? 0,
    transferState: wire.transferState,
    uploadTimestamp: wire.uploadTimestamp ?? 0,
    fileTTL: wire.fileTTL ?? 0,
    summary: wire.summary ?? [],
    pttType: (wire.pttType ?? PttType.INTERCOM) as PttType,
    voiceChanged: wire.voiceChanged ?? false,
    waveform: wire.waveform ?? new Uint8Array(),
  };
}

export function toWire(el: PttElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.PTT,
    isSender: el.isSender,
    subType: el.subType,
    fileName: el.fileName,
    filePath: el.filePath,
    fileSize: el.fileSize,
    md5Bytes: el.md5Bytes,
    contentHash: el.contentHash,
    isOriginal: el.isOriginal,
    md5: el.md5,
    fileToken: el.fileToken,
    uploadTime: el.uploadTime,
    transferState: el.transferState,
    uploadTimestamp: el.uploadTimestamp,
    fileTTL: el.fileTTL,
    summary: el.summary,
    pttType: el.pttType,
    voiceChanged: el.voiceChanged,
    waveform: el.waveform,
  };
}
