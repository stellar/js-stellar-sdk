import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";

export interface ScSpecUdtUnionCaseTupleV0Wire {
  doc: string;
  name: string;
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
  readonly doc: string;
  readonly name: string;
  readonly type: ScSpecTypeDef[];

  static readonly schema: XdrType<ScSpecUdtUnionCaseTupleV0Wire> = struct(
    "ScSpecUdtUnionCaseTupleV0",
    {
      doc: string_(1024),
      name: string_(60),
      type: array(ScSpecTypeDef.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: Uint8Array | string;
    name: Uint8Array | string;
    type: ScSpecTypeDef[];
  }) {
    super();
    this.doc =
      input.doc instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.doc)
        : input.doc;
    this.name =
      input.name instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.name)
        : input.name;
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
