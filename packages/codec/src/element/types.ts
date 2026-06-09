/**
 * Element abstract model — Layer 2 of the codec stack.
 *
 * `Element` is a discriminated union over `kind`. Each variant directly
 * mirrors the wire schema's field names (no renaming) and uses TS `?` to
 * mark which fields are GUARANTEED to appear vs which MAY appear for that
 * element kind. This required-vs-optional distinction drives downstream
 * UI choices (e.g. "compose new message" forms know which fields are
 * mandatory inputs).
 *
 * decode flow: ElementWire (raw protobuf) → decodeElement → adds `kind`
 * discriminator based on `wire.elementType` and forwards every other field
 * as-is. Nothing is dropped at the element layer; the renderer or msg
 * pipeline decides what to render or hide.
 *
 * encode flow: Element → encodeElement → strips `kind`, fills in
 * `elementType` from the kind→type map, forwards every other field as-is.
 *
 * `UnknownElement` exists so unknown elementType values from the wire don't
 * have to be dropped — we keep the raw wire envelope and re-emit it on
 * serialize, preserving forward-compat with new QQ element types.
 *
 * Tag numbers (40010, 45001, 45002, …) are described in `../proto/msg/common/element.ts`.
 */

import type { ProtoEncodeStructType } from '../core';
import type { ElementWire } from '../proto/msg/common/element';

/**
 * Numeric element types as encoded in tag 45002. Independent of the
 * (vendored, reference-only) enum in `@weq/types`.
 */
export enum ElementType {
  TEXT = 1,
  PIC = 2,
  PTT = 4,
  FACE = 6,
  GRAY_TIP = 8,
  ARK = 10,
  MULTI_MSG = 16,
  CALL = 21,
  ONLINE_FILE = 23,
  ONLINE_FOLDER = 30,
}

/** Pic sub-type (tag 45003 when elementType=PIC). */
export enum PicSubType {
  NORMAL = 0,
  EMOJI = 1,
}

/**
 * Pic type discriminator (tag 45416). Determines image category and
 * transmission behavior.
 */
export enum PicType {
  NORMAL = 1000,
  EMOJI = 2000,
  ORIGINAL = 1001,
}

/** Ptt (voice) type discriminator (tag 45906). */
export enum PttType {
  INTERCOM = 1,
  RECORDING = 2,
}

/**
 * Gray tip sub-type (tag 45003 when elementType=GRAY_TIP).
 * System notification messages with various interaction types.
 */
export enum GrayTipSubType {
  POKE = 17,
}

/**
 * Call sub-type (tag 45003 when elementType=CALL).
 * Voice/video call and screen sharing status.
 */
export enum CallSubType {
  VIDEO_ACCEPTED = 2,
  VIDEO_REJECTED_BY_US = 3,
  VIDEO_REJECTED_BY_PEER = 6,
  VOICE_ACCEPTED = 7,
  VOICE_REJECTED_BY_US = 8,
  VOICE_REJECTED_BY_PEER = 11,
  VIDEO_HANDLED_OTHER_DEVICE = 12,
  VOICE_HANDLED_OTHER_DEVICE = 13,
  SCREEN_SHARE_ACCEPTED = 19,
  SCREEN_SHARE_REJECTED = 22,
  REMOTE_ASSIST_FAILED = 34,
}

/** Call type discriminator (tag 48153). */
export enum CallType {
  VOICE = 1,
  VIDEO = 2,
  SCREEN_SHARE = 3,
  REMOTE_ASSIST = 5,
}

/**
 * Face sub-type (tag 45003 when elementType=FACE). Values observed on the
 * wire; semantics inferred and not all verified.
 */
export enum FaceSubType {
  QQ_BUILTIN_OLD = 1,
  QQ_BUILTIN_NEW = 2,
  SUPER_EMOJI = 3,
  UNKNOWN_4 = 4,
  INTERACTIVE = 5,
}

/** Action type discriminator (tags 48212/48273). */
export enum ActionType {
  SYSTEM = 1,
}

/**
 * Fields common to every element variant. All optional because the wire
 * declares them optional — element-specific interfaces tighten as needed.
 */
