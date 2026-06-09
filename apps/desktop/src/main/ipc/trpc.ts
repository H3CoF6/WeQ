/**
 * tRPC server setup for the Electron main process.
 *
 * Uses superjson transformer to handle bigint, Date, and other non-JSON types.
 * electron-trpc 0.7 + tRPC v11 requires an explicit transformer on both sides.
 */

import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.create({
  transformer: superjson,
});

export const router = t.router;
export const procedure = t.procedure;
