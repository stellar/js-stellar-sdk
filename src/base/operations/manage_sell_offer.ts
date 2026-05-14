import {
  isValidAmount,
  constructAmountRequirementsError,
  toXDRAmount,
  setSourceAccount,
  toXDRPrice,
} from "../util/operations.js";
import {
  Asset,
  Int64,
  Operation,
  OperationBody,
  Price,
} from "../generated/index.js";
import { ManageSellOfferOpts, OperationAttributes } from "./types.js";

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
 * @throws {Error} when the best rational approximation of `price` cannot be found.
 */
export function manageSellOffer(opts: ManageSellOfferOpts): Operation {
  const selling: Asset = opts.selling.toWireXDRObject();
  const buying: Asset = opts.buying.toWireXDRObject();

  if (!isValidAmount(opts.amount, true)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }

  const amount: Int64 = toXDRAmount(opts.amount);

  if (opts.price === undefined) {
    throw new TypeError("price argument is required");
  }

  const price: Price = toXDRPrice(opts.price);

  const offerIdStr = opts.offerId !== undefined ? opts.offerId.toString() : "0";
  const offerId: Int64 = BigInt(offerIdStr);

  const manageSellOfferOp = {
    selling,
    buying,
    amount,
    price,
    offerId,
  };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.manageSellOffer(manageSellOfferOp),
  };

  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
