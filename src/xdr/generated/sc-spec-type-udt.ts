import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { XdrString, xdrString } from "../values/xdr-string.js";

export interface ScSpecTypeUdtWire {
  name: XdrString;
}

/**
 * ```xdr
 * struct SCSpecTypeUDT
 * {
 *     string name<60>;
 * };
 * ```
 */
export class ScSpecTypeUdt extends XdrValue {
  readonly name: XdrString;

  static readonly schema: XdrType<ScSpecTypeUdtWire> = struct("ScSpecTypeUdt", {
    name: xdrString(60),
  });

  constructor(input: { name: XdrString | string | Uint8Array }) {
    super();
    this.name =
      input.name instanceof XdrString ? input.name : new XdrString(input.name);
  }

  toXdrObject(): ScSpecTypeUdtWire {
    return {
      name: this.name,
    };
  }

  static fromXdrObject(wire: ScSpecTypeUdtWire): ScSpecTypeUdt {
    return new ScSpecTypeUdt({
      name: wire.name,
    });
  }
}
