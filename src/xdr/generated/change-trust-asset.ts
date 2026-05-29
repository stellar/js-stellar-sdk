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
import {
  LiquidityPoolParameters,
  type LiquidityPoolParametersWire,
} from "./liquidity-pool-parameters.js";

export type ChangeTrustAssetWire =
  | { type: 0 }
  | { type: 1; alphaNum4: AlphaNum4Wire }
  | { type: 2; alphaNum12: AlphaNum12Wire }
  | { type: 3; liquidityPool: LiquidityPoolParametersWire };

export type ChangeTrustAssetVariantName =
  | "assetTypeNative"
  | "assetTypeCreditAlphanum4"
  | "assetTypeCreditAlphanum12"
  | "assetTypePoolShare";

/**
 * ```xdr
 * union ChangeTrustAsset switch (AssetType type)
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
 *     LiquidityPoolParameters liquidityPool;
 *
 *     // add other asset types here in the future
 * };
 * ```
 */
abstract class ChangeTrustAssetBase extends XdrValue {
  abstract readonly type: ChangeTrustAssetVariantName;

  static readonly schema: XdrType<ChangeTrustAssetWire> = union(
    "ChangeTrustAsset",
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
        case_(
          "assetTypePoolShare",
          3,
          field("liquidityPool", LiquidityPoolParameters.schema),
        ),
      ],
    },
  );

  static assetTypeNative(): ChangeTrustAssetNative {
    return new ChangeTrustAssetNative();
  }

  static assetTypeCreditAlphanum4(
    alphaNum4: AlphaNum4,
  ): ChangeTrustAssetCreditAlphanum4 {
    return new ChangeTrustAssetCreditAlphanum4(alphaNum4);
  }

  static assetTypeCreditAlphanum12(
    alphaNum12: AlphaNum12,
  ): ChangeTrustAssetCreditAlphanum12 {
    return new ChangeTrustAssetCreditAlphanum12(alphaNum12);
  }

  static assetTypePoolShare(
    liquidityPool: LiquidityPoolParameters,
  ): ChangeTrustAssetPoolShare {
    return new ChangeTrustAssetPoolShare(liquidityPool);
  }

  static fromXdrObject(wire: ChangeTrustAssetWire): ChangeTrustAsset {
    switch (wire.type) {
      case 0:
        return new ChangeTrustAssetNative();
      case 1:
        return new ChangeTrustAssetCreditAlphanum4(
          AlphaNum4.fromXdrObject(wire.alphaNum4),
        );
      case 2:
        return new ChangeTrustAssetCreditAlphanum12(
          AlphaNum12.fromXdrObject(wire.alphaNum12),
        );
      case 3:
        return new ChangeTrustAssetPoolShare(
          LiquidityPoolParameters.fromXdrObject(wire.liquidityPool),
        );
    }
  }

  abstract toXdrObject(): ChangeTrustAssetWire;
}

export class ChangeTrustAssetNative extends ChangeTrustAssetBase {
  readonly type = "assetTypeNative" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ChangeTrustAssetWire, { type: 0 }> {
    return { type: 0 };
  }
}

export class ChangeTrustAssetCreditAlphanum4 extends ChangeTrustAssetBase {
  readonly type = "assetTypeCreditAlphanum4" as const;
  readonly alphaNum4: AlphaNum4;

  constructor(alphaNum4: AlphaNum4) {
    super();
    this.alphaNum4 = alphaNum4;
  }

  get value(): AlphaNum4 {
    return this.alphaNum4;
  }

  toXdrObject(): Extract<ChangeTrustAssetWire, { type: 1 }> {
    return { type: 1, alphaNum4: this.alphaNum4.toXdrObject() };
  }
}

export class ChangeTrustAssetCreditAlphanum12 extends ChangeTrustAssetBase {
  readonly type = "assetTypeCreditAlphanum12" as const;
  readonly alphaNum12: AlphaNum12;

  constructor(alphaNum12: AlphaNum12) {
    super();
    this.alphaNum12 = alphaNum12;
  }

  get value(): AlphaNum12 {
    return this.alphaNum12;
  }

  toXdrObject(): Extract<ChangeTrustAssetWire, { type: 2 }> {
    return { type: 2, alphaNum12: this.alphaNum12.toXdrObject() };
  }
}

export class ChangeTrustAssetPoolShare extends ChangeTrustAssetBase {
  readonly type = "assetTypePoolShare" as const;
  readonly liquidityPool: LiquidityPoolParameters;

  constructor(liquidityPool: LiquidityPoolParameters) {
    super();
    this.liquidityPool = liquidityPool;
  }

  get value(): LiquidityPoolParameters {
    return this.liquidityPool;
  }

  toXdrObject(): Extract<ChangeTrustAssetWire, { type: 3 }> {
    return { type: 3, liquidityPool: this.liquidityPool.toXdrObject() };
  }
}

export type ChangeTrustAsset =
  | ChangeTrustAssetNative
  | ChangeTrustAssetCreditAlphanum4
  | ChangeTrustAssetCreditAlphanum12
  | ChangeTrustAssetPoolShare;
export const ChangeTrustAsset = ChangeTrustAssetBase;
