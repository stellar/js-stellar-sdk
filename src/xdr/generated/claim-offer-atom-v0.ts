import { int64, opaque, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";

export interface ClaimOfferAtomV0Wire {
  sellerEd25519: Uint8Array;
  offerId: bigint;
  assetSold: AssetWire;
  amountSold: bigint;
  assetBought: AssetWire;
  amountBought: bigint;
}

/**
 * ```xdr
 * struct ClaimOfferAtomV0
 * {
 *     // emitted to identify the offer
 *     uint256 sellerEd25519; // Account that owns the offer
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
export class ClaimOfferAtomV0 extends XdrValue {
  readonly sellerEd25519: Uint8Array;
  readonly offerId: bigint;
  readonly assetSold: Asset;
  readonly amountSold: bigint;
  readonly assetBought: Asset;
  readonly amountBought: bigint;

  static readonly schema: XdrType<ClaimOfferAtomV0Wire> = struct(
    "ClaimOfferAtomV0",
    {
      sellerEd25519: opaque(32),
      offerId: int64(),
      assetSold: Asset.schema,
      amountSold: int64(),
      assetBought: Asset.schema,
      amountBought: int64(),
    },
  );

  constructor(input: {
    sellerEd25519: Uint8Array;
    offerId: bigint;
    assetSold: Asset;
    amountSold: bigint;
    assetBought: Asset;
    amountBought: bigint;
  }) {
    super();
    this.sellerEd25519 = input.sellerEd25519;
    this.offerId = input.offerId;
    this.assetSold = input.assetSold;
    this.amountSold = input.amountSold;
    this.assetBought = input.assetBought;
    this.amountBought = input.amountBought;
  }

  toXdrObject(): ClaimOfferAtomV0Wire {
    return {
      sellerEd25519: this.sellerEd25519,
      offerId: this.offerId,
      assetSold: this.assetSold.toXdrObject(),
      amountSold: this.amountSold,
      assetBought: this.assetBought.toXdrObject(),
      amountBought: this.amountBought,
    };
  }

  static fromXdrObject(wire: ClaimOfferAtomV0Wire): ClaimOfferAtomV0 {
    return new ClaimOfferAtomV0({
      sellerEd25519: wire.sellerEd25519,
      offerId: wire.offerId,
      assetSold: Asset.fromXdrObject(wire.assetSold),
      amountSold: wire.amountSold,
      assetBought: Asset.fromXdrObject(wire.assetBought),
      amountBought: wire.amountBought,
    });
  }
}
