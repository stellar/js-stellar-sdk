import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";
import {
  ScSpecUdtErrorEnumCaseV0,
  type ScSpecUdtErrorEnumCaseV0Wire,
} from "./sc-spec-udt-error-enum-case-v0.js";

export interface ScSpecUdtErrorEnumV0Wire {
  doc: XdrString;
  lib: XdrString;
  name: XdrString;
  cases: ScSpecUdtErrorEnumCaseV0Wire[];
}

/**
 * ```xdr
 * struct SCSpecUDTErrorEnumV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string lib<80>;
 *     string name<60>;
 *     SCSpecUDTErrorEnumCaseV0 cases<>;
 * };
 * ```
 */
export class ScSpecUdtErrorEnumV0 extends XdrValue {
  readonly doc: XdrString;
  readonly lib: XdrString;
  readonly name: XdrString;
  readonly cases: ScSpecUdtErrorEnumCaseV0[];

  static readonly schema: XdrType<ScSpecUdtErrorEnumV0Wire> = struct(
    "ScSpecUdtErrorEnumV0",
    {
      doc: xdrString(1024),
      lib: xdrString(80),
      name: xdrString(60),
      cases: array(ScSpecUdtErrorEnumCaseV0.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    lib: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    cases: ScSpecUdtErrorEnumCaseV0[];
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

  toXdrObject(): ScSpecUdtErrorEnumV0Wire {
    return {
      doc: this.doc,
      lib: this.lib,
      name: this.name,
      cases: this.cases.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScSpecUdtErrorEnumV0Wire): ScSpecUdtErrorEnumV0 {
    return new ScSpecUdtErrorEnumV0({
      doc: wire.doc,
      lib: wire.lib,
      name: wire.name,
      cases: wire.cases.map((w) => ScSpecUdtErrorEnumCaseV0.fromXdrObject(w)),
    });
  }
}
