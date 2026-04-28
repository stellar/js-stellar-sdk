import {
  isValidAmount,
  constructAmountRequirementsError,
  toXDRAmount,
  setSourceAccount,
  toXDRPrice,
} from "../util/operations.js";
import xdr from "../xdr.js";
import {
  ManageSellOfferResult,
  ManageSellOfferOpts,
  OperationAttributes,
} from "./types.js";

/**
 * Returns a XDR ManageSellOfferOp. A "manage sell offer" operation creates, updates, or
 * deletes an offer.
 * @param opts - Options object
 * @param opts.selling - What you're selling.
 * @param opts.buying - What you're buying.
 * @param opts.amount - The total amount you're selling. If 0, deletes the offer.
 * @param opts.price - Price of 1 unit of `selling` in terms of `buying`.
 * @param opts.price.n - If `opts.price` is an object: the price numerator
 * @param opts.price.d - If `opts.price` is an object: the price denominator
 * @param opts.offerId - If `0`, will create a new offer (default). Otherwise, edits an existing offer.
 * @param opts.source - The source account (defaults to transaction source).
 * @throws Throws `Error` when the best rational approximation of `price` cannot be found.
 */
export function manageSellOffer(
  opts: ManageSellOfferOpts,
): xdr.Operation<ManageSellOfferResult> {
  const selling: xdr.Asset = opts.selling.toXDRObject();
  const buying: xdr.Asset = opts.buying.toXDRObject();

  if (!isValidAmount(opts.amount, true)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }

  const amount: xdr.Int64 = toXDRAmount(opts.amount);

  if (opts.price === undefined) {
    throw new TypeError("price argument is required");
  }

  const price: xdr.Price = toXDRPrice(opts.price);

  const offerIdStr = opts.offerId !== undefined ? opts.offerId.toString() : "0";
  const offerId: xdr.Int64 = xdr.Int64.fromString(offerIdStr);

  const manageSellOfferOp = new xdr.ManageSellOfferOp({
    selling,
    buying,
    amount,
    price,
    offerId,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.manageSellOffer(manageSellOfferOp),
  };

  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
