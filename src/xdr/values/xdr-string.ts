import { areUint8ArraysEqual } from "uint8array-extras";
import type { Reader } from "@stellar/js-xdr";
import type { Writer } from "@stellar/js-xdr";
import { BaseType, XdrError, type XdrType } from "@stellar/js-xdr";
import { string as stringBytes } from "@stellar/js-xdr";

// Wrapper for XDR `string<N>` values.
//
// JS strings can't be both byte-faithful and text-friendly (UTF-16 internally,
// no clean way to represent arbitrary byte sequences), and the wire format
// per RFC 4506 §4.11 is bytes with a length prefix — no charset enforcement.
// Real Stellar wire traffic carries non-UTF-8 bytes in some `string<N>`
// fields (notably `MemoText`), so the SDK has to preserve byte fidelity.
//
// `XdrString` settles this by:
//   - storing the wire bytes as the single canonical representation
//   - accepting either a JS string (UTF-8 encoded) or bytes at construction
//   - exposing `asString()` / `asStringOrBytes()` / `bytes` as explicit
//     access patterns — the caller picks the semantics they want
//   - rendering to SEP-0051's escape form for `toString()` (debug/JSON)
//
// Branded by a Symbol-typed `__xdrString` so it's distinct from `string`
// and `Uint8Array` at the type level.

const TAG: unique symbol = Symbol("XdrString");
const HEX = "0123456789abcdef";

export class XdrString {
  declare readonly [TAG]: true;
  readonly bytes: Uint8Array;

  constructor(input: string | Uint8Array | XdrString) {
    if (input instanceof XdrString) {
      // The migration guide documents this branch as a copy — don't alias
      // the original's bytes.
      this.bytes = input.bytes.slice();
    } else if (typeof input === "string") {
      this.bytes = new TextEncoder().encode(input);
    } else if (input instanceof Uint8Array) {
      this.bytes = input;
    } else {
      throw new TypeError(
        "XdrString: expected string, Uint8Array, or XdrString",
      );
    }
  }

  get length(): number {
    return this.bytes.length;
  }

