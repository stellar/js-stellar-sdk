import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ClaimPredicateTypeWire = number;

export type ClaimPredicateTypeName =
  | "claimPredicateUnconditional"
  | "claimPredicateAnd"
  | "claimPredicateOr"
  | "claimPredicateNot"
  | "claimPredicateBeforeAbsoluteTime"
  | "claimPredicateBeforeRelativeTime";

/**
 * ```xdr
 * enum ClaimPredicateType
 * {
 *     CLAIM_PREDICATE_UNCONDITIONAL = 0,
 *     CLAIM_PREDICATE_AND = 1,
 *     CLAIM_PREDICATE_OR = 2,
 *     CLAIM_PREDICATE_NOT = 3,
 *     CLAIM_PREDICATE_BEFORE_ABSOLUTE_TIME = 4,
 *     CLAIM_PREDICATE_BEFORE_RELATIVE_TIME = 5
 * };
 * ```
 */
export class ClaimPredicateType extends EnumValue<ClaimPredicateTypeName> {
  static readonly claimPredicateUnconditional = new ClaimPredicateType(
    "claimPredicateUnconditional",
    0,
  );
  static readonly claimPredicateAnd = new ClaimPredicateType(
    "claimPredicateAnd",
    1,
  );
  static readonly claimPredicateOr = new ClaimPredicateType(
    "claimPredicateOr",
    2,
  );
  static readonly claimPredicateNot = new ClaimPredicateType(
    "claimPredicateNot",
    3,
  );
  static readonly claimPredicateBeforeAbsoluteTime = new ClaimPredicateType(
    "claimPredicateBeforeAbsoluteTime",
    4,
  );
  static readonly claimPredicateBeforeRelativeTime = new ClaimPredicateType(
    "claimPredicateBeforeRelativeTime",
    5,
  );

  private static readonly byValue: Readonly<
    Record<number, ClaimPredicateType>
  > = {
    0: ClaimPredicateType.claimPredicateUnconditional,
    1: ClaimPredicateType.claimPredicateAnd,
    2: ClaimPredicateType.claimPredicateOr,
    3: ClaimPredicateType.claimPredicateNot,
    4: ClaimPredicateType.claimPredicateBeforeAbsoluteTime,
    5: ClaimPredicateType.claimPredicateBeforeRelativeTime,
  };

  static readonly schema = enumType("ClaimPredicateType", {
    claimPredicateUnconditional: 0,
    claimPredicateAnd: 1,
    claimPredicateOr: 2,
    claimPredicateNot: 3,
    claimPredicateBeforeAbsoluteTime: 4,
    claimPredicateBeforeRelativeTime: 5,
  });

  static fromValue(value: number): ClaimPredicateType {
    return enumLookup(
      "ClaimPredicateType",
      ClaimPredicateType.byValue,
      value,
    ) as ClaimPredicateType;
  }

  static fromName(name: ClaimPredicateTypeName): ClaimPredicateType {
    switch (name) {
      case "claimPredicateUnconditional":
        return ClaimPredicateType.claimPredicateUnconditional;
      case "claimPredicateAnd":
        return ClaimPredicateType.claimPredicateAnd;
      case "claimPredicateOr":
        return ClaimPredicateType.claimPredicateOr;
      case "claimPredicateNot":
        return ClaimPredicateType.claimPredicateNot;
      case "claimPredicateBeforeAbsoluteTime":
        return ClaimPredicateType.claimPredicateBeforeAbsoluteTime;
      case "claimPredicateBeforeRelativeTime":
        return ClaimPredicateType.claimPredicateBeforeRelativeTime;
      default:
        throw new XdrError(`ClaimPredicateType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ClaimPredicateType {
    return ClaimPredicateType.fromValue(wire);
  }
}
