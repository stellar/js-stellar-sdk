import { opaque } from "@stellar/js-xdr";
import { BytesValue } from "../values/bytes-value.js";

export type Uint256BytesWire = Uint8Array;

/**
 * ```xdr
 * typedef opaque uint256[32];
 * ```
 */
export class Uint256Bytes extends BytesValue<"Uint256Bytes"> {
  static readonly byteLength = 32;
  static readonly encoding = "hex" as const;
  static readonly schema = opaque(32, "Uint256Bytes");

  static fromXdrObject(wire: Uint8Array): Uint256Bytes {
    return new Uint256Bytes(wire);
  }
}
