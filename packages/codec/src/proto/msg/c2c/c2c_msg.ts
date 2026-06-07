/**
 * C2C (private chat) message body schema (table: `c2c_msg_table` in nt_msg.db).
 *
 * The element wire-format overlaps heavily with group messages, but the
 * envelope around it (routing, encryption hints) differs — keep these
 * schemas distinct from `../group/group_msg.ts` so you can't accidentally
 * decode a private message as a group one and vice versa.
 */

import { ProtoField, ScalarType } from '../../../core';
import { Elem } from '../elements';

/** Row.body — main message body for C2C. */
export const C2cMsgBody = {
  richText: ProtoField(1, () => C2cRichText, { optional: true }),
};

export const C2cRichText = {
  elems: ProtoField(2, () => Elem, { optional: true, repeat: true }),
  attr: ProtoField(3, ScalarType.BYTES, { optional: true }),
  // TODO: ptt, trans211TmpMsg ...
};

/** Row.pb_reserve — C2C auxiliary blob. */
export const C2cMsgPbReserve = {
  unknown_3: ProtoField(3, ScalarType.BYTES, { optional: true, inElement: false }),
};
