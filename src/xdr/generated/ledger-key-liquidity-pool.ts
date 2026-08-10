import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PoolId, type PoolIdWire } from "./pool-id.js";

export interface LedgerKeyLiquidityPoolWire {
  liquidityPoolId: PoolIdWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         PoolID liquidityPoolID;
 *     }
 * ```
 */
export class LedgerKeyLiquidityPool extends XdrValue {
  readonly liquidityPoolId: PoolId;

  static readonly schema: XdrType<LedgerKeyLiquidityPoolWire> = struct(
    "LedgerKeyLiquidityPool",
    {
      liquidityPoolId: PoolId.schema,
    },
  );

  constructor(input: { liquidityPoolId: PoolId }) {
    super();
    this.liquidityPoolId = input.liquidityPoolId;
  }

  toXdrObject(): LedgerKeyLiquidityPoolWire {
    return {
      liquidityPoolId: this.liquidityPoolId.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: LedgerKeyLiquidityPoolWire,
  ): LedgerKeyLiquidityPool {
    return new LedgerKeyLiquidityPool({
      liquidityPoolId: PoolId.fromXdrObject(wire.liquidityPoolId),
    });
  }
}
