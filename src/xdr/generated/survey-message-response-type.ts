import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type SurveyMessageResponseTypeWire = number;

export type SurveyMessageResponseTypeName = "surveyTopologyResponseV2";

/**
 * ```xdr
 * enum SurveyMessageResponseType
 * {
 *     SURVEY_TOPOLOGY_RESPONSE_V2 = 2
 * };
 * ```
 */
export class SurveyMessageResponseType extends EnumValue<SurveyMessageResponseTypeName> {
  static readonly surveyTopologyResponseV2 = new SurveyMessageResponseType(
    "surveyTopologyResponseV2",
    2,
  );

  private static readonly byValue: Readonly<
    Record<number, SurveyMessageResponseType>
  > = {
    2: SurveyMessageResponseType.surveyTopologyResponseV2,
  };

  static readonly schema = enumType("SurveyMessageResponseType", {
    surveyTopologyResponseV2: 2,
  });

  static fromValue(value: number): SurveyMessageResponseType {
    return enumLookup(
      "SurveyMessageResponseType",
      SurveyMessageResponseType.byValue,
      value,
    ) as SurveyMessageResponseType;
  }

  static fromName(
    name: SurveyMessageResponseTypeName,
  ): SurveyMessageResponseType {
    switch (name) {
      case "surveyTopologyResponseV2":
        return SurveyMessageResponseType.surveyTopologyResponseV2;
      default:
        throw new XdrError(`SurveyMessageResponseType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): SurveyMessageResponseType {
    return SurveyMessageResponseType.fromValue(wire);
  }
}
