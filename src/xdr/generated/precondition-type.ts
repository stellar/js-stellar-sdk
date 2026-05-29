import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
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

  static readonly schema = enumType("PreconditionType", {
    precondNone: 0,
    precondTime: 1,
    precondV2: 2,
  });

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
