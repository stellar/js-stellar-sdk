import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import {
  ScSpecFunctionInputV0,
  type ScSpecFunctionInputV0Wire,
} from "./sc-spec-function-input-v0.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";

export interface ScSpecFunctionV0Wire {
  doc: XdrString;
  name: XdrString;
  inputs: ScSpecFunctionInputV0Wire[];
  outputs: ScSpecTypeDefWire[];
}

/**
 * ```xdr
 * struct SCSpecFunctionV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     SCSymbol name;
 *     SCSpecFunctionInputV0 inputs<>;
 *     SCSpecTypeDef outputs<1>;
 * };
 * ```
 */
export class ScSpecFunctionV0 extends XdrValue {
  readonly doc: XdrString;
  readonly name: XdrString;
  readonly inputs: ScSpecFunctionInputV0[];
  readonly outputs: ScSpecTypeDef[];

  static readonly schema: XdrType<ScSpecFunctionV0Wire> = struct(
    "ScSpecFunctionV0",
    {
      doc: xdrString(1024),
      name: xdrString(32),
      inputs: array(ScSpecFunctionInputV0.schema, UNBOUNDED_MAX_LENGTH),
      outputs: array(ScSpecTypeDef.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    inputs: ScSpecFunctionInputV0[];
    outputs: ScSpecTypeDef[];
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
    this.inputs = input.inputs;
    this.outputs = input.outputs;
  }

  toXdrObject(): ScSpecFunctionV0Wire {
    return {
      doc: this.doc,
      name: this.name,
      inputs: this.inputs.map((v) => v.toXdrObject()),
      outputs: this.outputs.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScSpecFunctionV0Wire): ScSpecFunctionV0 {
    return new ScSpecFunctionV0({
      doc: wire.doc,
      name: wire.name,
      inputs: wire.inputs.map((w) => ScSpecFunctionInputV0.fromXdrObject(w)),
      outputs: wire.outputs.map((w) => ScSpecTypeDef.fromXdrObject(w)),
    });
  }
}
