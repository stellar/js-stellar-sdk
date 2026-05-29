import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";
import { MuxedAccount, type MuxedAccountWire } from "./muxed-account.js";

export interface ClawbackOpWire {
  asset: AssetWire;
  from: MuxedAccountWire;
  amount: bigint;
}

/**
 * ```xdr
 * struct ClawbackOp
 * {
 *     Asset asset;
 *     MuxedAccount from;
 *     int64 amount;
 * };
 * ```
 */
export class ClawbackOp extends XdrValue {
  readonly asset: Asset;
  readonly from: MuxedAccount;
  readonly amount: bigint;

  static readonly schema: XdrType<ClawbackOpWire> = struct("ClawbackOp", {
    asset: Asset.schema,
    from: MuxedAccount.schema,
    amount: int64(),
  });

  constructor(input: { asset: Asset; from: MuxedAccount; amount: bigint }) {
    super();
    this.asset = input.asset;
    this.from = input.from;
    this.amount = input.amount;
  }

  toXdrObject(): ClawbackOpWire {
    return {
      asset: this.asset.toXdrObject(),
      from: this.from.toXdrObject(),
      amount: this.amount,
    };
  }

  static fromXdrObject(wire: ClawbackOpWire): ClawbackOp {
    return new ClawbackOp({
      asset: Asset.fromXdrObject(wire.asset),
      from: MuxedAccount.fromXdrObject(wire.from),
      amount: wire.amount,
    });
  }
}
