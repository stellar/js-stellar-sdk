import { opaque } from "../types/opaque.js";
import { BytesValue } from "../values/bytes-value.js";

export type HashWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque Hash[32];
 * ```
 */
export class Hash extends BytesValue<"Hash"> {
  static readonly byteLength = 32;
  static readonly encoding = "hex" as const;
  static readonly schema = opaque(32, "Hash");

  static fromXdrObject(wire: Uint8Array): Hash {
    return new Hash(wire);
  }
}
