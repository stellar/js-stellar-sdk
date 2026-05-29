import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";

export interface ExtendFootprintTtlOpWire {
  ext: ExtensionPointWire;
  extendTo: number;
}

/**
 * ```xdr
 * struct ExtendFootprintTTLOp
 * {
 *     ExtensionPoint ext;
 *     uint32 extendTo;
 * };
 * ```
 */
export class ExtendFootprintTtlOp extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly extendTo: number;

  static readonly schema: XdrType<ExtendFootprintTtlOpWire> = struct(
    "ExtendFootprintTtlOp",
    {
      ext: ExtensionPoint.schema,
      extendTo: uint32(),
    },
  );

  constructor(input: { ext: ExtensionPoint; extendTo: number }) {
    super();
    this.ext = input.ext;
    this.extendTo = input.extendTo;
  }

  toXdrObject(): ExtendFootprintTtlOpWire {
    return {
      ext: this.ext.toXdrObject(),
      extendTo: this.extendTo,
    };
  }

  static fromXdrObject(wire: ExtendFootprintTtlOpWire): ExtendFootprintTtlOp {
    return new ExtendFootprintTtlOp({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      extendTo: wire.extendTo,
    });
  }
}
