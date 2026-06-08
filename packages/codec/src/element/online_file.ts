/**
 * OnlineFileElement codec — QQ online file messages.
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import {
  ElementType,
  type OnlineFileElement,
  type ElementWireField,
} from './types';

export const necessaryFields: readonly ElementWireField[] = [
  'fileFlag45415',
  'transferFlag45504',
];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): OnlineFileElement {
  return {
    kind: 'onlineFile',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    fileName: wire.fileName ?? '',
    filePath: wire.filePath ?? '',
    fileSize: wire.fileSize ?? 0,
    imgWidth: wire.imgWidth ?? 0,
    imgHeight: wire.imgHeight ?? 0,
    fileToken: wire.fileToken ?? '',
  };
}

export function toWire(el: OnlineFileElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.ONLINE_FILE,
    isSender: el.isSender,
    subType: el.subType,
    fileName: el.fileName,
    filePath: el.filePath,
    fileSize: el.fileSize,
    imgWidth: el.imgWidth,
    imgHeight: el.imgHeight,
    fileToken: el.fileToken,
  };
}
