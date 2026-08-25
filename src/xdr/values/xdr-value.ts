import {
  hexToUint8Array,
  uint8ArrayToHex,
  areUint8ArraysEqual,
} from "uint8array-extras";
import {
  base64ToUint8Array,
  uint8ArrayToBase64,
} from "../../base/util/base64.js";
import type { XdrType } from "@stellar/js-xdr";
import { array, Reader, UNBOUNDED_MAX_LENGTH, XdrError } from "@stellar/js-xdr";
import { walkToJson, walkFromJson } from "./to-json.js";

export type XdrFormat = "raw" | "hex" | "base64";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

/**
 * Bridge a concrete `XdrValue` subclass to its wire shape. Every subclass
 * declares `static readonly schema` and `static fromXdrObject(wire)`, which
 * is everything `XdrValue.fromXdr` needs to round-trip bytes through the class.
 */
export interface XdrValueConstructor<Wire, Instance extends XdrValue> {
  readonly schema: XdrType<Wire>;
  readonly name: string;
  fromXdrObject(wire: Wire): Instance;
}

/**
 * Base class for every generated XDR type. Subclasses supply:
 *   - `static readonly schema: XdrType<Wire>` describing the wire shape
 *   - `toXdrObject(): Wire` converting `this` into the wire shape (public so
 *     nested classes can compose without breaking access modifiers)
 *   - `static fromXdrObject(wire: Wire): InstanceType` going the other way
 *   - `toJson(): JsonValue`
 *
 * Inherited helpers (`toXdr`, `fromXdr`, `validateXdr`, `toString`, `equals`)
 * handle the rest.
 */
export abstract class XdrValue {
  abstract toXdrObject(): unknown;

  toXdr(): Uint8Array;
  toXdr(format: "raw"): Uint8Array;
  toXdr(format: "hex" | "base64"): string;
  toXdr(format: XdrFormat = "raw"): Uint8Array | string {
    const ctor = this.constructor as typeof XdrValue & {
      readonly schema: XdrType<unknown>;
    };
    if (!ctor.schema) {
      throw new XdrError(`${ctor.name}: missing static schema`);
    }
    const bytes = ctor.schema.encode(this.toXdrObject());
    return encodeBytes(bytes, format);
  }

  /**
   * @deprecated Use {@link toXdr} instead.
   * Deprecated in version v17
   */
  toXDR(): Uint8Array;
  /**
   * @deprecated Use {@link toXdr} instead.
   * Deprecated in version v17
   */ toXDR(format: "raw"): Uint8Array;
  /**
   * @deprecated Use {@link toXdr} instead.
   * Deprecated in version v17
   */ toXDR(format: "hex" | "base64"): string;
  toXDR(format: XdrFormat = "raw"): Uint8Array | string {
    return encodeBytes(this.toXdr(), format);
  }

  toString(): string {
    return uint8ArrayToBase64(this.toXdr());
  }

  toJson(): JsonValue {
    const ctor = this.constructor as typeof XdrValue & {
      readonly schema: XdrType<unknown>;
    };
    if (!ctor.schema) {
      throw new XdrError(`${ctor.name}: missing static schema`);
    }
    return walkToJson(this.toXdrObject(), ctor.schema);
  }

  /**
   * JavaScript-standard `JSON.stringify` hook — delegates to {@link toJson};
   * call that instead. Without this hook, stringify would throw on bigint
   * fields (`int64`/`uint64`) and dump raw byte internals. To substitute a
   * custom encoding, pass a replacer to `JSON.stringify` (its `this[key]` is
   * the original instance).
   */
  toJSON(): JsonValue {
    return this.toJson();
  }

  // Widened to `XdrValue` (not `this`): polymorphic `this` in parameter
  // position intersects a union's arms to `never`, making equals uncallable
  // on union-typed values (ScVal, Memo, ...). Cross-type calls return false.
  equals(other: XdrValue): boolean {
    if (this === other) return true;
    if (other == null || !(other instanceof XdrValue)) return false;
    if (this.constructor !== other.constructor) return false;
    return areUint8ArraysEqual(this.toXdr(), other.toXdr());
  }

