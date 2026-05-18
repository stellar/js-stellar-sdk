import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";

export interface ConfigUpgradeSetKeyWire {
  contractId: HashWire;
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
  readonly contractId: Hash;
  readonly contentHash: Hash;

  static readonly schema: XdrType<ConfigUpgradeSetKeyWire> = struct(
    "ConfigUpgradeSetKey",
    {
      contractId: Hash.schema,
      contentHash: Hash.schema,
    },
  );

  constructor(input: {
    contractId: Hash;
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
      contractId: Hash.fromXdrObject(wire.contractId),
      contentHash: Hash.fromXdrObject(wire.contentHash),
    });
  }
}
