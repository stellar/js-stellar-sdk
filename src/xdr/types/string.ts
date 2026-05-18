import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";
import { assertLength } from "../core/helpers.js";

class StringType extends BaseType<string> {
  readonly kind = "string";
  readonly #encoder = new TextEncoder();
  readonly #decoder = new TextDecoder("utf-8", { fatal: true });
  // Stellar's wire `string<N>` is opaque bytes — legitimate envelopes can carry
  // arbitrary non-UTF-8 bytes in memoText. When UTF-8 decode fails we fall back
  // to a 1:1 byte→char mapping (latin1) so the value round-trips through write
  // without corrupting the underlying bytes (and the resulting tx hash matches).
  readonly #latin1Decoder = new TextDecoder("latin1");

  constructor(private readonly maxLength: number) {
    super();
    assertLength(maxLength, "string maxLength");
  }

  _read(reader: Reader, path: string): string {
    const length = reader.readUint32(path);
    if (length > this.maxLength) {
      throw new XdrError(
        `${path}: string byte length ${length} exceeds maximum ${this.maxLength}`,
      );
    }
    const bytes = reader.readBytes(length, path);
    reader.skipPadding(length, path);
    try {
      return this.#decoder.decode(bytes);
    } catch {
      return this.#latin1Decoder.decode(bytes);
    }
  }

  _write(value: string | Uint8Array, writer: Writer, path: string): void {
    let bytes: Uint8Array;
    if (typeof value === "string") {
      // If the string was a latin1 round-trip from `_read`, every char is a
      // single byte in 0..255 and TextEncoder would re-encode 0x80+ as 2-byte
      // UTF-8 sequences (breaking byte-identical round-trips). Detect that
      // case and re-emit the raw bytes instead.
      bytes = encodeLatin1IfBinary(value, this.#encoder);
    } else if (value instanceof Uint8Array) {
      // XDR `string<N>` is defined as opaque bytes with a length prefix; the
      // class-xdr decoder returns it as a JS string, but legacy callers
      // (notably `MemoText`) sometimes pass raw binary buffers that aren't
      // valid UTF-8. Accept Uint8Array for byte-exact passthrough.
      bytes = value;
    } else {
      throw new XdrError(`${path}: expected string or Uint8Array`);
    }
    if (bytes.length > this.maxLength) {
      throw new XdrError(
        `${path}: string byte length ${bytes.length} exceeds maximum ${this.maxLength}`,
      );
    }
    writer.writeUint32(bytes.length);
    writer.writeBytes(bytes);
    writer.writePadding(bytes.length);
  }
}

function string_(maxLength: number): XdrType<string> {
  return new StringType(maxLength);
}

function encodeLatin1IfBinary(
  value: string,
  utf8Encoder: TextEncoder,
): Uint8Array {
  // Fast path: ASCII-only strings produce the same bytes either way.
  let hasHighByte = false;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 0x7f) {
      hasHighByte = true;
      if (code > 0xff) {
        // Real multi-byte unicode (e.g. emoji) — encode as UTF-8.
        return utf8Encoder.encode(value);
      }
    }
  }
  if (!hasHighByte) return utf8Encoder.encode(value);
  // All chars are 0..255 with at least one in 0x80..0xff — emit as latin1
  // bytes to preserve the original wire bytes from a latin1 _read round-trip.
  const out = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i++) {
    out[i] = value.charCodeAt(i);
  }
  return out;
}

export { string_ as string };
