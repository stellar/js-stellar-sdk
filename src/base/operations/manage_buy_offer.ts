import {
  isValidAmount,
  constructAmountRequirementsError,
  toXdrAmount,
  setSourceAccount,
  toXdrPrice,
  toXdrOfferId,
} from "../util/operations.js";
import {
  Asset,
  Int64,
  ManageBuyOfferOp,
  Operation,
  OperationBody,
  Price,
} from "../../xdr/index.js";
import { ManageBuyOfferOpts, OperationAttributes } from "./types.js";

/**
 * Returns a XDR ManageBuyOfferOp. A "manage buy offer" operation creates, updates, or
 * deletes a buy offer.
 * @param opts - Options object
 *   - `selling`: What you're selling.
 *   - `buying`: What you're buying.
 *   - `buyAmount`: The total amount you're buying. If 0, deletes the offer.
 *   - `price`: Price of 1 unit of `buying` in terms of `selling`.
 *     - `n`: If `opts.price` is an object: the price numerator
 *     - `d`: If `opts.price` is an object: the price denominator
 *   - `offerId`: If `0`, will create a new offer (default). Otherwise, edits an existing offer.
 *     Pass a non-negative safe integer or bigint, or a string of at most 22 decimal digits for a larger ID. The ID must not exceed 9223372036854775807 (the int64 maximum).
 *   - `source`: The source account (defaults to transaction source).
 * @throws when the best rational approximation of `price` cannot be found.
 */
export function manageBuyOffer(opts: ManageBuyOfferOpts): Operation {
  const selling: Asset = opts.selling.toXdrObject();
  const buying: Asset = opts.buying.toXdrObject();

  if (!isValidAmount(opts.buyAmount, true)) {
    throw new TypeError(constructAmountRequirementsError("buyAmount"));
  }

  const buyAmount: Int64 = toXdrAmount(opts.buyAmount);

  if (opts.price === undefined) {
    throw new TypeError("price argument is required");
  }

  const price: Price = toXdrPrice(opts.price);

  const offerId: Int64 = toXdrOfferId(opts.offerId);

  const manageBuyOfferOp = new ManageBuyOfferOp({
    selling,
    buying,
    buyAmount,
    price,
    offerId: offerId,
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.manageBuyOffer(manageBuyOfferOp),
  };

  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}
