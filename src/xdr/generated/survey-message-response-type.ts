import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("SurveyMessageResponseType", {
    surveyTopologyResponseV2: 2,
  });

  static fromValue(value: number): SurveyMessageResponseType {
    return enumFromValue(
      "SurveyMessageResponseType",
      SurveyMessageResponseType.schema,
      SurveyMessageResponseType,
      value,
    );
  }

  static fromName(
    name: SurveyMessageResponseTypeName,
  ): SurveyMessageResponseType {
    return enumFromName(
      "SurveyMessageResponseType",
      SurveyMessageResponseType,
      name,
    );
  }

  static fromXdrObject(wire: number): SurveyMessageResponseType {
    return SurveyMessageResponseType.fromValue(wire);
  }
}
