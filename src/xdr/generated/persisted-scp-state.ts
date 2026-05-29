/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { int32 } from "../types/int32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  PersistedScpStateV0,
  type PersistedScpStateV0Wire,
} from "./persisted-scp-state-v0.js";
import {
  PersistedScpStateV1,
  type PersistedScpStateV1Wire,
} from "./persisted-scp-state-v1.js";

export type PersistedScpStateWire =
  | { v: 0; v0: PersistedScpStateV0Wire }
  | { v: 1; v1: PersistedScpStateV1Wire };

export type PersistedScpStateVariantName = "v0" | "v1";

/**
 * ```xdr
 * union PersistedSCPState switch (int v)
 * {
 * case 0:
 * 	PersistedSCPStateV0 v0;
 * case 1:
 * 	PersistedSCPStateV1 v1;
 * };
 * ```
 */
abstract class PersistedScpStateBase extends XdrValue {
  abstract readonly type: PersistedScpStateVariantName;

  static readonly schema: XdrType<PersistedScpStateWire> = union(
    "PersistedScpState",
    {
      switchOn: int32(),
      cases: [
        case_("v0", 0, field("v0", PersistedScpStateV0.schema)),
        case_("v1", 1, field("v1", PersistedScpStateV1.schema)),
      ],
      switchKey: "v",
    },
  );

  static v0(v0: PersistedScpStateV0): PersistedScpStateV0Arm {
    return new PersistedScpStateV0Arm(v0);
  }

  static v1(v1: PersistedScpStateV1): PersistedScpStateV1Arm {
    return new PersistedScpStateV1Arm(v1);
  }

  static fromXdrObject(wire: PersistedScpStateWire): PersistedScpState {
    switch (wire.v) {
      case 0:
        return new PersistedScpStateV0Arm(
          PersistedScpStateV0.fromXdrObject(wire.v0),
        );
      case 1:
        return new PersistedScpStateV1Arm(
          PersistedScpStateV1.fromXdrObject(wire.v1),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete PersistedScpState variant.
   * Use this instead of `instanceof PersistedScpState`: the exported `PersistedScpState` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `PersistedScpState.is(x)` narrows to the union.
   */
  static is(value: unknown): value is PersistedScpState {
    return value instanceof PersistedScpStateBase;
  }

  abstract toXdrObject(): PersistedScpStateWire;
}

export class PersistedScpStateV0Arm extends PersistedScpStateBase {
  readonly type = "v0" as const;
  readonly v0: PersistedScpStateV0;

  constructor(v0: PersistedScpStateV0) {
    super();
    this.v0 = v0;
  }

  get value(): PersistedScpStateV0 {
    return this.v0;
  }

  toXdrObject(): Extract<PersistedScpStateWire, { v: 0 }> {
    return { v: 0, v0: this.v0.toXdrObject() };
  }
}

export class PersistedScpStateV1Arm extends PersistedScpStateBase {
  readonly type = "v1" as const;
  readonly v1: PersistedScpStateV1;

  constructor(v1: PersistedScpStateV1) {
    super();
    this.v1 = v1;
  }

  get value(): PersistedScpStateV1 {
    return this.v1;
  }

  toXdrObject(): Extract<PersistedScpStateWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export type PersistedScpState = PersistedScpStateV0Arm | PersistedScpStateV1Arm;
export const PersistedScpState = PersistedScpStateBase;