export interface BaseElementFields {
  elementId?: bigint;
  isSender?: boolean;
  subType?: number;
}

// ─────────────────────────────────────────────────────────────────────────
// Per-element interfaces — field names match the wire schema exactly.
// `?` marks fields that may be absent for the kind. Fields without `?` are
// guaranteed to appear on the wire when the element is well-formed.
// ─────────────────────────────────────────────────────────────────────────

export interface TextElement extends BaseElementFields {
  kind: 'text';
  /** Tag 45101. */
  textContent: string;
  /** Tag 45102. Envelope flag observed on every TEXT row in the wild. */
  textReserve?: number;
  /** Tag 45103. */
  textEncodingFlag?: number;
  /** Tag 45104. */
  fontStyle?: number;
  /** Tag 45105. */
  bubbleId?: string;
  /** Tag 45106. */
  textInputState?: number;
  /** Tag 45108. */
  translationFlag?: number;
  /** Tag 45109. */
  linkDetectionFlag?: number;
  /** Tag 45110. */
  atMentionMask?: string;
  /** Tag 45111. */
  walletFlag?: number;
  /** Tag 45112. */
  urlVerifyFlag?: number;
}

export interface PicElement extends BaseElementFields {
  kind: 'pic';
  /** Tag 45402. */
  fileName: string;
  /** Tag 45405. */
  fileSize: number;
  /** Tag 45406. */
  md5Bytes: Uint8Array;
  /** Tag 45408. */
  contentHash: Uint8Array;
  /** Tag 45411. */
  imgWidth: number;
  /** Tag 45412. */
  imgHeight: number;
  /** Tag 45416. */
  imgType: PicType;
  /** Tag 45418. */
  isOriginal: boolean;
  /** Tag 45424. */
  md5: string;
  /** Tag 45503. */
  fileToken: string;
  /** Tag 45505. */
  uploadTime: number;
  /** Tag 45517. */
  uploadTimestamp: number;
  /** Tag 45518. */
  fileTTL: number;
  /** Tag 45802. */
  thumbnailUrl: string;
  /** Tag 45803. */
  previewUrl: string;
  /** Tag 45804. */
  originalUrl: string;
  /** Tag 45815. */
  summary: string[];
  /** Tag 45816. */
  cdnHost: string;
  /** Tag 45403. Shared with PTT/ONLINE_FILE. */
  filePath?: string;
  /** Tag 45511. */
  picTransferState?: number;
  /** Tag 45513. */
  transferVersion?: number;
  /** Tag 45817. */
  picFlag45817?: number;
  /** Tag 45818. */
  picFlag45818?: string;
  /** Tag 45819. */
  picFlag45819?: string;
  /** Tag 45820. */
  picFlag45820?: string;
  /** Tag 45821. */
  picFlag45821?: number;
  /** Tag 45822. */
  picFlag45822?: number;
  /** Tag 45823. */
  picFlag45823?: number;
  /** Tag 45824. */
  picFlag45824?: string;
  /** Tag 45825. */
  picFlag45825?: number;
  /** Tag 45826. */
  picFlag45826?: number;
  /** Tag 45827. */
  picFlag45827?: number;
  /** Tag 45828. */
  picFlag45828?: string;
}

export interface PttElement extends BaseElementFields {
  kind: 'ptt';
  /** Tag 45402 (shared with PIC). */
  fileName: string;
  /** Tag 45403. */
  filePath: string;
  /** Tag 45405 (shared with PIC). */
  fileSize: number;
  /** Tag 45406 (shared with PIC). */
  md5Bytes: Uint8Array;
  /** Tag 45408 (shared with PIC). */
  contentHash: Uint8Array;
  /** Tag 45418 (shared with PIC). */
  isOriginal: boolean;
  /** Tag 45424 (shared with PIC). */
  md5: string;
  /** Tag 45503 (shared with PIC). */
  fileToken: string;
  /** Tag 45505 (shared with PIC). */
  uploadTime: number;
  /** Tag 45517 (shared with PIC). */
  uploadTimestamp: number;
  /** Tag 45518 (shared with PIC). */
  fileTTL: number;
  /** Tag 45815 (shared with PIC). */
  summary: string[];
  /** Tag 45906. */
  pttType: PttType;
  /** Tag 45911. */
  voiceChanged: boolean;
  /** Tag 45925. */
  waveform: Uint8Array;
  /** Tag 45550. */
  transferState?: number;
  /** Tag 45511 (shared with PIC). */
  picTransferState?: number;
  /** Tag 45513 (shared with PIC). */
  transferVersion?: number;
  /** Tag 45907. */
  pttFlag45907?: number;
  /** Tag 45909. */
  pttFlag45909?: number;
  /** Tag 45922. */
  pttFlag45922?: number;
}

