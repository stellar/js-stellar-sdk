import {
  isValidAmount,
  constructAmountRequirementsError,
  toXdrAmount,
  setSourceAccount,
  toXdrPrice,
} from "../util/operations.js";
import {
  Asset,
  Int64,
  ManageSellOfferOp,
  Operation,
  OperationBody,
  Price,
} from "../../xdr/index.js";
import { ManageSellOfferOpts, OperationAttributes } from "./types.js";

/**
 * Returns a XDR ManageSellOfferOp. A "manage sell offer" operation creates, updates, or
 * deletes an offer.
 * @param opts - Options object
 *   - `selling`: What you're selling.
 *   - `buying`: What you're buying.
 *   - `amount`: The total amount you're selling. If 0, deletes the offer.
 *   - `price`: Price of 1 unit of `selling` in terms of `buying`.
 *     - `n`: If `opts.price` is an object: the price numerator
 *     - `d`: If `opts.price` is an object: the price denominator
 *   - `offerId`: If `0`, will create a new offer (default). Otherwise, edits an existing offer.
 *   - `source`: The source account (defaults to transaction source).
 * @throws when the best rational approximation of `price` cannot be found.
 */
export function manageSellOffer(opts: ManageSellOfferOpts): Operation {
  const selling: Asset = opts.selling.toXdrObject();
  const buying: Asset = opts.buying.toXdrObject();

  if (!isValidAmount(opts.amount, true)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }

  const amount: Int64 = toXdrAmount(opts.amount);

  if (opts.price === undefined) {
    throw new TypeError("price argument is required");
  }

  const price: Price = toXdrPrice(opts.price);

  const offerIdStr = opts.offerId !== undefined ? opts.offerId.toString() : "0";
  const offerId: Int64 = Int64.fromString(offerIdStr);

  const manageSellOfferOp = new ManageSellOfferOp({
    selling,
    buying,
    amount,
    price,
    offerId: offerId,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.manageSellOffer(manageSellOfferOp),
  };

  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}
