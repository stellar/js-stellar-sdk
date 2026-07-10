import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { AssetCode4, type AssetCode4Wire } from "./asset-code4.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface AlphaNum4Wire {
  assetCode: AssetCode4Wire;
  issuer: PublicKeyWire;
}

/**
 * ```xdr
 * struct AlphaNum4
 * {
 *     AssetCode4 assetCode;
 *     AccountID issuer;
 * };
 * ```
 */
export class AlphaNum4 extends XdrValue {
  readonly assetCode: AssetCode4;
  readonly issuer: PublicKey;

  static readonly schema: XdrType<AlphaNum4Wire> = struct("AlphaNum4", {
    assetCode: AssetCode4.schema,
    issuer: PublicKey.schema,
  });

  constructor(input: {
    assetCode: AssetCode4 | Uint8Array | string;
    issuer: PublicKey;
  }) {
    super();
    this.assetCode =
      input.assetCode instanceof AssetCode4
        ? input.assetCode
        : new AssetCode4(input.assetCode);
    this.issuer = input.issuer;
  }

  toXdrObject(): AlphaNum4Wire {
    return {
      assetCode: this.assetCode.toXdrObject(),
      issuer: this.issuer.toXdrObject(),
    };
  }

  static fromXdrObject(wire: AlphaNum4Wire): AlphaNum4 {
    return new AlphaNum4({
      assetCode: AssetCode4.fromXdrObject(wire.assetCode),
      issuer: PublicKey.fromXdrObject(wire.issuer),
    });
  }
}
