/**
 * Element envelope wire schema — describes the physical protobuf shape of
 * ONE element inside the 40800 repeated container.
 *
 * The wire layout is FLAT: `elementType` (45002) is a discriminator that
 * tells you which of the per-type fields (textContent at 45101, … future
 * face/pic/file tags) carry the actual payload. The Element codec layer
 * decides what to lift into the high-level Element model — this schema
 * just describes what bytes can appear.
 *
 * Tag conventions:
 *   - 40010..40019 — envelope-level metadata shared by every element
 *   - 45001..45099 — element common fields (id, type, sub-type, …)
 *   - 45101..45199 — TEXT element specific
 *   - 45201..45299 — (future) FACE
 *   - 49154/49155  — roaming / msg-sync flags, ignored on read & write
 *
 * Each declared field falls into one of three roles:
 *   - Element-visible: read in `element/<kind>.fromWire`, written back in
 *     `toWire` from a field on the Element interface.
 *   - Category 1 (envelope flag): NOT exposed on Element, but QQ requires it
 *     on the wire. Declare with a `default` value and ProtoMsg.encode will
 *     auto-fill it. Example: 45102.
 *   - Category 2 (parse-but-ignore): NOT exposed on Element, NOT required on
 *     write. Declare with NO default so it's parsed for documentation and
 *     protolab visibility, but silently dropped on serialize. Examples:
 *     45103..45112, 49154, 49155.
 */

import { ProtoField, ScalarType } from '../../../core';

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

  /** Category 1 — envelope flag QQ always emits as 0. Auto-filled on encode. */
  textReserve: ProtoField(45102, ScalarType.UINT32, { optional: true, default: 0 }),

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

  // ---- FACE (elementType=6) ----

  /** Face id. Required for FACE elements. (`FaceIndex.DICE = 358`.) */
  faceId: ProtoField(47601, ScalarType.UINT32, { optional: true }),

  /** Face text description. Required for FACE elements. */
  faceText: ProtoField(47602, ScalarType.STRING, { optional: true }),

  /**
   * Super-emoji dice roll, "1".."6" as string. Only present when subType=3
   * AND faceId points at the dice face. 47603..47606 and 47608+ have been
   * observed on the wire but never carried anything useful — deliberately
   * NOT declared here so protobuf-ts skips them as unknown fields.
   */
  diceValue: ProtoField(47607, ScalarType.STRING, { optional: true }),

  // ---- ARK (elementType=10) ----

  /**
   * Ark card / mini-program JSON payload. UTF-8 string holding a JSON
   * document. Shape varies per `view` field of the JSON — see ArkPayload
   * and `SAMPLE_GAME_CENTER_AD` in `element/ark.ts` for a worked example.
   */
  arkData: ProtoField(47901, ScalarType.STRING, { optional: true }),

  // ---- Roaming / sync flags — category 2 envelope tags ----

  /** Roaming marker. Read for completeness; not part of any element. */
  roaming: ProtoField(49154, ScalarType.BYTES, { optional: true }),

  /** Message-sync marker. Same treatment as 49154. */
  msgSyncFlag: ProtoField(49155, ScalarType.BYTES, { optional: true }),
};
