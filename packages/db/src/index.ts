/**
 * `@weq/db` — typed access to QQ NT databases.
 *
 * Each Db class wraps a single SQLCipher file behind the QqDb handle
 * (which talks to `@weq/native`). The classes are constructed by the
 * `account` package once the dbKey is known, and consumed by account
 * services.
 *
 * The codec layer is invoked inside each Db class — consumers above the
 * db boundary see decoded `Msg` shapes, not protobuf bytes.
 */

export { QqDb } from './qq_db';
export type { QqDbOptions } from './qq_db';
export { rowsToObjects } from './row';

export { C2cMsgDb } from './c2c_msg_db';
export type { C2cMsgDbOptions } from './c2c_msg_db';

export type { C2cMsg } from './msg';
