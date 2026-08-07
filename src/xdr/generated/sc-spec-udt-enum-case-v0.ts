import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";

export interface ScSpecUdtEnumCaseV0Wire {
  doc: XdrString;
  name: XdrString;
  value: number;
}

/**
 * ```xdr
 * struct SCSpecUDTEnumCaseV0
 * {
 *     string doc<SC_SPEC_DOC_LIMIT>;
 *     string name<60>;
 *     uint32 value;
 * };
 * ```
 */
export class ScSpecUdtEnumCaseV0 extends XdrValue {
  readonly doc: XdrString;
  readonly name: XdrString;
  readonly value: number;

  static readonly schema: XdrType<ScSpecUdtEnumCaseV0Wire> = struct(
    "ScSpecUdtEnumCaseV0",
    {
      doc: xdrString(1024),
      name: xdrString(60),
      value: uint32(),
    },
  );

  constructor(input: {
    doc: XdrString | string | Uint8Array;
    name: XdrString | string | Uint8Array;
    value: number;
  }) {
    super();
    this.doc =
      input.doc instanceof XdrString ? input.doc : new XdrString(input.doc);
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
    this.value = input.value;
  }

  toXdrObject(): ScSpecUdtEnumCaseV0Wire {
    return {
      doc: this.doc,
      name: this.name,
      value: this.value,
    };
  }

  static fromXdrObject(wire: ScSpecUdtEnumCaseV0Wire): ScSpecUdtEnumCaseV0 {
    return new ScSpecUdtEnumCaseV0({
      doc: wire.doc,
      name: wire.name,
      value: wire.value,
    });
  }
}
