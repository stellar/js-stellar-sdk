import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";
import {
  ContractCodeCostInputs,
  type ContractCodeCostInputsWire,
} from "./contract-code-cost-inputs.js";

export interface ContractCodeEntryV1Wire {
  ext: ExtensionPointWire;
  costInputs: ContractCodeCostInputsWire;
}

/**
 * ```xdr
 * struct
 *             {
 *                 ExtensionPoint ext;
 *                 ContractCodeCostInputs costInputs;
 *             }
 * ```
 */
export class ContractCodeEntryV1 extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly costInputs: ContractCodeCostInputs;

  static readonly schema: XdrType<ContractCodeEntryV1Wire> = struct(
    "ContractCodeEntryV1",
    {
      ext: ExtensionPoint.schema,
      costInputs: ContractCodeCostInputs.schema,
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    costInputs: ContractCodeCostInputs;
  }) {
    super();
    this.ext = input.ext;
    this.costInputs = input.costInputs;
  }

  toXdrObject(): ContractCodeEntryV1Wire {
    return {
      ext: this.ext.toXdrObject(),
      costInputs: this.costInputs.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ContractCodeEntryV1Wire): ContractCodeEntryV1 {
    return new ContractCodeEntryV1({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      costInputs: ContractCodeCostInputs.fromXdrObject(wire.costInputs),
    });
  }
}
