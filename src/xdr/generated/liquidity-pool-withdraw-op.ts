import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";

export interface LiquidityPoolWithdrawOpWire {
  liquidityPoolId: HashWire;
  amount: bigint;
  minAmountA: bigint;
  minAmountB: bigint;
}

/**
 * ```xdr
 * struct LiquidityPoolWithdrawOp
 * {
 *     PoolID liquidityPoolID;
 *     int64 amount;     // amount of pool shares to withdraw
 *     int64 minAmountA; // minimum amount of first asset to withdraw
 *     int64 minAmountB; // minimum amount of second asset to withdraw
 * };
 * ```
 */
export class LiquidityPoolWithdrawOp extends XdrValue {
  readonly liquidityPoolId: Hash;
  readonly amount: bigint;
  readonly minAmountA: bigint;
  readonly minAmountB: bigint;

  static readonly schema: XdrType<LiquidityPoolWithdrawOpWire> = struct(
    "LiquidityPoolWithdrawOp",
    {
      liquidityPoolId: Hash.schema,
      amount: int64(),
      minAmountA: int64(),
      minAmountB: int64(),
    },
  );

  constructor(input: {
    liquidityPoolId: Hash;
    amount: bigint;
    minAmountA: bigint;
    minAmountB: bigint;
  }) {
    super();
    this.liquidityPoolId = input.liquidityPoolId;
    this.amount = input.amount;
    this.minAmountA = input.minAmountA;
    this.minAmountB = input.minAmountB;
  }

  toXdrObject(): LiquidityPoolWithdrawOpWire {
    return {
      liquidityPoolId: this.liquidityPoolId.toXdrObject(),
      amount: this.amount,
      minAmountA: this.minAmountA,
      minAmountB: this.minAmountB,
    };
  }

  static fromXdrObject(
    wire: LiquidityPoolWithdrawOpWire,
  ): LiquidityPoolWithdrawOp {
    return new LiquidityPoolWithdrawOp({
      liquidityPoolId: Hash.fromXdrObject(wire.liquidityPoolId),
      amount: wire.amount,
      minAmountA: wire.minAmountA,
      minAmountB: wire.minAmountB,
    });
  }
}
