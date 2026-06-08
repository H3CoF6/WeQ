/**
 * PicElement codec — QQ image elements (normal images, emoji images).
 *
 * subType values:
 *   0 = normal image
 *   1 = emoji image
 *
 * imgType (tag 45416) values:
 *   1000 = normal
 *   2000 = emoji
 *   1001 = original quality
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import {
  ElementType,
  PicType,
  type PicElement,
  type ElementWireField,
} from './types';

/** Category-1 envelope flags QQ requires on every PIC row. */
export const necessaryFields: readonly ElementWireField[] = [
  'picTransferState',
  'transferVersion',
  'picFlag45817',
  'picFlag45818',
  'picFlag45819',
  'picFlag45820',
  'picFlag45821',
  'picFlag45822',
  'picFlag45823',
  'picFlag45824',
  'picFlag45825',
  'picFlag45826',
  'picFlag45827',
  'picFlag45828',
];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): PicElement {
  return {
    kind: 'pic',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    fileName: wire.fileName ?? '',
    fileSize: wire.fileSize ?? 0,
    md5Bytes: wire.md5Bytes ?? new Uint8Array(),
    contentHash: wire.contentHash ?? new Uint8Array(),
    imgWidth: wire.imgWidth ?? 0,
    imgHeight: wire.imgHeight ?? 0,
    imgType: (wire.imgType ?? PicType.NORMAL) as PicType,
    isOriginal: wire.isOriginal ?? false,
    md5: wire.md5 ?? '',
    fileToken: wire.fileToken ?? '',
    uploadTime: wire.uploadTime ?? 0,
    uploadTimestamp: wire.uploadTimestamp ?? 0,
    fileTTL: wire.fileTTL ?? 0,
    thumbnailUrl: wire.thumbnailUrl ?? '',
    previewUrl: wire.previewUrl ?? '',
    originalUrl: wire.originalUrl ?? '',
    summary: wire.summary ?? [],
    cdnHost: wire.cdnHost ?? '',
  };
}

export function toWire(el: PicElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.PIC,
    isSender: el.isSender,
    subType: el.subType,
    fileName: el.fileName,
    fileSize: el.fileSize,
    md5Bytes: el.md5Bytes,
    contentHash: el.contentHash,
    imgWidth: el.imgWidth,
    imgHeight: el.imgHeight,
    imgType: el.imgType,
    isOriginal: el.isOriginal,
    md5: el.md5,
    fileToken: el.fileToken,
    uploadTime: el.uploadTime,
    uploadTimestamp: el.uploadTimestamp,
    fileTTL: el.fileTTL,
    thumbnailUrl: el.thumbnailUrl,
    previewUrl: el.previewUrl,
    originalUrl: el.originalUrl,
    summary: el.summary,
    cdnHost: el.cdnHost,
  };
}
