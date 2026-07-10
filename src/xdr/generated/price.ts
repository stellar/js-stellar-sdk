import { int32, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface PriceWire {
  n: number;
  d: number;
}

/**
 * ```xdr
 * struct Price
 * {
 *     int32 n; // numerator
 *     int32 d; // denominator
 * };
 * ```
 */
export class Price extends XdrValue {
  readonly n: number;
  readonly d: number;

  static readonly schema: XdrType<PriceWire> = struct("Price", {
    n: int32(),
    d: int32(),
  });

  constructor(input: { n: number; d: number }) {
    super();
    this.n = input.n;
    this.d = input.d;
  }

  toXdrObject(): PriceWire {
    return {
      n: this.n,
      d: this.d,
    };
  }

  static fromXdrObject(wire: PriceWire): Price {
    return new Price({
      n: wire.n,
      d: wire.d,
    });
  }
}
