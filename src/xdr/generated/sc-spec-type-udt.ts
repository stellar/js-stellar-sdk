import { struct } from "../types/struct.js";
import { string as string_ } from "../types/string.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ScSpecTypeUdtWire {
  name: string;
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
  readonly name: string;

  static readonly schema: XdrType<ScSpecTypeUdtWire> = struct("ScSpecTypeUdt", {
    name: string_(60),
  });

  constructor(input: { name: string }) {
    super();
    this.name = input.name;
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
