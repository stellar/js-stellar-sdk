import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { Asset, type AssetWire } from "./asset.js";

export interface SimplePaymentResultWire {
  destination: PublicKeyWire;
  asset: AssetWire;
  amount: bigint;
}

/**
 * ```xdr
 * struct SimplePaymentResult
 * {
 *     AccountID destination;
 *     Asset asset;
 *     int64 amount;
 * };
 * ```
 */
export class SimplePaymentResult extends XdrValue {
  readonly destination: PublicKey;
  readonly asset: Asset;
  readonly amount: bigint;

  static readonly schema: XdrType<SimplePaymentResultWire> = struct(
    "SimplePaymentResult",
    {
      destination: PublicKey.schema,
      asset: Asset.schema,
      amount: int64(),
    },
  );

  constructor(input: { destination: PublicKey; asset: Asset; amount: bigint }) {
    super();
    this.destination = input.destination;
    this.asset = input.asset;
    this.amount = input.amount;
  }

  toXdrObject(): SimplePaymentResultWire {
    return {
      destination: this.destination.toXdrObject(),
      asset: this.asset.toXdrObject(),
      amount: this.amount,
    };
  }

  static fromXdrObject(wire: SimplePaymentResultWire): SimplePaymentResult {
    return new SimplePaymentResult({
      destination: PublicKey.fromXdrObject(wire.destination),
      asset: Asset.fromXdrObject(wire.asset),
      amount: wire.amount,
    });
  }
}
