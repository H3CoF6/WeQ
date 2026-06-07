/**
 * Group-only row column schemas.
 *
 * Columns OTHER than 40800 on `group_msg_table` rows. Each BLOB column gets
 * its own protobuf schema here — these carry sender uid/name, group-context
 * info, reply target, etc.
 *
 * TODO(reverse-engineering): rename placeholders to semantic names as columns
 * are decoded against real rows.
 */

import { ProtoField, ScalarType } from '../../../core';

/** Placeholder for one of the BLOB columns on group rows. */
export const GroupRowPb40050 = {
  unknown_1: ProtoField(1, ScalarType.BYTES, { optional: true }),
};

/** Placeholder for another BLOB column on group rows. */
export const GroupRowPb40027 = {
  unknown_1: ProtoField(1, ScalarType.BYTES, { optional: true }),
};
