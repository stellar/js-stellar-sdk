import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("ClaimPredicateType", {
      claimPredicateUnconditional: 0,
      claimPredicateAnd: 1,
      claimPredicateOr: 2,
      claimPredicateNot: 3,
      claimPredicateBeforeAbsoluteTime: 4,
      claimPredicateBeforeRelativeTime: 5,
    }),
    "claimPredicate",
  );

  static fromValue(value: number): ClaimPredicateType {
    return enumFromValue(
      "ClaimPredicateType",
      ClaimPredicateType.schema,
      ClaimPredicateType,
      value,
    );
  }

  static fromName(name: ClaimPredicateTypeName): ClaimPredicateType {
    return enumFromName("ClaimPredicateType", ClaimPredicateType, name);
  }

  static fromXdrObject(wire: number): ClaimPredicateType {
    return ClaimPredicateType.fromValue(wire);
  }
}
