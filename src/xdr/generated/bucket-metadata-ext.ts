/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { BucketListType, type BucketListTypeWire } from "./bucket-list-type.js";

export type BucketMetadataExtWire =
  | { v: 0 }
  | { v: 1; bucketListType: BucketListTypeWire };

export type BucketMetadataExtVariantName = "v0" | "bucketListType";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         BucketListType bucketListType;
 *     }
 * ```
 */
abstract class BucketMetadataExtBase extends XdrValue {
  abstract readonly type: BucketMetadataExtVariantName;

  static readonly schema: XdrType<BucketMetadataExtWire> = union(
    "BucketMetadataExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_(
          "bucketListType",
          1,
          field("bucketListType", BucketListType.schema),
        ),
      ],
      switchKey: "v",
    },
  );

  static v0(): BucketMetadataExtV0 {
    return new BucketMetadataExtV0();
  }

  static bucketListType(
    bucketListType: BucketListType,
  ): BucketMetadataExtBucketListtype {
    return new BucketMetadataExtBucketListtype(bucketListType);
  }

  static fromXdrObject(wire: BucketMetadataExtWire): BucketMetadataExt {
    switch (wire.v) {
      case 0:
        return new BucketMetadataExtV0();
      case 1:
        return new BucketMetadataExtBucketListtype(
          BucketListType.fromXdrObject(wire.bucketListType),
        );
    }
  }

  abstract toXdrObject(): BucketMetadataExtWire;
}

export class BucketMetadataExtV0 extends BucketMetadataExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<BucketMetadataExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class BucketMetadataExtBucketListtype extends BucketMetadataExtBase {
  readonly type = "bucketListType" as const;
  readonly bucketListType: BucketListType;

  constructor(bucketListType: BucketListType) {
    super();
    this.bucketListType = bucketListType;
  }

  get value(): BucketListType {
    return this.bucketListType;
  }

  toXdrObject(): Extract<BucketMetadataExtWire, { v: 1 }> {
    return { v: 1, bucketListType: this.bucketListType.toXdrObject() };
  }
}

export type BucketMetadataExt =
  | BucketMetadataExtV0
  | BucketMetadataExtBucketListtype;
export const BucketMetadataExt = BucketMetadataExtBase;
