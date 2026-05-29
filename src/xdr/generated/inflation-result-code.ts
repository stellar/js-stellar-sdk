import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type InflationResultCodeWire = number;

export type InflationResultCodeName = "inflationSuccess" | "inflationNotTime";

/**
 * ```xdr
 * enum InflationResultCode
 * {
 *     // codes considered as "success" for the operation
 *     INFLATION_SUCCESS = 0,
 *     // codes considered as "failure" for the operation
 *     INFLATION_NOT_TIME = -1
 * };
 * ```
 */
export class InflationResultCode extends EnumValue<InflationResultCodeName> {
  static readonly inflationSuccess = new InflationResultCode(
    "inflationSuccess",
    0,
  );
  static readonly inflationNotTime = new InflationResultCode(
    "inflationNotTime",
    -1,
  );

  static readonly schema = enumType("InflationResultCode", {
    inflationSuccess: 0,
    inflationNotTime: -1,
  });

  static fromValue(value: number): InflationResultCode {
    return enumFromValue(
      "InflationResultCode",
      InflationResultCode.schema,
      InflationResultCode,
      value,
    );
  }

  static fromName(name: InflationResultCodeName): InflationResultCode {
    return enumFromName("InflationResultCode", InflationResultCode, name);
  }

  static fromXdrObject(wire: number): InflationResultCode {
    return InflationResultCode.fromValue(wire);
  }
}
