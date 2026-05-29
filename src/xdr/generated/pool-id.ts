import { opaque } from "../types/opaque.js";
import { BytesValue } from "../values/bytes-value.js";

export type PoolIdWire = Uint8Array;

/**
 * ```xdr
 * typedef Hash PoolID;
 * ```
 */
export class PoolId extends BytesValue<"PoolId"> {
  static readonly byteLength = 32;
  static readonly encoding = "hex" as const;
  static readonly schema = opaque(32, "PoolId");

  static fromXdrObject(wire: Uint8Array): PoolId {
    return new PoolId(wire);
  }
}
