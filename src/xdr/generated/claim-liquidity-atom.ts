import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PoolId, type PoolIdWire } from "./pool-id.js";
import { Asset, type AssetWire } from "./asset.js";

export interface ClaimLiquidityAtomWire {
  liquidityPoolId: PoolIdWire;
  assetSold: AssetWire;
  amountSold: bigint;
  assetBought: AssetWire;
  amountBought: bigint;
}

/**
 * ```xdr
 * struct ClaimLiquidityAtom
 * {
 *     PoolID liquidityPoolID;
 *
 *     // amount and asset taken from the pool
 *     Asset assetSold;
 *     int64 amountSold;
 *
 *     // amount and asset sent to the pool
 *     Asset assetBought;
 *     int64 amountBought;
 * };
 * ```
 */
export class ClaimLiquidityAtom extends XdrValue {
  readonly liquidityPoolId: PoolId;
  readonly assetSold: Asset;
  readonly amountSold: bigint;
  readonly assetBought: Asset;
  readonly amountBought: bigint;

  static readonly schema: XdrType<ClaimLiquidityAtomWire> = struct(
    "ClaimLiquidityAtom",
    {
      liquidityPoolId: PoolId.schema,
      assetSold: Asset.schema,
      amountSold: int64(),
      assetBought: Asset.schema,
      amountBought: int64(),
    },
  );

  constructor(input: {
    liquidityPoolId: PoolId;
    assetSold: Asset;
    amountSold: bigint;
    assetBought: Asset;
    amountBought: bigint;
  }) {
    super();
    this.liquidityPoolId = input.liquidityPoolId;
    this.assetSold = input.assetSold;
    this.amountSold = input.amountSold;
    this.assetBought = input.assetBought;
    this.amountBought = input.amountBought;
  }

  toXdrObject(): ClaimLiquidityAtomWire {
    return {
      liquidityPoolId: this.liquidityPoolId.toXdrObject(),
      assetSold: this.assetSold.toXdrObject(),
      amountSold: this.amountSold,
      assetBought: this.assetBought.toXdrObject(),
      amountBought: this.amountBought,
    };
  }

  static fromXdrObject(wire: ClaimLiquidityAtomWire): ClaimLiquidityAtom {
    return new ClaimLiquidityAtom({
      liquidityPoolId: PoolId.fromXdrObject(wire.liquidityPoolId),
      assetSold: Asset.fromXdrObject(wire.assetSold),
      amountSold: wire.amountSold,
      assetBought: Asset.fromXdrObject(wire.assetBought),
      amountBought: wire.amountBought,
    });
  }
}