  static fromXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array,
  ): Instance;
  static fromXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: string,
    format: "hex" | "base64",
  ): Instance;
  static fromXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array | string,
    format?: "hex" | "base64",
  ): Instance {
    assertXdrType(this, "fromXdr", true);
    const bytes = decodeBytes(input, format);
    return this.fromXdrObject(this.schema.decode(bytes));
  }

  /**
   * @deprecated Use {@link XdrValue.fromXdr} instead.
   * Deprecated in version v17.0.0
   */
  static fromXDR<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array,
  ): Instance;
  /**
   * @deprecated Use {@link XdrValue.fromXdr} instead.
   * Deprecated in version v17.0.0
   */
  static fromXDR<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: string,
    format: "hex" | "base64",
  ): Instance;
  /**
   * @deprecated Use {@link XdrValue.fromXdr} instead.
   * Deprecated in version v17.0.0
   */
  static fromXDR<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array | string,
    format?: "hex" | "base64",
  ): Instance {
    const bytes = decodeBytes(input, format);
    return this.fromXdrObject(this.schema.decode(bytes));
  }

  /**
   * Check whether `input` decodes as this type — {@link XdrValue.fromXdr}
   * without the throw. Returns `false` on any failure (bad hex/base64, wrong
   * shape, trailing bytes) and discards the error detail; decode directly
   * when you need the reason.
   *
   * @throws a `TypeError` when the type itself carries no static schema. Only
   * invalid *data* returns `false`; a type that cannot decode is a caller
   * mistake and is not reported as a validation failure.
   */
  static validateXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array,
  ): boolean;
  static validateXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: string,
    format: "hex" | "base64",
  ): boolean;
  static validateXdr<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array | string,
    format?: "hex" | "base64",
  ): boolean {
    assertXdrType(this, "validateXdr");
    let bytes: Uint8Array;
    try {
      bytes = decodeBytes(input, format);
    } catch {
      return false;
    }
    return this.schema.validateXdr(bytes);
  }

  /**
   * @deprecated Use {@link XdrValue.validateXdr} instead.
   * Deprecated in version v17.0.0
   */
  static validateXDR<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array,
  ): boolean;
  /**
   * @deprecated Use {@link XdrValue.validateXdr} instead.
   * Deprecated in version v17.0.0
   */
  static validateXDR<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: string,
    format: "hex" | "base64",
  ): boolean;
  /**
   * @deprecated Use {@link XdrValue.validateXdr} instead.
   * Deprecated in version v17.0.0
   */
  static validateXDR<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    input: Uint8Array | string,
    format?: "hex" | "base64",
  ): boolean {
    let bytes: Uint8Array;
    try {
      bytes = decodeBytes(input, format);
    } catch {
      return false;
    }
    return this.schema.validateXdr(bytes);
  }

  static fromJson<Wire, Instance extends XdrValue>(
    this: XdrValueConstructor<Wire, Instance>,
    json: JsonValue,
  ): Instance {
    assertXdrType(this, "fromJson", true);
    return this.fromXdrObject(walkFromJson(json, this.schema) as Wire);
  }
}

/**
 * Decode a buffer containing several XDR values of one type, concatenated
 * back-to-back (e.g. a contract spec's `ScSpecEntry` stream). Throws
 * `XdrError` if the buffer ends mid-value.
 *
 * @throws a `TypeError` when `type` carries no static schema, or no static
 * `fromXdrObject` to build values with
 */
export function decodeStream<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  input: Uint8Array,
): Instance[];
export function decodeStream<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  input: string,
  format: "hex" | "base64",
): Instance[];
export function decodeStream<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  input: Uint8Array | string,
  format?: "hex" | "base64",
): Instance[] {
  assertXdrType(type, "decodeStream", true);
  const reader = new Reader(decodeBytes(input, format));
  const path = type.schema.name ?? type.name;
  const out: Instance[] = [];
  while (reader.remaining > 0) {
    out.push(type.fromXdrObject(type.schema._read(reader, path)));
  }
  return out;
}

/** Options shared by {@link encodeArray} and {@link decodeArray}. */
export interface XdrArrayOptions {
  /**
   * Largest element count to accept, defaulting to the XDR maximum of
   * 2^32 - 1. Both encoding and decoding throw `XdrError` past this many
   * elements. Pass the bound from the XDR definition, so a field declared
   * `TimeSlicedPeerData peers<25>` decodes with `maxLength: 25`, or any cap
   * you want to enforce, to reject an oversized array before its elements are
   * decoded.
   */
  maxLength?: number;
  /**
   * How many nested schemas may be entered, counting the array itself as the
   * first level.
   */
  maxDepth?: number;
}

/**
 * Encode a list of XDR values as a single length-prefixed XDR variable-length
 * array (`T values<>` — a 4-byte count followed by the elements). This is the
 * wire format of the removed array typedef classes (`LedgerEntryChanges`,
 * `SorobanAuthorizationEntries`, …); use it where a protocol expects the whole
 * list as one blob, such as Horizon's `fee_meta_xdr`. For lists exchanged as
 * one string per element, encode each element with `value.toXdr(format)`
 * instead.
 *
 * @throws a `TypeError` when `type` carries no static schema
 */
