import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ScSpecUdtErrorEnumCaseV0,
  type ScSpecUdtErrorEnumCaseV0Wire,
} from "./sc-spec-udt-error-enum-case-v0.js";

export interface ScSpecUdtErrorEnumV0Wire {
  doc: string;
  lib: string;
  name: string;
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
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly cases: ScSpecUdtErrorEnumCaseV0[];

  static readonly schema: XdrType<ScSpecUdtErrorEnumV0Wire> = struct(
    "ScSpecUdtErrorEnumV0",
    {
      doc: string_(1024),
      lib: string_(80),
      name: string_(60),
      cases: array(ScSpecUdtErrorEnumCaseV0.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: Uint8Array | string;
    lib: Uint8Array | string;
    name: Uint8Array | string;
    cases: ScSpecUdtErrorEnumCaseV0[];
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
