import { int32, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";

export interface LiquidityPoolConstantProductParametersWire {
  assetA: AssetWire;
  assetB: AssetWire;
  fee: number;
}

/**
 * ```xdr
 * struct LiquidityPoolConstantProductParameters
 * {
 *     Asset assetA; // assetA < assetB
 *     Asset assetB;
 *     int32 fee; // Fee is in basis points, so the actual rate is (fee/100)%
 * };
 * ```
 */
export class LiquidityPoolConstantProductParameters extends XdrValue {
  readonly assetA: Asset;
  readonly assetB: Asset;
  readonly fee: number;

  static readonly schema: XdrType<LiquidityPoolConstantProductParametersWire> =
    struct("LiquidityPoolConstantProductParameters", {
      assetA: Asset.schema,
      assetB: Asset.schema,
      fee: int32(),
    });

  constructor(input: { assetA: Asset; assetB: Asset; fee: number }) {
    super();
    this.assetA = input.assetA;
    this.assetB = input.assetB;
    this.fee = input.fee;
  }

  toXdrObject(): LiquidityPoolConstantProductParametersWire {
    return {
      assetA: this.assetA.toXdrObject(),
      assetB: this.assetB.toXdrObject(),
      fee: this.fee,
    };
  }

  static fromXdrObject(
    wire: LiquidityPoolConstantProductParametersWire,
  ): LiquidityPoolConstantProductParameters {
    return new LiquidityPoolConstantProductParameters({
      assetA: Asset.fromXdrObject(wire.assetA),
      assetB: Asset.fromXdrObject(wire.assetB),
      fee: wire.fee,
    });
  }
}
