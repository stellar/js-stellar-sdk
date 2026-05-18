import { setSourceAccount } from "../util/operations.js";
import {
  ClaimableBalanceId,
  ClaimClaimableBalanceOp,
  Operation,
  OperationBody,
} from "../../xdr/index.js";
import { ClaimClaimableBalanceOpts, OperationAttributes } from "./types.js";

/**
 * Create a new claim claimable balance operation.
 * @param opts - Options object
 * @param opts.balanceId - The claimable balance id to be claimed.
 * @param opts.source - The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * const op = Operation.claimClaimableBalance({
 *   balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
 * });
 */
export function claimClaimableBalance(
  opts: ClaimClaimableBalanceOpts = {} as ClaimClaimableBalanceOpts,
): Operation {
  validateClaimableBalanceId(opts.balanceId);

  const balanceId: ClaimableBalanceId = ClaimableBalanceId.fromXdr(
    opts.balanceId,
    "hex",
  );
  const claimClaimableBalanceOp = new ClaimClaimableBalanceOp({
    balanceId: balanceId,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.claimClaimableBalance(claimClaimableBalanceOp),
  };

  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}

/**
 * Validates that a claimable balance ID has the expected format.
 *
 * @param balanceId - The claimable balance ID to validate.
 */
export function validateClaimableBalanceId(balanceId: unknown): void {
  if (
    typeof balanceId !== "string" ||
    balanceId.length !== 8 + 64 /* 8b discriminant + 64b string */
  ) {
    throw new Error("must provide a valid claimable balance id");
  }
}
