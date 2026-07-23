import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";
import { Price, type PriceWire } from "./price.js";

export interface ManageSellOfferOpWire {
  selling: AssetWire;
  buying: AssetWire;
  amount: bigint;
  price: PriceWire;
  offerId: bigint;
}

/**
 * ```xdr
 * struct ManageSellOfferOp
 * {
 *     Asset selling;
 *     Asset buying;
 *     int64 amount; // amount being sold. if set to 0, delete the offer
 *     Price price;  // price of thing being sold in terms of what you are buying
 *
 *     // 0=create a new offer, otherwise edit an existing offer
 *     int64 offerID;
 * };
 * ```
 */
export class ManageSellOfferOp extends XdrValue {
  readonly selling: Asset;
  readonly buying: Asset;
  readonly amount: bigint;
  readonly price: Price;
  readonly offerId: bigint;

  static readonly schema: XdrType<ManageSellOfferOpWire> = struct(
    "ManageSellOfferOp",
    {
      selling: Asset.schema,
      buying: Asset.schema,
      amount: int64(),
      price: Price.schema,
      offerId: int64(),
    },
  );

  constructor(input: {
    selling: Asset;
    buying: Asset;
    amount: bigint;
    price: Price;
    offerId: bigint;
  }) {
    super();
    this.selling = input.selling;
    this.buying = input.buying;
    this.amount = input.amount;
    this.price = input.price;
    this.offerId = input.offerId;
  }

  toXdrObject(): ManageSellOfferOpWire {
    return {
      selling: this.selling.toXdrObject(),
      buying: this.buying.toXdrObject(),
      amount: this.amount,
      price: this.price.toXdrObject(),
      offerId: this.offerId,
    };
  }

  static fromXdrObject(wire: ManageSellOfferOpWire): ManageSellOfferOp {
    return new ManageSellOfferOp({
      selling: Asset.fromXdrObject(wire.selling),
      buying: Asset.fromXdrObject(wire.buying),
      amount: wire.amount,
      price: Price.fromXdrObject(wire.price),
      offerId: wire.offerId,
    });
  }
}
