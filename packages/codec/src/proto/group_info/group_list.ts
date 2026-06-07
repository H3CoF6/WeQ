/**
 * group_list table — one row per joined group.
 *
 * The encrypted test row had two BLOB columns:
 *   - column 33 (~36 bytes)  → probably "group settings" packed pb
 *   - column 41 (~150 bytes) → probably "group profile / classify" packed pb
 *
 * TODO(reverse-engineering): identify each tag and rename the columns.
 */

import { ProtoField, ScalarType } from '../../core';

/** group_list.column_33 — 36-byte BLOB seen on every row. */
export const GroupListPb33 = {
  unknown_1: ProtoField(1, ScalarType.UINT64, { optional: true, inElement: false }),
  unknown_2: ProtoField(2, ScalarType.UINT32, { optional: true, inElement: false }),
};

/** group_list.column_41 — 150-byte BLOB seen on every row. */
export const GroupListPb41 = {
  unknown_1: ProtoField(1, ScalarType.STRING, { optional: true, inElement: false }),
};
