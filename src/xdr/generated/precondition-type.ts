import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type PreconditionTypeWire = number;

export type PreconditionTypeName = "precondNone" | "precondTime" | "precondV2";

/**
 * ```xdr
 * enum PreconditionType
 * {
 *     PRECOND_NONE = 0,
 *     PRECOND_TIME = 1,
 *     PRECOND_V2 = 2
 * };
 * ```
 */
export class PreconditionType extends EnumValue<PreconditionTypeName> {
  static readonly precondNone = new PreconditionType("precondNone", 0);
  static readonly precondTime = new PreconditionType("precondTime", 1);
  static readonly precondV2 = new PreconditionType("precondV2", 2);

  static readonly schema = withMemberPrefix(
    enumType("PreconditionType", {
      precondNone: 0,
      precondTime: 1,
      precondV2: 2,
    }),
    "precond",
  );

  static fromValue(value: number): PreconditionType {
    return enumFromValue(
      "PreconditionType",
      PreconditionType.schema,
      PreconditionType,
      value,
    );
  }

  static fromName(name: PreconditionTypeName): PreconditionType {
    return enumFromName("PreconditionType", PreconditionType, name);
  }

  static fromXdrObject(wire: number): PreconditionType {
    return PreconditionType.fromValue(wire);
  }
}
