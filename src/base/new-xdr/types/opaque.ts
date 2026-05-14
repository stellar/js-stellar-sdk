import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";
import { assertLength, assertUint8Array } from "../core/helpers.js";

class OpaqueType extends BaseType<Uint8Array> {
  readonly kind = "opaque";

  constructor(private readonly length: number) {
    super();
    assertLength(length, "opaque length");
  }

  _read(reader: Reader, path: string): Uint8Array {
    const bytes = reader.readBytes(this.length, path);
    reader.skipPadding(this.length, path);
    return bytes;
  }

  _write(value: Uint8Array, writer: Writer, path: string): void {
    assertUint8Array(value, path);
    if (value.length !== this.length) {
      throw new XdrError(
        `${path}: expected ${this.length} byte(s), got ${value.length}`,
      );
    }
    writer.writeBytes(value);
    writer.writePadding(value.length);
  }
}

export function opaque(length: number): XdrType<Uint8Array> {
  return new OpaqueType(length);
}
