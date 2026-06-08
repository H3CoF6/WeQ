/**
 * High-level handle to one open QQ NT database.
 *
 * `nt_helper` already does the heavy caching (one Connection per path), so
 * `QqDb` is intentionally thin: it remembers the SQLCipher key for this
 * database so callers don't pass it on every query, and it routes both reads
 * and writes through the same native binding.
 *
 * Construction does NOT open the database — the first `query()` / `write()`
 * call triggers the open + PRAGMA cipher dance inside native. Use `close()`
 * to drop the cached native handle when you're done (e.g. on account switch).
 */

import type { NativeBinding, SqlRow, SqlValue } from './types';

export interface QqDbOpenOptions {
  /** Absolute path to the QQ NT database file (encrypted, with QQ wrapper). */
  dbPath: string;
  /** SQLCipher key (hex passphrase or raw ASCII — both work). */
  key: string;
}

export class QqDb {
  readonly dbPath: string;
  private readonly key: string;
  private readonly native: NativeBinding;

  constructor(native: NativeBinding, opts: QqDbOpenOptions) {
    this.native = native;
    this.dbPath = opts.dbPath;
    this.key = opts.key;
  }

  /**
   * Execute a SELECT against this database. Returns rows as positional
   * `SqlValue` arrays. Use `rowsToObjects` from `./helpers` if you have a
   * static column list and prefer named access.
   */
  query(sql: string, params?: SqlValue[]): Promise<SqlRow[]> {
    return this.native.executeSqlWithKey(this.dbPath, sql, this.key, params ?? null);
  }

  /**
   * Execute an INSERT / UPDATE / DELETE. Returns the number of rows affected.
   *
   * ⚠️  Writes go to QQ's live database. Always back up first and prefer to
   *     run with QQ fully closed. See `apps/desktop` for the safety gate.
   */
  write(sql: string, params?: SqlValue[]): Promise<number> {
    return this.native.executeSqlWriteWithKey(this.dbPath, sql, this.key, params ?? null);
  }

  /** Drop both the read and write cached connections for this database. */
  close(): void {
    this.native.closeDb(this.dbPath);
  }
}

export * from './types';
export * from './helpers';
