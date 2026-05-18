import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ThresholdIndexesWire = number;

export type ThresholdIndexesName =
  | "thresholdMasterWeight"
  | "thresholdLow"
  | "thresholdMed"
  | "thresholdHigh";

/**
 * ```xdr
 * enum ThresholdIndexes
 * {
 *     THRESHOLD_MASTER_WEIGHT = 0,
 *     THRESHOLD_LOW = 1,
 *     THRESHOLD_MED = 2,
 *     THRESHOLD_HIGH = 3
 * };
 * ```
 */
export class ThresholdIndexes extends EnumValue<ThresholdIndexesName> {
  static readonly thresholdMasterWeight = new ThresholdIndexes(
    "thresholdMasterWeight",
    0,
  );
  static readonly thresholdLow = new ThresholdIndexes("thresholdLow", 1);
  static readonly thresholdMed = new ThresholdIndexes("thresholdMed", 2);
  static readonly thresholdHigh = new ThresholdIndexes("thresholdHigh", 3);

  private static readonly byValue: Readonly<Record<number, ThresholdIndexes>> =
    {
      0: ThresholdIndexes.thresholdMasterWeight,
      1: ThresholdIndexes.thresholdLow,
      2: ThresholdIndexes.thresholdMed,
      3: ThresholdIndexes.thresholdHigh,
    };

  static readonly schema = enumType("ThresholdIndexes", {
    thresholdMasterWeight: 0,
    thresholdLow: 1,
    thresholdMed: 2,
    thresholdHigh: 3,
  });

  static fromValue(value: number): ThresholdIndexes {
    return enumLookup(
      "ThresholdIndexes",
      ThresholdIndexes.byValue,
      value,
    ) as ThresholdIndexes;
  }

  static fromName(name: ThresholdIndexesName): ThresholdIndexes {
    switch (name) {
      case "thresholdMasterWeight":
        return ThresholdIndexes.thresholdMasterWeight;
      case "thresholdLow":
        return ThresholdIndexes.thresholdLow;
      case "thresholdMed":
        return ThresholdIndexes.thresholdMed;
      case "thresholdHigh":
        return ThresholdIndexes.thresholdHigh;
      default:
        throw new XdrError(`ThresholdIndexes: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ThresholdIndexes {
    return ThresholdIndexes.fromValue(wire);
  }
}
