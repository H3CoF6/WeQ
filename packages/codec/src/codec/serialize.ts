/**
 * Encode high-level `Element` lists back into the protobuf wire format
 * expected by QQ NT's database tables.
 *
 * Mirror of `parse.ts`. Fields that were dropped on decode (because the
 * renderer doesn't care about them) are re-emitted here with their default
 * values — the proto schemas under `../proto/` are the source of truth for
 * what those defaults are.
 *
 * ⚠️  Writing back into the live QQ database is a high-risk operation:
 *     external indices, full-text tables, and aggregate columns are NOT
 *     updated by us. Always back up the .db file first and run with QQ
 *     fully closed. See repository README for the safety policy.
 */

import type { Element } from './parse';

export function encodeGroupMsgBody(_elements: Element[]): Uint8Array {
  throw new Error('encodeGroupMsgBody not implemented yet');
}

export function encodeC2cMsgBody(_elements: Element[]): Uint8Array {
  throw new Error('encodeC2cMsgBody not implemented yet');
}
