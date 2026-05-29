/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { SurveyMessageResponseType } from "./survey-message-response-type.js";
import {
  TopologyResponseBodyV2,
  type TopologyResponseBodyV2Wire,
} from "./topology-response-body-v2.js";

export type SurveyResponseBodyWire = {
  type: 2;
  topologyResponseBodyV2: TopologyResponseBodyV2Wire;
};

export type SurveyResponseBodyVariantName = "surveyTopologyResponseV2";

/**
 * ```xdr
 * union SurveyResponseBody switch (SurveyMessageResponseType type)
 * {
 * case SURVEY_TOPOLOGY_RESPONSE_V2:
 *     TopologyResponseBodyV2 topologyResponseBodyV2;
 * };
 * ```
 */
abstract class SurveyResponseBodyBase extends XdrValue {
  abstract readonly type: SurveyResponseBodyVariantName;

  static readonly schema: XdrType<SurveyResponseBodyWire> = union(
    "SurveyResponseBody",
    {
      switchOn: SurveyMessageResponseType.schema,
      cases: [
        case_(
          "surveyTopologyResponseV2",
          2,
          field("topologyResponseBodyV2", TopologyResponseBodyV2.schema),
        ),
      ],
    },
  );

  static surveyTopologyResponseV2(
    topologyResponseBodyV2: TopologyResponseBodyV2,
  ): SurveyResponseBodySurveyTopologyResponseV2 {
    return new SurveyResponseBodySurveyTopologyResponseV2(
      topologyResponseBodyV2,
    );
  }

  static fromXdrObject(wire: SurveyResponseBodyWire): SurveyResponseBody {
    switch (wire.type) {
      case 2:
        return new SurveyResponseBodySurveyTopologyResponseV2(
          TopologyResponseBodyV2.fromXdrObject(wire.topologyResponseBodyV2),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete SurveyResponseBody variant.
   * Use this instead of `instanceof SurveyResponseBody`: the exported `SurveyResponseBody` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `SurveyResponseBody.is(x)` narrows to the union.
   */
  static is(value: unknown): value is SurveyResponseBody {
    return value instanceof SurveyResponseBodyBase;
  }

  abstract toXdrObject(): SurveyResponseBodyWire;
}

export class SurveyResponseBodySurveyTopologyResponseV2 extends SurveyResponseBodyBase {
  readonly type = "surveyTopologyResponseV2" as const;
  readonly topologyResponseBodyV2: TopologyResponseBodyV2;

  constructor(topologyResponseBodyV2: TopologyResponseBodyV2) {
    super();
    this.topologyResponseBodyV2 = topologyResponseBodyV2;
  }

  get value(): TopologyResponseBodyV2 {
    return this.topologyResponseBodyV2;
  }

  toXdrObject(): Extract<SurveyResponseBodyWire, { type: 2 }> {
    return {
      type: 2,
      topologyResponseBodyV2: this.topologyResponseBodyV2.toXdrObject(),
    };
  }
}

export type SurveyResponseBody = SurveyResponseBodySurveyTopologyResponseV2;
export const SurveyResponseBody = SurveyResponseBodyBase;
