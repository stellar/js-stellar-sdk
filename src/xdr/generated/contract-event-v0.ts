import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
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

  constructor(input: { topics: ScVal[]; data: ScVal }) {
    super();
    this.topics = input.topics;
    this.data = input.data;
  }

  toXdrObject(): ContractEventV0Wire {
    return {
      topics: this.topics.map((v) => v.toXdrObject()),
      data: this.data.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ContractEventV0Wire): ContractEventV0 {
    return new ContractEventV0({
      topics: wire.topics.map((w) => ScVal.fromXdrObject(w)),
      data: ScVal.fromXdrObject(wire.data),
    });
  }
}
