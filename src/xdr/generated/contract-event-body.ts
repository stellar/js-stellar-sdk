/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ContractEventV0,
  type ContractEventV0Wire,
} from "./contract-event-v0.js";

export type ContractEventBodyWire = { v: 0; v0: ContractEventV0Wire };

export type ContractEventBodyVariantName = "v0";

/**
 * ```xdr
 * union switch (int v)
 *     {
 *     case 0:
 *         struct
 *         {
 *             SCVal topics<>;
 *             SCVal data;
 *         } v0;
 *     }
 * ```
 */
abstract class ContractEventBodyBase extends XdrValue {
  abstract readonly type: ContractEventBodyVariantName;

  static readonly schema: XdrType<ContractEventBodyWire> = union(
    "ContractEventBody",
    {
      switchOn: int32(),
      cases: [case_("v0", 0, field("v0", ContractEventV0.schema))],
      switchKey: "v",
    },
  );

  static v0(v0: ContractEventV0): ContractEventBodyV0 {
    return new ContractEventBodyV0(v0);
  }

  static fromXdrObject(wire: ContractEventBodyWire): ContractEventBody {
    switch (wire.v) {
      case 0:
        return new ContractEventBodyV0(ContractEventV0.fromXdrObject(wire.v0));
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ContractEventBody variant.
   * Use this instead of `instanceof ContractEventBody`: the exported `ContractEventBody` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ContractEventBody.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ContractEventBody {
    return value instanceof ContractEventBodyBase;
  }

  abstract toXdrObject(): ContractEventBodyWire;
}

export class ContractEventBodyV0 extends ContractEventBodyBase {
  readonly type = "v0" as const;
  readonly v0: ContractEventV0;

  constructor(v0: ContractEventV0) {
    super();
    this.v0 = v0;
  }

  get value(): ContractEventV0 {
    return this.v0;
  }

  toXdrObject(): Extract<ContractEventBodyWire, { v: 0 }> {
    return { v: 0, v0: this.v0.toXdrObject() };
  }
}

export type ContractEventBody = ContractEventBodyV0;
export const ContractEventBody = ContractEventBodyBase;
