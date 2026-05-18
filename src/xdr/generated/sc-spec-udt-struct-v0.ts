import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ScSpecUdtStructFieldV0,
  type ScSpecUdtStructFieldV0Wire,
} from "./sc-spec-udt-struct-field-v0.js";

export interface ScSpecUdtStructV0Wire {
  doc: string;
  lib: string;
  name: string;
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
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly fields: ScSpecUdtStructFieldV0[];

  static readonly schema: XdrType<ScSpecUdtStructV0Wire> = struct(
    "ScSpecUdtStructV0",
    {
      doc: string_(1024),
      lib: string_(80),
      name: string_(60),
      fields: array(ScSpecUdtStructFieldV0.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: string;
    lib: string;
    name: string;
    fields: ScSpecUdtStructFieldV0[];
  }) {
    super();
    this.doc = input.doc;
    this.lib = input.lib;
    this.name = input.name;
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
