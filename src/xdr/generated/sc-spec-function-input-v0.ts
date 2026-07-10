import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";

export interface ScSpecFunctionInputV0Wire {
  doc: XdrString;
  name: XdrString;
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
  readonly doc: XdrString;
  readonly name: XdrString;
  readonly type: ScSpecTypeDef;

  static readonly schema: XdrType<ScSpecFunctionInputV0Wire> = struct(
    "ScSpecFunctionInputV0",
    {
      doc: xdrString(1024),
      name: xdrString(30),
      type: ScSpecTypeDef.schema,
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    type: ScSpecTypeDef;
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
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