export interface FaceElement extends BaseElementFields {
  kind: 'face';
  /** Tag 47601. (`FaceIndex.DICE = 358`.) */
  faceId: number;
  /** Tag 47602. */
  faceText: string;
  /** Tag 45004. */
  faceExtDesc?: string;
  /** Tag 47603. Super-emoji category. */
  superEmojiCategory?: string;
  /** Tag 47604. Super-emoji code. */
  superEmojiCode?: string;
  /** Tag 47605. */
  superEmojiFlag1?: number;
  /** Tag 47606. */
  superEmojiFlag2?: number;
  /** Tag 47607. Dice value "1".."6" — only present for super-emoji dice. */
  diceValue?: string;
  /** Tag 47609. */
  superEmojiFlag3?: number;
  /** Tag 47610. */
  superEmojiFlag4?: number;
  /** Tag 47622. Whether the emoji supports chain reaction. */
  canChain?: boolean;
}

export interface GrayTipElement extends BaseElementFields {
  kind: 'grayTip';
  /** Tag 48211 (subType=17). Observed: 12 (poke), 16 (red packet). */
  actionId: number;
  /** Tag 48212 (subType=17). 1=system, 1061=poke, 19357=red packet. */
  detailedId: number;
  /** Tag 48213 (subType=17). Observed: 7. */
  typeFlag: number;
  /** Tag 48214 (subType=17). XML preview document. */
  grayTipXmlContent: string;
  /** Tag 48215 (subType=17). Observed: 1132. */
  businessId: number;
  /** Tag 48216 (subType=17). */
  actionUniqueId: number;
  /** Tag 48271 (subType=17). JSON payload — parse against TipJsonPayload. */
  tipJson: string;
  /** Tag 48273 (subType=17). 1=system, matches detailedId. */
  tipType: number;
  /** Tag 48210 (subType=17). Nested: {1005: uid, 1006: nickname}. */
  actionInitiator?: { uid?: string; nickname?: string };
  /** Tag 43210 (subType=17). Nested: {1005: uid, 1006: nickname}. */
  actionTarget?: { uid?: string; nickname?: string };
  /** Tag 48217 (subType=17). Repeated nested: {1005: key, 1006: value}. */
  actionAttributes?: { key?: string; value?: string }[];
  /** Tag 48218. */
  grayTipReserved?: string;
  /** Tag 48272. Observed: true. */
  grayTipFlag48272?: boolean;
  /** Tag 48275. */
  grayTipFlag48275?: number;
}

export interface ArkElement extends BaseElementFields {
  kind: 'ark';
  /**
   * Tag 47901. Raw JSON string. Parse with `JSON.parse()` and narrow against
   * `ArkPayload`. Kept as string so re-serialize is byte-exact (no JSON
   * key-reorder).
   */
  arkData: string;
}

export interface MultiMsgElement extends BaseElementFields {
  kind: 'multiMsg';
  /** Tag 48601. Server resource ID for the merged message chain. */
  resId: string;
  /**
   * Tag 48602. XML preview document. Parse with an XML parser and map to
   * `MultiMsgXmlPayload`. Kept as raw string so re-serialize is byte-exact.
   */
  xmlContent: string;
  /** Tag 48603. Session identifier; appears as `m_fileName` in the XML. */
  sessionId: string;
}

