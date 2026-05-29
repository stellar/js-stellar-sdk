import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { Asset, type AssetWire } from "./asset.js";
import { Price, type PriceWire } from "./price.js";
import { OfferEntryExt, type OfferEntryExtWire } from "./offer-entry-ext.js";

export interface OfferEntryWire {
  sellerId: PublicKeyWire;
  offerId: bigint;
  selling: AssetWire;
  buying: AssetWire;
  amount: bigint;
  price: PriceWire;
  flags: number;
  ext: OfferEntryExtWire;
}

/**
 * ```xdr
 * struct OfferEntry
 * {
 *     AccountID sellerID;
 *     int64 offerID;
 *     Asset selling; // A
 *     Asset buying;  // B
 *     int64 amount;  // amount of A
 *
 *     /* price for this offer:
 *         price of A in terms of B
 *         price=AmountB/AmountA=priceNumerator/priceDenominator
 *         price is after fees
 *     *\/
 *     Price price;
 *     uint32 flags; // see OfferEntryFlags
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class OfferEntry extends XdrValue {
  readonly sellerId: PublicKey;
  readonly offerId: bigint;
  readonly selling: Asset;
  readonly buying: Asset;
  readonly amount: bigint;
  readonly price: Price;
  readonly flags: number;
  readonly ext: OfferEntryExt;

  static readonly schema: XdrType<OfferEntryWire> = struct("OfferEntry", {
    sellerId: PublicKey.schema,
    offerId: int64(),
    selling: Asset.schema,
    buying: Asset.schema,
    amount: int64(),
    price: Price.schema,
    flags: uint32(),
    ext: OfferEntryExt.schema,
  });

  constructor(input: {
    sellerId: PublicKey;
    offerId: bigint;
    selling: Asset;
    buying: Asset;
    amount: bigint;
    price: Price;
    flags: number;
    ext: OfferEntryExt;
  }) {
    super();
    this.sellerId = input.sellerId;
    this.offerId = input.offerId;
    this.selling = input.selling;
    this.buying = input.buying;
    this.amount = input.amount;
    this.price = input.price;
    this.flags = input.flags;
    this.ext = input.ext;
  }

  toXdrObject(): OfferEntryWire {
    return {
      sellerId: this.sellerId.toXdrObject(),
      offerId: this.offerId,
      selling: this.selling.toXdrObject(),
      buying: this.buying.toXdrObject(),
      amount: this.amount,
      price: this.price.toXdrObject(),
      flags: this.flags,
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: OfferEntryWire): OfferEntry {
    return new OfferEntry({
      sellerId: PublicKey.fromXdrObject(wire.sellerId),
      offerId: wire.offerId,
      selling: Asset.fromXdrObject(wire.selling),
      buying: Asset.fromXdrObject(wire.buying),
      amount: wire.amount,
      price: Price.fromXdrObject(wire.price),
      flags: wire.flags,
      ext: OfferEntryExt.fromXdrObject(wire.ext),
    });
  }
}
