import xdr from "../xdr.js";
import { decodeAddressToMuxedAccount } from "../util/decode_encode_muxed_account.js";
import {
  PathPaymentStrictSendResult,
  PathPaymentStrictSendOpts,
  OperationAttributes,
} from "./types.js";
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
): xdr.Operation<PathPaymentStrictSendResult> {
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

  const sendAsset: xdr.Asset = opts.sendAsset.toXDRObject();
  const sendAmount: xdr.Int64 = toXDRAmount(opts.sendAmount);

  let destination: xdr.MuxedAccount;

  try {
    destination = decodeAddressToMuxedAccount(opts.destination);
  } catch (e) {
    throw new Error("destination is invalid");
  }

  const destAsset: xdr.Asset = opts.destAsset.toXDRObject();
  const destMin: xdr.Int64 = toXDRAmount(opts.destMin);
  const path = (opts.path ?? []).map((x) => x.toXDRObject());

  const payment = new xdr.PathPaymentStrictSendOp({
    sendAsset,
    sendAmount,
    destination,
    destAsset,
    destMin,
    path,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.pathPaymentStrictSend(payment),
  };

  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
