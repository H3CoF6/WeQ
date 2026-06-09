/**
 * Wraps the renderer tree with the trpc + react-query providers so
 * hooks like `trpc.bootstrap.describeInstall.useQuery()` work anywhere.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode, type ReactElement } from 'react';
import superjson from 'superjson';
import { trpc, makeLinks } from './client';

export function TrpcProvider({ children }: { children: ReactNode }): ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // Account dbs are read-only after open — refetches just waste time.
          queries: { staleTime: 5_000 },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({ links: makeLinks(), transformer: superjson }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
