/**
 * tRPC client + React Query glue for the renderer.
 *
 * - `ipcLink` from `electron-trpc/renderer` carries calls over the IPC
 *   bridge set up in the preload.
 * - Uses superjson transformer (matches server-side config).
 *
 * Exports:
 *   - `trpc`   — React hooks via createTRPCReact<AppRouter>()
 *   - `client` — vanilla proxy client for one-off calls outside React
 */

import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, type TRPCLink } from '@trpc/client';
import { ipcLink } from 'electron-trpc/renderer';
import superjson from 'superjson';
import type { AppRouter } from '../../../shared/router';

export const trpc = createTRPCReact<AppRouter>();

export function makeLinks(): TRPCLink<AppRouter>[] {
  return [ipcLink() as unknown as TRPCLink<AppRouter>];
}

export const client = createTRPCProxyClient<AppRouter>({
  links: makeLinks(),
  transformer: superjson,
});
