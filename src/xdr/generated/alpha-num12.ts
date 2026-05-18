import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { AssetCode12, type AssetCode12Wire } from "./asset-code12.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface AlphaNum12Wire {
  assetCode: AssetCode12Wire;
  issuer: PublicKeyWire;
}

/**
 * ```xdr
 * struct AlphaNum12
 * {
 *     AssetCode12 assetCode;
 *     AccountID issuer;
 * };
 * ```
 */
export class AlphaNum12 extends XdrValue {
  readonly assetCode: AssetCode12;
  readonly issuer: PublicKey;

  static readonly schema: XdrType<AlphaNum12Wire> = struct("AlphaNum12", {
    assetCode: AssetCode12.schema,
    issuer: PublicKey.schema,
  });

  constructor(input: {
    assetCode: AssetCode12 | Uint8Array | string;
    issuer: PublicKey;
  }) {
    super();
    this.assetCode =
      input.assetCode instanceof AssetCode12
        ? input.assetCode
        : new AssetCode12(input.assetCode);
    this.issuer = input.issuer;
  }

  toXdrObject(): AlphaNum12Wire {
    return {
      assetCode: this.assetCode.toXdrObject(),
      issuer: this.issuer.toXdrObject(),
    };
  }

  static fromXdrObject(wire: AlphaNum12Wire): AlphaNum12 {
    return new AlphaNum12({
      assetCode: AssetCode12.fromXdrObject(wire.assetCode),
      issuer: PublicKey.fromXdrObject(wire.issuer),
    });
  }
}
