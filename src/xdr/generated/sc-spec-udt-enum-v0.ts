import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ScSpecUdtEnumCaseV0,
  type ScSpecUdtEnumCaseV0Wire,
} from "./sc-spec-udt-enum-case-v0.js";

export interface ScSpecUdtEnumV0Wire {
  doc: string;
  lib: string;
  name: string;
  cases: ScSpecUdtEnumCaseV0Wire[];
}

/**
 * ```xdr
 * struct SCSpecUDTEnumV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string lib<80>;
 *     string name<60>;
 *     SCSpecUDTEnumCaseV0 cases<>;
 * };
 * ```
 */
export class ScSpecUdtEnumV0 extends XdrValue {
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly cases: ScSpecUdtEnumCaseV0[];

  static readonly schema: XdrType<ScSpecUdtEnumV0Wire> = struct(
    "ScSpecUdtEnumV0",
    {
      doc: string_(1024),
      lib: string_(80),
      name: string_(60),
      cases: array(ScSpecUdtEnumCaseV0.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: Uint8Array | string;
    lib: Uint8Array | string;
    name: Uint8Array | string;
    cases: ScSpecUdtEnumCaseV0[];
  }) {
    super();
    this.doc =
      input.doc instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.doc)
        : input.doc;
    this.lib =
      input.lib instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.lib)
        : input.lib;
    this.name =
      input.name instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.name)
        : input.name;
    this.cases = input.cases;
  }

  toXdrObject(): ScSpecUdtEnumV0Wire {
    return {
      doc: this.doc,
      lib: this.lib,
      name: this.name,
      cases: this.cases.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScSpecUdtEnumV0Wire): ScSpecUdtEnumV0 {
    return new ScSpecUdtEnumV0({
      doc: wire.doc,
      lib: wire.lib,
      name: wire.name,
      cases: wire.cases.map((w) => ScSpecUdtEnumCaseV0.fromXdrObject(w)),
    });
  }
}
