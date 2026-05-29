import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";
import { MuxedAccount, type MuxedAccountWire } from "./muxed-account.js";

export interface PathPaymentStrictReceiveOpWire {
  sendAsset: AssetWire;
  sendMax: bigint;
  destination: MuxedAccountWire;
  destAsset: AssetWire;
  destAmount: bigint;
  path: AssetWire[];
}

/**
 * ```xdr
 * struct PathPaymentStrictReceiveOp
 * {
 *     Asset sendAsset; // asset we pay with
 *     int64 sendMax;   // the maximum amount of sendAsset to
 *                      // send (excluding fees).
 *                      // The operation will fail if can't be met
 *
 *     MuxedAccount destination; // recipient of the payment
 *     Asset destAsset;          // what they end up with
 *     int64 destAmount;         // amount they end up with
 *
 *     Asset path<5>; // additional hops it must go through to get there
 * };
 * ```
 */
export class PathPaymentStrictReceiveOp extends XdrValue {
  readonly sendAsset: Asset;
  readonly sendMax: bigint;
  readonly destination: MuxedAccount;
  readonly destAsset: Asset;
  readonly destAmount: bigint;
  readonly path: Asset[];

  static readonly schema: XdrType<PathPaymentStrictReceiveOpWire> = struct(
    "PathPaymentStrictReceiveOp",
    {
      sendAsset: Asset.schema,
      sendMax: int64(),
      destination: MuxedAccount.schema,
      destAsset: Asset.schema,
      destAmount: int64(),
      path: array(Asset.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    sendAsset: Asset;
    sendMax: bigint;
    destination: MuxedAccount;
    destAsset: Asset;
    destAmount: bigint;
    path: Asset[];
  }) {
    super();
    this.sendAsset = input.sendAsset;
    this.sendMax = input.sendMax;
    this.destination = input.destination;
    this.destAsset = input.destAsset;
    this.destAmount = input.destAmount;
    this.path = input.path;
  }

  toXdrObject(): PathPaymentStrictReceiveOpWire {
    return {
      sendAsset: this.sendAsset.toXdrObject(),
      sendMax: this.sendMax,
      destination: this.destination.toXdrObject(),
      destAsset: this.destAsset.toXdrObject(),
      destAmount: this.destAmount,
      path: this.path.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: PathPaymentStrictReceiveOpWire,
  ): PathPaymentStrictReceiveOp {
    return new PathPaymentStrictReceiveOp({
      sendAsset: Asset.fromXdrObject(wire.sendAsset),
      sendMax: wire.sendMax,
      destination: MuxedAccount.fromXdrObject(wire.destination),
      destAsset: Asset.fromXdrObject(wire.destAsset),
      destAmount: wire.destAmount,
      path: wire.path.map((w) => Asset.fromXdrObject(w)),
    });
  }
}
