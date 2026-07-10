import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface BumpSequenceOpWire {
  bumpTo: bigint;
}

/**
 * ```xdr
 * struct BumpSequenceOp
 * {
 *     SequenceNumber bumpTo;
 * };
 * ```
 */
export class BumpSequenceOp extends XdrValue {
  readonly bumpTo: bigint;

  static readonly schema: XdrType<BumpSequenceOpWire> = struct(
    "BumpSequenceOp",
    {
      bumpTo: int64(),
    },
  );

  constructor(input: { bumpTo: bigint }) {
    super();
    this.bumpTo = input.bumpTo;
  }

  toXdrObject(): BumpSequenceOpWire {
    return {
      bumpTo: this.bumpTo,
    };
  }

  static fromXdrObject(wire: BumpSequenceOpWire): BumpSequenceOp {
    return new BumpSequenceOp({
      bumpTo: wire.bumpTo,
    });
  }
}
