/**
 * Element abstract model — Layer 2 of the codec stack.
 *
 * `Element` is a discriminated union over `kind`. Each variant carries
 * the cleaned-up high-level fields the renderer cares about. Common fields
 * (id, isSender, subType) live in `BaseElementFields` and are spread into
 * every variant.
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
 * The set of field names declared on the wire envelope. Used to constrain
 * each element codec's `necessaryFields` so a typo in the codec doesn't
 * silently no-op at runtime.
 */
export type ElementWireField = keyof typeof ElementWire;

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

/**
 * Pic sub-type (tag 45003 when elementType=PIC).
 */
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

/**
 * Ptt (voice) type discriminator (tag 45906).
 */
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

/**
 * Call type discriminator (tag 48153).
 */
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

/** Fields common to every element variant. */
export interface BaseElementFields {
  elementId: bigint;
  isSender?: boolean;
  subType?: number;
}

export interface TextElement extends BaseElementFields {
  kind: 'text';
  content: string;
}

export interface FaceElement extends BaseElementFields {
  kind: 'face';
  /** Face id (e.g. 358 for dice). */
  faceId: number;
  /** Display text shown when the receiver lacks the asset. */
  faceText: string;
  /** Dice value "1".."6"; only set when this face is a super-emoji dice. */
  diceValue?: string;
}

export interface PicElement extends BaseElementFields {
  kind: 'pic';
  /** Image filename (tag 45402). */
  fileName: string;
  /** File size in bytes (tag 45405). */
  fileSize: number;
  /** Binary MD5 hash (tag 45406). */
  md5Bytes: Uint8Array;
  /** Content verification hash (tag 45408). */
  contentHash: Uint8Array;
  /** Image width in pixels (tag 45411). */
  imgWidth: number;
  /** Image height in pixels (tag 45412). */
  imgHeight: number;
  /** Image type: 1000=normal, 2000=emoji, 1001=original (tag 45416). */
  imgType: PicType;
  /** Whether original quality (tag 45418). */
  isOriginal: boolean;
  /** Uppercase hex MD5 string (tag 45424). */
  md5: string;
  /** Download token (tag 45503). */
  fileToken: string;
  /** Upload/processing timestamp (tag 45505). */
  uploadTime: number;
  /** Upload timestamp (tag 45517). */
  uploadTimestamp: number;
  /** File TTL in seconds (tag 45518). */
  fileTTL: number;
  /** Thumbnail download URL (tag 45802). */
  thumbnailUrl: string;
  /** Preview download URL (tag 45803). */
  previewUrl: string;
  /** Original image download URL (tag 45804). */
  originalUrl: string;
  /** Image summary/description, repeated field (tag 45815). */
  summary: string[];
  /** CDN host domain (tag 45816). */
  cdnHost: string;
}

export interface PttElement extends BaseElementFields {
  kind: 'ptt';
  /** Audio filename (tag 45402, shared with PIC). */
  fileName: string;
  /** Local file path (tag 45403). */
  filePath: string;
  /** File size in bytes (tag 45405, shared with PIC). */
  fileSize: number;
  /** Binary MD5 hash (tag 45406, shared with PIC). */
  md5Bytes: Uint8Array;
  /** Content verification hash (tag 45408, shared with PIC). */
  contentHash: Uint8Array;
  /** Whether original quality (tag 45418, shared with PIC). */
  isOriginal: boolean;
  /** Uppercase hex MD5 string (tag 45424, shared with PIC). */
  md5: string;
  /** Download token (tag 45503, shared with PIC). */
  fileToken: string;
  /** Upload/processing timestamp (tag 45505, shared with PIC). */
  uploadTime: number;
  /** Transfer state (tag 45550). Optional. */
  transferState?: number;
  /** Upload timestamp (tag 45517, shared with PIC). */
  uploadTimestamp: number;
  /** File TTL in seconds (tag 45518, shared with PIC). */
  fileTTL: number;
  /** Audio summary/description, repeated field (tag 45815, shared with PIC). */
  summary: string[];
  /** Voice type: 1=intercom, 2=recording (tag 45906). */
  pttType: PttType;
  /** Whether voice is changed/transformed (tag 45911). */
  voiceChanged: boolean;
  /** Audio waveform data for visualization (tag 45925). */
  waveform: Uint8Array;
}

