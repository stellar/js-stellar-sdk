import xdr from "../xdr.js";
import { Asset } from "../asset.js";
import {
  CreateClaimableBalanceResult,
  CreateClaimableBalanceOpts,
  OperationAttributes,
} from "./types.js";
import {
  constructAmountRequirementsError,
  isValidAmount,
  setSourceAccount,
  toXDRAmount,
} from "../util/operations.js";

/**
 * Create a new claimable balance operation.
 *
 *
 * @param opts - Options object
 * @param opts.asset - The asset for the claimable balance.
 * @param opts.amount - Amount.
 * @param opts.claimants - An array of Claimants
 * @param opts.source - The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * const asset = new Asset(
 *   'USD',
 *   'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
 * );
 * const amount = '100.0000000';
 * const claimants = [
 *   new Claimant(
 *     'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ',
 *      Claimant.predicateBeforeAbsoluteTime("4102444800000")
 *   )
 * ];
 *
 * const op = Operation.createClaimableBalance({
 *   asset,
 *   amount,
 *   claimants
 * });
 */
export function createClaimableBalance(
  opts: CreateClaimableBalanceOpts,
): xdr.Operation<CreateClaimableBalanceResult> {
  if (!(opts.asset instanceof Asset)) {
    throw new Error(
      "must provide an asset for create claimable balance operation",
    );
  }

  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }

  if (!Array.isArray(opts.claimants) || opts.claimants.length === 0) {
    throw new Error("must provide at least one claimant");
  }

  const asset: xdr.Asset = opts.asset.toXDRObject();
  const amount: xdr.Int64 = toXDRAmount(opts.amount);
  const claimants: xdr.Claimant[] = opts.claimants.map((c) => c.toXDRObject());

  const createClaimableBalanceOp = new xdr.CreateClaimableBalanceOp({
    asset,
    amount,
    claimants,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.createClaimableBalance(createClaimableBalanceOp),
  };

  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
