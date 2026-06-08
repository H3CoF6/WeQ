/**
 * Discover and HMR-watch every schema object exported from `@weq/codec/proto`.
 *
 * Vite's `import.meta.glob` with `eager: true` resolves to a module map at
 * build time; on dev, Vite re-evaluates any module in the glob when its source
 * file changes and triggers a full HMR cycle. We expose the schemas as
 * `useSchemas()` returning a list of `{ qualifiedName, schema }` so the UI
 * can show a dropdown that stays in sync with the filesystem.
 */

import { useEffect, useState } from 'react';
import type { ProtoMessageType } from '@weq/codec';

type Mod = Record<string, unknown>;

const modules = import.meta.glob<Mod>('../../../../../../packages/codec/src/proto/**/*.ts', {
  eager: true,
});

export interface SchemaEntry {
  /** e.g. "msg/c2c/c2c_msg.C2cMsgBody" */
  qualifiedName: string;
  /** The raw schema object the user wrote. */
  schema: ProtoMessageType;
}

function collect(mods: Record<string, Mod>): SchemaEntry[] {
  const out: SchemaEntry[] = [];
  for (const [path, mod] of Object.entries(mods)) {
    // Trim "/../../packages/codec/src/proto/" prefix and ".ts" suffix
    const file = path
      .replace(/^.*\/proto\//, '')
      .replace(/\.ts$/, '');
    for (const [name, value] of Object.entries(mod)) {
      if (!isProtoMessage(value)) continue;
      out.push({
        qualifiedName: `${file}.${name}`,
        schema: value as ProtoMessageType,
      });
    }
  }
  out.sort((a, b) => a.qualifiedName.localeCompare(b.qualifiedName));
  return out;
}

function isProtoMessage(v: unknown): v is ProtoMessageType {
  if (!v || typeof v !== 'object') return false;
  // ProtoField() entries have { kind: 'scalar' | 'message', no, type, optional, repeat }
  for (const f of Object.values(v as Record<string, unknown>)) {
    if (!f || typeof f !== 'object') return false;
    const k = (f as { kind?: unknown }).kind;
    if (k !== 'scalar' && k !== 'message') return false;
  }
  return Object.keys(v as object).length > 0;
}

export function useSchemas(): SchemaEntry[] {
  const [entries, setEntries] = useState<SchemaEntry[]>(() => collect(modules));

  useEffect(() => {
    // Vite HMR: when any glob target updates, import.meta.glob re-runs and
    // we rebuild the list. The `hot` API is best-effort — in production
    // (where there's no `import.meta.hot`) this is a no-op.
    if (!import.meta.hot) return;
    const cb = () => setEntries(collect(modules));
    import.meta.hot.on('vite:afterUpdate', cb);
    return () => import.meta.hot?.off('vite:afterUpdate', cb);
  }, []);

  return entries;
}
