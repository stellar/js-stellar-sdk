import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import {
  ScSpecUdtUnionCaseV0,
  type ScSpecUdtUnionCaseV0Wire,
} from "./sc-spec-udt-union-case-v0.js";

export interface ScSpecUdtUnionV0Wire {
  doc: XdrString;
  lib: XdrString;
  name: XdrString;
  cases: ScSpecUdtUnionCaseV0Wire[];
}

/**
 * ```xdr
 * struct SCSpecUDTUnionV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string lib<80>;
 *     string name<60>;
 *     SCSpecUDTUnionCaseV0 cases<>;
 * };
 * ```
 */
export class ScSpecUdtUnionV0 extends XdrValue {
  readonly doc: XdrString;
  readonly lib: XdrString;
  readonly name: XdrString;
  readonly cases: ScSpecUdtUnionCaseV0[];

  static readonly schema: XdrType<ScSpecUdtUnionV0Wire> = struct(
    "ScSpecUdtUnionV0",
    {
      doc: xdrString(1024),
      lib: xdrString(80),
      name: xdrString(60),
      cases: array(ScSpecUdtUnionCaseV0.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    lib: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    cases: ScSpecUdtUnionCaseV0[];
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

  toXdrObject(): ScSpecUdtUnionV0Wire {
    return {
      doc: this.doc,
      lib: this.lib,
      name: this.name,
      cases: this.cases.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScSpecUdtUnionV0Wire): ScSpecUdtUnionV0 {
    return new ScSpecUdtUnionV0({
      doc: wire.doc,
      lib: wire.lib,
      name: wire.name,
      cases: wire.cases.map((w) => ScSpecUdtUnionCaseV0.fromXdrObject(w)),
    });
  }
}
