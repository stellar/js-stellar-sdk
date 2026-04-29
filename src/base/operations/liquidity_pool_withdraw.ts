import {
  isValidAmount,
  constructAmountRequirementsError,
  toXDRAmount,
  setSourceAccount,
} from "../util/operations.js";
import xdr from "../xdr.js";
import {
  LiquidityPoolWithdrawResult,
  LiquidityPoolWithdrawOpts,
  OperationAttributes,
} from "./types.js";

/**
 * Creates a liquidity pool withdraw operation.
 *
 * @see https://developers.stellar.org/docs/start/list-of-operations/#liquidity-pool-withdraw
 *
 * @param opts - Options object
 * @param opts.liquidityPoolId - The liquidity pool ID.
 * @param opts.amount - Amount of pool shares to withdraw.
 * @param opts.minAmountA - Minimum amount of first asset to withdraw.
 * @param opts.minAmountB - Minimum amount of second asset to withdraw.
 * @param opts.source - The source account for the operation. Defaults to the transaction's source account.
 */
export function liquidityPoolWithdraw(
  opts: LiquidityPoolWithdrawOpts = {} as LiquidityPoolWithdrawOpts,
): xdr.Operation<LiquidityPoolWithdrawResult> {
  if (!opts.liquidityPoolId) {
    throw new TypeError("liquidityPoolId argument is required");
  }
  const liquidityPoolId = Buffer.from(
    opts.liquidityPoolId,
    "hex",
  ) as unknown as xdr.PoolId;

  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }
  const amount = toXDRAmount(opts.amount);

  if (!isValidAmount(opts.minAmountA, true)) {
    throw new TypeError(constructAmountRequirementsError("minAmountA"));
  }
  const minAmountA = toXDRAmount(opts.minAmountA);

  if (!isValidAmount(opts.minAmountB, true)) {
    throw new TypeError(constructAmountRequirementsError("minAmountB"));
  }
  const minAmountB = toXDRAmount(opts.minAmountB);

  const liquidityPoolWithdrawOp = new xdr.LiquidityPoolWithdrawOp({
    liquidityPoolId,
    amount,
    minAmountA,
    minAmountB,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.liquidityPoolWithdraw(liquidityPoolWithdrawOp),
  };
  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
