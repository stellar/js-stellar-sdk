import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScVal, type ScValWire } from "./sc-val.js";
import { ContractEvent, type ContractEventWire } from "./contract-event.js";

export interface InvokeHostFunctionSuccessPreImageWire {
  returnValue: ScValWire;
  events: ContractEventWire[];
}

/**
 * ```xdr
 * struct InvokeHostFunctionSuccessPreImage
 * {
 *     SCVal returnValue;
 *     ContractEvent events<>;
 * };
 * ```
 */
export class InvokeHostFunctionSuccessPreImage extends XdrValue {
  readonly returnValue: ScVal;
  readonly events: ContractEvent[];

  static readonly schema: XdrType<InvokeHostFunctionSuccessPreImageWire> =
    struct("InvokeHostFunctionSuccessPreImage", {
      returnValue: ScVal.schema,
      events: array(ContractEvent.schema, UNBOUNDED_MAX_LENGTH),
    });

  constructor(input: { returnValue: ScVal; events: ContractEvent[] }) {
    super();
    this.returnValue = input.returnValue;
    this.events = input.events;
  }

  toXdrObject(): InvokeHostFunctionSuccessPreImageWire {
    return {
      returnValue: this.returnValue.toXdrObject(),
      events: this.events.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: InvokeHostFunctionSuccessPreImageWire,
  ): InvokeHostFunctionSuccessPreImage {
    return new InvokeHostFunctionSuccessPreImage({
      returnValue: ScVal.fromXdrObject(wire.returnValue),
      events: wire.events.map((w) => ContractEvent.fromXdrObject(w)),
    });
  }
}
