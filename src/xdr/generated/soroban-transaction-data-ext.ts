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
  SorobanResourcesExtV0,
  type SorobanResourcesExtV0Wire,
} from "./soroban-resources-ext-v0.js";

export type SorobanTransactionDataExtWire =
  | { v: 0 }
  | { v: 1; resourceExt: SorobanResourcesExtV0Wire };

export type SorobanTransactionDataExtVariantName = "v0" | "resourceExt";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     case 1:
 *         SorobanResourcesExtV0 resourceExt;
 *     }
 * ```
 */
abstract class SorobanTransactionDataExtBase extends XdrValue {
  abstract readonly type: SorobanTransactionDataExtVariantName;

  static readonly schema: XdrType<SorobanTransactionDataExtWire> = union(
    "SorobanTransactionDataExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_(
          "resourceExt",
          1,
          field("resourceExt", SorobanResourcesExtV0.schema),
        ),
      ],
      switchKey: "v",
    },
  );

  static v0(): SorobanTransactionDataExtV0 {
    return new SorobanTransactionDataExtV0();
  }

  static resourceExt(
    resourceExt: SorobanResourcesExtV0,
  ): SorobanTransactionDataExtResourceExt {
    return new SorobanTransactionDataExtResourceExt(resourceExt);
  }

  static fromXdrObject(
    wire: SorobanTransactionDataExtWire,
  ): SorobanTransactionDataExt {
    switch (wire.v) {
      case 0:
        return new SorobanTransactionDataExtV0();
      case 1:
        return new SorobanTransactionDataExtResourceExt(
          SorobanResourcesExtV0.fromXdrObject(wire.resourceExt),
        );
    }
  }

  abstract toXdrObject(): SorobanTransactionDataExtWire;
}

export class SorobanTransactionDataExtV0 extends SorobanTransactionDataExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<SorobanTransactionDataExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class SorobanTransactionDataExtResourceExt extends SorobanTransactionDataExtBase {
  readonly type = "resourceExt" as const;
  readonly resourceExt: SorobanResourcesExtV0;

  constructor(resourceExt: SorobanResourcesExtV0) {
    super();
    this.resourceExt = resourceExt;
  }

  get value(): SorobanResourcesExtV0 {
    return this.resourceExt;
  }

  toXdrObject(): Extract<SorobanTransactionDataExtWire, { v: 1 }> {
    return { v: 1, resourceExt: this.resourceExt.toXdrObject() };
  }
}

export type SorobanTransactionDataExt =
  | SorobanTransactionDataExtV0
  | SorobanTransactionDataExtResourceExt;
export const SorobanTransactionDataExt = SorobanTransactionDataExtBase;
