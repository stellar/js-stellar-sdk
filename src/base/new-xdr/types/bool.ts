import { XdrError } from "../core/error.js";
import type { Reader } from "../core/reader.js";
import type { Writer } from "../core/writer.js";
import { BaseType, type XdrType } from "../core/xdr-type.js";

class BoolType extends BaseType<boolean> {
  readonly kind = "bool";

  _read(reader: Reader, path: string): boolean {
    const value = reader.readUint32(path);
    if (value === 0) return false;
    if (value === 1) return true;
    throw new XdrError(`${path}: invalid bool discriminant ${value}`);
  }

  _write(value: boolean, writer: Writer, path: string): void {
    if (typeof value !== "boolean") {
      throw new XdrError(`${path}: expected boolean`);
    }
    writer.writeUint32(value ? 1 : 0);
  }
}

export const BOOL_TYPE = new BoolType();

export function bool(): XdrType<boolean> {
  return BOOL_TYPE;
}
