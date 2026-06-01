import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("ScpStatementType", {
      scpStPrepare: 0,
      scpStConfirm: 1,
      scpStExternalize: 2,
      scpStNominate: 3,
    }),
    "scpSt",
  );

  static fromValue(value: number): ScpStatementType {
    return enumFromValue(
      "ScpStatementType",
      ScpStatementType.schema,
      ScpStatementType,
      value,
    );
  }

  static fromName(name: ScpStatementTypeName): ScpStatementType {
    return enumFromName("ScpStatementType", ScpStatementType, name);
  }

  static fromXdrObject(wire: number): ScpStatementType {
    return ScpStatementType.fromValue(wire);
  }
}
