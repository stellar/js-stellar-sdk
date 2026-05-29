import { struct } from "../types/struct.js";
import { option } from "../types/option.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  SorobanTransactionMetaExt,
  type SorobanTransactionMetaExtWire,
} from "./soroban-transaction-meta-ext.js";
import { ScVal, type ScValWire } from "./sc-val.js";

export interface SorobanTransactionMetaV2Wire {
  ext: SorobanTransactionMetaExtWire;
  returnValue: ScValWire | null;
}

/**
 * ```xdr
 * struct SorobanTransactionMetaV2
 * {
 *     SorobanTransactionMetaExt ext;
 *
 *     SCVal* returnValue;
 * };
 * ```
 */
export class SorobanTransactionMetaV2 extends XdrValue {
  readonly ext: SorobanTransactionMetaExt;
  readonly returnValue: ScVal | null;

  static readonly schema: XdrType<SorobanTransactionMetaV2Wire> = struct(
    "SorobanTransactionMetaV2",
    {
      ext: SorobanTransactionMetaExt.schema,
      returnValue: option(ScVal.schema),
    },
  );

  constructor(input: {
    ext: SorobanTransactionMetaExt;
    returnValue: ScVal | null;
  }) {
    super();
    this.ext = input.ext;
    this.returnValue = input.returnValue;
  }

  toXdrObject(): SorobanTransactionMetaV2Wire {
    return {
      ext: this.ext.toXdrObject(),
      returnValue:
        this.returnValue === null ? null : this.returnValue.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: SorobanTransactionMetaV2Wire,
  ): SorobanTransactionMetaV2 {
    return new SorobanTransactionMetaV2({
      ext: SorobanTransactionMetaExt.fromXdrObject(wire.ext),
      returnValue:
        wire.returnValue === null
          ? null
          : ScVal.fromXdrObject(wire.returnValue),
    });
  }
}
