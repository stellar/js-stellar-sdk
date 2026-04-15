import xdr from "../xdr.js";
import { decodeAddressToMuxedAccount } from "../util/decode_encode_muxed_account.js";
import {
  OperationAttributes,
  PathPaymentStrictReceiveResult,
  PathPaymentStrictReceiveOpts,
} from "./types.js";
import {
  isValidAmount,
  constructAmountRequirementsError,
  toXDRAmount,
  setSourceAccount,
} from "../util/operations.js";

/**
 * Creates a PathPaymentStrictReceive operation.
 *
 * A `PathPaymentStrictReceive` operation sends the specified amount to the
 * destination account. It credits the destination with `destAmount` of
 * `destAsset`, while debiting at most `sendMax` of `sendAsset` from the source.
 * The transfer optionally occurs through a path. XLM payments create the
 * destination account if it does not exist.
 *
 * @see https://developers.stellar.org/docs/start/list-of-operations/#path-payment-strict-receive
 *
 * @param opts - Options object
 * @param opts.sendAsset - asset to pay with
 * @param opts.sendMax - maximum amount of sendAsset to send
 * @param opts.destination - destination account to send to
 * @param opts.destAsset - asset the destination will receive
 * @param opts.destAmount - amount the destination receives
 * @param opts.path - array of Asset objects to use as the path
 * @param opts.source - The source account for the payment.
 *     Defaults to the transaction's source account.
 */
export function pathPaymentStrictReceive(
  opts: PathPaymentStrictReceiveOpts,
): xdr.Operation<PathPaymentStrictReceiveResult> {
  if (!opts.sendAsset) {
    throw new Error("Must specify a send asset");
  }
  if (!isValidAmount(opts.sendMax)) {
    throw new TypeError(constructAmountRequirementsError("sendMax"));
  }
  if (!opts.destAsset) {
    throw new Error("Must provide a destAsset for a payment operation");
  }
  if (!isValidAmount(opts.destAmount)) {
    throw new TypeError(constructAmountRequirementsError("destAmount"));
  }

  let destination: xdr.MuxedAccount;
  try {
    destination = decodeAddressToMuxedAccount(opts.destination);
  } catch {
    throw new Error("destination is invalid");
  }

  const path = opts.path ? opts.path : [];

  const paymentOp = new xdr.PathPaymentStrictReceiveOp({
    sendAsset: opts.sendAsset.toXDRObject(),
    sendMax: toXDRAmount(opts.sendMax),
    destination,
    destAsset: opts.destAsset.toXDRObject(),
    destAmount: toXDRAmount(opts.destAmount),
    path: path.map((x) => x.toXDRObject()),
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.pathPaymentStrictReceive(paymentOp),
  };
  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
