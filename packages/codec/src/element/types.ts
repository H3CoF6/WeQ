/**
 * Element abstract model — Layer 2 of the codec stack.
 *
 * `Element` is a discriminated union over `kind`. Each variant carries
 * the cleaned-up high-level fields the renderer cares about. Common fields
 * (id, isSender, subType) live in `BaseElementFields` and are spread into
 * every variant.
 *
 * `UnknownElement` exists so unknown elementType values from the wire don't
 * have to be dropped — we keep the raw wire envelope and re-emit it on
 * serialize, preserving forward-compat with new QQ element types.
 *
 * Tag numbers (40010, 45001, 45002, …) are described in `../proto/msg/common/element.ts`.
 */

import type { ProtoEncodeStructType } from '../core';
import type { ElementWire } from '../proto/msg/common/element';

/**
 * The set of field names declared on the wire envelope. Used to constrain
 * each element codec's `necessaryFields` so a typo in the codec doesn't
 * silently no-op at runtime.
 */
export type ElementWireField = keyof typeof ElementWire;

/**
 * Numeric element types as encoded in tag 45002. Independent of the
 * (vendored, reference-only) enum in `@weq/types`.
 */
export enum ElementType {
  TEXT = 1,
  FACE = 6,
  ARK = 10,
}

/**
 * Face sub-type (tag 45003 when elementType=FACE). Values observed on the
 * wire; semantics inferred and not all verified.
 */
export enum FaceSubType {
  QQ_BUILTIN_OLD = 1,
  QQ_BUILTIN_NEW = 2,
  SUPER_EMOJI = 3,
  UNKNOWN_4 = 4,
  INTERACTIVE = 5,
}

/** Fields common to every element variant. */
export interface BaseElementFields {
  elementId: bigint;
  isSender?: boolean;
  subType?: number;
}

export interface TextElement extends BaseElementFields {
  kind: 'text';
  content: string;
}

export interface FaceElement extends BaseElementFields {
  kind: 'face';
  /** Face id (e.g. 358 for dice). */
  faceId: number;
  /** Display text shown when the receiver lacks the asset. */
  faceText: string;
  /** Dice value "1".."6"; only set when this face is a super-emoji dice. */
  diceValue?: string;
}

/**
 * Shape of the JSON document stored in wire field 47901 for ARK elements.
 * `meta`'s inner shape varies per `view` (`pubAdArkView`, `news`, …) — the
 * concrete examples that have been documented live as exported sample
 * constants in `element/ark.ts`.
 */
export interface ArkPayload {
  /** App identifier, e.g. "com.tencent.gamecenter.mall". */
  app: string;
  /** Short description shown in AIO list / notification. */
  desc: string;
  /** View-specific data, keyed by template name (`template3`, `news`, …). */
  meta: Record<string, Record<string, unknown>>;
  /** Plain-text fallback used when the card can't render. */
  prompt: string;
  /** Source identifier (often the appid for ads). */
  sourceName?: string;
  /** Ark template version, e.g. "0.0.3.67". */
  ver?: string;
  /** Renderer name, e.g. "pubAdArkView". Determines which `meta.<name>` is read. */
  view: string;
  /** Card verification token + creation timestamp. */
  config?: ArkConfig;
}

export interface ArkConfig {
  /** Unix seconds. */
  ctime: number;
  /** Card signature token. */
  token: string;
}

export interface ArkElement extends BaseElementFields {
  kind: 'ark';
  /**
   * Raw JSON string from wire field 47901. Parse with `JSON.parse()` and
   * narrow against `ArkPayload`. The codec deliberately keeps this as
   * string so re-serialize is byte-exact (no JSON key-reorder).
   */
  arkData: string;
}

/**
 * Fallback for elementType values that aren't yet registered in the codec.
 * Carries the full wire envelope so encodeElement can put it back on disk
 * exactly as it came in.
 */
export interface UnknownElement extends BaseElementFields {
  kind: 'unknown';
  elementType: number;
  raw: ProtoEncodeStructType<typeof ElementWire>;
}

export type Element = TextElement | FaceElement | ArkElement | UnknownElement;
