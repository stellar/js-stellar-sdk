import {
  Asset,
  Int64,
  MuxedAccount,
  Operation,
  OperationBody,
} from "../generated/index.js";
import { decodeAddressToMuxedAccount } from "../util/decode_encode_muxed_account.js";
import { PathPaymentStrictSendOpts, OperationAttributes } from "./types.js";
import {
  isValidAmount,
  constructAmountRequirementsError,
  toXDRAmount,
  setSourceAccount,
} from "../util/operations.js";

/**
 * Creates a PathPaymentStrictSend operation.
 *
 * A `PathPaymentStrictSend` operation sends the specified amount to the
 * destination account crediting at least `destMin` of `destAsset`, optionally
 * through a path. XLM payments create the destination account if it does not
 * exist.
 *
 * @see https://developers.stellar.org/docs/start/list-of-operations/#path-payment-strict-send
 *
 * @param opts - Options object
 * @param opts.sendAsset - asset to pay with
 * @param opts.sendAmount - amount of sendAsset to send (excluding fees)
 * @param opts.destination - destination account to send to
 * @param opts.destAsset - asset the destination will receive
 * @param opts.destMin - minimum amount of destAsset to be received
 * @param opts.path - array of Asset objects to use as the path
 * @param opts.source - The source account for the payment. Defaults to the transaction's source account.
 */
export function pathPaymentStrictSend(
  opts: PathPaymentStrictSendOpts,
): Operation {
  if (!opts.sendAsset) {
    throw new Error("Must specify a send asset");
  }

  if (!isValidAmount(opts.sendAmount)) {
    throw new TypeError(constructAmountRequirementsError("sendAmount"));
  }

  if (!opts.destAsset) {
    throw new Error("Must provide a destAsset for a payment operation");
  }

  if (!isValidAmount(opts.destMin)) {
    throw new TypeError(constructAmountRequirementsError("destMin"));
  }

  const sendAsset: Asset = opts.sendAsset.toWireXDRObject();
  const sendAmount: Int64 = toXDRAmount(opts.sendAmount);

  let destination: MuxedAccount;

  try {
    destination = decodeAddressToMuxedAccount(opts.destination);
  } catch {
    throw new Error("destination is invalid");
  }

  const destAsset: Asset = opts.destAsset.toWireXDRObject();
  const destMin: Int64 = toXDRAmount(opts.destMin);
  const path = (opts.path ?? []).map((x) => x.toWireXDRObject());

  const payment = {
    sendAsset,
    sendAmount,
    destination,
    destAsset,
    destMin,
    path,
  };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.pathPaymentStrictSend(payment),
  };

  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
