import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface LedgerKeyOfferWire {
  sellerId: PublicKeyWire;
  offerId: bigint;
}

/**
 * ```xdr
 * struct
 *     {
 *         AccountID sellerID;
 *         int64 offerID;
 *     }
 * ```
 */
export class LedgerKeyOffer extends XdrValue {
  readonly sellerId: PublicKey;
  readonly offerId: bigint;

  static readonly schema: XdrType<LedgerKeyOfferWire> = struct(
    "LedgerKeyOffer",
    {
      sellerId: PublicKey.schema,
      offerId: int64(),
    },
  );

  constructor(input: { sellerId: PublicKey; offerId: bigint }) {
    super();
    this.sellerId = input.sellerId;
    this.offerId = input.offerId;
  }

  toXdrObject(): LedgerKeyOfferWire {
    return {
      sellerId: this.sellerId.toXdrObject(),
      offerId: this.offerId,
    };
  }

  static fromXdrObject(wire: LedgerKeyOfferWire): LedgerKeyOffer {
    return new LedgerKeyOffer({
      sellerId: PublicKey.fromXdrObject(wire.sellerId),
      offerId: wire.offerId,
    });
  }
}
