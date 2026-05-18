import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";

export interface LedgerKeyLiquidityPoolWire {
  liquidityPoolId: HashWire;
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
  readonly liquidityPoolId: Hash;

  static readonly schema: XdrType<LedgerKeyLiquidityPoolWire> = struct(
    "LedgerKeyLiquidityPool",
    {
      liquidityPoolId: Hash.schema,
    },
  );

  constructor(input: { liquidityPoolId: Hash }) {
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
      liquidityPoolId: Hash.fromXdrObject(wire.liquidityPoolId),
    });
  }
}
