import {
  constructAmountRequirementsError,
  isValidAmount,
  setSourceAccount,
  toXDRAmount,
  toXDRPrice,
} from "../util/operations.js";
import {
  Asset,
  Int64,
  Operation,
  OperationBody,
  Price,
} from "../generated/index.js";
import { CreatePassiveSellOfferOpts, OperationAttributes } from "./types.js";

/**
 * A "create passive offer" operation creates an offer that won't consume a
 * counter offer that exactly matches this offer. This is useful for offers
 * just used as 1:1 exchanges for path payments. Use manage offer to manage
 * this offer after using this operation to create it.
 * @param opts - Options object
 * @param opts.selling - What you're selling.
 * @param opts.buying - What you're buying.
 * @param opts.amount - The total amount you're selling. If 0, deletes the offer.
 * @param opts.price - Price of 1 unit of `selling` in terms of `buying`.
 * @param opts.price.n - If `opts.price` is an object: the price numerator
 * @param opts.price.d - If `opts.price` is an object: the price denominator
 * @param opts.source - The source account (defaults to transaction source).
 * @throws {Error} when the best rational approximation of `price` cannot be found.
 */
export function createPassiveSellOffer(
  opts: CreatePassiveSellOfferOpts,
): Operation {
  const selling: Asset = opts.selling.toWireXDRObject();
  const buying: Asset = opts.buying.toWireXDRObject();

  if (!isValidAmount(opts.amount)) {
    throw new TypeError(constructAmountRequirementsError("amount"));
  }

  const amount: Int64 = toXDRAmount(opts.amount);

  if (opts.price === undefined) {
    throw new TypeError("price argument is required");
  }

  const price: Price = toXDRPrice(opts.price);

  const createPassiveSellOfferOp = {
    selling,
    buying,
    amount,
    price,
  };

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.createPassiveSellOffer(createPassiveSellOfferOp),
  };

  setSourceAccount(opAttributes, opts);

  return opAttributes;
}
