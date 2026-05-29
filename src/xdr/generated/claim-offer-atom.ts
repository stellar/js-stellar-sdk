import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { Asset, type AssetWire } from "./asset.js";

export interface ClaimOfferAtomWire {
  sellerId: PublicKeyWire;
  offerId: bigint;
  assetSold: AssetWire;
  amountSold: bigint;
  assetBought: AssetWire;
  amountBought: bigint;
}

/**
 * ```xdr
 * struct ClaimOfferAtom
 * {
 *     // emitted to identify the offer
 *     AccountID sellerID; // Account that owns the offer
 *     int64 offerID;
 *
 *     // amount and asset taken from the owner
 *     Asset assetSold;
 *     int64 amountSold;
 *
 *     // amount and asset sent to the owner
 *     Asset assetBought;
 *     int64 amountBought;
 * };
 * ```
 */
export class ClaimOfferAtom extends XdrValue {
  readonly sellerId: PublicKey;
  readonly offerId: bigint;
  readonly assetSold: Asset;
  readonly amountSold: bigint;
  readonly assetBought: Asset;
  readonly amountBought: bigint;

  static readonly schema: XdrType<ClaimOfferAtomWire> = struct(
    "ClaimOfferAtom",
    {
      sellerId: PublicKey.schema,
      offerId: int64(),
      assetSold: Asset.schema,
      amountSold: int64(),
      assetBought: Asset.schema,
      amountBought: int64(),
    },
  );

  constructor(input: {
    sellerId: PublicKey;
    offerId: bigint;
    assetSold: Asset;
    amountSold: bigint;
    assetBought: Asset;
    amountBought: bigint;
  }) {
    super();
    this.sellerId = input.sellerId;
    this.offerId = input.offerId;
    this.assetSold = input.assetSold;
    this.amountSold = input.amountSold;
    this.assetBought = input.assetBought;
    this.amountBought = input.amountBought;
  }

  toXdrObject(): ClaimOfferAtomWire {
    return {
      sellerId: this.sellerId.toXdrObject(),
      offerId: this.offerId,
      assetSold: this.assetSold.toXdrObject(),
      amountSold: this.amountSold,
      assetBought: this.assetBought.toXdrObject(),
      amountBought: this.amountBought,
    };
  }

  static fromXdrObject(wire: ClaimOfferAtomWire): ClaimOfferAtom {
    return new ClaimOfferAtom({
      sellerId: PublicKey.fromXdrObject(wire.sellerId),
      offerId: wire.offerId,
      assetSold: Asset.fromXdrObject(wire.assetSold),
      amountSold: wire.amountSold,
      assetBought: Asset.fromXdrObject(wire.assetBought),
      amountBought: wire.amountBought,
    });
  }
}
