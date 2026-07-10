import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface LedgerBoundsWire {
  minLedger: number;
  maxLedger: number;
}

/**
 * ```xdr
 * struct LedgerBounds
 * {
 *     uint32 minLedger;
 *     uint32 maxLedger; // 0 here means no maxLedger
 * };
 * ```
 */
export class LedgerBounds extends XdrValue {
  readonly minLedger: number;
  readonly maxLedger: number;

  static readonly schema: XdrType<LedgerBoundsWire> = struct("LedgerBounds", {
    minLedger: uint32(),
    maxLedger: uint32(),
  });

  constructor(input: { minLedger: number; maxLedger: number }) {
    super();
    this.minLedger = input.minLedger;
    this.maxLedger = input.maxLedger;
  }

  toXdrObject(): LedgerBoundsWire {
    return {
      minLedger: this.minLedger,
      maxLedger: this.maxLedger,
    };
  }

  static fromXdrObject(wire: LedgerBoundsWire): LedgerBounds {
    return new LedgerBounds({
      minLedger: wire.minLedger,
      maxLedger: wire.maxLedger,
    });
  }
}
