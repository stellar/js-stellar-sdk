import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import {
  ScSpecUdtEnumCaseV0,
  type ScSpecUdtEnumCaseV0Wire,
} from "./sc-spec-udt-enum-case-v0.js";

export interface ScSpecUdtEnumV0Wire {
  doc: XdrString;
  lib: XdrString;
  name: XdrString;
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
  readonly doc: XdrString;
  readonly lib: XdrString;
  readonly name: XdrString;
  readonly cases: ScSpecUdtEnumCaseV0[];

  static readonly schema: XdrType<ScSpecUdtEnumV0Wire> = struct(
    "ScSpecUdtEnumV0",
    {
      doc: xdrString(1024),
      lib: xdrString(80),
      name: xdrString(60),
      cases: array(ScSpecUdtEnumCaseV0.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    lib: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    cases: ScSpecUdtEnumCaseV0[];
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.lib =
      input.lib instanceof XdrString ? input.lib : new XdrString(input.lib);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
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
