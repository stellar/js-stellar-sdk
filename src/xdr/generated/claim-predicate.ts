/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { array } from "../types/array.js";
import { lazy } from "../types/lazy.js";
import { option } from "../types/option.js";
import { int64 } from "../types/int64.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ClaimPredicateType } from "./claim-predicate-type.js";

export type ClaimPredicateWire =
  | { type: 0 }
  | { type: 1; andPredicates: ClaimPredicateWire[] }
  | { type: 2; orPredicates: ClaimPredicateWire[] }
  | { type: 3; notPredicate: ClaimPredicateWire | null }
  | { type: 4; absBefore: bigint }
  | { type: 5; relBefore: bigint };

export type ClaimPredicateVariantName =
  | "claimPredicateUnconditional"
  | "claimPredicateAnd"
  | "claimPredicateOr"
  | "claimPredicateNot"
  | "claimPredicateBeforeAbsoluteTime"
  | "claimPredicateBeforeRelativeTime";

/**
 * ```xdr
 * union ClaimPredicate switch (ClaimPredicateType type)
 * {
 * case CLAIM_PREDICATE_UNCONDITIONAL:
 *     void;
 * case CLAIM_PREDICATE_AND:
 *     ClaimPredicate andPredicates<2>;
 * case CLAIM_PREDICATE_OR:
 *     ClaimPredicate orPredicates<2>;
 * case CLAIM_PREDICATE_NOT:
 *     ClaimPredicate* notPredicate;
 * case CLAIM_PREDICATE_BEFORE_ABSOLUTE_TIME:
 *     int64 absBefore; // Predicate will be true if closeTime < absBefore
 * case CLAIM_PREDICATE_BEFORE_RELATIVE_TIME:
 *     int64 relBefore; // Seconds since closeTime of the ledger in which the
 *                      // ClaimableBalanceEntry was created
 * };
 * ```
 */
abstract class ClaimPredicateBase extends XdrValue {
  abstract readonly type: ClaimPredicateVariantName;

  static readonly schema: XdrType<ClaimPredicateWire> = union(
    "ClaimPredicate",
    {
      switchOn: ClaimPredicateType.schema,
      cases: [
        case_("claimPredicateUnconditional", 0, voidType()),
        case_(
          "claimPredicateAnd",
          1,
          field(
            "andPredicates",
            array(
              lazy(() => ClaimPredicate.schema),
              UNBOUNDED_MAX_LENGTH,
            ),
          ),
        ),
        case_(
          "claimPredicateOr",
          2,
          field(
            "orPredicates",
            array(
              lazy(() => ClaimPredicate.schema),
              UNBOUNDED_MAX_LENGTH,
            ),
          ),
        ),
        case_(
          "claimPredicateNot",
          3,
          field("notPredicate", option(lazy(() => ClaimPredicate.schema))),
        ),
        case_(
          "claimPredicateBeforeAbsoluteTime",
          4,
          field("absBefore", int64()),
        ),
        case_(
          "claimPredicateBeforeRelativeTime",
          5,
          field("relBefore", int64()),
        ),
      ],
    },
  );

  static claimPredicateUnconditional(): ClaimPredicateUnconditional {
    return new ClaimPredicateUnconditional();
  }

  static claimPredicateAnd(andPredicates: ClaimPredicate[]): ClaimPredicateAnd {
    return new ClaimPredicateAnd(andPredicates);
  }

  static claimPredicateOr(orPredicates: ClaimPredicate[]): ClaimPredicateOr {
    return new ClaimPredicateOr(orPredicates);
  }

  static claimPredicateNot(
    notPredicate: ClaimPredicate | null,
  ): ClaimPredicateNot {
    return new ClaimPredicateNot(notPredicate);
  }

  static claimPredicateBeforeAbsoluteTime(
    absBefore: bigint,
  ): ClaimPredicateBeforeAbsoluteTime {
    return new ClaimPredicateBeforeAbsoluteTime(absBefore);
  }

  static claimPredicateBeforeRelativeTime(
    relBefore: bigint,
  ): ClaimPredicateBeforeRelativeTime {
    return new ClaimPredicateBeforeRelativeTime(relBefore);
  }

