import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Liabilities, type LiabilitiesWire } from "./liabilities.js";
import {
  TrustLineEntryV1Ext,
  type TrustLineEntryV1ExtWire,
} from "./trust-line-entry-v1-ext.js";

export interface TrustLineEntryV1Wire {
  liabilities: LiabilitiesWire;
  ext: TrustLineEntryV1ExtWire;
}

/**
 * ```xdr
 * struct
 *         {
 *             Liabilities liabilities;
 *
 *             union switch (int v)
 *             {
 *             case 0:
 *                 void;
 *             case 2:
 *                 TrustLineEntryExtensionV2 v2;
 *             }
 *             ext;
 *         }
 * ```
 */
export class TrustLineEntryV1 extends XdrValue {
  readonly liabilities: Liabilities;
  readonly ext: TrustLineEntryV1Ext;

  static readonly schema: XdrType<TrustLineEntryV1Wire> = struct(
    "TrustLineEntryV1",
    {
      liabilities: Liabilities.schema,
      ext: TrustLineEntryV1Ext.schema,
    },
  );

  constructor(input: { liabilities: Liabilities; ext: TrustLineEntryV1Ext }) {
    super();
    this.liabilities = input.liabilities;
    this.ext = input.ext;
  }

  toXdrObject(): TrustLineEntryV1Wire {
    return {
      liabilities: this.liabilities.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: TrustLineEntryV1Wire): TrustLineEntryV1 {
    return new TrustLineEntryV1({
      liabilities: Liabilities.fromXdrObject(wire.liabilities),
      ext: TrustLineEntryV1Ext.fromXdrObject(wire.ext),
    });
  }
}