  /**
   * Strict UTF-8 decode. Throws if the bytes aren't valid UTF-8.
   * Use this when you know the content is text and want to fail loudly
   * if a binary payload sneaks in. Note that implicit JS string coercion
   * (e.g. template literals) calls the lenient `toString()` instead.
   */
  toStringStrict(): string {
    // ignoreBOM keeps a leading EF BB BF in the output — without it the
    // decoder drops those bytes and re-encoding changes the wire bytes.
    return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
      this.bytes,
    );
  }

  /**
   * Lenient UTF-8 decode. Invalid sequences are replaced with U+FFFD, but no error is thrown. Use this when you want to be resilient to binary payloads
   * and just want something readable out of the bytes, even if it's not the
   * original intended string.
   */
  toString(): string {
    return new TextDecoder("utf-8", { fatal: false, ignoreBOM: true }).decode(
      this.bytes,
    );
  }

  /**
   * Best-effort decode. Returns a JS string if the bytes are valid UTF-8,
   * otherwise returns the raw bytes. Lets callers pattern-match on what
   * came back without try/catch.
   */
  asStringOrBytes(): string | Uint8Array {
    try {
      // Must be the strict decode — the lenient toString() never throws, it
      // silently substitutes U+FFFD, which would make the bytes fallback
      // unreachable and corrupt binary payloads.
      return this.toStringStrict();
    } catch {
      return this.bytes;
    }
  }

  /**
   * SEP-0051 escape form — printable ASCII passes through, control bytes
   * and high bytes are escaped (`\0` `\t` `\n` `\r` `\\` `\xNN`). Suitable
   * for log lines and JSON embedding; reversible via `XdrString.fromJson`.
   */
  toJson(): string {
    let out = "";
    for (let i = 0; i < this.bytes.length; i += 1) {
      const b = this.bytes[i];
      switch (b) {
        case 0x00:
          out += "\\0";
          break;
        case 0x09:
          out += "\\t";
          break;
        case 0x0a:
          out += "\\n";
          break;
        case 0x0d:
          out += "\\r";
          break;
        case 0x5c:
          out += "\\\\";
          break;
        default:
          if (b >= 0x20 && b <= 0x7e) {
            out += String.fromCharCode(b);
          } else {
            out += "\\x" + HEX[(b >> 4) & 0xf] + HEX[b & 0xf];
          }
      }
    }
    return out;
  }

  /**
   * JavaScript-standard `JSON.stringify` hook — delegates to {@link toJson};
   * call that instead. (Duplicated from `XdrValue` because `XdrString` does
   * not extend it.)
   */
  toJSON(): string {
    return this.toJson();
  }

  /** Inverse of `toJson` — parse a SEP-0051 escape string to an XdrString. */
  static fromJson(escaped: string): XdrString {
    const out: number[] = [];
    for (let i = 0; i < escaped.length; i += 1) {
      const ch = escaped.charCodeAt(i);
      if (ch === 0x5c /* `\` */) {
        const next = escaped.charCodeAt(i + 1);
        switch (next) {
          case 0x5c:
            out.push(0x5c);
            i += 1;
            break;
          case 0x30 /* `0` */:
            out.push(0x00);
            i += 1;
            break;
          case 0x74 /* `t` */:
            out.push(0x09);
            i += 1;
            break;
          case 0x6e /* `n` */:
            out.push(0x0a);
            i += 1;
            break;
          case 0x72 /* `r` */:
            out.push(0x0d);
            i += 1;
            break;
          case 0x78 /* `x` */:
          case 0x58 /* `X` */: {
            if (i + 3 >= escaped.length) {
              throw new SyntaxError(
                `XdrString: truncated \\x escape at index ${i}`,
              );
            }
            const hi = hexDigit(escaped.charCodeAt(i + 2));
            const lo = hexDigit(escaped.charCodeAt(i + 3));
            if (hi < 0 || lo < 0) {
              throw new SyntaxError(
                `XdrString: invalid \\x escape "${escaped.slice(i, i + 4)}"`,
              );
            }
            out.push((hi << 4) | lo);
            i += 3;
            break;
          }
          default:
            throw new SyntaxError(
              `XdrString: unsupported escape \\${escaped[i + 1] ?? ""}`,
            );
        }
      } else if (ch >= 0x20 && ch <= 0x7e) {
        out.push(ch);
      } else {
        throw new SyntaxError(
          `XdrString: non-ASCII char (code 0x${ch.toString(16)}) at index ${i}`,
        );
      }
    }
    return new XdrString(Uint8Array.from(out));
  }

  equals(other: XdrString): boolean {
    if (this === other) return true;
    if (!(other instanceof XdrString)) return false;
    return areUint8ArraysEqual(this.bytes, other.bytes);
  }
}

function hexDigit(code: number): number {
  if (code >= 0x30 && code <= 0x39) return code - 0x30;
  if (code >= 0x41 && code <= 0x46) return code - 0x41 + 10;
  if (code >= 0x61 && code <= 0x66) return code - 0x61 + 10;
  return -1;
}

/**
 * Schema builder: a wrapper around the `types/string.ts` byte primitive
 * that surfaces values as `XdrString` for ergonomic consumer access.
 *
 * The schema delegates byte-level I/O to the inner `StringType`, then
 * wraps/unwraps `XdrString` at the boundary. This keeps `types/` agnostic
 * of consumer-facing wrappers — the schema primitives there can be lifted
 * into a standalone XDR runtime without dragging `XdrString` along.
 */
class XdrStringType extends BaseType<XdrString> {
  readonly kind = "string";
  readonly maxLength: number;
  readonly #inner: XdrType<Uint8Array>;

  constructor(maxLength: number) {
    super();
    this.maxLength = maxLength;
    this.#inner = stringBytes(maxLength);
  }

  _read(reader: Reader, path: string): XdrString {
    return new XdrString(this.#inner._read(reader, path));
  }

  _write(
    value: XdrString | string | Uint8Array,
    writer: Writer,
    path: string,
  ): void {
    // Invalid inputs must surface as XdrError so `validate` reports them as
    // invalid values rather than rethrowing a bare TypeError.
    if (
      !(value instanceof XdrString) &&
      typeof value !== "string" &&
      !(value instanceof Uint8Array)
    ) {
      throw new XdrError(`${path}: expected string, Uint8Array, or XdrString`);
    }
    const xs = value instanceof XdrString ? value : new XdrString(value);
    this.#inner._write(xs.bytes, writer, path);
  }
}

export function xdrString(maxLength: number): XdrType<XdrString> {
  return new XdrStringType(maxLength);
}