  static fromXdrObject(wire: ClaimPredicateWire): ClaimPredicate {
    switch (wire.type) {
      case 0:
        return new ClaimPredicateUnconditional();
      case 1:
        return new ClaimPredicateAnd(
          wire.andPredicates.map((w) => ClaimPredicate.fromXdrObject(w)),
        );
      case 2:
        return new ClaimPredicateOr(
          wire.orPredicates.map((w) => ClaimPredicate.fromXdrObject(w)),
        );
      case 3:
        return new ClaimPredicateNot(
          wire.notPredicate === null
            ? null
            : ClaimPredicate.fromXdrObject(wire.notPredicate),
        );
      case 4:
        return new ClaimPredicateBeforeAbsoluteTime(wire.absBefore);
      case 5:
        return new ClaimPredicateBeforeRelativeTime(wire.relBefore);
    }
  }

  abstract toXdrObject(): ClaimPredicateWire;
}

export class ClaimPredicateUnconditional extends ClaimPredicateBase {
  readonly type = "claimPredicateUnconditional" as const;

  toXdrObject(): Extract<ClaimPredicateWire, { type: 0 }> {
    return { type: 0 };
  }
}

export class ClaimPredicateAnd extends ClaimPredicateBase {
  readonly type = "claimPredicateAnd" as const;
  readonly andPredicates: ClaimPredicate[];

  constructor(andPredicates: ClaimPredicate[]) {
    super();
    this.andPredicates = andPredicates;
  }

  get value(): ClaimPredicate[] {
    return this.andPredicates;
  }

  toXdrObject(): Extract<ClaimPredicateWire, { type: 1 }> {
    return {
      type: 1,
      andPredicates: this.andPredicates.map((v) => v.toXdrObject()),
    };
  }
}

export class ClaimPredicateOr extends ClaimPredicateBase {
  readonly type = "claimPredicateOr" as const;
  readonly orPredicates: ClaimPredicate[];

  constructor(orPredicates: ClaimPredicate[]) {
    super();
    this.orPredicates = orPredicates;
  }

  get value(): ClaimPredicate[] {
    return this.orPredicates;
  }

  toXdrObject(): Extract<ClaimPredicateWire, { type: 2 }> {
    return {
      type: 2,
      orPredicates: this.orPredicates.map((v) => v.toXdrObject()),
    };
  }
}

export class ClaimPredicateNot extends ClaimPredicateBase {
  readonly type = "claimPredicateNot" as const;
  readonly notPredicate: ClaimPredicate | null;

  constructor(notPredicate: ClaimPredicate | null) {
    super();
    this.notPredicate = notPredicate;
  }

  get value(): ClaimPredicate | null {
    return this.notPredicate;
  }

  toXdrObject(): Extract<ClaimPredicateWire, { type: 3 }> {
    return {
      type: 3,
      notPredicate:
        this.notPredicate === null ? null : this.notPredicate.toXdrObject(),
    };
  }
}

export class ClaimPredicateBeforeAbsoluteTime extends ClaimPredicateBase {
  readonly type = "claimPredicateBeforeAbsoluteTime" as const;
  readonly absBefore: bigint;

  constructor(absBefore: bigint) {
    super();
    this.absBefore = absBefore;
  }

  get value(): bigint {
    return this.absBefore;
  }

  toXdrObject(): Extract<ClaimPredicateWire, { type: 4 }> {
    return { type: 4, absBefore: this.absBefore };
  }
}

export class ClaimPredicateBeforeRelativeTime extends ClaimPredicateBase {
  readonly type = "claimPredicateBeforeRelativeTime" as const;
  readonly relBefore: bigint;

  constructor(relBefore: bigint) {
    super();
    this.relBefore = relBefore;
  }

  get value(): bigint {
    return this.relBefore;
  }

  toXdrObject(): Extract<ClaimPredicateWire, { type: 5 }> {
    return { type: 5, relBefore: this.relBefore };
  }
}

export type ClaimPredicate =
  | ClaimPredicateUnconditional
  | ClaimPredicateAnd
  | ClaimPredicateOr
  | ClaimPredicateNot
  | ClaimPredicateBeforeAbsoluteTime
  | ClaimPredicateBeforeRelativeTime;
export const ClaimPredicate = ClaimPredicateBase;
