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
  ContractCodeEntryV1,
  type ContractCodeEntryV1Wire,
} from "./contract-code-entry-v1.js";

export type ContractCodeEntryExtWire =
  | { v: 0 }
  | { v: 1; v1: ContractCodeEntryV1Wire };

export type ContractCodeEntryExtVariantName = "v0" | "v1";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *         case 0:
 *             void;
 *         case 1:
 *             struct
 *             {
 *                 ExtensionPoint ext;
 *                 ContractCodeCostInputs costInputs;
 *             } v1;
 *     }
 * ```
 */
abstract class ContractCodeEntryExtBase extends XdrValue {
  abstract readonly type: ContractCodeEntryExtVariantName;

  static readonly schema: XdrType<ContractCodeEntryExtWire> = union(
    "ContractCodeEntryExt",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, voidType()),
        case_("v1", 1, field("v1", ContractCodeEntryV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(): ContractCodeEntryExtV0 {
    return new ContractCodeEntryExtV0();
  }

  static v1(v1: ContractCodeEntryV1): ContractCodeEntryExtV1 {
    return new ContractCodeEntryExtV1(v1);
  }

  static fromXdrObject(wire: ContractCodeEntryExtWire): ContractCodeEntryExt {
    switch (wire.v) {
      case 0:
        return new ContractCodeEntryExtV0();
      case 1:
        return new ContractCodeEntryExtV1(
          ContractCodeEntryV1.fromXdrObject(wire.v1),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ContractCodeEntryExt variant.
   * Use this instead of `instanceof ContractCodeEntryExt`: the exported `ContractCodeEntryExt` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ContractCodeEntryExt.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ContractCodeEntryExt {
    return value instanceof ContractCodeEntryExtBase;
  }

  abstract toXdrObject(): ContractCodeEntryExtWire;
}

export class ContractCodeEntryExtV0 extends ContractCodeEntryExtBase {
  readonly type = "v0" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ContractCodeEntryExtWire, { v: 0 }> {
    return { v: 0 };
  }
}

export class ContractCodeEntryExtV1 extends ContractCodeEntryExtBase {
  readonly type = "v1" as const;
  readonly v1: ContractCodeEntryV1;

  constructor(v1: ContractCodeEntryV1) {
    super();
    this.v1 = v1;
  }

  get value(): ContractCodeEntryV1 {
    return this.v1;
  }

  toXdrObject(): Extract<ContractCodeEntryExtWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type ContractCodeEntryExt =
  | ContractCodeEntryExtV0
  | ContractCodeEntryExtV1;
export const ContractCodeEntryExt = ContractCodeEntryExtBase;
