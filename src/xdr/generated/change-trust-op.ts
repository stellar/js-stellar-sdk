import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ChangeTrustAsset,
  type ChangeTrustAssetWire,
} from "./change-trust-asset.js";

export interface ChangeTrustOpWire {
  line: ChangeTrustAssetWire;
  limit: bigint;
}

/**
 * ```xdr
 * struct ChangeTrustOp
 * {
 *     ChangeTrustAsset line;
 *
 *     // if limit is set to 0, deletes the trust line
 *     int64 limit;
 * };
 * ```
 */
export class ChangeTrustOp extends XdrValue {
  readonly line: ChangeTrustAsset;
  readonly limit: bigint;

  static readonly schema: XdrType<ChangeTrustOpWire> = struct("ChangeTrustOp", {
    line: ChangeTrustAsset.schema,
    limit: int64(),
  });

  constructor(input: { line: ChangeTrustAsset; limit: bigint }) {
    super();
    this.line = input.line;
    this.limit = input.limit;
  }

  toXdrObject(): ChangeTrustOpWire {
    return {
      line: this.line.toXdrObject(),
      limit: this.limit,
    };
  }

  static fromXdrObject(wire: ChangeTrustOpWire): ChangeTrustOp {
    return new ChangeTrustOp({
      line: ChangeTrustAsset.fromXdrObject(wire.line),
      limit: wire.limit,
    });
  }
}
