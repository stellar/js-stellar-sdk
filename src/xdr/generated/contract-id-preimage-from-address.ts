import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import { Uint256Bytes, type Uint256BytesWire } from "./uint256-bytes.js";

export interface ContractIdPreimageFromAddressWire {
  address: ScAddressWire;
  salt: Uint256BytesWire;
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
  readonly salt: Uint256Bytes;

  static readonly schema: XdrType<ContractIdPreimageFromAddressWire> = struct(
    "ContractIdPreimageFromAddress",
    {
      address: ScAddress.schema,
      salt: Uint256Bytes.schema,
    },
  );

  constructor(input: {
    address: ScAddress;
    salt: Uint256Bytes | Uint8Array | string;
  }) {
    super();
    this.address = input.address;
    this.salt =
      input.salt instanceof Uint256Bytes
        ? input.salt
        : new Uint256Bytes(input.salt);
  }

  toXdrObject(): ContractIdPreimageFromAddressWire {
    return {
      address: this.address.toXdrObject(),
      salt: this.salt.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: ContractIdPreimageFromAddressWire,
  ): ContractIdPreimageFromAddress {
    return new ContractIdPreimageFromAddress({
      address: ScAddress.fromXdrObject(wire.address),
      salt: Uint256Bytes.fromXdrObject(wire.salt),
    });
  }
}
