import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ScSpecUdtUnionCaseVoidV0Wire {
  doc: string;
  name: string;
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
  readonly doc: string;
  readonly name: string;

  static readonly schema: XdrType<ScSpecUdtUnionCaseVoidV0Wire> = struct(
    "ScSpecUdtUnionCaseVoidV0",
    {
      doc: string_(1024),
      name: string_(60),
    },
  );

  constructor(input: { doc: Uint8Array | string; name: Uint8Array | string }) {
    super();
    this.doc =
      input.doc instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.doc)
        : input.doc;
    this.name =
      input.name instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.name)
        : input.name;
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
