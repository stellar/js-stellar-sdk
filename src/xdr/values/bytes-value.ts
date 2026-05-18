import {
  hexToUint8Array,
  uint8ArrayToHex,
  base64ToUint8Array,
  uint8ArrayToBase64,
  stringToUint8Array,
  uint8ArrayToString,
} from "uint8array-extras";
import { XdrError } from "../core/error.js";
import { XdrValue } from "./xdr-value.js";

export type BytesEncoding = "hex" | "base64" | "ascii";

function decodeBytesInput(
  input: Uint8Array | string,
  encoding: BytesEncoding,
): Uint8Array {
  if (input instanceof Uint8Array) return input;
  switch (encoding) {
    case "hex":
      return hexToUint8Array(input);
    case "base64":
      return base64ToUint8Array(input);
    case "ascii":
      return stringToUint8Array(input);
  }
}

function stripTrailingNuls(bytes: Uint8Array): Uint8Array {
  let end = bytes.length;
  while (end > 0 && bytes[end - 1] === 0) end -= 1;
  return end === bytes.length ? bytes : bytes.slice(0, end);
}

function encodeBytesValue(bytes: Uint8Array, encoding: BytesEncoding): string {
  switch (encoding) {
    case "hex":
      return uint8ArrayToHex(bytes);
    case "base64":
      return uint8ArrayToBase64(bytes);
    case "ascii":
      return uint8ArrayToString(stripTrailingNuls(bytes));
  }
}

/**
 * Shared base for fixed-length and variable-length byte aliases (Hash, Signature, AssetCode4, ...).
 * Subclasses set `static readonly byteLength` (or override `validateLength`) and
 * `static readonly encoding` to control the `toJson()` representation.
 *
 * The `Tag` type parameter is a nominal-typing brand: subclasses pass a unique
 * string so structurally-identical aliases (e.g. `AssetCode4` vs `AssetCode12`)
 * are not silently assignable to each other.
 */
export abstract class BytesValue<Tag extends string = string> extends XdrValue {
  declare readonly __tag: Tag;
  readonly value: Uint8Array;

  constructor(value: Uint8Array | string) {
    super();
    const ctor = this.constructor as typeof BytesValue & {
      readonly byteLength?: number;
      readonly encoding: BytesEncoding;
    };
    const bytes = decodeBytesInput(value, ctor.encoding);
    if (ctor.byteLength !== undefined && bytes.length !== ctor.byteLength) {
      throw new XdrError(
        `${ctor.name}: expected ${ctor.byteLength} byte(s), got ${bytes.length}`,
      );
    }
    this.value = bytes;
  }

  toXdrObject(): Uint8Array {
    return this.value;
  }

  toJson(): string {
    const ctor = this.constructor as typeof BytesValue & {
      readonly encoding: BytesEncoding;
    };
    return encodeBytesValue(this.value, ctor.encoding);
  }

  toBytes(): Uint8Array {
    return this.value;
  }
}
