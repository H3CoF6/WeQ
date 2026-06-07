/**
 * Resolve and load the closed-source `nt_helper` native addon.
 *
 * Supports two repo layouts (nested preferred, flat legacy):
 *   native/<platform>/<arch>/*.node    e.g. native/win32/x64/nt_helper.node
 *   native/<platform>-<arch>/*.node    e.g. native/win32-x64/index.win32-x64-msvc.node
 *
 * Requires the `.node` file directly rather than going through napi-rs's
 * `index.js` shim — the shim tries multiple platform-package fallbacks that
 * misfire when invoked from outside its own monorepo (you'd see
 * `Cannot find module 'nt-helper-win32-x64-msvc'`).
 *
 * Resolution order:
 *   1. `NT_HELPER_PATH` env var (full path to `.node` or `index.js`) — dev override
 *   2. `<resourcesPath>/native/<platform>/<arch>/*.node` — production build
 *   3. `<repo>/native/<platform>/<arch>/*.node` — dev (nested layout)
 *   4. `<repo>/native/<platform>-<arch>/*.node` — dev (flat legacy layout)
 *   5. `<repo-parent>/Qrypt-Native/nt_helper/index.<triple>.node` — sibling repo
 */

import { app } from 'electron';
import { createRequire } from 'node:module';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NativeBinding } from '@weq/db-reader';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { platform, arch } = process;

function findNodeIn(dir: string): string | null {
  if (!existsSync(dir)) return null;
  const named = join(dir, 'nt_helper.node');
  if (existsSync(named)) return named;
  try {
    for (const entry of readdirSync(dir)) {
      if (entry.endsWith('.node')) return join(dir, entry);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function findSiblingNapiRs(dir: string): string | null {
  if (!existsSync(dir)) return null;
  try {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith(`index.${platform}-${arch}`) && entry.endsWith('.node')) {
        return join(dir, entry);
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function resolveEntry(): string {
  const override = process.env.NT_HELPER_PATH;
  if (override) {
    if (!existsSync(override)) {
      throw new Error(`NT_HELPER_PATH points at non-existent file: ${override}`);
    }
    return override;
  }

  if (app.isPackaged) {
    const nested = findNodeIn(join(process.resourcesPath, 'native', platform, arch));
    if (nested) return nested;
    const flat = findNodeIn(join(process.resourcesPath, 'native', `${platform}-${arch}`));
    if (flat) return flat;
    throw new Error(
      `nt_helper not bundled. Expected native/${platform}/${arch}/*.node in resources.`,
    );
  }

  // Dev: out/main → out → desktop → apps → weQ
  const weqRoot = resolve(here, '..', '..', '..', '..');

  const nested = findNodeIn(join(weqRoot, 'native', platform, arch));
  if (nested) return nested;

  const flat = findNodeIn(join(weqRoot, 'native', `${platform}-${arch}`));
  if (flat) return flat;

  const siblingDir = resolve(weqRoot, '..', 'Qrypt-Native', 'nt_helper');
  const sibling = findSiblingNapiRs(siblingDir);
  if (sibling) return sibling;

  throw new Error(
    `Could not locate nt_helper for ${platform}-${arch}. Tried:\n` +
      `  - ${join(weqRoot, 'native', platform, arch)}/*.node\n` +
      `  - ${join(weqRoot, 'native', `${platform}-${arch}`)}/*.node\n` +
      `  - ${siblingDir}/index.${platform}-${arch}-*.node\n` +
      `Set NT_HELPER_PATH to override.`,
  );
}

let cached: NativeBinding | undefined;

export function loadNative(): NativeBinding {
  if (cached) return cached;
  const entry = resolveEntry();
  cached = require(entry) as NativeBinding;
  return cached;
}
