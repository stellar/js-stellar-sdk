import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type ScSpecEventParamLocationV0Wire = number;

export type ScSpecEventParamLocationV0Name =
  | "scSpecEventParamLocationData"
  | "scSpecEventParamLocationTopicList";

/**
 * ```xdr
 * enum SCSpecEventParamLocationV0
 * {
 *     SC_SPEC_EVENT_PARAM_LOCATION_DATA = 0,
 *     SC_SPEC_EVENT_PARAM_LOCATION_TOPIC_LIST = 1
 * };
 * ```
 */
export class ScSpecEventParamLocationV0 extends EnumValue<ScSpecEventParamLocationV0Name> {
  static readonly scSpecEventParamLocationData = new ScSpecEventParamLocationV0(
    "scSpecEventParamLocationData",
    0,
  );
  static readonly scSpecEventParamLocationTopicList =
    new ScSpecEventParamLocationV0("scSpecEventParamLocationTopicList", 1);

  static readonly schema = withMemberPrefix(
    enumType("ScSpecEventParamLocationV0", {
      scSpecEventParamLocationData: 0,
      scSpecEventParamLocationTopicList: 1,
    }),
    "scSpecEventParamLocation",
  );

  static fromValue(value: number): ScSpecEventParamLocationV0 {
    return enumFromValue(
      "ScSpecEventParamLocationV0",
      ScSpecEventParamLocationV0.schema,
      ScSpecEventParamLocationV0,
      value,
    );
  }

  static fromName(
    name: ScSpecEventParamLocationV0Name,
  ): ScSpecEventParamLocationV0 {
    return enumFromName(
      "ScSpecEventParamLocationV0",
      ScSpecEventParamLocationV0,
      name,
    );
  }

  static fromXdrObject(wire: number): ScSpecEventParamLocationV0 {
    return ScSpecEventParamLocationV0.fromValue(wire);
  }
}
