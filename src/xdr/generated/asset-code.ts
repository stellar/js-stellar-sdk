/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { AssetType } from "./asset-type.js";
import { AssetCode4, type AssetCode4Wire } from "./asset-code4.js";
import { AssetCode12, type AssetCode12Wire } from "./asset-code12.js";

export type AssetCodeWire =
  | { type: 1; assetCode4: AssetCode4Wire }
  | { type: 2; assetCode12: AssetCode12Wire };

export type AssetCodeVariantName =
  | "assetTypeCreditAlphanum4"
  | "assetTypeCreditAlphanum12";

/**
 * ```xdr
 * union AssetCode switch (AssetType type)
 * {
 * case ASSET_TYPE_CREDIT_ALPHANUM4:
 *     AssetCode4 assetCode4;
 *
 * case ASSET_TYPE_CREDIT_ALPHANUM12:
 *     AssetCode12 assetCode12;
 *
 *     // add other asset types here in the future
 * };
 * ```
 */
abstract class AssetCodeBase extends XdrValue {
  abstract readonly type: AssetCodeVariantName;

  static readonly schema: XdrType<AssetCodeWire> = union("AssetCode", {
    switchOn: AssetType.schema,
    cases: [
      case_(
        "assetTypeCreditAlphanum4",
        1,
        field("assetCode4", AssetCode4.schema),
      ),
      case_(
        "assetTypeCreditAlphanum12",
        2,
        field("assetCode12", AssetCode12.schema),
      ),
    ],
  });

  static assetTypeCreditAlphanum4(
    assetCode4: AssetCode4 | Uint8Array | string,
  ): AssetCodeCreditAlphanum4 {
    return new AssetCodeCreditAlphanum4(assetCode4);
  }

  static assetTypeCreditAlphanum12(
    assetCode12: AssetCode12 | Uint8Array | string,
  ): AssetCodeCreditAlphanum12 {
    return new AssetCodeCreditAlphanum12(assetCode12);
  }

  static fromXdrObject(wire: AssetCodeWire): AssetCode {
    switch (wire.type) {
      case 1:
        return new AssetCodeCreditAlphanum4(
          AssetCode4.fromXdrObject(wire.assetCode4),
        );
      case 2:
        return new AssetCodeCreditAlphanum12(
          AssetCode12.fromXdrObject(wire.assetCode12),
        );
    }
  }

  abstract toXdrObject(): AssetCodeWire;
}

export class AssetCodeCreditAlphanum4 extends AssetCodeBase {
  readonly type = "assetTypeCreditAlphanum4" as const;
  readonly assetCode4: AssetCode4;

  constructor(assetCode4: AssetCode4 | Uint8Array | string) {
    super();
    this.assetCode4 =
      assetCode4 instanceof AssetCode4
        ? assetCode4
        : new AssetCode4(assetCode4);
  }

  get value(): AssetCode4 {
    return this.assetCode4;
  }

  toXdrObject(): Extract<AssetCodeWire, { type: 1 }> {
    return { type: 1, assetCode4: this.assetCode4.toXdrObject() };
  }
}

export class AssetCodeCreditAlphanum12 extends AssetCodeBase {
  readonly type = "assetTypeCreditAlphanum12" as const;
  readonly assetCode12: AssetCode12;

  constructor(assetCode12: AssetCode12 | Uint8Array | string) {
    super();
    this.assetCode12 =
      assetCode12 instanceof AssetCode12
        ? assetCode12
        : new AssetCode12(assetCode12);
  }

  get value(): AssetCode12 {
    return this.assetCode12;
  }

  toXdrObject(): Extract<AssetCodeWire, { type: 2 }> {
    return { type: 2, assetCode12: this.assetCode12.toXdrObject() };
  }
}

export type AssetCode = AssetCodeCreditAlphanum4 | AssetCodeCreditAlphanum12;
export const AssetCode = AssetCodeBase;
