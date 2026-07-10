import {
  hexToUint8Array,
  base64ToUint8Array,
  stringToUint8Array,
} from "uint8array-extras";
import { XdrError } from "@stellar/js-xdr";
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

  // `toJson()` is inherited from `XdrValue` — the JSON walker dispatches
  // on schema name. With named-schema codegen for typedef-opaque aliases
  // (Hash, AssetCode4, PoolId, ContractId, …), the walker fires the
  // appropriate override; without one, falls through to the kind-based
  // default (`opaque`/`varOpaque` → hex per SEP-0051).

  toBytes(): Uint8Array {
    return this.value;
  }
}
