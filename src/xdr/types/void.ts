import { XdrError } from "../core/error.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";

class VoidType extends BaseType<void> {
  readonly kind = "void";

  _read(): void {
    return undefined;
  }

  _write(value: void, _writer: Writer, path: string): void {
    if (value !== undefined) {
      throw new XdrError(`${path}: expected void`);
    }
  }
}

function void_(): XdrType<void> {
  return new VoidType();
}

export { void_ as void };
