import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type Infer, type XdrType } from "../core/xdr-type.js";
import { assertArray, assertLength } from "../core/helpers.js";

class ArrayType<T> extends BaseType<T[]> {
  readonly kind = "array";

  constructor(
    private readonly element: XdrType<T>,
    private readonly maxLength: number,
  ) {
    super();
    assertLength(maxLength, "array maxLength");
  }

  _read(reader: Reader, path: string): T[] {
    reader.enter(path);
    try {
      const length = reader.readUint32(path);
      if (length > this.maxLength) {
        throw new XdrError(
          `${path}: array length ${length} exceeds maximum ${this.maxLength}`,
        );
      }
      return readArray(reader, length, this.element, path);
    } finally {
      reader.exit();
    }
  }

  _write(value: T[], writer: Writer, path: string): void {
    assertArray(value, path);
    if (value.length > this.maxLength) {
      throw new XdrError(
        `${path}: array length ${value.length} exceeds maximum ${this.maxLength}`,
      );
    }
    writer.writeUint32(value.length);
    writeArray(value, writer, this.element, path);
  }
}

export function array<T extends XdrType<unknown>>(
  element: T,
  maxLength: number,
): XdrType<Infer<T>[]> {
  return new ArrayType(element, maxLength) as XdrType<Infer<T>[]>;
}

export function readArray<T>(
  reader: Reader,
  length: number,
  element: XdrType<T>,
  path: string,
): T[] {
  const values: T[] = [];
  for (let i = 0; i < length; i += 1) {
    values.push(element._read(reader, `${path}[${i}]`));
  }
  return values;
}

export function writeArray<T>(
  values: T[],
  writer: Writer,
  element: XdrType<T>,
  path: string,
): void {
  let i = 0;
  for (const value of values) {
    element._write(value, writer, `${path}[${i}]`);
    i += 1;
  }
}
