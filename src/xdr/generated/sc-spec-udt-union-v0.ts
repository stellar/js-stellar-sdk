import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ScSpecUdtUnionCaseV0,
  type ScSpecUdtUnionCaseV0Wire,
} from "./sc-spec-udt-union-case-v0.js";

export interface ScSpecUdtUnionV0Wire {
  doc: string;
  lib: string;
  name: string;
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
  readonly doc: string;
  readonly lib: string;
  readonly name: string;
  readonly cases: ScSpecUdtUnionCaseV0[];

  static readonly schema: XdrType<ScSpecUdtUnionV0Wire> = struct(
    "ScSpecUdtUnionV0",
    {
      doc: string_(1024),
      lib: string_(80),
      name: string_(60),
      cases: array(ScSpecUdtUnionCaseV0.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    doc: Uint8Array | string;
    lib: Uint8Array | string;
    name: Uint8Array | string;
    cases: ScSpecUdtUnionCaseV0[];
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
