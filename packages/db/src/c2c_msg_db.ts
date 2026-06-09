/**
 * `c2c_msg_table` — private-chat (one-on-one) messages.
 *
 * Column map (subset we actually read; more columns exist):
 *   40001  msgId         (INTEGER)
 *   40020  senderUid     (TEXT)
 *   40021  peerUid       (TEXT)
 *   40030  peerUin       (INTEGER)
 *   40033  senderUin     (INTEGER)
 *   40050  sendTime      (INTEGER, unix seconds)
 *   40800  msgBody       (BLOB — protobuf repeated ElementWire)
 *
 * The 40800 column is decoded by `@weq/codec`. Row-level columns and
 * decoded elements are assembled into `C2cMsg`.
 */

import { ProtoMsg } from '@weq/codec';
import { decodeElement } from '@weq/codec';
import { MsgBody } from '@weq/codec/proto/msg/common/body';
import type { NtHelperBinding, SqlRow, SqlValue } from '@weq/native';
import type { C2cMsg } from './msg';
import { QqDb } from './qq_db';

const SELECT_COLUMNS = `"40001","40020","40021","40030","40033","40050","40800"`;
const bodyCodec = new ProtoMsg(MsgBody);

export interface C2cMsgDbOptions {
  /** Absolute path to nt_msg.db. */
  dbPath: string;
  /** SQLCipher key. */
  key: string;
}

export class C2cMsgDb {
  private readonly qq: QqDb;

  constructor(nt: NtHelperBinding, opts: C2cMsgDbOptions) {
    this.qq = new QqDb(nt, { dbPath: opts.dbPath, key: opts.key });
  }

  /**
   * Most recent N messages exchanged with one peer, newest first.
   *
   * `peerUin` is the QQ number of the contact (not the encoded uid). We
   * intentionally filter on `40030` (peerUin) — using the uid here would
   * require an extra lookup, and the caller always knows the uin.
   */
  async listRecentWithPeer(peerUin: bigint, limit = 50): Promise<C2cMsg[]> {
    const rows = await this.qq.query(
      `SELECT ${SELECT_COLUMNS} FROM c2c_msg_table
        WHERE "40030" = ?
        ORDER BY "40050" DESC
        LIMIT ?`,
      [peerUin, BigInt(limit)],
    );
    return rows.map(rowToC2cMsg);
  }

  /** Most recent N messages across all peers, newest first. Useful for "test dump". */
  async listRecent(limit = 50): Promise<C2cMsg[]> {
    const rows = await this.qq.query(
      `SELECT ${SELECT_COLUMNS} FROM c2c_msg_table
        ORDER BY "40050" DESC
        LIMIT ?`,
      [BigInt(limit)],
    );
    return rows.map(rowToC2cMsg);
  }

  /** Drop the cached native connection. Call on account switch / shutdown. */
  close(): void {
    this.qq.close();
  }
}

// ---------- row → C2cMsg --------------------------------------------------

function rowToC2cMsg(row: SqlRow): C2cMsg {
  return {
    msgId: toBigint(row[0]),
    senderUid: toStr(row[1]),
    peerUid: toStr(row[2]),
    peerUin: toBigint(row[3]),
    senderUin: toBigint(row[4]),
    sendTime: toBigint(row[5]),
    elements: decodeBody(row[6]),
  };
}

function decodeBody(blob: SqlValue | undefined): C2cMsg['elements'] {
  if (!(blob instanceof Uint8Array)) return [];
  const decoded = bodyCodec.decode(blob);
  return (decoded.elements ?? []).map(decodeElement);
}

function toBigint(v: SqlValue | undefined): bigint {
  if (typeof v === 'bigint') return v;
  if (typeof v === 'number') return BigInt(v);
  if (typeof v === 'string' && v !== '') return BigInt(v);
  return 0n;
}

function toStr(v: SqlValue | undefined): string {
  return typeof v === 'string' ? v : String(v ?? '');
}
