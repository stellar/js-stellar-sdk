import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("ScSpecEventDataFormat", {
      scSpecEventDataFormatSingleValue: 0,
      scSpecEventDataFormatVec: 1,
      scSpecEventDataFormatMap: 2,
    }),
    "scSpecEventDataFormat",
  );

  static fromValue(value: number): ScSpecEventDataFormat {
    return enumFromValue(
      "ScSpecEventDataFormat",
      ScSpecEventDataFormat.schema,
      ScSpecEventDataFormat,
      value,
    );
  }

  static fromName(name: ScSpecEventDataFormatName): ScSpecEventDataFormat {
    return enumFromName("ScSpecEventDataFormat", ScSpecEventDataFormat, name);
  }

  static fromXdrObject(wire: number): ScSpecEventDataFormat {
    return ScSpecEventDataFormat.fromValue(wire);
  }
}
