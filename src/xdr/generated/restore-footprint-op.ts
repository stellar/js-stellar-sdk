import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";

export interface RestoreFootprintOpWire {
  ext: ExtensionPointWire;
}

/**
 * ```xdr
 * struct RestoreFootprintOp
 * {
 *     ExtensionPoint ext;
 * };
 * ```
 */
export class RestoreFootprintOp extends XdrValue {
  readonly ext: ExtensionPoint;

  static readonly schema: XdrType<RestoreFootprintOpWire> = struct(
    "RestoreFootprintOp",
    {
      ext: ExtensionPoint.schema,
    },
  );

  constructor(input: { ext: ExtensionPoint }) {
    super();
    this.ext = input.ext;
  }

  toXdrObject(): RestoreFootprintOpWire {
    return {
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: RestoreFootprintOpWire): RestoreFootprintOp {
    return new RestoreFootprintOp({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
    });
  }
}
