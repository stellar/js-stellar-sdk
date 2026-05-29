import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";
import { assertBigIntRange } from "../core/helpers.js";

class UHyperType extends BaseType<bigint> {
  readonly kind = "uint64";

  _read(reader: Reader, path: string): bigint {
    return reader.readBigUint64(path);
  }

  _write(value: bigint, writer: Writer, path: string): void {
    assertBigIntRange(value, 0n, (1n << 64n) - 1n, path);
    writer.writeBigUint64(value);
  }
}

export function uint64(): XdrType<bigint> {
  return new UHyperType();
}
