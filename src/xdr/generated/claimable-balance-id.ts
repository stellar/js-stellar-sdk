/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ClaimableBalanceIdType } from "./claimable-balance-id-type.js";
import { Hash, type HashWire } from "./hash.js";

export type ClaimableBalanceIdWire = { type: 0; v0: HashWire };

export type ClaimableBalanceIdVariantName = "claimableBalanceIdTypeV0";

/**
 * ```xdr
 * union ClaimableBalanceID switch (ClaimableBalanceIDType type)
 * {
 * case CLAIMABLE_BALANCE_ID_TYPE_V0:
 *     Hash v0;
 * };
 * ```
 */
abstract class ClaimableBalanceIdBase extends XdrValue {
  abstract readonly type: ClaimableBalanceIdVariantName;

  static readonly schema: XdrType<ClaimableBalanceIdWire> = union(
    "ClaimableBalanceId",
    {
      switchOn: ClaimableBalanceIdType.schema,
      cases: [case_("claimableBalanceIdTypeV0", 0, field("v0", Hash.schema))],
    },
  );

  static claimableBalanceIdTypeV0(v0: Hash): ClaimableBalanceIdV0 {
    return new ClaimableBalanceIdV0(v0);
  }

  static fromXdrObject(wire: ClaimableBalanceIdWire): ClaimableBalanceId {
    switch (wire.type) {
      case 0:
        return new ClaimableBalanceIdV0(Hash.fromXdrObject(wire.v0));
    }
  }

  abstract toXdrObject(): ClaimableBalanceIdWire;
}

export class ClaimableBalanceIdV0 extends ClaimableBalanceIdBase {
  readonly type = "claimableBalanceIdTypeV0" as const;
  readonly v0: Hash;

  constructor(v0: Hash) {
    super();
    this.v0 = v0;
  }

  get value(): Hash {
    return this.v0;
  }

  toXdrObject(): Extract<ClaimableBalanceIdWire, { type: 0 }> {
    return { type: 0, v0: this.v0.toXdrObject() };
  }
}

export type ClaimableBalanceId = ClaimableBalanceIdV0;
export const ClaimableBalanceId = ClaimableBalanceIdBase;
