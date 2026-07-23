import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface LiabilitiesWire {
  buying: bigint;
  selling: bigint;
}

/**
 * ```xdr
 * struct Liabilities
 * {
 *     int64 buying;
 *     int64 selling;
 * };
 * ```
 */
export class Liabilities extends XdrValue {
  readonly buying: bigint;
  readonly selling: bigint;

  static readonly schema: XdrType<LiabilitiesWire> = struct("Liabilities", {
    buying: int64(),
    selling: int64(),
  });

  constructor(input: { buying: bigint; selling: bigint }) {
    super();
    this.buying = input.buying;
    this.selling = input.selling;
  }

  toXdrObject(): LiabilitiesWire {
    return {
      buying: this.buying,
      selling: this.selling,
    };
  }

  static fromXdrObject(wire: LiabilitiesWire): Liabilities {
    return new Liabilities({
      buying: wire.buying,
      selling: wire.selling,
    });
  }
}
