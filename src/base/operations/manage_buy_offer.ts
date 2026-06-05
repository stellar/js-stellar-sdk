import {
  isValidAmount,
  constructAmountRequirementsError,
  toXDRAmount,
  setSourceAccount,
  toXDRPrice,
} from "../util/operations.js";
import xdr from "../xdr.js";
import {
  ManageBuyOfferResult,
  ManageBuyOfferOpts,
  OperationAttributes,
} from "./types.js";

/**
 * Returns a XDR ManageBuyOfferOp. A "manage buy offer" operation creates, updates, or
 * deletes a buy offer.
 * @param opts - Options object
 *   - `selling`: What you're selling.
 *   - `buying`: What you're buying.
 *   - `buyAmount`: The total amount you're buying. If 0, deletes the offer.
 *   - `price`: Price of 1 unit of `buying` in terms of `selling`.
 *   - `price.n`: If `opts.price` is an object: the price numerator
 *   - `price.d`: If `opts.price` is an object: the price denominator
 *   - `offerId`: If `0`, will create a new offer (default). Otherwise, edits an existing offer.
 *   - `source`: The source account (defaults to transaction source).
 * @throws when the best rational approximation of `price` cannot be found.
 */
export function manageBuyOffer(
  opts: ManageBuyOfferOpts,
): xdr.Operation<ManageBuyOfferResult> {
  const selling: xdr.Asset = opts.selling.toXDRObject();
  const buying: xdr.Asset = opts.buying.toXDRObject();

  if (!isValidAmount(opts.buyAmount, true)) {
    throw new TypeError(constructAmountRequirementsError("buyAmount"));
  }

  const buyAmount: xdr.Int64 = toXDRAmount(opts.buyAmount);

  if (opts.price === undefined) {
    throw new TypeError("price argument is required");
  }

  const price: xdr.Price = toXDRPrice(opts.price);

  const offerIdStr = opts.offerId !== undefined ? opts.offerId.toString() : "0";
  const offerId: xdr.Int64 = xdr.Int64.fromString(offerIdStr);

  const manageBuyOfferOp = new xdr.ManageBuyOfferOp({
    selling,
    buying,
    buyAmount,
    price,
    offerId,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.manageBuyOffer(manageBuyOfferOp),
  };

  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}
