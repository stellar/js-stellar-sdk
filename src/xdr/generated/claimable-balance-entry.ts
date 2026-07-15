import { array, int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  ClaimableBalanceId,
  type ClaimableBalanceIdWire,
} from "./claimable-balance-id.js";
import { Claimant, type ClaimantWire } from "./claimant.js";
import { Asset, type AssetWire } from "./asset.js";
import {
  ClaimableBalanceEntryExt,
  type ClaimableBalanceEntryExtWire,
} from "./claimable-balance-entry-ext.js";

export interface ClaimableBalanceEntryWire {
  balanceId: ClaimableBalanceIdWire;
  claimants: ClaimantWire[];
  asset: AssetWire;
  amount: bigint;
  ext: ClaimableBalanceEntryExtWire;
}

/**
 * ```xdr
 * struct ClaimableBalanceEntry
 * {
 *     // Unique identifier for this ClaimableBalanceEntry
 *     ClaimableBalanceID balanceID;
 *
 *     // List of claimants with associated predicate
 *     Claimant claimants<10>;
 *
 *     // Any asset including native
 *     Asset asset;
 *
 *     // Amount of asset
 *     int64 amount;
 *
 *     // reserved for future use
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         ClaimableBalanceEntryExtensionV1 v1;
 *     }
 *     ext;
 * };
 * ```
 */
export class ClaimableBalanceEntry extends XdrValue {
  readonly balanceId: ClaimableBalanceId;
  readonly claimants: Claimant[];
  readonly asset: Asset;
  readonly amount: bigint;
  readonly ext: ClaimableBalanceEntryExt;

  static readonly schema: XdrType<ClaimableBalanceEntryWire> = struct(
    "ClaimableBalanceEntry",
    {
      balanceId: ClaimableBalanceId.schema,
      claimants: array(Claimant.schema, 10),
      asset: Asset.schema,
      amount: int64(),
      ext: ClaimableBalanceEntryExt.schema,
    },
  );

  constructor(input: {
    balanceId: ClaimableBalanceId;
    claimants: Claimant[];
    asset: Asset;
    amount: bigint;
    ext: ClaimableBalanceEntryExt;
  }) {
    super();
    this.balanceId = input.balanceId;
    this.claimants = input.claimants;
    this.asset = input.asset;
    this.amount = input.amount;
    this.ext = input.ext;
  }

  toXdrObject(): ClaimableBalanceEntryWire {
    return {
      balanceId: this.balanceId.toXdrObject(),
      claimants: this.claimants.map((v) => v.toXdrObject()),
      asset: this.asset.toXdrObject(),
      amount: this.amount,
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ClaimableBalanceEntryWire): ClaimableBalanceEntry {
    return new ClaimableBalanceEntry({
      balanceId: ClaimableBalanceId.fromXdrObject(wire.balanceId),
      claimants: wire.claimants.map((w) => Claimant.fromXdrObject(w)),
      asset: Asset.fromXdrObject(wire.asset),
      amount: wire.amount,
      ext: ClaimableBalanceEntryExt.fromXdrObject(wire.ext),
    });
  }
}
