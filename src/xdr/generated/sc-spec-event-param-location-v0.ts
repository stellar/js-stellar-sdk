import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, ScSpecEventParamLocationV0>
  > = {
    0: ScSpecEventParamLocationV0.scSpecEventParamLocationData,
    1: ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList,
  };

  static readonly schema = enumType("ScSpecEventParamLocationV0", {
    scSpecEventParamLocationData: 0,
    scSpecEventParamLocationTopicList: 1,
  });

  static fromValue(value: number): ScSpecEventParamLocationV0 {
    return enumLookup(
      "ScSpecEventParamLocationV0",
      ScSpecEventParamLocationV0.byValue,
      value,
    ) as ScSpecEventParamLocationV0;
  }

  static fromName(
    name: ScSpecEventParamLocationV0Name,
  ): ScSpecEventParamLocationV0 {
    switch (name) {
      case "scSpecEventParamLocationData":
        return ScSpecEventParamLocationV0.scSpecEventParamLocationData;
      case "scSpecEventParamLocationTopicList":
        return ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList;
      default:
        throw new XdrError(`ScSpecEventParamLocationV0: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ScSpecEventParamLocationV0 {
    return ScSpecEventParamLocationV0.fromValue(wire);
  }
}
