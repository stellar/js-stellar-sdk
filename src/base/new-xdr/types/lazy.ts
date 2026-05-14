import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type Infer, type XdrType } from "../core/xdr-type.js";

class LazyType<T> extends BaseType<T> {
  readonly kind = "lazy";

  constructor(private readonly getSchema: () => XdrType<T>) {
    super();
  }

  _read(reader: Reader, path: string): T {
    reader.enter(path);
    try {
      return this.getSchema()._read(reader, path);
    } finally {
      reader.exit();
    }
  }

  _write(value: T, writer: Writer, path: string): void {
    this.getSchema()._write(value, writer, path);
  }
}

export function lazy<T extends XdrType<unknown>>(
  getSchema: () => T,
): XdrType<Infer<T>> {
  return new LazyType(() => getSchema()) as XdrType<Infer<T>>;
}
