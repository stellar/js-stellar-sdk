import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";

export interface ContractCostParamEntryWire {
  ext: ExtensionPointWire;
  constTerm: bigint;
  linearTerm: bigint;
}

/**
 * ```xdr
 * struct ContractCostParamEntry {
 *     // use `ext` to add more terms (e.g. higher order polynomials) in the future
 *     ExtensionPoint ext;
 *
 *     int64 constTerm;
 *     int64 linearTerm;
 * };
 * ```
 */
export class ContractCostParamEntry extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly constTerm: bigint;
  readonly linearTerm: bigint;

  static readonly schema: XdrType<ContractCostParamEntryWire> = struct(
    "ContractCostParamEntry",
    {
      ext: ExtensionPoint.schema,
      constTerm: int64(),
      linearTerm: int64(),
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    constTerm: bigint;
    linearTerm: bigint;
  }) {
    super();
    this.ext = input.ext;
    this.constTerm = input.constTerm;
    this.linearTerm = input.linearTerm;
  }

  toXdrObject(): ContractCostParamEntryWire {
    return {
      ext: this.ext.toXdrObject(),
      constTerm: this.constTerm,
      linearTerm: this.linearTerm,
    };
  }

  static fromXdrObject(
    wire: ContractCostParamEntryWire,
  ): ContractCostParamEntry {
    return new ContractCostParamEntry({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      constTerm: wire.constTerm,
      linearTerm: wire.linearTerm,
    });
  }
}
