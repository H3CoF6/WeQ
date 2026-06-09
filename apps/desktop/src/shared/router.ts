/**
 * AppRouter type contract shared between main + renderer.
 *
 * Both `tsconfig.node.json` (main) and `tsconfig.web.json` (renderer)
 * include `src/shared/**`, so this file participates in both type-check
 * passes. The `export type` indirection means nothing from `src/main/`
 * gets bundled into the renderer at runtime — only types flow through.
 */

export type { AppRouter } from '../main/ipc/router';
