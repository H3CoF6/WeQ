/**
 * Domain message model — Layer 3 of the codec stack.
 *
 * A Message is what the renderer ultimately consumes: a list of Elements
 * plus the row-level metadata (who, when, where) needed to display them.
 *
 * Per-chat-type extensions live here because group vs. c2c differ in
 * sender/peer semantics. Both share the BaseMessage core.
 *
 * Many fields are stubbed (TODO RE) — the exact mapping from each SQL
 * column to a field will be filled in by `row_to_message.ts` as the row
 * schemas in `proto/msg/{group,c2c}/row.ts` get RE'd.
 */

import type { Element } from '../element';

export interface BaseMessage {
  msgId: string;
  msgSeq: string;
  msgTime: string;
  senderUid: string;
  peerUid: string;
  elements: Element[];
}

export interface GroupMessage extends BaseMessage {
  chatType: 'group';
  /** TODO(RE): sender display name, role, anonymous info, … */
}

export interface C2cMessage extends BaseMessage {
  chatType: 'c2c';
  /** TODO(RE): c2c-specific routing fields */
}

export type Message = GroupMessage | C2cMessage;
