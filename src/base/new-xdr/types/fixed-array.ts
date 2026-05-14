import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type Infer, type XdrType } from "../core/xdr-type.js";
import { assertArray, assertLength } from "../core/helpers.js";
import { readArray, writeArray } from "./array.js";

class FixedArrayType<T> extends BaseType<T[]> {
  readonly kind = "fixedArray";

  constructor(
    private readonly element: XdrType<T>,
    private readonly length: number,
  ) {
    super();
    assertLength(length, "fixedArray length");
  }

  _read(reader: Reader, path: string): T[] {
    reader.enter(path);
    try {
      return readArray(reader, this.length, this.element, path);
    } finally {
      reader.exit();
    }
  }

  _write(value: T[], writer: Writer, path: string): void {
    assertArray(value, path);
    if (value.length !== this.length) {
      throw new XdrError(
        `${path}: expected array length ${this.length}, got ${value.length}`,
      );
    }
    writeArray(value, writer, this.element, path);
  }
}

export function fixedArray<T extends XdrType<unknown>>(
  element: T,
  length: number,
): XdrType<Infer<T>[]> {
  return new FixedArrayType(element, length) as XdrType<Infer<T>[]>;
}