export function encodeArray<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  values: readonly Instance[],
  options?: XdrArrayOptions,
): Uint8Array;
export function encodeArray<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  values: readonly Instance[],
  format: "raw",
  options?: XdrArrayOptions,
): Uint8Array;
export function encodeArray<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  values: readonly Instance[],
  format: "hex" | "base64",
  options?: XdrArrayOptions,
): string;
export function encodeArray<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  values: readonly Instance[],
  formatOrOptions?: XdrFormat | XdrArrayOptions,
  maybeOptions?: XdrArrayOptions,
): Uint8Array | string {
  const [format, options] = splitArrayArgs(formatOrOptions, maybeOptions);
  assertXdrType(type, "encodeArray");
  const codec = array(type.schema, options.maxLength ?? UNBOUNDED_MAX_LENGTH);
  const bytes = codec.encode(
    values.map((v) => v.toXdrObject() as Wire),
    { maxDepth: options.maxDepth },
  );
  return encodeBytes(bytes, format ?? "raw");
}

/**
 * Decode a single length-prefixed XDR variable-length array (`T values<>`)
 * into a list of values — the inverse of {@link encodeArray}. Throws
 * `XdrError` on a short buffer, trailing bytes, or a count that doesn't match
 * the payload. For a buffer of values concatenated with no length prefix, use
 * {@link decodeStream}.
 *
 * @throws a `TypeError` when `type` carries no static schema, or no static
 * `fromXdrObject` to build values with
 */
export function decodeArray<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  input: Uint8Array,
  options?: XdrArrayOptions,
): Instance[];
export function decodeArray<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  input: string,
  format: "hex" | "base64",
  options?: XdrArrayOptions,
): Instance[];
export function decodeArray<Wire, Instance extends XdrValue>(
  type: XdrValueConstructor<Wire, Instance>,
  input: Uint8Array | string,
  formatOrOptions?: "hex" | "base64" | XdrArrayOptions,
  maybeOptions?: XdrArrayOptions,
): Instance[] {
  const [format, options] = splitArrayArgs(formatOrOptions, maybeOptions);
  assertXdrType(type, "decodeArray", true);
  const codec = array(type.schema, options.maxLength ?? UNBOUNDED_MAX_LENGTH);
  const wires = codec.decode(
    decodeBytes(input, format as "hex" | "base64" | undefined),
    { maxDepth: options.maxDepth },
  );
  return wires.map((w) => type.fromXdrObject(w));
}

/**
 * A `type` argument before it has been checked. The generated classes satisfy
 * {@link XdrValueConstructor}, but nothing stops a plain-JS caller passing a
 * primitive shim, an abstract base, or something that is not a type at all.
 */
interface UncheckedXdrType {
  readonly schema?: unknown;
  readonly name?: string;
  readonly fromXdrObject?: unknown;
}

/**
 * Name an unchecked `type` for an error message. Reading `.name` alone is not
 * enough: an instance stringifies to its own base64, an enum singleton's
 * `.name` getter shadows the class name, a string prints as the class it names,
 * and a null-prototype object throws on `String()`.
 */
function describeType(type: unknown): string {
  // `typeof` cannot tell a class from an ordinary or arrow function, and an
  // unnamed one of any kind lands here, so the wording covers both.
  if (typeof type === "function") {
    return type.name || "an anonymous function or class";
  }
  if (type === null || type === undefined) return String(type);
  if (typeof type === "object") {
    return `an instance of ${type.constructor?.name || "an anonymous object"}`;
  }
  return typeof type === "string"
    ? `the string "${type}"`
    : `the ${typeof type} ${String(type)}`;
}

/**
 * Reject a `type` that cannot encode or decode, naming the helper and the
 * argument. Runs before any codec work, because otherwise the mistake surfaces
 * as an internal `TypeError` about an undefined property — or not at all:
 * `array()` accepts an `undefined` element schema and reads it only once per
 * element, so an empty list encoded as a valid-looking 4-byte count.
 *
 * Only a bad *type* throws here. Thin or malformed *data* keeps its existing
 * behaviour, so an empty list still round-trips and `validateXdr` still
 * returns `false` rather than throwing.
 *
 * The requirement differs by direction, so `needsFromXdrObject` is set only by
 * the decode paths. `encodeArray` and `validateXdr` never call
 * `fromXdrObject`, and a class that declares a schema without one encodes
 * correctly — requiring it there would reject a type that works.
 */
function assertXdrType(
  type: UncheckedXdrType | null | undefined,
  fn: string,
  needsFromXdrObject = false,
): void {
  if (!type?.schema) {
    throw new TypeError(
      `${fn}: ${describeType(type)} has no static schema, so it is not a ` +
        `usable XDR type. Pass a generated class such as xdr.ScVal, or ` +
        "declare `static readonly schema` on a class of your own.",
    );
  }
  if (needsFromXdrObject && typeof type.fromXdrObject !== "function") {
    throw new TypeError(
      `${fn}: ${describeType(type)} has a static schema but no static ` +
        "fromXdrObject, so it can encode but not decode. Declare " +
        "`static fromXdrObject(wire)` on it.",
    );
  }
}

