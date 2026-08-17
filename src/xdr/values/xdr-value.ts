import {
  hexToUint8Array,
  uint8ArrayToHex,
  base64ToUint8Array,
  uint8ArrayToBase64,
  areUint8ArraysEqual,
} from "uint8array-extras";
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
    const bytes = decodeBytes(input, format);
    return this.fromXdrObject(this.schema.decode(bytes));
  }

  /**
   * Check whether `input` decodes as this type — {@link XdrValue.fromXdr}
   * without the throw. Returns `false` on any failure (bad hex/base64, wrong
   * shape, trailing bytes) and discards the error detail; decode directly
   * when you need the reason.
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
    return this.fromXdrObject(walkFromJson(json, this.schema) as Wire);
  }
}

/**
 * Decode a buffer containing several XDR values of one type, concatenated
 * back-to-back (e.g. a contract spec's `ScSpecEntry` stream). Throws
 * `XdrError` if the buffer ends mid-value.
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
  const codec = array(type.schema, options.maxLength ?? UNBOUNDED_MAX_LENGTH);
  const wires = codec.decode(
    decodeBytes(input, format as "hex" | "base64" | undefined),
    { maxDepth: options.maxDepth },
  );
  return wires.map((w) => type.fromXdrObject(w));
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

export function decodeBytes(
  input: Uint8Array | string,
  format: "raw" | "hex" | "base64" | undefined,
): Uint8Array {
  if (input instanceof Uint8Array) return input;
  if (format === undefined || format === "raw") {
    throw new XdrError(
      "fromXdr: string input requires format ('hex' | 'base64')",
    );
  }
  if (format === "hex") return hexToUint8Array(input);
  if (format === "base64") return base64ToUint8Array(input);
  // Plain-JS callers get no TS checking; treating an unknown format as
  // base64 would silently decode garbage bytes.
  throw new XdrError(`fromXdr: unknown format "${String(format)}"`);
}
