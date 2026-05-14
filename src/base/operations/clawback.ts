import { MuxedAccount, Operation, OperationBody } from "../generated/index.js";
import { decodeAddressToMuxedAccount } from "../util/decode_encode_muxed_account.js";
import { ClawbackOpts, OperationAttributes } from "./types.js";
import {
  constructAmountRequirementsError,
  isValidAmount,
  setSourceAccount,
  toXDRAmount,
} from "../util/operations.js";

/**
 * Creates a clawback operation.
 *
 *
 * @param opts - Options object
 * @param opts.asset - The asset being clawed back.
 * @param opts.amount - The amount of the asset to claw back.
 * @param opts.from - The public key of the (optionally-muxed)
 *     account to claw back from.
 * @param opts.source - The source account for the operation.
 *     Defaults to the transaction's source account.
 *
 * @see https://github.com/stellar/stellar-protocol/blob/master/core/cap-0035.md#clawback-operation
 */
export function clawback(opts: ClawbackOpts): Operation {
  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }

  let from: MuxedAccount;
  try {
    from = decodeAddressToMuxedAccount(opts.from);
  } catch {
    throw new Error("from address is invalid");
  }

  const clawbackOp = {
    amount: toXDRAmount(opts.amount),
    asset: opts.asset.toWireXDRObject(),
    from,
  };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.clawback(clawbackOp),
  };
  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
