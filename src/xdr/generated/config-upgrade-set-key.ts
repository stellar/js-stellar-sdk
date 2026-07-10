import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ContractId, type ContractIdWire } from "./contract-id.js";
import { Hash, type HashWire } from "./hash.js";

export interface ConfigUpgradeSetKeyWire {
  contractId: ContractIdWire;
  contentHash: HashWire;
}

/**
 * ```xdr
 * struct ConfigUpgradeSetKey {
 *     ContractID contractID;
 *     Hash contentHash;
 * };
 * ```
 */
export class ConfigUpgradeSetKey extends XdrValue {
  readonly contractId: ContractId;
  readonly contentHash: Hash;

  static readonly schema: XdrType<ConfigUpgradeSetKeyWire> = struct(
    "ConfigUpgradeSetKey",
    {
      contractId: ContractId.schema,
      contentHash: Hash.schema,
    },
  );

  constructor(input: {
    contractId: ContractId;
    contentHash: Hash | Uint8Array | string;
  }) {
    super();
    this.contractId = input.contractId;
    this.contentHash =
      input.contentHash instanceof Hash
        ? input.contentHash
        : new Hash(input.contentHash);
  }

  toXdrObject(): ConfigUpgradeSetKeyWire {
    return {
      contractId: this.contractId.toXdrObject(),
      contentHash: this.contentHash.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ConfigUpgradeSetKeyWire): ConfigUpgradeSetKey {
    return new ConfigUpgradeSetKey({
      contractId: ContractId.fromXdrObject(wire.contractId),
      contentHash: Hash.fromXdrObject(wire.contentHash),
    });
  }
}
