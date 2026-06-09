/**
 * Helpers to stringify `bigint` at the IPC boundary.
 *
 * tRPC v11 + electron-trpc 0.7 don't agree on transformer wiring yet,
 * so we deliberately ship `bigint` as `string`. The conversion is done
 * here once per router shape — keeps the IPC contract explicit.
 *
 * Renderer-side: every uin / msgId / sendTime arrives as `string` and
 * the renderer can `BigInt(s)` back if it needs arithmetic. Display
 * code (`<div>{uin}</div>`) is no-op.
 */

import type { C2cMsg, C2cPeer } from '@weq/db';

export interface C2cPeerWire {
  peerUin: string;
  lastSendTime: string;
  msgCount: number;
}

export interface C2cMsgWire {
  msgId: string;
  peerUin: string;
  senderUin: string;
  peerUid: string;
  senderUid: string;
  sendTime: string;
  elements: unknown[];
}

export function peerToWire(p: C2cPeer): C2cPeerWire {
  return {
    peerUin: p.peerUin.toString(),
    lastSendTime: p.lastSendTime.toString(),
    msgCount: p.msgCount,
  };
}

export function msgToWire(m: C2cMsg): C2cMsgWire {
  return {
    msgId: m.msgId.toString(),
    peerUin: m.peerUin.toString(),
    senderUin: m.senderUin.toString(),
    peerUid: m.peerUid,
    senderUid: m.senderUid,
    sendTime: m.sendTime.toString(),
    elements: sanitize(m.elements),
  };
}

/**
 * Deep-sanitize any object to be IPC-safe.
 * - Uint8Array -> hex string
 * - bigint -> string
 */
function sanitize(v: any): any {
  if (v === null || v === undefined) return v;
  if (typeof v === 'bigint') return v.toString();
  if (v instanceof Uint8Array) {
    return Array.from(v)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  if (Array.isArray(v)) return v.map(sanitize);
  if (typeof v === 'object') {
    const out: Record<string, any> = {};
    for (const k of Object.keys(v)) {
      out[k] = sanitize(v[k]);
    }
    return out;
  }
  return v;
}
