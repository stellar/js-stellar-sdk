import { int32, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  TrustLineEntryExtensionV2Ext,
  type TrustLineEntryExtensionV2ExtWire,
} from "./trust-line-entry-extension-v2-ext.js";

export interface TrustLineEntryExtensionV2Wire {
  liquidityPoolUseCount: number;
  ext: TrustLineEntryExtensionV2ExtWire;
}

/**
 * ```xdr
 * struct TrustLineEntryExtensionV2
 * {
 *     int32 liquidityPoolUseCount;
 *
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class TrustLineEntryExtensionV2 extends XdrValue {
  readonly liquidityPoolUseCount: number;
  readonly ext: TrustLineEntryExtensionV2Ext;

  static readonly schema: XdrType<TrustLineEntryExtensionV2Wire> = struct(
    "TrustLineEntryExtensionV2",
    {
      liquidityPoolUseCount: int32(),
      ext: TrustLineEntryExtensionV2Ext.schema,
    },
  );

  constructor(input: {
    liquidityPoolUseCount: number;
    ext: TrustLineEntryExtensionV2Ext;
  }) {
    super();
    this.liquidityPoolUseCount = input.liquidityPoolUseCount;
    this.ext = input.ext;
  }

  toXdrObject(): TrustLineEntryExtensionV2Wire {
    return {
      liquidityPoolUseCount: this.liquidityPoolUseCount,
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: TrustLineEntryExtensionV2Wire,
  ): TrustLineEntryExtensionV2 {
    return new TrustLineEntryExtensionV2({
      liquidityPoolUseCount: wire.liquidityPoolUseCount,
      ext: TrustLineEntryExtensionV2Ext.fromXdrObject(wire.ext),
    });
  }
}
