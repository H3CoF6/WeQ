/**
 * friend_info / buddy_info table — one row per friend.
 *
 * TODO(reverse-engineering): identify the BLOB columns and tag layouts.
 */

import { ProtoField, ScalarType } from '../../core';

export const FriendInfoPbReserve = {
  unknown_1: ProtoField(1, ScalarType.BYTES, { optional: true }),
};
