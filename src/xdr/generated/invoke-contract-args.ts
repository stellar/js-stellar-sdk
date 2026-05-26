import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import { ScVal, type ScValWire } from "./sc-val.js";

export interface InvokeContractArgsWire {
  contractAddress: ScAddressWire;
  functionName: string;
  args: ScValWire[];
}

/**
 * ```xdr
 * struct InvokeContractArgs {
 *     SCAddress contractAddress;
 *     SCSymbol functionName;
 *     SCVal args<>;
 * };
 * ```
 */
export class InvokeContractArgs extends XdrValue {
  readonly contractAddress: ScAddress;
  readonly functionName: string;
  readonly args: ScVal[];

  static readonly schema: XdrType<InvokeContractArgsWire> = struct(
    "InvokeContractArgs",
    {
      contractAddress: ScAddress.schema,
      functionName: string_(32),
      args: array(ScVal.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    contractAddress: ScAddress;
    functionName: Uint8Array | string;
    args: ScVal[];
  }) {
    super();
    this.contractAddress = input.contractAddress;
    this.functionName =
      input.functionName instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.functionName)
        : input.functionName;
    this.args = input.args;
  }

  toXdrObject(): InvokeContractArgsWire {
    return {
      contractAddress: this.contractAddress.toXdrObject(),
      functionName: this.functionName,
      args: this.args.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: InvokeContractArgsWire): InvokeContractArgs {
    return new InvokeContractArgs({
      contractAddress: ScAddress.fromXdrObject(wire.contractAddress),
      functionName: wire.functionName,
      args: wire.args.map((w) => ScVal.fromXdrObject(w)),
    });
  }
}
