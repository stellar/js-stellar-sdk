import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";
import { assertBigIntRange } from "../core/helpers.js";

class HyperType extends BaseType<bigint> {
  readonly kind = "int64";

  _read(reader: Reader, path: string): bigint {
    return reader.readBigInt64(path);
  }

  _write(value: bigint, writer: Writer, path: string): void {
    assertBigIntRange(value, -(1n << 63n), (1n << 63n) - 1n, path);
    writer.writeBigInt64(value);
  }
}

export function int64(): XdrType<bigint> {
  return new HyperType();
}
