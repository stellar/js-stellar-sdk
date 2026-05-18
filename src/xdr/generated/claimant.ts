/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ClaimantType } from "./claimant-type.js";
import { ClaimantV0, type ClaimantV0Wire } from "./claimant-v0.js";

export type ClaimantWire = { type: 0; v0: ClaimantV0Wire };

export type ClaimantVariantName = "claimantTypeV0";

/**
 * ```xdr
 * union Claimant switch (ClaimantType type)
 * {
 * case CLAIMANT_TYPE_V0:
 *     struct
 *     {
 *         AccountID destination;    // The account that can use this condition
 *         ClaimPredicate predicate; // Claimable if predicate is true
 *     } v0;
 * };
 * ```
 */
abstract class ClaimantBase extends XdrValue {
  abstract readonly type: ClaimantVariantName;

  static readonly schema: XdrType<ClaimantWire> = union("Claimant", {
    switchOn: ClaimantType.schema,
    cases: [case_("claimantTypeV0", 0, field("v0", ClaimantV0.schema))],
  });

  static claimantTypeV0(v0: ClaimantV0): ClaimantV0Arm {
    return new ClaimantV0Arm(v0);
  }

  static fromXdrObject(wire: ClaimantWire): Claimant {
    switch (wire.type) {
      case 0:
        return new ClaimantV0Arm(ClaimantV0.fromXdrObject(wire.v0));
    }
  }

  abstract toXdrObject(): ClaimantWire;
}

export class ClaimantV0Arm extends ClaimantBase {
  readonly type = "claimantTypeV0" as const;
  readonly v0: ClaimantV0;

  constructor(v0: ClaimantV0) {
    super();
    this.v0 = v0;
  }

  get value(): ClaimantV0 {
    return this.v0;
  }

  toXdrObject(): Extract<ClaimantWire, { type: 0 }> {
    return { type: 0, v0: this.v0.toXdrObject() };
  }
}

export type Claimant = ClaimantV0Arm;
export const Claimant = ClaimantBase;
