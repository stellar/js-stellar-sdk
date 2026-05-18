import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, PreconditionType>> =
    {
      0: PreconditionType.precondNone,
      1: PreconditionType.precondTime,
      2: PreconditionType.precondV2,
    };

  static readonly schema = enumType("PreconditionType", {
    precondNone: 0,
    precondTime: 1,
    precondV2: 2,
  });

  static fromValue(value: number): PreconditionType {
    return enumLookup(
      "PreconditionType",
      PreconditionType.byValue,
      value,
    ) as PreconditionType;
  }

  static fromName(name: PreconditionTypeName): PreconditionType {
    switch (name) {
      case "precondNone":
        return PreconditionType.precondNone;
      case "precondTime":
        return PreconditionType.precondTime;
      case "precondV2":
        return PreconditionType.precondV2;
      default:
        throw new XdrError(`PreconditionType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): PreconditionType {
    return PreconditionType.fromValue(wire);
  }
}
