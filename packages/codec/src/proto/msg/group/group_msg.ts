/**
 * Group message body schema (table: `group_msg_table` in nt_msg.db).
 *
 * Each BLOB column on the row is a separate protobuf payload — declare one
 * exported schema per column so callers know which column to decode with which
 * schema.
 */

import { ProtoField, ScalarType } from '../../../core';
import { Elem } from '../elements';

/**
 * Row.body — the main message body BLOB on group messages.
 *
 * TODO(reverse-engineering): confirm tag numbers against real rows. The
 * placeholders below are guesses based on NapCat's group msg shape; fix tag
 * numbers once you've decoded a real sample in the Protobuf Lab.
 */
export const GroupMsgBody = {
  richText: ProtoField(1, () => GroupRichText, { optional: true }),
};

export const GroupRichText = {
  elems: ProtoField(2, () => Elem, { optional: true, repeat: true }),
  attr: ProtoField(3, ScalarType.BYTES, { optional: true }),
  // TODO: ptt, tmpPtt, trans211TmpMsg ...
};

/**
 * Row.pb_reserve — the auxiliary protobuf blob on group_msg_table rows.
 * Often carries reply-context, anonymous info, and forward markers.
 *
 * TODO(reverse-engineering): all field meanings.
 */
export const GroupMsgPbReserve = {
  unknown_3: ProtoField(3, ScalarType.BYTES, { optional: true, inElement: false }),
};
