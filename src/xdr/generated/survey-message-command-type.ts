import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

export type SurveyMessageCommandTypeWire = number;

export type SurveyMessageCommandTypeName = "timeSlicedSurveyTopology";

/**
 * ```xdr
 * enum SurveyMessageCommandType
 * {
 *     TIME_SLICED_SURVEY_TOPOLOGY = 1
 * };
 * ```
 */
export class SurveyMessageCommandType extends EnumValue<SurveyMessageCommandTypeName> {
  static readonly timeSlicedSurveyTopology = new SurveyMessageCommandType(
    "timeSlicedSurveyTopology",
    1,
  );

  static readonly schema = enumType("SurveyMessageCommandType", {
    timeSlicedSurveyTopology: 1,
  });

  static fromValue(value: number): SurveyMessageCommandType {
    return enumFromValue(
      "SurveyMessageCommandType",
      SurveyMessageCommandType.schema,
      SurveyMessageCommandType,
      value,
    );
  }

  static fromName(
    name: SurveyMessageCommandTypeName,
  ): SurveyMessageCommandType {
    return enumFromName(
      "SurveyMessageCommandType",
      SurveyMessageCommandType,
      name,
    );
  }

  static fromXdrObject(wire: number): SurveyMessageCommandType {
    return SurveyMessageCommandType.fromValue(wire);
  }
}
