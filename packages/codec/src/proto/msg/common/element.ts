/**
 * Element envelope wire schema — describes the physical protobuf shape of
 * ONE element inside the 40800 repeated container.
 *
 * The wire layout is FLAT: `elementType` (45002) is a discriminator that
 * tells you which of the per-type fields (textContent at 45101, … future
 * face/pic/file tags) carry the actual payload.
 *
 * Tag conventions:
 *   - 40010..40019 — envelope-level metadata shared by every element
 *   - 45001..45099 — element common fields (id, type, sub-type, …)
 *   - 45101..45199 — TEXT element specific
 *   - 45201..45299 — FACE element specific
 *   - 49154/49155  — roaming / msg-sync flags
 *
 * Philosophy:
 *   ALL tags are parsed and lifted into Element objects. The msg/UI layer
 *   decides which fields matter for rendering or editing. This keeps the
 *   codec layer thin and protocol-focused, avoiding dual maintenance of
 *   "important" vs "envelope-only" field classifications.
 */

import { ProtoField, ScalarType } from '../../../core';

/** Nested message for action user info (tags 48210/43210). */
export const ActionUserWire = {
  uid: ProtoField(1005, ScalarType.STRING, { optional: true }),
  nickname: ProtoField(1006, ScalarType.STRING, { optional: true }),
};

/** Nested message for action attributes (tag 48217, repeated). */
export const ActionAttrWire = {
  key: ProtoField(1005, ScalarType.STRING, { optional: true }),
  value: ProtoField(1006, ScalarType.STRING, { optional: true }),
};

