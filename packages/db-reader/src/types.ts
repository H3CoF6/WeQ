/**
 * Mirror of the `SqlValue` union that `nt_helper`'s napi layer emits on the
 * wire. Re-declared here so consumers can import it without a runtime
 * dependency on the closed-source native module.
 *
 * Keep this in sync with `Qrypt-Native/nt_helper/src/database/value.rs`:
 *   - INTEGER → `bigint` (full i64 precision)
 *   - REAL    → `number`
 *   - TEXT    → `string`
 *   - BLOB    → `Buffer` (Uint8Array also accepted on encode)
 *   - NULL    → `null`
 */
export type SqlValue = null | bigint | number | string | Buffer;

export type SqlRow = SqlValue[];

/**
 * The slice of `nt_helper` we depend on at runtime. The native loader in the
 * main process produces an object matching this shape; `QqDb` takes it as
 * a constructor argument so this package is testable without the .node file.
 */
export interface NativeBinding {
  executeSql(dbPath: string, sql: string, params?: SqlValue[] | null): Promise<SqlRow[]>;
  executeSqlWithKey(
    dbPath: string,
    sql: string,
    key: string,
    params?: SqlValue[] | null,
  ): Promise<SqlRow[]>;
  executeSqlWrite(
    dbPath: string,
    sql: string,
    params?: SqlValue[] | null,
  ): Promise<number>;
  executeSqlWriteWithKey(
    dbPath: string,
    sql: string,
    key: string,
    params?: SqlValue[] | null,
  ): Promise<number>;
  closeDb(dbPath: string): number;
  closeAllDb(): number;
}
