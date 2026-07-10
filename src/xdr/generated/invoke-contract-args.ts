import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { ScAddress, type ScAddressWire } from "./sc-address.js";
import { ScVal, type ScValWire } from "./sc-val.js";

export interface InvokeContractArgsWire {
  contractAddress: ScAddressWire;
  functionName: XdrString;
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
  readonly functionName: XdrString;
  readonly args: ScVal[];

  static readonly schema: XdrType<InvokeContractArgsWire> = struct(
    "InvokeContractArgs",
    {
      contractAddress: ScAddress.schema,
      functionName: xdrString(32),
      args: array(ScVal.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    contractAddress: ScAddress;
    functionName: XdrString | string | Uint8Array;
    args: ScVal[];
  }) {
    super();
    this.contractAddress = input.contractAddress;
    this.functionName =
      input.functionName instanceof XdrString
        ? input.functionName
        : new XdrString(input.functionName);
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
