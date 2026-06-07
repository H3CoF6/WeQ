/**
 * Project a row of `SqlValue` arrays into an array of objects keyed by column
 * name. Saves callers from indexing by position when they already know the
 * schema.
 *
 * Lightweight helper — the heavy lifting (open/decrypt/cache) is in the
 * native layer, this is just a convenience wrapper.
 */

import type { SqlRow, SqlValue } from './types';

export function rowsToObjects<T extends Record<string, SqlValue>>(
  rows: SqlRow[],
  columns: ReadonlyArray<keyof T & string>,
): T[] {
  return rows.map((row) => {
    const obj = {} as T;
    for (let i = 0; i < columns.length; i++) {
      const key = columns[i];
      if (key === undefined) continue;
      (obj as Record<string, SqlValue>)[key] = (row[i] ?? null) as SqlValue;
    }
    return obj;
  });
}
