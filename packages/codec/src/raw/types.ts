/**
 * Tree representation of schema-free decoded protobuf.
 *
 * Every node holds the byte range it came from (for hex-view highlighting)
 * and one or more `Guess`es — different valid interpretations of the same
 * bytes. The UI lets the user pick which guess to display; the decoder's
 * job is to produce all plausible ones, not to commit to one.
 */

import type { WireType } from './wire';

export interface RawField {
  /** Field number from the wire format. */
  tag: number;
  /** Wire type. Determines which guesses are possible. */
  wireType: WireType;
  /** Offset in the *original* (top-level) buffer where this field's tag begins. */
  start: number;
  /** Total bytes this field occupies in the original buffer. */
  size: number;
  /**
   * All plausible interpretations of the payload bytes, ordered by confidence
   * (highest first). At least one entry — even an unknown VARINT has the raw
   * uint64 guess.
   */
  guesses: Guess[];
}

export type Guess =
  // VARINT family
  | { kind: 'varint-uint64'; value: bigint; confidence: number }
  | { kind: 'varint-int64-zigzag'; value: bigint; confidence: number }
  | { kind: 'varint-bool'; value: boolean; confidence: number }
  | { kind: 'varint-timestamp-sec'; value: Date; confidence: number }
  | { kind: 'varint-timestamp-ms'; value: Date; confidence: number }
  // I64
  | { kind: 'i64-fixed'; value: bigint; confidence: number }
  | { kind: 'i64-double'; value: number; confidence: number }
  // I32
  | { kind: 'i32-fixed'; value: number; confidence: number }
  | { kind: 'i32-float'; value: number; confidence: number }
  // LEN
  | { kind: 'len-utf8'; value: string; confidence: number }
  | { kind: 'len-nested'; value: RawField[]; consumedAll: boolean; confidence: number }
  | { kind: 'len-bytes'; value: Uint8Array; confidence: number };

export function isVarintGuess(g: Guess): boolean {
  return g.kind.startsWith('varint-');
}
