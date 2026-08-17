/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import {
  case as case_,
  field,
  int32,
  union,
  void as voidType,
} from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
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

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === BucketMetadataExtBase) {
      throw new TypeError(
        "new xdr.BucketMetadataExt(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.BucketMetadataExt.v0() " +
          "(or another arm factory) instead.",
      );
    }
  }

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
  ): BucketMetadataExtBucketListType {
    return new BucketMetadataExtBucketListType(bucketListType);
  }

  static fromXdrObject(wire: BucketMetadataExtWire): BucketMetadataExt {
    switch (wire.v) {
      case 0:
        return new BucketMetadataExtV0();
      case 1:
        return new BucketMetadataExtBucketListType(
          BucketListType.fromXdrObject(wire.bucketListType),
        );
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `BucketMetadataExt: unknown v ${(wire as { v: unknown }).v}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete BucketMetadataExt variant.
   * Use this instead of `instanceof BucketMetadataExt`: the exported `BucketMetadataExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `BucketMetadataExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is BucketMetadataExt {
    return value instanceof BucketMetadataExtBase;
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

export class BucketMetadataExtBucketListType extends BucketMetadataExtBase {
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
  | BucketMetadataExtBucketListType;
export const BucketMetadataExt = BucketMetadataExtBase;
