import { struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ContractId, type ContractIdWire } from "./contract-id.js";

export interface MuxedContractWire {
  id: bigint;
  contractId: ContractIdWire;
}

/**
 * ```xdr
 * struct MuxedContract
 * {
 *     uint64 id;
 *     ContractID contractId;
 * };
 * ```
 */
export class MuxedContract extends XdrValue {
  readonly id: bigint;
  readonly contractId: ContractId;

  static readonly schema: XdrType<MuxedContractWire> = struct("MuxedContract", {
    id: uint64(),
    contractId: ContractId.schema,
  });

  constructor(input: { id: bigint; contractId: ContractId }) {
    super();
    this.id = input.id;
    this.contractId = input.contractId;
  }

  toXdrObject(): MuxedContractWire {
    return {
      id: this.id,
      contractId: this.contractId.toXdrObject(),
    };
  }

  static fromXdrObject(wire: MuxedContractWire): MuxedContract {
    return new MuxedContract({
      id: wire.id,
      contractId: ContractId.fromXdrObject(wire.contractId),
    });
  }
}
