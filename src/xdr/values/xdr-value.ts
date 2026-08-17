import {
  hexToUint8Array,
  uint8ArrayToHex,
  base64ToUint8Array,
  uint8ArrayToBase64,
  areUint8ArraysEqual,
} from "uint8array-extras";
import type { XdrType } from "@stellar/js-xdr";
import { Reader, XdrError } from "@stellar/js-xdr";
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
 * @param bytes the bytes to encode
 * @param format `"raw"` returns `bytes` unchanged; `"hex"` and `"base64"`
 *   return a string
 * @throws {XdrError} on an unknown format
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
 * @param input the bytes or encoded string to decode
 * @param format required when `input` is a string; ignored for `Uint8Array`
 * @throws {XdrError} when a string arrives without a `"hex"` / `"base64"`
 *   format, or the format is unknown
 * @see {@link encodeBytes} for the reverse direction
 */
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
