/**
 * Account-scoped router — only usable once `bootstrap.openAccount`
 * resolved. Every procedure asserts an account session is open and
 * throws otherwise.
 *
 * `bigint` fields (uin / msgId / sendTime) are stringified at the IPC
 * boundary (see `../serde.ts`). The renderer is responsible for
 * `BigInt(s)`-ing them back if it needs arithmetic — most code just
 * displays them as text.
 */

import { z } from 'zod';
import { getAppContext } from '../../context/app_context';
import { procedure, router } from '../trpc';
import { msgToWire, peerToWire } from '../serde';
import type { AccountSession } from '@weq/account';

function requireSession(): AccountSession {
  const ctx = getAppContext();
  if (!ctx.account) {
    throw new Error('No account session open — call bootstrap.openAccount first.');
  }
  return ctx.account;
}

export const accountRouter = router({
  /** Distinct c2c peers, newest activity first. */
  listPeers: procedure.query(async () => {
    const peers = await requireSession().c2cMsgs.listPeers();
    return peers.map(peerToWire);
  }),

  /**
   * Paginated c2c messages with one peer, newest first.
   *
   * v0: simple offset paging. SQLite indexes the (40030, 40050) pair, so
   * `OFFSET ?` stays cheap even at page 10. Switch to cursor paging if
   * we ever care about a peer with tens of thousands of rows.
   */
  listMessagesWithPeer: procedure
    .input(
      z.object({
        peerUin: z.string(),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const session = requireSession();
      // Use SQL pagination directly for O(limit) performance.
      const all = await session.c2cMsgs.listRecentWithPeer(
        BigInt(input.peerUin),
        input.limit,
        input.offset,
      );
      return all.map(msgToWire);
    }),
});
