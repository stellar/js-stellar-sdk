/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { AssetType } from "./asset-type.js";
import { AlphaNum4, type AlphaNum4Wire } from "./alpha-num4.js";
import { AlphaNum12, type AlphaNum12Wire } from "./alpha-num12.js";
import { PoolId, type PoolIdWire } from "./pool-id.js";

export type TrustLineAssetWire =
  | { type: 0 }
  | { type: 1; alphaNum4: AlphaNum4Wire }
  | { type: 2; alphaNum12: AlphaNum12Wire }
  | { type: 3; liquidityPoolId: PoolIdWire };

export type TrustLineAssetVariantName =
  | "assetTypeNative"
  | "assetTypeCreditAlphanum4"
  | "assetTypeCreditAlphanum12"
  | "assetTypePoolShare";

/**
 * ```xdr
 * union TrustLineAsset switch (AssetType type)
 * {
 * case ASSET_TYPE_NATIVE: // Not credit
 *     void;
 *
 * case ASSET_TYPE_CREDIT_ALPHANUM4:
 *     AlphaNum4 alphaNum4;
 *
 * case ASSET_TYPE_CREDIT_ALPHANUM12:
 *     AlphaNum12 alphaNum12;
 *
 * case ASSET_TYPE_POOL_SHARE:
 *     PoolID liquidityPoolID;
 *
 *     // add other asset types here in the future
 * };
 * ```
 */
abstract class TrustLineAssetBase extends XdrValue {
  abstract readonly type: TrustLineAssetVariantName;

  static readonly schema: XdrType<TrustLineAssetWire> = union(
    "TrustLineAsset",
    {
      switchOn: AssetType.schema,
      cases: [
        case_("assetTypeNative", 0, voidType()),
        case_(
          "assetTypeCreditAlphanum4",
          1,
          field("alphaNum4", AlphaNum4.schema),
        ),
        case_(
          "assetTypeCreditAlphanum12",
          2,
          field("alphaNum12", AlphaNum12.schema),
        ),
        case_("assetTypePoolShare", 3, field("liquidityPoolId", PoolId.schema)),
      ],
    },
  );

  static assetTypeNative(): TrustLineAssetNative {
    return new TrustLineAssetNative();
  }

  static assetTypeCreditAlphanum4(
    alphaNum4: AlphaNum4,
  ): TrustLineAssetCreditAlphanum4 {
    return new TrustLineAssetCreditAlphanum4(alphaNum4);
  }

  static assetTypeCreditAlphanum12(
    alphaNum12: AlphaNum12,
  ): TrustLineAssetCreditAlphanum12 {
    return new TrustLineAssetCreditAlphanum12(alphaNum12);
  }

  static assetTypePoolShare(liquidityPoolId: PoolId): TrustLineAssetPoolShare {
    return new TrustLineAssetPoolShare(liquidityPoolId);
  }

  static fromXdrObject(wire: TrustLineAssetWire): TrustLineAsset {
    switch (wire.type) {
      case 0:
        return new TrustLineAssetNative();
      case 1:
        return new TrustLineAssetCreditAlphanum4(
          AlphaNum4.fromXdrObject(wire.alphaNum4),
        );
      case 2:
        return new TrustLineAssetCreditAlphanum12(
          AlphaNum12.fromXdrObject(wire.alphaNum12),
        );
      case 3:
        return new TrustLineAssetPoolShare(
          PoolId.fromXdrObject(wire.liquidityPoolId),
        );
    }
  }

  abstract toXdrObject(): TrustLineAssetWire;
}

export class TrustLineAssetNative extends TrustLineAssetBase {
  readonly type = "assetTypeNative" as const;

  toXdrObject(): Extract<TrustLineAssetWire, { type: 0 }> {
    return { type: 0 };
  }
}

export class TrustLineAssetCreditAlphanum4 extends TrustLineAssetBase {
  readonly type = "assetTypeCreditAlphanum4" as const;
  readonly alphaNum4: AlphaNum4;

  constructor(alphaNum4: AlphaNum4) {
    super();
    this.alphaNum4 = alphaNum4;
  }

  get value(): AlphaNum4 {
    return this.alphaNum4;
  }

  toXdrObject(): Extract<TrustLineAssetWire, { type: 1 }> {
    return { type: 1, alphaNum4: this.alphaNum4.toXdrObject() };
  }
}

export class TrustLineAssetCreditAlphanum12 extends TrustLineAssetBase {
  readonly type = "assetTypeCreditAlphanum12" as const;
  readonly alphaNum12: AlphaNum12;

  constructor(alphaNum12: AlphaNum12) {
    super();
    this.alphaNum12 = alphaNum12;
  }

  get value(): AlphaNum12 {
    return this.alphaNum12;
  }

  toXdrObject(): Extract<TrustLineAssetWire, { type: 2 }> {
    return { type: 2, alphaNum12: this.alphaNum12.toXdrObject() };
  }
}

export class TrustLineAssetPoolShare extends TrustLineAssetBase {
  readonly type = "assetTypePoolShare" as const;
  readonly liquidityPoolId: PoolId;

  constructor(liquidityPoolId: PoolId) {
    super();
    this.liquidityPoolId = liquidityPoolId;
  }

  get value(): PoolId {
    return this.liquidityPoolId;
  }

  toXdrObject(): Extract<TrustLineAssetWire, { type: 3 }> {
    return { type: 3, liquidityPoolId: this.liquidityPoolId.toXdrObject() };
  }
}

export type TrustLineAsset =
  | TrustLineAssetNative
  | TrustLineAssetCreditAlphanum4
  | TrustLineAssetCreditAlphanum12
  | TrustLineAssetPoolShare;
export const TrustLineAsset = TrustLineAssetBase;
