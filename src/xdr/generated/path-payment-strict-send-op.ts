import { array, int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";
import { MuxedAccount, type MuxedAccountWire } from "./muxed-account.js";

export interface PathPaymentStrictSendOpWire {
  sendAsset: AssetWire;
  sendAmount: bigint;
  destination: MuxedAccountWire;
  destAsset: AssetWire;
  destMin: bigint;
  path: AssetWire[];
}

/**
 * ```xdr
 * struct PathPaymentStrictSendOp
 * {
 *     Asset sendAsset;  // asset we pay with
 *     int64 sendAmount; // amount of sendAsset to send (excluding fees)
 *
 *     MuxedAccount destination; // recipient of the payment
 *     Asset destAsset;          // what they end up with
 *     int64 destMin;            // the minimum amount of dest asset to
 *                               // be received
 *                               // The operation will fail if it can't be met
 *
 *     Asset path<5>; // additional hops it must go through to get there
 * };
 * ```
 */
export class PathPaymentStrictSendOp extends XdrValue {
  readonly sendAsset: Asset;
  readonly sendAmount: bigint;
  readonly destination: MuxedAccount;
  readonly destAsset: Asset;
  readonly destMin: bigint;
  readonly path: Asset[];

  static readonly schema: XdrType<PathPaymentStrictSendOpWire> = struct(
    "PathPaymentStrictSendOp",
    {
      sendAsset: Asset.schema,
      sendAmount: int64(),
      destination: MuxedAccount.schema,
      destAsset: Asset.schema,
      destMin: int64(),
      path: array(Asset.schema, 5),
    },
  );

  constructor(input: {
    sendAsset: Asset;
    sendAmount: bigint;
    destination: MuxedAccount;
    destAsset: Asset;
    destMin: bigint;
    path: Asset[];
  }) {
    super();
    this.sendAsset = input.sendAsset;
    this.sendAmount = input.sendAmount;
    this.destination = input.destination;
    this.destAsset = input.destAsset;
    this.destMin = input.destMin;
    this.path = input.path;
  }

  toXdrObject(): PathPaymentStrictSendOpWire {
    return {
      sendAsset: this.sendAsset.toXdrObject(),
      sendAmount: this.sendAmount,
      destination: this.destination.toXdrObject(),
      destAsset: this.destAsset.toXdrObject(),
      destMin: this.destMin,
      path: this.path.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: PathPaymentStrictSendOpWire,
  ): PathPaymentStrictSendOp {
    return new PathPaymentStrictSendOp({
      sendAsset: Asset.fromXdrObject(wire.sendAsset),
      sendAmount: wire.sendAmount,
      destination: MuxedAccount.fromXdrObject(wire.destination),
      destAsset: Asset.fromXdrObject(wire.destAsset),
      destMin: wire.destMin,
      path: wire.path.map((w) => Asset.fromXdrObject(w)),
    });
  }
}
