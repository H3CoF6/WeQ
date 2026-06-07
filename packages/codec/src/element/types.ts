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
 * Numeric element types as encoded in tag 45002. Independent of the
 * (vendored, reference-only) enum in `@weq/types`.
 */
export enum ElementType {
  TEXT = 1,
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

export type Element = TextElement | UnknownElement;
