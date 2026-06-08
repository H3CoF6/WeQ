/**
 * OnlineFolderElement codec — QQ online folder messages.
 *
 * Reuses ONLINE_FILE wire tags (no new tags). The 45504 (transferFlag45504)
 * default is independently injected per-codec via `necessaryFields`, so
 * sharing the tag with online_file does not cause any conflict.
 */

import type { ProtoDecodeStructType, ProtoEncodeStructType } from '../core';
import { ElementWire } from '../proto/msg/common/element';
import {
  ElementType,
  type OnlineFolderElement,
  type ElementWireField,
} from './types';

export const necessaryFields: readonly ElementWireField[] = [
  'fileFlag45415',
  'transferFlag45504',
];

export function fromWire(wire: ProtoDecodeStructType<typeof ElementWire>): OnlineFolderElement {
  return {
    kind: 'onlineFolder',
    elementId: wire.elementId ?? 0n,
    isSender: wire.isSender,
    subType: wire.subType,
    fileName: wire.fileName ?? '',
    filePath: wire.filePath ?? '',
    fileSize: wire.fileSize ?? 0,
    fileToken: wire.fileToken ?? '',
  };
}

export function toWire(el: OnlineFolderElement): ProtoEncodeStructType<typeof ElementWire> {
  return {
    elementId: el.elementId,
    elementType: ElementType.ONLINE_FOLDER,
    isSender: el.isSender,
    subType: el.subType,
    fileName: el.fileName,
    filePath: el.filePath,
    fileSize: el.fileSize,
    fileToken: el.fileToken,
  };
}
