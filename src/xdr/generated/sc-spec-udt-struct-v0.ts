import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import {
  ScSpecUdtStructFieldV0,
  type ScSpecUdtStructFieldV0Wire,
} from "./sc-spec-udt-struct-field-v0.js";

export interface ScSpecUdtStructV0Wire {
  doc: XdrString;
  lib: XdrString;
  name: XdrString;
  fields: ScSpecUdtStructFieldV0Wire[];
}

/**
 * ```xdr
 * struct SCSpecUDTStructV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string lib<80>;
 *     string name<60>;
 *     SCSpecUDTStructFieldV0 fields<>;
 * };
 * ```
 */
export class ScSpecUdtStructV0 extends XdrValue {
  readonly doc: XdrString;
  readonly lib: XdrString;
  readonly name: XdrString;
  readonly fields: ScSpecUdtStructFieldV0[];

  static readonly schema: XdrType<ScSpecUdtStructV0Wire> = struct(
    "ScSpecUdtStructV0",
    {
      doc: xdrString(1024),
      lib: xdrString(80),
      name: xdrString(60),
      fields: array(ScSpecUdtStructFieldV0.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    lib: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    fields: ScSpecUdtStructFieldV0[];
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.lib =
      input.lib instanceof XdrString ? input.lib : new XdrString(input.lib);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
    this.fields = input.fields;
  }

  toXdrObject(): ScSpecUdtStructV0Wire {
    return {
      doc: this.doc,
      lib: this.lib,
      name: this.name,
      fields: this.fields.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScSpecUdtStructV0Wire): ScSpecUdtStructV0 {
    return new ScSpecUdtStructV0({
      doc: wire.doc,
      lib: wire.lib,
      name: wire.name,
      fields: wire.fields.map((w) => ScSpecUdtStructFieldV0.fromXdrObject(w)),
    });
  }
}
