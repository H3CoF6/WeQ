/**
 * Domain `Msg` shape — what consumers above the db layer see.
 *
 * This is the db-layer's enrichment of codec's `BaseMessage`: the codec
 * decoded the protobuf BLOB and gave us `Element[]`, but it didn't know
 * about row columns like 40030 (peerUin) or 40050 (sendTime). The db class
 * pulls those columns and assembles them with the decoded elements into
 * the `Msg` shape below.
 *
 * Numeric ids stay as `bigint` so we don't lose precision on 64-bit ids.
 * The TestMsgService stringifies them at the JSON boundary.
 */

import type { Element } from '@weq/codec';

export interface C2cMsg {
  msgId: bigint;
  peerUin: bigint;
  senderUin: bigint;
  peerUid: string;
  senderUid: string;
  /** Seconds since epoch (column 40050 is a unix-second integer). */
  sendTime: bigint;
  elements: Element[];
}

/** One row of the c2c peer list (left pane of the main view). */
export interface C2cPeer {
  /** Peer's QQ number — the "conversation id" for c2c chats. */
  peerUin: bigint;
  /** Most recent sendTime across all messages with this peer (unix seconds). */
  lastSendTime: bigint;
  /** Total messages on file with this peer. */
  msgCount: number;
}
