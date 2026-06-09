/**
 * Zod schemas for element validation — runtime type checking to determine
 * required vs optional fields for each element kind.
 *
 * Usage:
 *   import { TextElementSchema } from './spec';
 *   const result = TextElementSchema.safeParse(data);
 *   if (result.success) { ... }
 */

import { z } from 'zod';
import {
  ElementType,
  PicSubType,
  PicType,
  PttType,
  GrayTipSubType,
  CallSubType,
  CallType,
  FaceSubType,
  ActionType,
} from './types';

const BaseElementFieldsSchema = z.object({
  elementId: z.bigint().optional(),
  isSender: z.boolean().optional(),
  subType: z.number().optional(),
});

export const TextElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('text'),
  textContent: z.string(),
  textReserve: z.number().optional(),
  textEncodingFlag: z.number().optional(),
  fontStyle: z.number().optional(),
  bubbleId: z.string().optional(),
  textInputState: z.number().optional(),
  translationFlag: z.number().optional(),
  linkDetectionFlag: z.number().optional(),
  atMentionMask: z.string().optional(),
  walletFlag: z.number().optional(),
  urlVerifyFlag: z.number().optional(),
});

export const PicElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('pic'),
  fileName: z.string(),
  fileSize: z.number(),
  md5Bytes: z.instanceof(Uint8Array),
  contentHash: z.instanceof(Uint8Array),
  imgWidth: z.number(),
  imgHeight: z.number(),
  imgType: z.nativeEnum(PicType),
  isOriginal: z.boolean(),
  md5: z.string(),
  fileToken: z.string(),
  uploadTime: z.number(),
  uploadTimestamp: z.number(),
  fileTTL: z.number(),
  thumbnailUrl: z.string(),
  previewUrl: z.string(),
  originalUrl: z.string(),
  summary: z.array(z.string()),
  cdnHost: z.string(),
  filePath: z.string().optional(),
  picTransferState: z.number().optional(),
  transferVersion: z.number().optional(),
  picFlag45817: z.number().optional(),
  picFlag45818: z.string().optional(),
  picFlag45819: z.string().optional(),
  picFlag45820: z.string().optional(),
  picFlag45821: z.number().optional(),
  picFlag45822: z.number().optional(),
  picFlag45823: z.number().optional(),
  picFlag45824: z.string().optional(),
  picFlag45825: z.number().optional(),
  picFlag45826: z.number().optional(),
  picFlag45827: z.number().optional(),
  picFlag45828: z.string().optional(),
});

export const PttElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('ptt'),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  md5Bytes: z.instanceof(Uint8Array),
  contentHash: z.instanceof(Uint8Array),
  isOriginal: z.boolean(),
  md5: z.string(),
  fileToken: z.string(),
  uploadTime: z.number(),
  uploadTimestamp: z.number(),
  fileTTL: z.number(),
  summary: z.array(z.string()),
  pttType: z.nativeEnum(PttType),
  voiceChanged: z.boolean(),
  waveform: z.instanceof(Uint8Array),
  transferState: z.number().optional(),
  picTransferState: z.number().optional(),
  transferVersion: z.number().optional(),
  pttFlag45907: z.number().optional(),
  pttFlag45909: z.number().optional(),
  pttFlag45922: z.number().optional(),
});

export const FaceElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('face'),
  faceId: z.number(),
  faceText: z.string(),
  faceExtDesc: z.string().optional(),
  superEmojiCategory: z.string().optional(),
  superEmojiCode: z.string().optional(),
  superEmojiFlag1: z.number().optional(),
  superEmojiFlag2: z.number().optional(),
  diceValue: z.string().optional(),
  superEmojiFlag3: z.number().optional(),
  superEmojiFlag4: z.number().optional(),
  canChain: z.boolean().optional(),
});

export const GrayTipElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('grayTip'),
  actionId: z.number(),
  detailedId: z.number(),
  typeFlag: z.number(),
  grayTipXmlContent: z.string(),
  businessId: z.number(),
  actionUniqueId: z.number(),
  tipJson: z.string(),
  tipType: z.number(),
  actionInitiator: z.object({ uid: z.string().optional(), nickname: z.string().optional() }).optional(),
  actionTarget: z.object({ uid: z.string().optional(), nickname: z.string().optional() }).optional(),
  actionAttributes: z.array(z.object({ key: z.string().optional(), value: z.string().optional() })).optional(),
  grayTipReserved: z.string().optional(),
  grayTipFlag48272: z.boolean().optional(),
  grayTipFlag48275: z.number().optional(),
});

export const ArkElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('ark'),
  arkData: z.string(),
});

export const MultiMsgElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('multiMsg'),
  resId: z.string(),
  xmlContent: z.string(),
  sessionId: z.string(),
});

export const CallElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('call'),
  callType: z.number(),
  duration: z.number(),
  callMethod: z.nativeEnum(CallType),
  callSummary: z.array(z.string()),
  callUnknownType: z.number().optional(),
  callFlag48156: z.number().optional(),
});

export const OnlineFileElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('onlineFile'),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  imgWidth: z.number(),
  imgHeight: z.number(),
  fileToken: z.string(),
  fileFlag45415: z.number().optional(),
  transferFlag45504: z.string().optional(),
});

export const OnlineFolderElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('onlineFolder'),
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  fileToken: z.string(),
  fileFlag45415: z.number().optional(),
  transferFlag45504: z.string().optional(),
});

export const UnknownElementSchema = BaseElementFieldsSchema.extend({
  kind: z.literal('unknown'),
  elementType: z.number(),
  raw: z.any(),
});

export const ElementSchema = z.discriminatedUnion('kind', [
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
  UnknownElementSchema,
]);

// Infer TypeScript types from schemas
export type TextElement = z.infer<typeof TextElementSchema>;
export type PicElement = z.infer<typeof PicElementSchema>;
export type PttElement = z.infer<typeof PttElementSchema>;
export type FaceElement = z.infer<typeof FaceElementSchema>;
export type GrayTipElement = z.infer<typeof GrayTipElementSchema>;
export type ArkElement = z.infer<typeof ArkElementSchema>;
export type MultiMsgElement = z.infer<typeof MultiMsgElementSchema>;
export type CallElement = z.infer<typeof CallElementSchema>;
export type OnlineFileElement = z.infer<typeof OnlineFileElementSchema>;
export type OnlineFolderElement = z.infer<typeof OnlineFolderElementSchema>;
export type UnknownElement = z.infer<typeof UnknownElementSchema>;
export type Element = z.infer<typeof ElementSchema>;
