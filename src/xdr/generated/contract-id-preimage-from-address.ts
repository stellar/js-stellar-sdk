import { struct } from "../types/struct.js";
import { opaque } from "../types/opaque.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";

export interface ContractIdPreimageFromAddressWire {
  address: ScAddressWire;
  salt: Uint8Array;
}

/**
 * ```xdr
 * struct
 *     {
 *         SCAddress address;
 *         uint256 salt;
 *     }
 * ```
 */
export class ContractIdPreimageFromAddress extends XdrValue {
  readonly address: ScAddress;
  readonly salt: Uint8Array;

  static readonly schema: XdrType<ContractIdPreimageFromAddressWire> = struct(
    "ContractIdPreimageFromAddress",
    {
      address: ScAddress.schema,
      salt: opaque(32),
    },
  );

  constructor(input: { address: ScAddress; salt: Uint8Array }) {
    super();
    this.address = input.address;
    this.salt = input.salt;
  }

  toXdrObject(): ContractIdPreimageFromAddressWire {
    return {
      address: this.address.toXdrObject(),
      salt: this.salt,
    };
  }

  static fromXdrObject(
    wire: ContractIdPreimageFromAddressWire,
  ): ContractIdPreimageFromAddress {
    return new ContractIdPreimageFromAddress({
      address: ScAddress.fromXdrObject(wire.address),
      salt: wire.salt,
    });
  }
}
