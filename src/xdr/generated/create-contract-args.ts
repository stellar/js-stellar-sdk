import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  ContractIdPreimage,
  type ContractIdPreimageWire,
} from "./contract-id-preimage.js";
import {
  ContractExecutable,
  type ContractExecutableWire,
} from "./contract-executable.js";

export interface CreateContractArgsWire {
  contractIdPreimage: ContractIdPreimageWire;
  executable: ContractExecutableWire;
}

/**
 * ```xdr
 * struct CreateContractArgs
 * {
 *     ContractIDPreimage contractIDPreimage;
 *     ContractExecutable executable;
 * };
 * ```
 */
export class CreateContractArgs extends XdrValue {
  readonly contractIdPreimage: ContractIdPreimage;
  readonly executable: ContractExecutable;

  static readonly schema: XdrType<CreateContractArgsWire> = struct(
    "CreateContractArgs",
    {
      contractIdPreimage: ContractIdPreimage.schema,
      executable: ContractExecutable.schema,
    },
  );

  constructor(input: {
    contractIdPreimage: ContractIdPreimage;
    executable: ContractExecutable;
  }) {
    super();
    this.contractIdPreimage = input.contractIdPreimage;
    this.executable = input.executable;
  }

  toXdrObject(): CreateContractArgsWire {
    return {
      contractIdPreimage: this.contractIdPreimage.toXdrObject(),
      executable: this.executable.toXdrObject(),
    };
  }

  static fromXdrObject(wire: CreateContractArgsWire): CreateContractArgs {
    return new CreateContractArgs({
      contractIdPreimage: ContractIdPreimage.fromXdrObject(
        wire.contractIdPreimage,
      ),
      executable: ContractExecutable.fromXdrObject(wire.executable),
    });
  }
}
