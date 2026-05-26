import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScSpecTypeDef, type ScSpecTypeDefWire } from "./sc-spec-type-def.js";

export interface ScSpecUdtStructFieldV0Wire {
  doc: string;
  name: string;
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
  readonly doc: string;
  readonly name: string;
  readonly type: ScSpecTypeDef;

  static readonly schema: XdrType<ScSpecUdtStructFieldV0Wire> = struct(
    "ScSpecUdtStructFieldV0",
    {
      doc: string_(1024),
      name: string_(30),
      type: ScSpecTypeDef.schema,
    },
  );

  constructor(input: {
    doc: Uint8Array | string;
    name: Uint8Array | string;
    type: ScSpecTypeDef;
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
