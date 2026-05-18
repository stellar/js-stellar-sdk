import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { Asset, type AssetWire } from "./asset.js";
import { Claimant, type ClaimantWire } from "./claimant.js";

export interface CreateClaimableBalanceOpWire {
  asset: AssetWire;
  amount: bigint;
  claimants: ClaimantWire[];
}

/**
 * ```xdr
 * struct CreateClaimableBalanceOp
 * {
 *     Asset asset;
 *     int64 amount;
 *     Claimant claimants<10>;
 * };
 * ```
 */
export class CreateClaimableBalanceOp extends XdrValue {
  readonly asset: Asset;
  readonly amount: bigint;
  readonly claimants: Claimant[];

  static readonly schema: XdrType<CreateClaimableBalanceOpWire> = struct(
    "CreateClaimableBalanceOp",
    {
      asset: Asset.schema,
      amount: int64(),
      claimants: array(Claimant.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { asset: Asset; amount: bigint; claimants: Claimant[] }) {
    super();
    this.asset = input.asset;
    this.amount = input.amount;
    this.claimants = input.claimants;
  }

  toXdrObject(): CreateClaimableBalanceOpWire {
    return {
      asset: this.asset.toXdrObject(),
      amount: this.amount,
      claimants: this.claimants.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: CreateClaimableBalanceOpWire,
  ): CreateClaimableBalanceOp {
    return new CreateClaimableBalanceOp({
      asset: Asset.fromXdrObject(wire.asset),
      amount: wire.amount,
      claimants: wire.claimants.map((w) => Claimant.fromXdrObject(w)),
    });
  }
}
