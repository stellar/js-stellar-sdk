import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  ContractIdPreimage,
  type ContractIdPreimageWire,
} from "./contract-id-preimage.js";
import {
  ContractExecutable,
  type ContractExecutableWire,
} from "./contract-executable.js";
import { ScVal, type ScValWire } from "./sc-val.js";

export interface CreateContractArgsV2Wire {
  contractIdPreimage: ContractIdPreimageWire;
  executable: ContractExecutableWire;
  constructorArgs: ScValWire[];
}

/**
 * ```xdr
 * struct CreateContractArgsV2
 * {
 *     ContractIDPreimage contractIDPreimage;
 *     ContractExecutable executable;
 *     // Arguments of the contract's constructor.
 *     SCVal constructorArgs<>;
 * };
 * ```
 */
export class CreateContractArgsV2 extends XdrValue {
  readonly contractIdPreimage: ContractIdPreimage;
  readonly executable: ContractExecutable;
  readonly constructorArgs: ScVal[];

  static readonly schema: XdrType<CreateContractArgsV2Wire> = struct(
    "CreateContractArgsV2",
    {
      contractIdPreimage: ContractIdPreimage.schema,
      executable: ContractExecutable.schema,
      constructorArgs: array(ScVal.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    contractIdPreimage: ContractIdPreimage;
    executable: ContractExecutable;
    constructorArgs: ScVal[];
  }) {
    super();
    this.contractIdPreimage = input.contractIdPreimage;
    this.executable = input.executable;
    this.constructorArgs = input.constructorArgs;
  }

  toXdrObject(): CreateContractArgsV2Wire {
    return {
      contractIdPreimage: this.contractIdPreimage.toXdrObject(),
      executable: this.executable.toXdrObject(),
      constructorArgs: this.constructorArgs.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: CreateContractArgsV2Wire): CreateContractArgsV2 {
    return new CreateContractArgsV2({
      contractIdPreimage: ContractIdPreimage.fromXdrObject(
        wire.contractIdPreimage,
      ),
      executable: ContractExecutable.fromXdrObject(wire.executable),
      constructorArgs: wire.constructorArgs.map((w) => ScVal.fromXdrObject(w)),
    });
  }
}
