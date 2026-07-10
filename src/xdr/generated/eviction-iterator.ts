import { bool, struct, uint32, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface EvictionIteratorWire {
  bucketListLevel: number;
  isCurrBucket: boolean;
  bucketFileOffset: bigint;
}

/**
 * ```xdr
 * struct EvictionIterator {
 *     uint32 bucketListLevel;
 *     bool isCurrBucket;
 *     uint64 bucketFileOffset;
 * };
 * ```
 */
export class EvictionIterator extends XdrValue {
  readonly bucketListLevel: number;
  readonly isCurrBucket: boolean;
  readonly bucketFileOffset: bigint;

  static readonly schema: XdrType<EvictionIteratorWire> = struct(
    "EvictionIterator",
    {
      bucketListLevel: uint32(),
      isCurrBucket: bool(),
      bucketFileOffset: uint64(),
    },
  );

  constructor(input: {
    bucketListLevel: number;
    isCurrBucket: boolean;
    bucketFileOffset: bigint;
  }) {
    super();
    this.bucketListLevel = input.bucketListLevel;
    this.isCurrBucket = input.isCurrBucket;
    this.bucketFileOffset = input.bucketFileOffset;
  }

  toXdrObject(): EvictionIteratorWire {
    return {
      bucketListLevel: this.bucketListLevel,
      isCurrBucket: this.isCurrBucket,
      bucketFileOffset: this.bucketFileOffset,
    };
  }

  static fromXdrObject(wire: EvictionIteratorWire): EvictionIterator {
    return new EvictionIterator({
      bucketListLevel: wire.bucketListLevel,
      isCurrBucket: wire.isCurrBucket,
      bucketFileOffset: wire.bucketFileOffset,
    });
  }
}
