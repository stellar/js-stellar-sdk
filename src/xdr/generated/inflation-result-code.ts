import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, InflationResultCode>
  > = {
    0: InflationResultCode.inflationSuccess,
    "-1": InflationResultCode.inflationNotTime,
  };

  static readonly schema = enumType("InflationResultCode", {
    inflationSuccess: 0,
    inflationNotTime: -1,
  });

  static fromValue(value: number): InflationResultCode {
    return enumLookup(
      "InflationResultCode",
      InflationResultCode.byValue,
      value,
    ) as InflationResultCode;
  }

  static fromName(name: InflationResultCodeName): InflationResultCode {
    switch (name) {
      case "inflationSuccess":
        return InflationResultCode.inflationSuccess;
      case "inflationNotTime":
        return InflationResultCode.inflationNotTime;
      default:
        throw new XdrError(`InflationResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): InflationResultCode {
    return InflationResultCode.fromValue(wire);
  }
}
