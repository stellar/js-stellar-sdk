import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";

export interface ScSpecUdtUnionCaseVoidV0Wire {
  doc: XdrString;
  name: XdrString;
}

/**
 * ```xdr
 * struct SCSpecUDTUnionCaseVoidV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string name<60>;
 * };
 * ```
 */
export class ScSpecUdtUnionCaseVoidV0 extends XdrValue {
  readonly doc: XdrString;
  readonly name: XdrString;

  static readonly schema: XdrType<ScSpecUdtUnionCaseVoidV0Wire> = struct(
    "ScSpecUdtUnionCaseVoidV0",
    {
      doc: xdrString(1024),
      name: xdrString(60),
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
  }

  toXdrObject(): ScSpecUdtUnionCaseVoidV0Wire {
    return {
      doc: this.doc,
      name: this.name,
    };
  }

  static fromXdrObject(
    wire: ScSpecUdtUnionCaseVoidV0Wire,
  ): ScSpecUdtUnionCaseVoidV0 {
    return new ScSpecUdtUnionCaseVoidV0({
      doc: wire.doc,
      name: wire.name,
    });
  }
}
