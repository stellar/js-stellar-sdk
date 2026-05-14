import { MuxedAccount, Operation, OperationBody } from "../generated/index.js";
import { decodeAddressToMuxedAccount } from "../util/decode_encode_muxed_account.js";
import { OperationAttributes, PaymentOpts } from "./types.js";
import {
  constructAmountRequirementsError,
  isValidAmount,
  setSourceAccount,
  toXDRAmount,
} from "../util/operations.js";

/**
 * Create a payment operation.
 *
 * @see https://developers.stellar.org/docs/start/list-of-operations/#payment
 *
 * @param opts - options object
 * @param opts.destination - destination account ID
 * @param opts.asset - asset to send
 * @param opts.amount - amount to send
 * @param opts.source - The source account for the payment.
 *     Defaults to the transaction's source account.
 */
export function payment(opts: PaymentOpts): Operation {
  if (!opts.asset) {
    throw new Error("Must provide an asset for a payment operation");
  }
  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }

  let destination: MuxedAccount;
  try {
    destination = decodeAddressToMuxedAccount(opts.destination);
  } catch {
    throw new Error("destination is invalid");
  }

  const paymentOp = {
    destination,
    asset: opts.asset.toWireXDRObject(),
    amount: toXDRAmount(opts.amount),
  };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.payment(paymentOp),
  };
  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
