import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ScpStatementTypeWire = number;

export type ScpStatementTypeName =
  | "scpStPrepare"
  | "scpStConfirm"
  | "scpStExternalize"
  | "scpStNominate";

/**
 * ```xdr
 * enum SCPStatementType
 * {
 *     SCP_ST_PREPARE = 0,
 *     SCP_ST_CONFIRM = 1,
 *     SCP_ST_EXTERNALIZE = 2,
 *     SCP_ST_NOMINATE = 3
 * };
 * ```
 */
export class ScpStatementType extends EnumValue<ScpStatementTypeName> {
  static readonly scpStPrepare = new ScpStatementType("scpStPrepare", 0);
  static readonly scpStConfirm = new ScpStatementType("scpStConfirm", 1);
  static readonly scpStExternalize = new ScpStatementType(
    "scpStExternalize",
    2,
  );
  static readonly scpStNominate = new ScpStatementType("scpStNominate", 3);

  private static readonly byValue: Readonly<Record<number, ScpStatementType>> =
    {
      0: ScpStatementType.scpStPrepare,
      1: ScpStatementType.scpStConfirm,
      2: ScpStatementType.scpStExternalize,
      3: ScpStatementType.scpStNominate,
    };

  static readonly schema = enumType("ScpStatementType", {
    scpStPrepare: 0,
    scpStConfirm: 1,
    scpStExternalize: 2,
    scpStNominate: 3,
  });

  static fromValue(value: number): ScpStatementType {
    return enumLookup(
      "ScpStatementType",
      ScpStatementType.byValue,
      value,
    ) as ScpStatementType;
  }

  static fromName(name: ScpStatementTypeName): ScpStatementType {
    switch (name) {
      case "scpStPrepare":
        return ScpStatementType.scpStPrepare;
      case "scpStConfirm":
        return ScpStatementType.scpStConfirm;
      case "scpStExternalize":
        return ScpStatementType.scpStExternalize;
      case "scpStNominate":
        return ScpStatementType.scpStNominate;
      default:
        throw new XdrError(`ScpStatementType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScpStatementType {
    return ScpStatementType.fromValue(wire);
  }
}