/**
 * Shape of the JSON document stored in wire field 47901 for ARK elements.
 * `meta`'s inner shape varies per `view` (`pubAdArkView`, `news`, …) — the
 * concrete examples that have been documented live as exported sample
 * constants in `element/ark.ts`.
 */
export interface ArkPayload {
  /** App identifier, e.g. "com.tencent.gamecenter.mall". */
  app: string;
  /** Short description shown in AIO list / notification. */
  desc: string;
  /** View-specific data, keyed by template name (`template3`, `news`, …). */
  meta: Record<string, Record<string, unknown>>;
  /** Plain-text fallback used when the card can't render. */
  prompt: string;
  /** Source identifier (often the appid for ads). */
  sourceName?: string;
  /** Ark template version, e.g. "0.0.3.67". */
  ver?: string;
  /** Renderer name, e.g. "pubAdArkView". Determines which `meta.<name>` is read. */
  view: string;
  /** Card verification token + creation timestamp. */
  config?: ArkConfig;
}

export interface ArkConfig {
  /** Unix seconds. */
  ctime: number;
  /** Card signature token. */
  token: string;
}

export interface ArkElement extends BaseElementFields {
  kind: 'ark';
  /**
   * Raw JSON string from wire field 47901. Parse with `JSON.parse()` and
   * narrow against `ArkPayload`. The codec deliberately keeps this as
   * string so re-serialize is byte-exact (no JSON key-reorder).
   */
  arkData: string;
}

/**
 * Shape of the XML document stored in wire field 48602 for MULTI_MSG
 * (merged forward) elements. The XML carries a preview of the forwarded
 * message chain — titles, brief, and metadata for rendering the card.
 *
 * Root element attributes (observed):
 * - serviceID: "35"
 * - templateID: "1"
 * - action: "viewMultiMsg"
 * - brief: plain-text summary, e.g. "[聊天记录]"
 * - m_resid: server resource ID (matches wire field 48601)
 * - m_fileName: session identifier (matches wire field 48603)
 * - tSum: total message count (string-encoded int)
 * - flag: flags (string-encoded int)
 *
 * Child elements:
 * - <item layout="1">: preview content
 *   - <title color="..." size="...">: message preview lines
 *   - <hr />: separator
 *   - <summary color="...">: footer text
 * - <source name="...">: source label
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

export interface MultiMsgElement extends BaseElementFields {
  kind: 'multiMsg';
  /**
   * Server resource ID for the merged message chain (tag 48601). Used to
   * fetch the full message history from QQ servers.
   */
  resId: string;
  /**
   * XML preview document (tag 48602). Carries message titles, summary, and
   * metadata for rendering the forward card. Parse with an XML parser and
   * map to `MultiMsgXmlPayload`. The codec keeps it as a raw string so
   * re-serialize is byte-exact.
   */
  xmlContent: string;
  /**
   * Session identifier (tag 48603). Links this forward element to its
   * upload session. Appears as `m_fileName` in the XML.
   */
  sessionId: string;
}

/**
 * User info in action gray tip (nested in tags 48210/43210).
 * Used for poke, red packet, and other interactive actions.
 */
export interface ActionUser {
  /** User ID (nested tag 1005). */
  uid: string;
  /** User nickname (nested tag 1006). */
  nickname: string;
}

/**
 * Key-value attribute in action gray tip (nested in repeated tag 48217).
 */
export interface ActionAttr {
  /** Attribute key (nested tag 1005). */
  key: string;
  /** Attribute value (nested tag 1006). */
  value: string;
}

/**
 * Action type discriminator (tags 48212/48273).
 */
export enum ActionType {
  SYSTEM = 1,
}

/**
 * Tip item in gray tip JSON (tag 48271).
 */
export interface TipJsonItem {
  type: 'img' | 'qq' | 'nor' | 'url' | string;
  src?: string;
  uid?: string;
  txt?: string;
  col?: string;
  jp?: string;
}

