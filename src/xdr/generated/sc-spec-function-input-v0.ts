import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";

export interface ScSpecFunctionInputV0Wire {
  doc: string;
  name: string;
  type: ScSpecTypeDefWire;
}

/**
 * ```xdr
 * struct SCSpecFunctionInputV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string name<30>;
 *     SCSpecTypeDef type;
 * };
 * ```
 */
export class ScSpecFunctionInputV0 extends XdrValue {
  readonly doc: string;
  readonly name: string;
  readonly type: ScSpecTypeDef;

  static readonly schema: XdrType<ScSpecFunctionInputV0Wire> = struct(
    "ScSpecFunctionInputV0",
    {
      doc: string_(1024),
      name: string_(30),
      type: ScSpecTypeDef.schema,
    },
  );

  constructor(input: { doc: string; name: string; type: ScSpecTypeDef }) {
    super();
    this.doc = input.doc;
    this.name = input.name;
    this.type = input.type;
  }

  toXdrObject(): ScSpecFunctionInputV0Wire {
    return {
      doc: this.doc,
      name: this.name,
      type: this.type.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScSpecFunctionInputV0Wire): ScSpecFunctionInputV0 {
    return new ScSpecFunctionInputV0({
      doc: wire.doc,
      name: wire.name,
      type: ScSpecTypeDef.fromXdrObject(wire.type),
    });
  }
}
