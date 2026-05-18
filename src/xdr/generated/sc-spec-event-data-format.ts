import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ScSpecEventDataFormatWire = number;

export type ScSpecEventDataFormatName =
  | "scSpecEventDataFormatSingleValue"
  | "scSpecEventDataFormatVec"
  | "scSpecEventDataFormatMap";

/**
 * ```xdr
 * enum SCSpecEventDataFormat
 * {
 *     SC_SPEC_EVENT_DATA_FORMAT_SINGLE_VALUE = 0,
 *     SC_SPEC_EVENT_DATA_FORMAT_VEC = 1,
 *     SC_SPEC_EVENT_DATA_FORMAT_MAP = 2
 * };
 * ```
 */
export class ScSpecEventDataFormat extends EnumValue<ScSpecEventDataFormatName> {
  static readonly scSpecEventDataFormatSingleValue = new ScSpecEventDataFormat(
    "scSpecEventDataFormatSingleValue",
    0,
  );
  static readonly scSpecEventDataFormatVec = new ScSpecEventDataFormat(
    "scSpecEventDataFormatVec",
    1,
  );
  static readonly scSpecEventDataFormatMap = new ScSpecEventDataFormat(
    "scSpecEventDataFormatMap",
    2,
  );

  private static readonly byValue: Readonly<
    Record<number, ScSpecEventDataFormat>
  > = {
    0: ScSpecEventDataFormat.scSpecEventDataFormatSingleValue,
    1: ScSpecEventDataFormat.scSpecEventDataFormatVec,
    2: ScSpecEventDataFormat.scSpecEventDataFormatMap,
  };

  static readonly schema = enumType("ScSpecEventDataFormat", {
    scSpecEventDataFormatSingleValue: 0,
    scSpecEventDataFormatVec: 1,
    scSpecEventDataFormatMap: 2,
  });

  static fromValue(value: number): ScSpecEventDataFormat {
    return enumLookup(
      "ScSpecEventDataFormat",
      ScSpecEventDataFormat.byValue,
      value,
    ) as ScSpecEventDataFormat;
  }

  static fromName(name: ScSpecEventDataFormatName): ScSpecEventDataFormat {
    switch (name) {
      case "scSpecEventDataFormatSingleValue":
        return ScSpecEventDataFormat.scSpecEventDataFormatSingleValue;
      case "scSpecEventDataFormatVec":
        return ScSpecEventDataFormat.scSpecEventDataFormatVec;
      case "scSpecEventDataFormatMap":
        return ScSpecEventDataFormat.scSpecEventDataFormatMap;
      default:
        throw new XdrError(`ScSpecEventDataFormat: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScSpecEventDataFormat {
    return ScSpecEventDataFormat.fromValue(wire);
  }
}
