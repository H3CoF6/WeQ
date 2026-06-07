/**
 * C2C-only row column schemas.
 *
 * Columns OTHER than 40800 on `c2c_msg_table` rows. Counterpart of
 * `../group/row.ts`. Most of the element-body shape is shared via
 * `../common/{element,body}.ts`; only sender/peer routing differs and
 * lives in this file.
 *
 * TODO(reverse-engineering): rename placeholders to semantic names.
 */

import { ProtoField, ScalarType } from '../../../core';

/** Placeholder for one of the BLOB columns on c2c rows. */
export const C2cRowPb40050 = {
  unknown_1: ProtoField(1, ScalarType.BYTES, { optional: true }),
};
