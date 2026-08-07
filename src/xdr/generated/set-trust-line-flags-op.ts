import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { Asset, type AssetWire } from "./asset.js";

export interface SetTrustLineFlagsOpWire {
  trustor: PublicKeyWire;
  asset: AssetWire;
  clearFlags: number;
  setFlags: number;
}

/**
 * ```xdr
 * struct SetTrustLineFlagsOp
 * {
 *     AccountID trustor;
 *     Asset asset;
 *
 *     uint32 clearFlags; // which flags to clear
 *     uint32 setFlags;   // which flags to set
 * };
 * ```
 */
export class SetTrustLineFlagsOp extends XdrValue {
  readonly trustor: PublicKey;
  readonly asset: Asset;
  readonly clearFlags: number;
  readonly setFlags: number;

  static readonly schema: XdrType<SetTrustLineFlagsOpWire> = struct(
    "SetTrustLineFlagsOp",
    {
      trustor: PublicKey.schema,
      asset: Asset.schema,
      clearFlags: uint32(),
      setFlags: uint32(),
    },
  );

  constructor(input: {
    trustor: PublicKey;
    asset: Asset;
    clearFlags: number;
    setFlags: number;
  }) {
    super();
    this.trustor = input.trustor;
    this.asset = input.asset;
    this.clearFlags = input.clearFlags;
    this.setFlags = input.setFlags;
  }

  toXdrObject(): SetTrustLineFlagsOpWire {
    return {
      trustor: this.trustor.toXdrObject(),
      asset: this.asset.toXdrObject(),
      clearFlags: this.clearFlags,
      setFlags: this.setFlags,
    };
  }

  static fromXdrObject(wire: SetTrustLineFlagsOpWire): SetTrustLineFlagsOp {
    return new SetTrustLineFlagsOp({
      trustor: PublicKey.fromXdrObject(wire.trustor),
      asset: Asset.fromXdrObject(wire.asset),
      clearFlags: wire.clearFlags,
      setFlags: wire.setFlags,
    });
  }
}
