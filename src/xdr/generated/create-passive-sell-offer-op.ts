import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";
import { Price, type PriceWire } from "./price.js";

export interface CreatePassiveSellOfferOpWire {
  selling: AssetWire;
  buying: AssetWire;
  amount: bigint;
  price: PriceWire;
}

/**
 * ```xdr
 * struct CreatePassiveSellOfferOp
 * {
 *     Asset selling; // A
 *     Asset buying;  // B
 *     int64 amount;  // amount taker gets
 *     Price price;   // cost of A in terms of B
 * };
 * ```
 */
export class CreatePassiveSellOfferOp extends XdrValue {
  readonly selling: Asset;
  readonly buying: Asset;
  readonly amount: bigint;
  readonly price: Price;

  static readonly schema: XdrType<CreatePassiveSellOfferOpWire> = struct(
    "CreatePassiveSellOfferOp",
    {
      selling: Asset.schema,
      buying: Asset.schema,
      amount: int64(),
      price: Price.schema,
    },
  );

  constructor(input: {
    selling: Asset;
    buying: Asset;
    amount: bigint;
    price: Price;
  }) {
    super();
    this.selling = input.selling;
    this.buying = input.buying;
    this.amount = input.amount;
    this.price = input.price;
  }

  toXdrObject(): CreatePassiveSellOfferOpWire {
    return {
      selling: this.selling.toXdrObject(),
      buying: this.buying.toXdrObject(),
      amount: this.amount,
      price: this.price.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: CreatePassiveSellOfferOpWire,
  ): CreatePassiveSellOfferOp {
    return new CreatePassiveSellOfferOp({
      selling: Asset.fromXdrObject(wire.selling),
      buying: Asset.fromXdrObject(wire.buying),
      amount: wire.amount,
      price: Price.fromXdrObject(wire.price),
    });
  }
}
