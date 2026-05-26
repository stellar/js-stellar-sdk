import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ScSpecUdtEnumCaseV0Wire {
  doc: string;
  name: string;
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
  readonly doc: string;
  readonly name: string;
  readonly value: number;

  static readonly schema: XdrType<ScSpecUdtEnumCaseV0Wire> = struct(
    "ScSpecUdtEnumCaseV0",
    {
      doc: string_(1024),
      name: string_(60),
      value: uint32(),
    },
  );

  constructor(input: {
    doc: Uint8Array | string;
    name: Uint8Array | string;
    value: number;
  }) {
    super();
    this.doc =
      input.doc instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.doc)
        : input.doc;
    this.name =
      input.name instanceof Uint8Array
        ? new TextDecoder("latin1").decode(input.name)
        : input.name;
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
