/**
 * NapProto — schema-as-object protobuf DSL.
 *
 * Originally adapted from NapCatQQ's `napcat-protobuf` package
 * (https://github.com/NapNeko/NapCatQQ/blob/main/packages/napcat-protobuf/NapProto.ts).
 * Divergences from upstream:
 *   - ProtoField uses an options object instead of positional optional/repeat
 *     args, and gains two element-mapping fields (`inElement`, `default`)
 *     used by `codec/{parse,serialize}.ts` to round-trip fields the
 *     high-level Element model doesn't care about.
 *   - The `R extends O extends true ? false : boolean` constraint upstream
 *     applies (incorrectly) was relaxed to plain `R extends boolean`, so
 *     `message + optional + repeat` (e.g. `elems`) type-checks naturally.
 *
 * `@protobuf-ts/runtime` still does the actual wire-format work; this DSL
 * is the thin schema-description layer.
 */

// @ts-nocheck — heavy type-level recursion that exceeds TS's inference budget
// for any sane error message; the runtime contracts are nonetheless sound.

import {
  MessageType,
  type PartialMessage,
  RepeatType,
  ScalarType,
} from '@protobuf-ts/runtime';
import type { PartialFieldInfo } from '@protobuf-ts/runtime/build/types/reflection-info';

export { ScalarType } from '@protobuf-ts/runtime';

export type LowerCamelCase<S extends string> = CamelCaseHelper<S, false, true>;

export type CamelCaseHelper<
  S extends string,
  CapNext extends boolean,
  IsFirstChar extends boolean,
> = S extends `${infer F}${infer R}`
  ? F extends '_'
    ? CamelCaseHelper<R, true, false>
    : F extends `${number}`
      ? `${F}${CamelCaseHelper<R, true, false>}`
      : CapNext extends true
        ? `${Uppercase<F>}${CamelCaseHelper<R, false, false>}`
        : IsFirstChar extends true
          ? `${Lowercase<F>}${CamelCaseHelper<R, false, false>}`
          : `${F}${CamelCaseHelper<R, false, false>}`
  : '';

export type ScalarTypeToTsType<T extends ScalarType> = T extends
  | ScalarType.DOUBLE
  | ScalarType.FLOAT
  | ScalarType.INT32
  | ScalarType.FIXED32
  | ScalarType.UINT32
  | ScalarType.SFIXED32
  | ScalarType.SINT32
  ? number
  : T extends
        | ScalarType.INT64
        | ScalarType.UINT64
        | ScalarType.FIXED64
        | ScalarType.SFIXED64
        | ScalarType.SINT64
    ? bigint
    : T extends ScalarType.BOOL
      ? boolean
      : T extends ScalarType.STRING
        ? string
        : T extends ScalarType.BYTES
          ? Uint8Array
          : never;

/**
 * Options accepted by `ProtoField`. `TsType` is the value-shape this field
 * carries on the wire — used to constrain `default` so wrong-type literals
 * (e.g. `default: "hi"` on a UINT32 field) fail at compile time.
 */
export interface ProtoFieldOpts<TsType, O extends boolean = boolean, R extends boolean = boolean> {
  /** protobuf3 `optional` modifier — encode struct may omit this field. */
  optional?: O;
  /** protobuf `repeated` — wire may carry many; TS type becomes T[]. */
  repeat?: R;
  /**
   * Whether this field appears in the high-level Element model.
   * - `true` (default): element ↔ field 1:1.
   * - `false`: parse drops it; serialize re-emits `default` (or protobuf3 zero).
   *
   * Use `false` for envelope flags / unknown_<tag> placeholders the renderer
   * doesn't need to see but QQ expects on the wire.
   */
  inElement?: boolean;
  /** Fallback value supplied by `serialize.ts` when the element layer didn't
   *  carry this field. Only meaningful with `inElement: false`. */
  default?: TsType;
}

export interface BaseProtoFieldType<T, O extends boolean, R extends boolean> {
  kind: 'scalar' | 'message';
  no: number;
  type: T;
  optional: O;
  repeat: R;
  /** Defaults to true (element carries it). */
  inElement: boolean;
  /** Serialize-time default when `inElement === false`. Untyped at storage; the
   *  ProtoField overloads type-check it at construction. */
  default?: unknown;
}

export interface ScalarProtoFieldType<T extends ScalarType, O extends boolean, R extends boolean>
  extends BaseProtoFieldType<T, O, R> {
  kind: 'scalar';
}

export interface MessageProtoFieldType<
  T extends () => ProtoMessageType,
  O extends boolean,
  R extends boolean,
> extends BaseProtoFieldType<T, O, R> {
  kind: 'message';
}

export type ProtoFieldType =
  | ScalarProtoFieldType<ScalarType, boolean, boolean>
  | MessageProtoFieldType<() => ProtoMessageType, boolean, boolean>;

export type ProtoMessageType = {
  [key: string]: ProtoFieldType;
};

/**
 * Describe a single protobuf field by its wire-format tag number and type.
 *
 * @example
 *   // scalar
 *   text: ProtoField(123, ScalarType.STRING, { optional: true }),
 *   // unknown — element-layer doesn't carry it, write 1 on encode
 *   unknown_124: ProtoField(124, ScalarType.UINT32, {
 *     optional: true, inElement: false, default: 1,
 *   }),
 *   // nested message, repeated
 *   elems: ProtoField(2, () => Elem, { optional: true, repeat: true }),
 */
export function ProtoField<
  T extends ScalarType,
  O extends boolean = false,
  R extends boolean = false,
