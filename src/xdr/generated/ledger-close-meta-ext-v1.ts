import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";

export interface LedgerCloseMetaExtV1Wire {
  ext: ExtensionPointWire;
  sorobanFeeWrite1Kb: bigint;
}

/**
 * ```xdr
 * struct LedgerCloseMetaExtV1
 * {
 *     ExtensionPoint ext;
 *     int64 sorobanFeeWrite1KB;
 * };
 * ```
 */
export class LedgerCloseMetaExtV1 extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly sorobanFeeWrite1Kb: bigint;

  static readonly schema: XdrType<LedgerCloseMetaExtV1Wire> = struct(
    "LedgerCloseMetaExtV1",
    {
      ext: ExtensionPoint.schema,
      sorobanFeeWrite1Kb: int64(),
    },
  );

  constructor(input: { ext: ExtensionPoint; sorobanFeeWrite1Kb: bigint }) {
    super();
    this.ext = input.ext;
    this.sorobanFeeWrite1Kb = input.sorobanFeeWrite1Kb;
  }

  toXdrObject(): LedgerCloseMetaExtV1Wire {
    return {
      ext: this.ext.toXdrObject(),
      sorobanFeeWrite1Kb: this.sorobanFeeWrite1Kb,
    };
  }

  static fromXdrObject(wire: LedgerCloseMetaExtV1Wire): LedgerCloseMetaExtV1 {
    return new LedgerCloseMetaExtV1({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      sorobanFeeWrite1Kb: wire.sorobanFeeWrite1Kb,
    });
  }
}
