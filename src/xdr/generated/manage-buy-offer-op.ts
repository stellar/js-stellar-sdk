import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";
import { Price, type PriceWire } from "./price.js";

export interface ManageBuyOfferOpWire {
  selling: AssetWire;
  buying: AssetWire;
  buyAmount: bigint;
  price: PriceWire;
  offerId: bigint;
}

/**
 * ```xdr
 * struct ManageBuyOfferOp
 * {
 *     Asset selling;
 *     Asset buying;
 *     int64 buyAmount; // amount being bought. if set to 0, delete the offer
 *     Price price;     // price of thing being bought in terms of what you are
 *                      // selling
 *
 *     // 0=create a new offer, otherwise edit an existing offer
 *     int64 offerID;
 * };
 * ```
 */
export class ManageBuyOfferOp extends XdrValue {
  readonly selling: Asset;
  readonly buying: Asset;
  readonly buyAmount: bigint;
  readonly price: Price;
  readonly offerId: bigint;

  static readonly schema: XdrType<ManageBuyOfferOpWire> = struct(
    "ManageBuyOfferOp",
    {
      selling: Asset.schema,
      buying: Asset.schema,
      buyAmount: int64(),
      price: Price.schema,
      offerId: int64(),
    },
  );

  constructor(input: {
    selling: Asset;
    buying: Asset;
    buyAmount: bigint;
    price: Price;
    offerId: bigint;
  }) {
    super();
    this.selling = input.selling;
    this.buying = input.buying;
    this.buyAmount = input.buyAmount;
    this.price = input.price;
    this.offerId = input.offerId;
  }

  toXdrObject(): ManageBuyOfferOpWire {
    return {
      selling: this.selling.toXdrObject(),
      buying: this.buying.toXdrObject(),
      buyAmount: this.buyAmount,
      price: this.price.toXdrObject(),
      offerId: this.offerId,
    };
  }

  static fromXdrObject(wire: ManageBuyOfferOpWire): ManageBuyOfferOp {
    return new ManageBuyOfferOp({
      selling: Asset.fromXdrObject(wire.selling),
      buying: Asset.fromXdrObject(wire.buying),
      buyAmount: wire.buyAmount,
      price: Price.fromXdrObject(wire.price),
      offerId: wire.offerId,
    });
  }
}
