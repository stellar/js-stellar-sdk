import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";

export interface ScSpecUdtStructFieldV0Wire {
  doc: XdrString;
  name: XdrString;
  type: ScSpecTypeDefWire;
}

/**
 * ```xdr
 * struct SCSpecUDTStructFieldV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string name<30>;
 *     SCSpecTypeDef type;
 * };
 * ```
 */
export class ScSpecUdtStructFieldV0 extends XdrValue {
  readonly doc: XdrString;
  readonly name: XdrString;
  readonly type: ScSpecTypeDef;

  static readonly schema: XdrType<ScSpecUdtStructFieldV0Wire> = struct(
    "ScSpecUdtStructFieldV0",
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

  toXdrObject(): ScSpecUdtStructFieldV0Wire {
    return {
      doc: this.doc,
      name: this.name,
      type: this.type.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: ScSpecUdtStructFieldV0Wire,
  ): ScSpecUdtStructFieldV0 {
    return new ScSpecUdtStructFieldV0({
      doc: wire.doc,
      name: wire.name,
      type: ScSpecTypeDef.fromXdrObject(wire.type),
    });
  }
}
