import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { AssetCode, type AssetCodeWire } from "./asset-code.js";

export interface AllowTrustOpWire {
  trustor: PublicKeyWire;
  asset: AssetCodeWire;
  authorize: number;
}

/**
 * ```xdr
 * struct AllowTrustOp
 * {
 *     AccountID trustor;
 *     AssetCode asset;
 *
 *     // One of 0, AUTHORIZED_FLAG, or AUTHORIZED_TO_MAINTAIN_LIABILITIES_FLAG
 *     uint32 authorize;
 * };
 * ```
 */
export class AllowTrustOp extends XdrValue {
  readonly trustor: PublicKey;
  readonly asset: AssetCode;
  readonly authorize: number;

  static readonly schema: XdrType<AllowTrustOpWire> = struct("AllowTrustOp", {
    trustor: PublicKey.schema,
    asset: AssetCode.schema,
    authorize: uint32(),
  });

  constructor(input: {
    trustor: PublicKey;
    asset: AssetCode;
    authorize: number;
  }) {
    super();
    this.trustor = input.trustor;
    this.asset = input.asset;
    this.authorize = input.authorize;
  }

  toXdrObject(): AllowTrustOpWire {
    return {
      trustor: this.trustor.toXdrObject(),
      asset: this.asset.toXdrObject(),
      authorize: this.authorize,
    };
  }

  static fromXdrObject(wire: AllowTrustOpWire): AllowTrustOp {
    return new AllowTrustOp({
      trustor: PublicKey.fromXdrObject(wire.trustor),
      asset: AssetCode.fromXdrObject(wire.asset),
      authorize: wire.authorize,
    });
  }
}
