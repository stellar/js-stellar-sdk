import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";

export interface ScSpecUdtUnionCaseTupleV0Wire {
  doc: XdrString;
  name: XdrString;
  type: ScSpecTypeDefWire[];
}

/**
 * ```xdr
 * struct SCSpecUDTUnionCaseTupleV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string name<60>;
 *     SCSpecTypeDef type<>;
 * };
 * ```
 */
export class ScSpecUdtUnionCaseTupleV0 extends XdrValue {
  readonly doc: XdrString;
  readonly name: XdrString;
  readonly type: ScSpecTypeDef[];

  static readonly schema: XdrType<ScSpecUdtUnionCaseTupleV0Wire> = struct(
    "ScSpecUdtUnionCaseTupleV0",
    {
      doc: xdrString(1024),
      name: xdrString(60),
      type: array(ScSpecTypeDef.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    type: ScSpecTypeDef[];
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
    this.type = input.type;
  }

  toXdrObject(): ScSpecUdtUnionCaseTupleV0Wire {
    return {
      doc: this.doc,
      name: this.name,
      type: this.type.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: ScSpecUdtUnionCaseTupleV0Wire,
  ): ScSpecUdtUnionCaseTupleV0 {
    return new ScSpecUdtUnionCaseTupleV0({
      doc: wire.doc,
      name: wire.name,
      type: wire.type.map((w) => ScSpecTypeDef.fromXdrObject(w)),
    });
  }
}
