// Schema DSL
export * from './core';

// Schema-free decoder (for the Protobuf Lab and reverse-engineering)
export * as raw from './raw';

// Codec entry points (high-level Element ↔ protobuf)
export * from './codec/parse';
export * from './codec/serialize';

// Schemas are intentionally NOT re-exported wholesale here — import them
// directly from `@weq/codec/proto/<area>/<table>` so the import path stays
// self-documenting about which table is being parsed.
