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
 * Round-trip rule: `default` only set for fields QQ EXPECTS to be present.
 * Truly optional fields (e.g. 49154/49155) get no default — they just don't
 * appear in serialized bytes when not provided.
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

  /** Reserved field carried alongside text. Wire type varint; semantics TBD. */
  textReserve: ProtoField(45102, ScalarType.UINT32, { optional: true }),

  // tags 45103..45111 observed on the wire but verified to carry nothing
  // we need — intentionally not declared so they show up as `(unknown)` in
  // protolab and round-trip serialize drops them.

  // ---- Roaming / sync flags — never parsed, never written back ----

  /** Roaming marker. Read for completeness; not part of any element. */
  roaming: ProtoField(49154, ScalarType.BYTES, { optional: true }),

  /** Message-sync marker. Same treatment as 49154. */
  msgSyncFlag: ProtoField(49155, ScalarType.BYTES, { optional: true }),
};
