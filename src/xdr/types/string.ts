import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";
import { assertLength } from "../core/helpers.js";

/**
 * XDR `string<N>` — length-prefixed bytes, 4-byte padded.
 *
 * Schema primitive: reads/writes raw `Uint8Array`. Charset handling is a
 * higher-layer concern (see e.g. `values/xdr-string.ts` for a wrapper that
 * exposes ergonomic string semantics on top of these bytes). Keeping this
 * layer charset-free means the `types/` schema primitives have no dependency
 * on the consumer-facing `values/` classes — the runtime can be lifted out
 * of this repo into a standalone XDR library without modification.
 */
class StringType extends BaseType<Uint8Array> {
  readonly kind = "string";

  constructor(private readonly maxLength: number) {
    super();
    assertLength(maxLength, "string maxLength");
  }

  _read(reader: Reader, path: string): Uint8Array {
    const length = reader.readUint32(path);
    if (length > this.maxLength) {
      throw new XdrError(
        `${path}: string byte length ${length} exceeds maximum ${this.maxLength}`,
      );
    }
    const bytes = reader.readBytes(length, path);
    reader.skipPadding(length, path);
    return bytes;
  }

  _write(value: Uint8Array, writer: Writer, path: string): void {
    if (!(value instanceof Uint8Array)) {
      throw new XdrError(`${path}: expected Uint8Array`);
    }
    if (value.length > this.maxLength) {
      throw new XdrError(
        `${path}: string byte length ${value.length} exceeds maximum ${this.maxLength}`,
      );
    }
    writer.writeUint32(value.length);
    writer.writeBytes(value);
    writer.writePadding(value.length);
  }
}

function string_(maxLength: number): XdrType<Uint8Array> {
  return new StringType(maxLength);
}

export { string_ as string };
