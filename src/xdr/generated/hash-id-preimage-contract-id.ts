import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  ContractIdPreimage,
  type ContractIdPreimageWire,
} from "./contract-id-preimage.js";

export interface HashIdPreimageContractIdWire {
  networkId: HashWire;
  contractIdPreimage: ContractIdPreimageWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         Hash networkID;
 *         ContractIDPreimage contractIDPreimage;
 *     }
 * ```
 */
export class HashIdPreimageContractId extends XdrValue {
  readonly networkId: Hash;
  readonly contractIdPreimage: ContractIdPreimage;

  static readonly schema: XdrType<HashIdPreimageContractIdWire> = struct(
    "HashIdPreimageContractId",
    {
      networkId: Hash.schema,
      contractIdPreimage: ContractIdPreimage.schema,
    },
  );

  constructor(input: {
    networkId: Hash | Uint8Array | string;
    contractIdPreimage: ContractIdPreimage;
  }) {
    super();
    this.networkId =
      input.networkId instanceof Hash
        ? input.networkId
        : new Hash(input.networkId);
    this.contractIdPreimage = input.contractIdPreimage;
  }

  toXdrObject(): HashIdPreimageContractIdWire {
    return {
      networkId: this.networkId.toXdrObject(),
      contractIdPreimage: this.contractIdPreimage.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: HashIdPreimageContractIdWire,
  ): HashIdPreimageContractId {
    return new HashIdPreimageContractId({
      networkId: Hash.fromXdrObject(wire.networkId),
      contractIdPreimage: ContractIdPreimage.fromXdrObject(
        wire.contractIdPreimage,
      ),
    });
  }
}