/**
 * Sort out the trailing `(format?, options?)` arguments of the array helpers,
 * where the format may be omitted and the options object take its place.
 */
function splitArrayArgs(
  formatOrOptions?: XdrFormat | XdrArrayOptions,
  maybeOptions?: XdrArrayOptions,
): [XdrFormat | undefined, XdrArrayOptions] {
  return typeof formatOrOptions === "string"
    ? [formatOrOptions, maybeOptions ?? {}]
    : [undefined, formatOrOptions ?? maybeOptions ?? {}];
}

/**
 * Encode raw bytes into the requested {@link XdrFormat}: the bytes themselves
 * for `"raw"`, or a `"hex"` / `"base64"` string. This is the encoder behind
 * every `toXdr(format)` call, exported so consumers can format any
 * `Uint8Array` the SDK hands back (hashes, signatures, raw keys) without a
 * helper library.
 *
 * ```ts
 * encodeBytes(new Uint8Array([0xde, 0xad, 0xbe, 0xef]), "hex");    // "deadbeef"
 * encodeBytes(new Uint8Array([0xde, 0xad, 0xbe, 0xef]), "base64"); // "3q2+7w=="
 * ```
 *
 * @param bytes - the bytes to encode
 * @param format - `"raw"` returns `bytes` unchanged; `"hex"` and `"base64"`
 *   return a string
 * @throws an {@link XdrError} on an unknown format
 * @see {@link decodeBytes} for the reverse direction
 */
export function encodeBytes(bytes: Uint8Array, format: "raw"): Uint8Array;
export function encodeBytes(
  bytes: Uint8Array,
  format: "hex" | "base64",
): string;
export function encodeBytes(
  bytes: Uint8Array,
  format: XdrFormat,
): Uint8Array | string;
export function encodeBytes(
  bytes: Uint8Array,
  format: XdrFormat,
): Uint8Array | string {
  switch (format) {
    case "raw":
      return bytes;
    case "hex":
      return uint8ArrayToHex(bytes);
    case "base64":
      return uint8ArrayToBase64(bytes);
    default:
      // Plain-JS callers get no TS checking; without this a typo like
      // "base-64" would silently return undefined.
      throw new XdrError(`toXdr: unknown format "${String(format)}"`);
  }
}

/**
 * Decode a `"hex"` or `"base64"` string into bytes; a `Uint8Array` input
 * passes through unchanged. This is the decoder behind every
 * `fromXdr(input, format)` call, exported so consumers can parse encoded
 * byte strings without a helper library.
 *
 * ```ts
 * decodeBytes("deadbeef", "hex");  // Uint8Array [0xde, 0xad, 0xbe, 0xef]
 * decodeBytes("3q2+7w==", "base64");
 * ```
 *
 * Decoding is strict: malformed input throws instead of being silently
 * truncated the way `Buffer.from(str, "hex")` was.
 *
 * @param input - the bytes or encoded string to decode
 * @param format - required when `input` is a string; ignored for `Uint8Array`
 * @throws an {@link XdrError} when `input` is not valid `format`, when a string
 *   arrives without a `"hex"` / `"base64"` format, or when the format is
 *   unknown; a `TypeError` when `input` is neither a string nor a `Uint8Array`
 * @see {@link encodeBytes} for the reverse direction
 */
export function decodeBytes(
  input: Uint8Array | string,
  format: "raw" | "hex" | "base64" | undefined,
): Uint8Array {
  if (input instanceof Uint8Array) return input;
  // A non-string argument is a caller mistake, not malformed data, so it stays
  // a TypeError — the same split `Keypair.verify` uses. Checked ahead of every
  // `format` branch so the class never depends on the other argument.
  if (typeof input !== "string") {
    throw new TypeError(
      `fromXdr: expected a string or Uint8Array, got ${typeof input}`,
    );
  }
  if (format === undefined || format === "raw") {
    throw new XdrError(
      "fromXdr: string input requires format ('hex' | 'base64')",
    );
  }
  if (format === "hex" || format === "base64") {
    try {
      return format === "hex"
        ? hexToUint8Array(input)
        : base64ToUint8Array(input);
    } catch {
      // The decoders report through the platform: a plain Error for hex, a
      // runtime-worded DOMException for base64. Neither is matchable.
      throw new XdrError(`invalid ${format} input`);
    }
  }
  // Plain-JS callers get no TS checking; treating an unknown format as
  // base64 would silently decode garbage bytes.
  throw new XdrError(`fromXdr: unknown format "${String(format)}"`);
}
