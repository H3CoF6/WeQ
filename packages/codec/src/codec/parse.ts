/**
 * Decode raw protobuf bytes (from `nt_helper.executeSqlWithKey`) into the
 * high-level element types from `@weq/types`.
 *
 * This direction is lossy on purpose: many wire-format fields are tooling
 * artifacts (compression hints, internal flags) that the renderer does not
 * need. The schemas under `../proto/` still declare those fields so the
 * encode path in `serialize.ts` can round-trip them with sensible defaults.
 */

// TODO: replace `Element = unknown` with the real union once @weq/types
// exposes a top-level `Element` discriminated union. Today the NapCat-style
// element shapes (TextElement, FaceElement, …) live in individual files and
// there's no convenience union yet — wire it up when the renderer side needs it.
export type Element = unknown;

export interface DecodeOptions {
  /** Drop unknown elements rather than emitting a placeholder Element. */
  strict?: boolean;
}

/**
 * Decode the `body` BLOB of one row of `group_msg_table` into a list of Elements.
 *
 * TODO(impl): NapProtoMsg(GroupMsgBody).decode(bytes) → walk richText.elems
 *             → map each Elem variant to an Element via a per-tag visitor.
 */
export function decodeGroupMsgBody(_bytes: Uint8Array, _opts: DecodeOptions = {}): Element[] {
  throw new Error('decodeGroupMsgBody not implemented yet');
}

/**
 * Decode the `body` BLOB of one row of `c2c_msg_table` into a list of Elements.
 *
 * TODO(impl): same shape as group, but using the C2C schemas.
 */
export function decodeC2cMsgBody(_bytes: Uint8Array, _opts: DecodeOptions = {}): Element[] {
  throw new Error('decodeC2cMsgBody not implemented yet');
}
