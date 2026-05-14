import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";
import { assertLength } from "../core/helpers.js";

class StringType extends BaseType<string> {
  readonly kind = "string";
  readonly #encoder = new TextEncoder();
  readonly #decoder = new TextDecoder("utf-8", { fatal: true });

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
      throw new XdrError(`${path}: invalid UTF-8 string`);
    }
  }

  _write(value: string, writer: Writer, path: string): void {
    if (typeof value !== "string") {
      throw new XdrError(`${path}: expected string`);
    }
    const bytes = this.#encoder.encode(value);
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

export { string_ as string };
