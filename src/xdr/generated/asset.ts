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

export type AssetWire =
  | { type: 0 }
  | { type: 1; alphaNum4: AlphaNum4Wire }
  | { type: 2; alphaNum12: AlphaNum12Wire };

export type AssetVariantName =
  | "assetTypeNative"
  | "assetTypeCreditAlphanum4"
  | "assetTypeCreditAlphanum12";

/**
 * ```xdr
 * union Asset switch (AssetType type)
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
 *     // add other asset types here in the future
 * };
 * ```
 */
abstract class AssetBase extends XdrValue {
  abstract readonly type: AssetVariantName;

  static readonly schema: XdrType<AssetWire> = union("Asset", {
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
    ],
  });

  static assetTypeNative(): AssetNative {
    return new AssetNative();
  }

  static assetTypeCreditAlphanum4(alphaNum4: AlphaNum4): AssetCreditAlphanum4 {
    return new AssetCreditAlphanum4(alphaNum4);
  }

  static assetTypeCreditAlphanum12(
    alphaNum12: AlphaNum12,
  ): AssetCreditAlphanum12 {
    return new AssetCreditAlphanum12(alphaNum12);
  }

  static fromXdrObject(wire: AssetWire): Asset {
    switch (wire.type) {
      case 0:
        return new AssetNative();
      case 1:
        return new AssetCreditAlphanum4(
          AlphaNum4.fromXdrObject(wire.alphaNum4),
        );
      case 2:
        return new AssetCreditAlphanum12(
          AlphaNum12.fromXdrObject(wire.alphaNum12),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete Asset variant.
   * Use this instead of `instanceof Asset`: the exported `Asset` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `Asset.is(x)` narrows to the union.
   */
  static is(value: unknown): value is Asset {
    return value instanceof AssetBase;
  }

  abstract toXdrObject(): AssetWire;
}

export class AssetNative extends AssetBase {
  readonly type = "assetTypeNative" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<AssetWire, { type: 0 }> {
    return { type: 0 };
  }
}

export class AssetCreditAlphanum4 extends AssetBase {
  readonly type = "assetTypeCreditAlphanum4" as const;
  readonly alphaNum4: AlphaNum4;

  constructor(alphaNum4: AlphaNum4) {
    super();
    this.alphaNum4 = alphaNum4;
  }

  get value(): AlphaNum4 {
    return this.alphaNum4;
  }

  toXdrObject(): Extract<AssetWire, { type: 1 }> {
    return { type: 1, alphaNum4: this.alphaNum4.toXdrObject() };
  }
}

export class AssetCreditAlphanum12 extends AssetBase {
  readonly type = "assetTypeCreditAlphanum12" as const;
  readonly alphaNum12: AlphaNum12;

  constructor(alphaNum12: AlphaNum12) {
    super();
    this.alphaNum12 = alphaNum12;
  }

  get value(): AlphaNum12 {
    return this.alphaNum12;
  }

  toXdrObject(): Extract<AssetWire, { type: 2 }> {
    return { type: 2, alphaNum12: this.alphaNum12.toXdrObject() };
  }
}

export type Asset = AssetNative | AssetCreditAlphanum4 | AssetCreditAlphanum12;
export const Asset = AssetBase;
