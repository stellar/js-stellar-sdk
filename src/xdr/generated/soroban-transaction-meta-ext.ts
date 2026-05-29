/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  SorobanTransactionMetaExtV1,
  type SorobanTransactionMetaExtV1Wire,
} from "./soroban-transaction-meta-ext-v1.js";

export type SorobanTransactionMetaExtWire =
  | { v: 0 }
  | { v: 1; v1: SorobanTransactionMetaExtV1Wire };

export type SorobanTransactionMetaExtVariantName = "v0" | "v1";

/**
 * ```xdr
 * union SorobanTransactionMetaExt switch (int v)
 * {
 * case 0:
 *     void;
 * case 1:
 *     SorobanTransactionMetaExtV1 v1;
 * };
 * ```
 */
abstract class SorobanTransactionMetaExtBase extends XdrValue {
  abstract readonly type: SorobanTransactionMetaExtVariantName;

  static readonly schema: XdrType<SorobanTransactionMetaExtWire> = union(
    "SorobanTransactionMetaExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v1", 1, field("v1", SorobanTransactionMetaExtV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): SorobanTransactionMetaExtV0 {
    return new SorobanTransactionMetaExtV0();
  }

  static v1(v1: SorobanTransactionMetaExtV1): SorobanTransactionMetaExtV1Arm {
    return new SorobanTransactionMetaExtV1Arm(v1);
  }

  static fromXdrObject(
    wire: SorobanTransactionMetaExtWire,
  ): SorobanTransactionMetaExt {
    switch (wire.v) {
      case 0:
        return new SorobanTransactionMetaExtV0();
      case 1:
        return new SorobanTransactionMetaExtV1Arm(
          SorobanTransactionMetaExtV1.fromXdrObject(wire.v1),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete SorobanTransactionMetaExt variant.
   * Use this instead of `instanceof SorobanTransactionMetaExt`: the exported `SorobanTransactionMetaExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `SorobanTransactionMetaExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is SorobanTransactionMetaExt {
    return value instanceof SorobanTransactionMetaExtBase;
  }

  abstract toXdrObject(): SorobanTransactionMetaExtWire;
}

export class SorobanTransactionMetaExtV0 extends SorobanTransactionMetaExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SorobanTransactionMetaExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class SorobanTransactionMetaExtV1Arm extends SorobanTransactionMetaExtBase {
  readonly type = "v1" as const;
  readonly v1: SorobanTransactionMetaExtV1;

  constructor(v1: SorobanTransactionMetaExtV1) {
    super();
    this.v1 = v1;
  }

  get value(): SorobanTransactionMetaExtV1 {
    return this.v1;
  }

  toXdrObject(): Extract<SorobanTransactionMetaExtWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type SorobanTransactionMetaExt =
  | SorobanTransactionMetaExtV0
  | SorobanTransactionMetaExtV1Arm;
export const SorobanTransactionMetaExt = SorobanTransactionMetaExtBase;