/**
 * Shape of the JSON document in gray tip (tag 48271).
 * Example: {"items":[{"type":"img","src":"..."},{"type":"qq","uid":"..."},...]}
 */
export interface TipJsonPayload {
  items: TipJsonItem[];
}

/**
 * Shape of the XML document in action gray tip (tag 48214).
 * Example structure:
 * <gtip align="center">
 *   <qq uin="..." col="1" nm="" />
 *   <img src="..." jp="..." />
 *   <nor txt="戳了戳"/>
 *   <qq uin="..." col="1" nm="" tp="0"/>
 *   <nor txt="的oF₆，剩下甲基吲哚"/>
 * </gtip>
 */
/**
 * Shape of the XML document in action gray tip (tag 48214).
 * Example structure:
 * <gtip align="center">
 *   <qq uin="..." col="1" nm="" />
 *   <img src="..." jp="..." />
 *   <nor txt="戳了戳"/>
 *   <qq uin="..." col="1" nm="" tp="0"/>
 *   <nor txt="的oF₆，剩下甲基吲哚"/>
 * </gtip>
 */
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

export interface GrayTipElement extends BaseElementFields {
  kind: 'grayTip';
  /** Action initiator user info (tag 48210, subType=17). */
  actionInitiator: ActionUser;
  /** Action target user info (tag 43210, subType=17). */
  actionTarget: ActionUser;
  /** Action type ID (tag 48211, subType=17). Observed: 12 (poke), 16 (red packet). */
  actionId: number;
  /** Detailed action ID (tag 48212, subType=17). 1=system, 1061=poke, 19357=red packet. */
  detailedId: number;
  /** Type flag (tag 48213, subType=17). Observed: 7. */
  typeFlag: number;
  /** XML preview document (tag 48214, subType=17). */
  xmlContent: string;
  /** Business logic ID (tag 48215, subType=17). Observed: 1132. */
  businessId: number;
  /** This action's unique ID (tag 48216, subType=17). */
  actionUniqueId: number;
  /** Additional attributes (tag 48217, repeated, subType=17). */
  attributes: ActionAttr[];
  /** Tip JSON payload (tag 48271, subType=17). Parse with JSON.parse() to TipJsonPayload. */
  tipJson: string;
  /** Tip type (tag 48273, subType=17). 1=system, matches detailedId. */
  tipType: number;
}

export interface CallElement extends BaseElementFields {
  kind: 'call';
  /** Call status type (tag 48151), matches subType. */
  callType: number;
  /** Call duration in milliseconds (tag 48152). Connection time or waiting time. */
  duration: number;
  /** Call method (tag 48153). 1=voice, 2=video, 3=screen share, 5=remote assist. */
  callMethod: CallType;
  /** Unknown type flag (tag 48155, optional). Observed: 0, 1, 2, or absent. */
  unknownType?: number;
  /** Call summary (tag 48157). */
  summary: string[];
}

export interface OnlineFileElement extends BaseElementFields {
  kind: 'onlineFile';
  /** File name (tag 45402, shared with PIC). */
  fileName: string;
  /** Local file path (tag 45403). */
  filePath: string;
  /** File size in bytes (tag 45405, shared with PIC). */
  fileSize: number;
  /** Image width if applicable (tag 45411, shared with PIC). */
  imgWidth: number;
  /** Image height if applicable (tag 45412, shared with PIC). */
  imgHeight: number;
  /** Download token (tag 45503, shared with PIC). */
  fileToken: string;
}

export interface OnlineFolderElement extends BaseElementFields {
  kind: 'onlineFolder';
  /** Folder name (tag 45402, shared with PIC). */
  fileName: string;
  /** Local folder path (tag 45403). */
  filePath: string;
  /** Folder size in bytes (tag 45405, shared with PIC). */
  fileSize: number;
  /** Folder token (tag 45503, shared with PIC). */
  fileToken: string;
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

export type Element = TextElement | PicElement | PttElement | FaceElement | GrayTipElement | ArkElement | MultiMsgElement | CallElement | OnlineFileElement | OnlineFolderElement | UnknownElement;
