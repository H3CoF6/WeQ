import { ElementType } from '@weq/codec/element';
import {
  TextElementSchema,
  PicElementSchema,
  PttElementSchema,
  FaceElementSchema,
  GrayTipElementSchema,
  ArkElementSchema,
  MultiMsgElementSchema,
  CallElementSchema,
  OnlineFileElementSchema,
  OnlineFolderElementSchema,
} from '@weq/codec/element';
import type { AnnotatedField } from '@weq/codec/raw';
import { z } from 'zod';

const ELEMENT_SCHEMAS: Partial<Record<ElementType, any>> = {
  [ElementType.TEXT]: TextElementSchema,
  [ElementType.PIC]: PicElementSchema,
  [ElementType.PTT]: PttElementSchema,
  [ElementType.FACE]: FaceElementSchema,
  [ElementType.GRAY_TIP]: GrayTipElementSchema,
  [ElementType.ARK]: ArkElementSchema,
  [ElementType.MULTI_MSG]: MultiMsgElementSchema,
  [ElementType.CALL]: CallElementSchema,
  [ElementType.ONLINE_FILE]: OnlineFileElementSchema,
  [ElementType.ONLINE_FOLDER]: OnlineFolderElementSchema,
};

export interface ElementValidation {
  elementType: ElementType;
  elementName: string;
  hasSchema: boolean;
  missingRequired: string[];
  unexpectedFields: number[];
}

export function validateElement(fields: AnnotatedField[]): ElementValidation | null {
  const elementTypeField = fields.find(f => f.raw.tag === 45002);
  if (!elementTypeField) return null;

  const guess = elementTypeField.raw.guesses.find(g => g.kind === 'varint-uint64');
  if (!guess || guess.kind !== 'varint-uint64') return null;

  const elementType = Number(guess.value) as ElementType;
  const elementName = ElementType[elementType] || 'UNKNOWN';
  const schema = ELEMENT_SCHEMAS[elementType];

  if (!schema) {
    return {
      elementType,
      elementName,
      hasSchema: false,
      missingRequired: [],
      unexpectedFields: [],
    };
  }

  const presentTags = new Set(fields.map(f => f.raw.tag));
  const schemaShape = schema.shape;

  const requiredFields = Object.entries(schemaShape)
    .filter(([name, fieldSchema]) => {
      if (name === 'kind') return false;
      return !(fieldSchema as any).isOptional?.();
    })
    .map(([name]) => name);

  const missingRequired = requiredFields.filter(name =>
    !presentTags.has(getTagForField(name))
  );

  const expectedTags = new Set([45002, 40010, 45001, 45003]);
  const unexpectedFields = fields
    .map(f => f.raw.tag)
    .filter(tag => !expectedTags.has(tag) && !isExpectedTag(tag, elementType));

  return {
    elementType,
    elementName,
    hasSchema: true,
    missingRequired,
    unexpectedFields,
  };
}

function getTagForField(fieldName: string): number {
  const tagMap: Record<string, number> = {
    textContent: 45101,
    fileName: 45402,
    fileSize: 45405,
    md5Bytes: 45406,
    contentHash: 45408,
    imgWidth: 45411,
    imgHeight: 45412,
    imgType: 45416,
    isOriginal: 45418,
    md5: 45424,
    fileToken: 45503,
    uploadTime: 45505,
    uploadTimestamp: 45517,
    fileTTL: 45518,
    thumbnailUrl: 45802,
    previewUrl: 45803,
    originalUrl: 45804,
    summary: 45815,
    cdnHost: 45816,
    filePath: 45403,
    pttType: 45906,
    voiceChanged: 45911,
    waveform: 45925,
    faceId: 47601,
    faceText: 47602,
    arkData: 47901,
    resId: 48601,
    xmlContent: 48602,
    sessionId: 48603,
    callType: 48151,
    duration: 48152,
    callMethod: 48153,
    callSummary: 48157,
    actionId: 48211,
    detailedId: 48212,
    typeFlag: 48213,
    grayTipXmlContent: 48214,
    businessId: 48215,
    actionUniqueId: 48216,
    tipJson: 48271,
    tipType: 48273,
  };
  return tagMap[fieldName] || 0;
}

function isExpectedTag(tag: number, elementType: ElementType): boolean {
  const ranges: Record<ElementType, number[][]> = {
    [ElementType.TEXT]: [[45101, 45112]],
    [ElementType.PIC]: [[45402, 45828]],
    [ElementType.PTT]: [[45402, 45925]],
    [ElementType.FACE]: [[45004, 45004], [47601, 47622]],
    [ElementType.GRAY_TIP]: [[43210, 43210], [48210, 48275]],
    [ElementType.ARK]: [[47901, 47901]],
    [ElementType.MULTI_MSG]: [[48601, 48603]],
    [ElementType.CALL]: [[48151, 48157]],
    [ElementType.ONLINE_FILE]: [[45402, 45504]],
    [ElementType.ONLINE_FOLDER]: [[45402, 45504]],
  };

  const elementRanges = ranges[elementType] || [];
  return elementRanges.some((range) => range && range[0] !== undefined && range[1] !== undefined && tag >= range[0] && tag <= range[1]);
}
