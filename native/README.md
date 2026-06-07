# `native/` — closed-source `.node` binaries

The `nt_helper` native addon is **not part of this repository**. Its compiled
`.node` file must be placed under the matching platform/arch subdirectory
below before running `pnpm dev` or `pnpm build`.

## Layout (nested, preferred)

```
native/
├── win32/
│   └── x64/
│       └── nt_helper.node       ← drop the .node file here
├── linux/
│   ├── x64/
│   └── arm64/
└── darwin/
    ├── x64/
    └── arm64/
```

The loader will use the first `*.node` it finds in the target dir, but
prefers a file literally named `nt_helper.node` if present.

A legacy flat layout (`native/win32-x64/...`) is still recognized as a
fallback, but new installs should use nested.

## Where to get the binary

Source: `<repo-parent>/Qrypt-Native/nt_helper/`

```bash
cd ../../Qrypt-Native/nt_helper
$env:OPENSSL_DIR = "C:\Program Files\OpenSSL-Win64"   # Windows
$env:OPENSSL_NO_VENDOR = "1"
npm run build
```

This emits `index.<platform>-<arch>-<runtime>.node` (e.g.
`index.win32-x64-msvc.node`). Copy that file into
`native/<platform>/<arch>/`, optionally renaming it to `nt_helper.node`.

Do **not** copy `index.js` (the napi-rs platform-resolver shim) — the
loader bypasses it entirely and requires the `.node` directly, sidestepping
the "Cannot find module 'nt-helper-win32-x64-msvc'" failure mode that the
shim triggers when used outside its own monorepo.

## Runtime resolution order

`apps/desktop/src/main/native/loader.ts` (and the matching file in
`apps/protolab/`) resolve in this order:

1. `process.env.NT_HELPER_PATH` (full path to a `.node` file)
2. `<resourcesPath>/native/<platform>/<arch>/*.node` (production / packaged)
3. `<repo>/native/<platform>/<arch>/*.node` (dev, nested)
4. `<repo>/native/<platform>-<arch>/*.node` (dev, flat legacy)
5. `<repo-parent>/Qrypt-Native/nt_helper/index.<platform>-<arch>-*.node` (sibling repo fallback)
