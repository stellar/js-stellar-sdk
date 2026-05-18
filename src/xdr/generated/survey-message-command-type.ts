import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, SurveyMessageCommandType>
  > = {
    1: SurveyMessageCommandType.timeSlicedSurveyTopology,
  };

  static readonly schema = enumType("SurveyMessageCommandType", {
    timeSlicedSurveyTopology: 1,
  });

  static fromValue(value: number): SurveyMessageCommandType {
    return enumLookup(
      "SurveyMessageCommandType",
      SurveyMessageCommandType.byValue,
      value,
    ) as SurveyMessageCommandType;
  }

  static fromName(
    name: SurveyMessageCommandTypeName,
  ): SurveyMessageCommandType {
    switch (name) {
      case "timeSlicedSurveyTopology":
        return SurveyMessageCommandType.timeSlicedSurveyTopology;
      default:
        throw new XdrError(`SurveyMessageCommandType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): SurveyMessageCommandType {
    return SurveyMessageCommandType.fromValue(wire);
  }
}
