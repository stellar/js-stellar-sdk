import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { OWNED } from "../values/owned.js";
import { ScVal, type ScValWire } from "./sc-val.js";

export interface ContractEventV0Wire {
  topics: ScValWire[];
  data: ScValWire;
}

/**
 * ```xdr
 * struct
 *         {
 *             SCVal topics<>;
 *             SCVal data;
 *         }
 * ```
 */
export class ContractEventV0 extends XdrValue {
  readonly topics: ScVal[];
  readonly data: ScVal;

  static readonly schema: XdrType<ContractEventV0Wire> = struct(
    "ContractEventV0",
    {
      topics: array(ScVal.schema, UNBOUNDED_MAX_LENGTH),
      data: ScVal.schema,
    },
  );

  constructor(
    input: {
      topics: ScVal[];
      data: ScVal;
    },
    owned?: typeof OWNED,
  ) {
    super();
    this.topics = owned === OWNED ? input.topics : input.topics.slice();
    this.data = input.data;
  }

  toXdrObject(): ContractEventV0Wire {
    return {
      topics: this.topics.map((v) => v.toXdrObject()),
      data: this.data.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ContractEventV0Wire): ContractEventV0 {
    return new ContractEventV0(
      {
        topics: wire.topics.map((w) => ScVal.fromXdrObject(w)),
        data: ScVal.fromXdrObject(wire.data),
      },
      OWNED,
    );
  }
}
