import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { TrustLineAsset, type TrustLineAssetWire } from "./trust-line-asset.js";

export interface LedgerKeyTrustLineWire {
  accountId: PublicKeyWire;
  asset: TrustLineAssetWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         AccountID accountID;
 *         TrustLineAsset asset;
 *     }
 * ```
 */
export class LedgerKeyTrustLine extends XdrValue {
  readonly accountId: PublicKey;
  readonly asset: TrustLineAsset;

  static readonly schema: XdrType<LedgerKeyTrustLineWire> = struct(
    "LedgerKeyTrustLine",
    {
      accountId: PublicKey.schema,
      asset: TrustLineAsset.schema,
    },
  );

  constructor(input: { accountId: PublicKey; asset: TrustLineAsset }) {
    super();
    this.accountId = input.accountId;
    this.asset = input.asset;
  }

  toXdrObject(): LedgerKeyTrustLineWire {
    return {
      accountId: this.accountId.toXdrObject(),
      asset: this.asset.toXdrObject(),
    };
  }

  static fromXdrObject(wire: LedgerKeyTrustLineWire): LedgerKeyTrustLine {
    return new LedgerKeyTrustLine({
      accountId: PublicKey.fromXdrObject(wire.accountId),
      asset: TrustLineAsset.fromXdrObject(wire.asset),
    });
  }
}
