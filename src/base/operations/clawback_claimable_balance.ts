import { setSourceAccount } from "../util/operations.js";
import xdr from "../xdr.js";
import { validateClaimableBalanceId } from "./claim_claimable_balance.js";
import {
  ClawbackClaimableBalanceResult,
  ClawbackClaimableBalanceOpts,
  OperationAttributes,
} from "./types.js";

/**
 * Creates a clawback operation for a claimable balance.
 *
 * @param opts - Options object
 * @param opts.balanceId - The claimable balance ID to be clawed back.
 * @param opts.source - The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * const op = Operation.clawbackClaimableBalance({
 *   balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
 * });
 *
 * @see https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#clawback-claimable-balance-operation
 */
export function clawbackClaimableBalance(
  opts: ClawbackClaimableBalanceOpts = {} as ClawbackClaimableBalanceOpts,
): xdr.Operation<ClawbackClaimableBalanceResult> {
  validateClaimableBalanceId(opts.balanceId);

  const balanceId: xdr.ClaimableBalanceId = xdr.ClaimableBalanceId.fromXDR(
    opts.balanceId,
    "hex",
  );

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.clawbackClaimableBalance(
      new xdr.ClawbackClaimableBalanceOp({ balanceId }),
    ),
  };

  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