export interface CallElement extends BaseElementFields {
  kind: 'call';
  /** Tag 48151. Matches subType. */
  callType: number;
  /** Tag 48152. Connection or waiting time in milliseconds. */
  duration: number;
  /** Tag 48153. 1=voice, 2=video, 3=screen share, 5=remote assist. */
  callMethod: CallType;
  /** Tag 48157. */
  callSummary: string[];
  /** Tag 48155. Observed: 0, 1, 2, or absent. */
  callUnknownType?: number;
  /** Tag 48156. */
  callFlag48156?: number;
}

export interface OnlineFileElement extends BaseElementFields {
  kind: 'onlineFile';
  /** Tag 45402 (shared with PIC). */
  fileName: string;
  /** Tag 45403. */
  filePath: string;
  /** Tag 45405 (shared with PIC). */
  fileSize: number;
  /** Tag 45411 (shared with PIC). */
  imgWidth: number;
  /** Tag 45412 (shared with PIC). */
  imgHeight: number;
  /** Tag 45503 (shared with PIC). */
  fileToken: string;
  /** Tag 45415. */
  fileFlag45415?: number;
  /** Tag 45504. */
  transferFlag45504?: string;
}

export interface OnlineFolderElement extends BaseElementFields {
  kind: 'onlineFolder';
  /** Tag 45402 (shared with PIC). */
  fileName: string;
  /** Tag 45403. */
  filePath: string;
  /** Tag 45405 (shared with PIC). */
  fileSize: number;
  /** Tag 45503 (shared with PIC). */
  fileToken: string;
  /** Tag 45415. */
  fileFlag45415?: number;
  /** Tag 45504. */
  transferFlag45504?: string;
}

/**
 * Fallback for elementType values that aren't yet registered in the codec.
 * Carries the full wire envelope so encodeElement can put it back on disk
 * exactly as it came in.
 */
export interface UnknownElement extends BaseElementFields {
  kind: 'unknown';
  elementType: number;
  raw: ProtoEncodeStructType<typeof ElementWire>;
}

export type Element =
  | TextElement
  | PicElement
  | PttElement
  | FaceElement
  | GrayTipElement
  | ArkElement
  | MultiMsgElement
  | CallElement
  | OnlineFileElement
  | OnlineFolderElement
  | UnknownElement;

// ─────────────────────────────────────────────────────────────────────────
// Downstream-parsing helper shapes (NOT part of the wire — these describe
// the structure of JSON/XML payloads carried INSIDE certain wire string
// fields like arkData, tipJson, grayTipXmlContent, xmlContent).
// ─────────────────────────────────────────────────────────────────────────

/**
 * Shape of the JSON document stored in wire field 47901 for ARK elements.
 */
export interface ArkPayload {
  app: string;
  desc: string;
  meta: Record<string, Record<string, unknown>>;
  prompt: string;
  sourceName?: string;
  ver?: string;
  view: string;
  config?: ArkConfig;
}

export interface ArkConfig {
  /** Unix seconds. */
  ctime: number;
  /** Card signature token. */
  token: string;
}

/**
 * Shape of the XML document stored in wire field 48602 for MULTI_MSG.
 */
export interface MultiMsgXmlPayload {
  serviceID: string;
  templateID: string;
  action: string;
  brief: string;
  m_resid: string;
  m_fileName: string;
  tSum: string;
  flag: string;
  item?: {
    layout: string;
    titles: Array<{ color: string; size: string; text: string }>;
    summary?: { color: string; text: string };
  };
  source?: { name: string };
}

/** Tip item in gray tip JSON (tag 48271). */
export interface TipJsonItem {
  type: 'img' | 'qq' | 'nor' | 'url' | string;
  src?: string;
  uid?: string;
  txt?: string;
  col?: string;
  jp?: string;
}

/** Shape of the JSON document in gray tip (tag 48271). */
export interface TipJsonPayload {
  items: TipJsonItem[];
}

/** Shape of the XML document in action gray tip (tag 48214). */
export interface ActionXmlPayload {
  align: string;
  elements: Array<{
    type: 'qq' | 'img' | 'nor';
    uin?: string;
    col?: string;
    nm?: string;
    tp?: string;
    src?: string;
    jp?: string;
    txt?: string;
  }>;
}
