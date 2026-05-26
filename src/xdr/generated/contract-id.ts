import { opaque } from "../types/opaque.js";
import { BytesValue } from "../values/bytes-value.js";

export type ContractIdWire = Uint8Array;

/**
 * ```xdr
 * typedef Hash ContractID;
 * ```
 */
export class ContractId extends BytesValue<"ContractId"> {
  static readonly byteLength = 32;
  static readonly encoding = "hex" as const;
  static readonly schema = opaque(32, "ContractId");

  static fromXdrObject(wire: Uint8Array): ContractId {
    return new ContractId(wire);
  }
}