>(
  no: number,
  type: T,
  opts?: ProtoFieldOpts<ScalarTypeToTsType<T>, O, R>,
): ScalarProtoFieldType<T, O, R>;
export function ProtoField<
  T extends () => ProtoMessageType,
  O extends boolean = false,
  R extends boolean = false,
>(
  no: number,
  type: T,
  opts?: ProtoFieldOpts<unknown, O, R>,
): MessageProtoFieldType<T, O, R>;
export function ProtoField(
  no: number,
  type: ScalarType | (() => ProtoMessageType),
  opts?: ProtoFieldOpts<unknown>,
): ProtoFieldType {
  const optional = (opts?.optional ?? false) as boolean;
  const repeat = (opts?.repeat ?? false) as boolean;
  const inElement = opts?.inElement ?? true;
  const defaultValue = opts?.default;

  if (typeof type === 'function') {
    return {
      kind: 'message',
      no,
      type,
      optional,
      repeat,
      inElement,
      default: defaultValue,
    } as ProtoFieldType;
  }
  return {
    kind: 'scalar',
    no,
    type,
    optional,
    repeat,
    inElement,
    default: defaultValue,
  } as ProtoFieldType;
}

export type ProtoFieldReturnType<T, E extends boolean> =
  NonNullable<T> extends ScalarProtoFieldType<infer S, infer _O, infer _R>
    ? ScalarTypeToTsType<S>
    : T extends NonNullable<MessageProtoFieldType<infer S, infer _O, infer _R>>
      ? NonNullable<NapProtoStructType<ReturnType<S>, E>>
      : never;

export type RequiredFieldsBaseType<T, E extends boolean> = {
  [K in keyof T as T[K] extends { optional: true } ? never : LowerCamelCase<K & string>]: T[K] extends {
    repeat: true;
  }
    ? ProtoFieldReturnType<T[K], E>[]
    : ProtoFieldReturnType<T[K], E>;
};

export type OptionalFieldsBaseType<T, E extends boolean> = {
  [K in keyof T as T[K] extends { optional: true } ? LowerCamelCase<K & string> : never]?: T[K] extends {
    repeat: true;
  }
    ? ProtoFieldReturnType<T[K], E>[]
    : ProtoFieldReturnType<T[K], E>;
};

export type RequiredFieldsType<T, E extends boolean> = E extends true
  ? Partial<RequiredFieldsBaseType<T, E>>
  : RequiredFieldsBaseType<T, E>;

export type OptionalFieldsType<T, E extends boolean> = E extends true
  ? Partial<OptionalFieldsBaseType<T, E>>
  : OptionalFieldsBaseType<T, E>;

export type NapProtoStructType<T, E extends boolean> = RequiredFieldsType<T, E> & OptionalFieldsType<T, E>;

export type NapProtoEncodeStructType<T> = NapProtoStructType<T, true>;
export type NapProtoDecodeStructType<T> = NapProtoStructType<T, false>;

class NapProtoRealMsg<T extends ProtoMessageType> {
  private readonly _field: PartialFieldInfo[];
  private readonly _proto_msg: MessageType<NapProtoStructType<T, boolean>>;
  private static cache = new WeakMap<ProtoMessageType, NapProtoRealMsg<any>>();

  private constructor(fields: T) {
    this._field = Object.keys(fields).map((key) => {
      const field = fields[key];
      if (field.kind === 'scalar') {
        const repeatType = field.repeat
          ? [ScalarType.STRING, ScalarType.BYTES].includes(field.type)
            ? RepeatType.UNPACKED
            : RepeatType.PACKED
          : RepeatType.NO;
        return {
          no: field.no,
          name: key,
          kind: 'scalar',
          T: field.type,
          opt: field.optional,
          repeat: repeatType,
        };
      }
      if (field.kind === 'message') {
        return {
          no: field.no,
          name: key,
          kind: 'message',
          repeat: field.repeat ? RepeatType.PACKED : RepeatType.NO,
          T: () => NapProtoRealMsg.getInstance(field.type())._proto_msg,
        };
      }
      throw new Error(`Unknown field kind: ${(field as { kind: string }).kind}`);
    }) as PartialFieldInfo[];
    this._proto_msg = new MessageType<NapProtoStructType<T, boolean>>('weq', this._field);
  }

  static getInstance<T extends ProtoMessageType>(fields: T): NapProtoRealMsg<T> {
    let instance = this.cache.get(fields);
    if (!instance) {
      instance = new NapProtoRealMsg(fields);
      this.cache.set(fields, instance);
    }
    return instance;
  }

  encode(data: NapProtoEncodeStructType<T>): Uint8Array {
    return this._proto_msg.toBinary(
      this._proto_msg.create(data as PartialMessage<NapProtoEncodeStructType<T>>),
    );
  }

  decode(data: Uint8Array): NapProtoDecodeStructType<T> {
    return this._proto_msg.fromBinary(data) as NapProtoDecodeStructType<T>;
  }
}

/**
 * Wrap a schema definition into something with `encode` / `decode` methods.
 *
 * @example
 *   const Text = { str: ProtoField(1, ScalarType.STRING, { optional: true }) };
 *   const msg = new NapProtoMsg(Text);
 *   const bytes = msg.encode({ str: 'hi' });
 *   const back = msg.decode(bytes);     // { str: 'hi' }
 */
export class NapProtoMsg<T extends ProtoMessageType> {
  private realMsg: NapProtoRealMsg<T>;

  constructor(fields: T) {
    this.realMsg = NapProtoRealMsg.getInstance(fields);
  }

  encode(data: NapProtoEncodeStructType<T>): Uint8Array {
    return this.realMsg.encode(data);
  }

  decode(data: Uint8Array): NapProtoDecodeStructType<T> {
    return this.realMsg.decode(data);
  }
}
