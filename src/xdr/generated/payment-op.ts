import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { MuxedAccount, type MuxedAccountWire } from "./muxed-account.js";
import { Asset, type AssetWire } from "./asset.js";

export interface PaymentOpWire {
  destination: MuxedAccountWire;
  asset: AssetWire;
  amount: bigint;
}

/**
 * ```xdr
 * struct PaymentOp
 * {
 *     MuxedAccount destination; // recipient of the payment
 *     Asset asset;              // what they end up with
 *     int64 amount;             // amount they end up with
 * };
 * ```
 */
export class PaymentOp extends XdrValue {
  readonly destination: MuxedAccount;
  readonly asset: Asset;
  readonly amount: bigint;

  static readonly schema: XdrType<PaymentOpWire> = struct("PaymentOp", {
    destination: MuxedAccount.schema,
    asset: Asset.schema,
    amount: int64(),
  });

  constructor(input: {
    destination: MuxedAccount;
    asset: Asset;
    amount: bigint;
  }) {
    super();
    this.destination = input.destination;
    this.asset = input.asset;
    this.amount = input.amount;
  }

  toXdrObject(): PaymentOpWire {
    return {
      destination: this.destination.toXdrObject(),
      asset: this.asset.toXdrObject(),
      amount: this.amount,
    };
  }

  static fromXdrObject(wire: PaymentOpWire): PaymentOp {
    return new PaymentOp({
      destination: MuxedAccount.fromXdrObject(wire.destination),
      asset: Asset.fromXdrObject(wire.asset),
      amount: wire.amount,
    });
  }
}
