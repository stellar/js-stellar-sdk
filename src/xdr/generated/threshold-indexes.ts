import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("ThresholdIndexes", {
    thresholdMasterWeight: 0,
    thresholdLow: 1,
    thresholdMed: 2,
    thresholdHigh: 3,
  });

  static fromValue(value: number): ThresholdIndexes {
    return enumFromValue(
      "ThresholdIndexes",
      ThresholdIndexes.schema,
      ThresholdIndexes,
      value,
    );
  }

  static fromName(name: ThresholdIndexesName): ThresholdIndexes {
    return enumFromName("ThresholdIndexes", ThresholdIndexes, name);
  }

  static fromXdrObject(wire: number): ThresholdIndexes {
    return ThresholdIndexes.fromValue(wire);
  }
}