export const ElementWire = {
  /**
   * Whether this device originated the message. Absent for messages received
   * from peers AND for messages sent by other devices of this account. Set
   * to true only when this exact device pressed Send.
   */
  isSender: ProtoField(40010, ScalarType.BOOL, { optional: true }),

  /** Element serial number. Required. */
  elementId: ProtoField(45001, ScalarType.UINT64, { optional: true }),

  /** Element type discriminator. Required. Values come from `element/types.ts`. */
  elementType: ProtoField(45002, ScalarType.UINT32, { optional: true }),

  /** Element sub-type (semantics depend on elementType). Optional. */
  subType: ProtoField(45003, ScalarType.UINT32, { optional: true }),

  // ---- TEXT (elementType=1) ----

  /** Text content. Required for TEXT elements. */
  textContent: ProtoField(45101, ScalarType.STRING, { optional: true }),

  /** Text envelope flag observed in QQ protocol. */
  textReserve: ProtoField(45102, ScalarType.UINT32, { optional: true }),

  // Category 2 — observed in the wild on TEXT rows. Parsed (so protolab
  // labels them) but neither lifted into TextElement nor written back. Best
  // guesses at semantics are kept in the field doc — none verified.

  /** 文本编码 / 加密标志. Best guess: integer flag. */
  textEncodingFlag: ProtoField(45103, ScalarType.UINT32, { optional: true }),

  /** 字体 / 样式相关. Best guess: integer flag. */
  fontStyle: ProtoField(45104, ScalarType.UINT32, { optional: true }),

  /** 气泡 ID. Best guess: string id. */
  bubbleId: ProtoField(45105, ScalarType.STRING, { optional: true }),

  /** 文本输入状态. Best guess: integer flag. */
  textInputState: ProtoField(45106, ScalarType.UINT32, { optional: true }),

  // 45107 — not observed yet.

  /** 翻译 / 转换标志. Best guess: integer flag. */
  translationFlag: ProtoField(45108, ScalarType.UINT32, { optional: true }),

  /** 链接识别标志. Best guess: integer flag. */
  linkDetectionFlag: ProtoField(45109, ScalarType.UINT32, { optional: true }),

  /** @相关位掩码. Best guess: string-encoded bitmask. */
  atMentionMask: ProtoField(45110, ScalarType.STRING, { optional: true }),

  /** 红包 / 钱包含义标志. Best guess: integer flag. */
  walletFlag: ProtoField(45111, ScalarType.UINT32, { optional: true }),

  /** 网址校验字段. Best guess: integer flag. */
  urlVerifyFlag: ProtoField(45112, ScalarType.UINT32, { optional: true }),

  // ---- PIC (elementType=2) ----

  /** Image filename. Required for PIC elements. */
  fileName: ProtoField(45402, ScalarType.STRING, { optional: true }),

  /** Local file path. Used by PTT and ONLINE_FILE elements. */
  filePath: ProtoField(45403, ScalarType.STRING, { optional: true }),

  /** File size in bytes. Required for PIC elements. */
  fileSize: ProtoField(45405, ScalarType.UINT32, { optional: true }),

  /** Binary MD5 hash. Required for PIC elements. */
  md5Bytes: ProtoField(45406, ScalarType.BYTES, { optional: true }),

  /** Content verification hash. Required for PIC elements. */
  contentHash: ProtoField(45408, ScalarType.BYTES, { optional: true }),

  /** Image width in pixels. Required for PIC elements. */
  imgWidth: ProtoField(45411, ScalarType.UINT32, { optional: true }),

  /** Image height in pixels. Required for PIC elements. */
  imgHeight: ProtoField(45412, ScalarType.UINT32, { optional: true }),

  /** Image type: 1000=normal, 2000=emoji, 1001=original. Required for PIC elements. */
  imgType: ProtoField(45416, ScalarType.UINT32, { optional: true }),

  /** Whether original quality. Required for PIC elements. */
  isOriginal: ProtoField(45418, ScalarType.BOOL, { optional: true }),

  /** Uppercase hex MD5 string. Required for PIC elements. */
  md5: ProtoField(45424, ScalarType.STRING, { optional: true }),

  /** Download token. Required for PIC elements. */
  fileToken: ProtoField(45503, ScalarType.STRING, { optional: true }),

  /** Upload/processing timestamp. Required for PIC elements. */
  uploadTime: ProtoField(45505, ScalarType.UINT32, { optional: true }),

  /** Transfer state flag. */
  picTransferState: ProtoField(45511, ScalarType.UINT32, { optional: true }),

  /** Transfer version flag. */
  transferVersion: ProtoField(45513, ScalarType.UINT32, { optional: true }),

  /** Upload timestamp. Required for PIC elements. */
  uploadTimestamp: ProtoField(45517, ScalarType.UINT32, { optional: true }),

  /** File TTL in seconds. Required for PIC elements. */
  fileTTL: ProtoField(45518, ScalarType.UINT32, { optional: true }),

  /** Thumbnail download URL. Required for PIC elements. */
  thumbnailUrl: ProtoField(45802, ScalarType.STRING, { optional: true }),

  /** Preview download URL. Required for PIC elements. */
  previewUrl: ProtoField(45803, ScalarType.STRING, { optional: true }),

  /** Original image download URL. Required for PIC elements. */
  originalUrl: ProtoField(45804, ScalarType.STRING, { optional: true }),

  /** Image summary/description. Repeated field. Required for PIC elements. */
  summary: ProtoField(45815, ScalarType.STRING, { repeat: true }),

  /** CDN host domain. Required for PIC elements. */
  cdnHost: ProtoField(45816, ScalarType.STRING, { optional: true }),

  /** PIC protocol flag. */
  picFlag45817: ProtoField(45817, ScalarType.UINT32, { optional: true }),

  picFlag45818: ProtoField(45818, ScalarType.STRING, { optional: true }),
  picFlag45819: ProtoField(45819, ScalarType.STRING, { optional: true }),
  picFlag45820: ProtoField(45820, ScalarType.STRING, { optional: true }),

  picFlag45821: ProtoField(45821, ScalarType.UINT32, { optional: true }),
  picFlag45822: ProtoField(45822, ScalarType.UINT32, { optional: true }),
  picFlag45823: ProtoField(45823, ScalarType.UINT32, { optional: true }),

  picFlag45824: ProtoField(45824, ScalarType.STRING, { optional: true }),

  picFlag45825: ProtoField(45825, ScalarType.UINT32, { optional: true }),
  picFlag45826: ProtoField(45826, ScalarType.UINT32, { optional: true }),
  picFlag45827: ProtoField(45827, ScalarType.UINT32, { optional: true }),

  picFlag45828: ProtoField(45828, ScalarType.STRING, { optional: true }),

  // ---- PTT (elementType=4) ----
  // PTT reuses most PIC tags (45402-45518, 45815) for file metadata.

  /** Transfer state (optional). */
  transferState: ProtoField(45550, ScalarType.UINT32, { optional: true }),

  /** Voice type: 1=intercom, 2=recording. Required for PTT elements. */
  pttType: ProtoField(45906, ScalarType.UINT32, { optional: true }),

  /** PTT protocol flag. */
  pttFlag45907: ProtoField(45907, ScalarType.UINT32, { optional: true }),

  pttFlag45909: ProtoField(45909, ScalarType.UINT32, { optional: true }),

  /** Whether voice is changed/transformed. Required for PTT elements. */
  voiceChanged: ProtoField(45911, ScalarType.BOOL, { optional: true }),

  pttFlag45922: ProtoField(45922, ScalarType.UINT32, { optional: true }),

  /** Audio waveform data for visualization. Required for PTT elements. */
  waveform: ProtoField(45925, ScalarType.BYTES, { optional: true }),

  // ---- GRAY_TIP (elementType=8) ----
  // subType=17: action interactions (poke, red packet, etc.)

  /** Action target user info (subType=17). Nested: {1005: uid, 1006: nickname}. */
  actionTarget: ProtoField(43210, () => ActionUserWire, { optional: true }),

  /** Action initiator user info (subType=17). Nested: {1005: uid, 1006: nickname}. */
  actionInitiator: ProtoField(48210, () => ActionUserWire, { optional: true }),

  /** Action type ID (subType=17). Observed: 12 (poke), 16 (red packet). */
  actionId: ProtoField(48211, ScalarType.UINT32, { optional: true }),

  /** Detailed action ID (subType=17). 1=system, 1061=poke, 19357=red packet. */
  detailedId: ProtoField(48212, ScalarType.UINT32, { optional: true }),

  /** Type flag (subType=17). Observed: 7. */
  typeFlag: ProtoField(48213, ScalarType.UINT32, { optional: true }),

  /** XML preview document (subType=17). */
  grayTipXmlContent: ProtoField(48214, ScalarType.STRING, { optional: true }),

  /** Business logic ID (subType=17). Observed: 1132. */
  businessId: ProtoField(48215, ScalarType.UINT32, { optional: true }),

  /** This action's unique ID (subType=17). */
  actionUniqueId: ProtoField(48216, ScalarType.UINT32, { optional: true }),

  /** Additional attributes (subType=17). Repeated nested: {1005: key, 1006: value}. */
  actionAttributes: ProtoField(48217, () => ActionAttrWire, { repeat: true }),

  /** Category 2 — reserved field. Observed but not required. */
  grayTipReserved: ProtoField(48218, ScalarType.STRING, { optional: true }),

  /** Tip JSON payload (subType=17). Required for action gray tips. */
  tipJson: ProtoField(48271, ScalarType.STRING, { optional: true }),

  /** Category 2 — unknown flag. Observed: true. */
  grayTipFlag48272: ProtoField(48272, ScalarType.BOOL, { optional: true }),

  /** Tip type (subType=17). 1=system, matches detailedId. Required for action gray tips. */
  tipType: ProtoField(48273, ScalarType.UINT32, { optional: true }),

  /** Category 2 — observed field, not parsed. */
  grayTipFlag48275: ProtoField(48275, ScalarType.UINT32, { optional: true }),

  // ---- FACE (elementType=6) ----

  /** Extended description. Optional for FACE elements. */
  faceExtDesc: ProtoField(45004, ScalarType.STRING, { optional: true }),

  /** Face id. Required for FACE elements. (`FaceIndex.DICE = 358`.) */
  faceId: ProtoField(47601, ScalarType.UINT32, { optional: true }),

  /** Face text description. Required for FACE elements. */
  faceText: ProtoField(47602, ScalarType.STRING, { optional: true }),

  /** Super-emoji category. Optional for super-emoji FACE elements. */
  superEmojiCategory: ProtoField(47603, ScalarType.STRING, { optional: true }),

  /** Super-emoji code/number. Optional for super-emoji FACE elements. */
  superEmojiCode: ProtoField(47604, ScalarType.STRING, { optional: true }),

  /** Super-emoji flag 1. Optional for super-emoji FACE elements. */
  superEmojiFlag1: ProtoField(47605, ScalarType.UINT32, { optional: true }),

  /** Super-emoji flag 2. Optional for super-emoji FACE elements. */
  superEmojiFlag2: ProtoField(47606, ScalarType.UINT32, { optional: true }),

  /**
   * Super-emoji dice roll, "1".."6" as string. Only present when subType=3
   * AND faceId points at the dice face.
   */
  diceValue: ProtoField(47607, ScalarType.STRING, { optional: true }),

  /** Super-emoji flag 3. Optional for super-emoji FACE elements. */
  superEmojiFlag3: ProtoField(47609, ScalarType.UINT32, { optional: true }),

  /** Super-emoji flag 4. Optional for super-emoji FACE elements. */
  superEmojiFlag4: ProtoField(47610, ScalarType.UINT32, { optional: true }),

  /** Whether emoji supports chain reaction. Optional for FACE elements. */
  canChain: ProtoField(47622, ScalarType.BOOL, { optional: true }),

  // ---- ARK (elementType=10) ----

  /**
   * Ark card / mini-program JSON payload. UTF-8 string holding a JSON
   * document. Shape varies per `view` field of the JSON — see ArkPayload
   * and `SAMPLE_GAME_CENTER_AD` in `element/ark.ts` for a worked example.
   */
  arkData: ProtoField(47901, ScalarType.STRING, { optional: true }),

  // ---- MULTI_MSG (elementType=16) ----

  /**
   * Server resource ID for merged forward message chain. Used to fetch the
   * full message history from QQ servers. Required for MULTI_MSG elements.
   */
  resId: ProtoField(48601, ScalarType.STRING, { optional: true }),

  /**
   * XML preview document. Carries message titles, summary, and metadata for
   * rendering the forward card. Required for MULTI_MSG elements.
   */
  xmlContent: ProtoField(48602, ScalarType.STRING, { optional: true }),

  /**
   * Session identifier linking this forward element to its upload session.
   * Appears as `m_fileName` in the XML. Required for MULTI_MSG elements.
   */
  sessionId: ProtoField(48603, ScalarType.STRING, { optional: true }),

  // ---- CALL (elementType=21) ----

  /** Call status type, matches subType. Required for CALL elements. */
  callType: ProtoField(48151, ScalarType.UINT32, { optional: true }),

  /** Call duration in milliseconds. Required for CALL elements. */
  duration: ProtoField(48152, ScalarType.UINT32, { optional: true }),

  /** Call method: 1=voice, 2=video, 3=screen share, 5=remote assist. Required for CALL elements. */
  callMethod: ProtoField(48153, ScalarType.UINT32, { optional: true }),

  /** Unknown type flag. Optional for CALL elements. Observed: 0, 1, 2, or absent. */
  callUnknownType: ProtoField(48155, ScalarType.UINT32, { optional: true }),

  /** CALL protocol flag. */
  callFlag48156: ProtoField(48156, ScalarType.UINT32, { optional: true }),

  /** Call summary. Required for CALL elements. */
  callSummary: ProtoField(48157, ScalarType.STRING, { repeat: true }),

  // ---- ONLINE_FILE (elementType=23) ----
  // Reuses PIC tags: 45402 (fileName), 45403 (filePath), 45405 (fileSize),
  // 45411 (imgWidth), 45412 (imgHeight), 45503 (fileToken).

  /** File related identifier. */
  fileFlag45415: ProtoField(45415, ScalarType.UINT32, { optional: true }),

  /** Transfer flag. */
  transferFlag45504: ProtoField(45504, ScalarType.STRING, { optional: true }),

  // ---- Roaming / sync flags — category 2 envelope tags ----

  /** Roaming marker. Read for completeness; not part of any element. */
  roaming: ProtoField(49154, ScalarType.BYTES, { optional: true }),

  /** Message-sync timestamp. Read for completeness; not part of any element. */
  msgSyncFlag: ProtoField(49155, ScalarType.UINT64, { optional: true }),
};
