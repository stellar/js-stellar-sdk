/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { array, case as case_, field, int32, union } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { TxSetComponent, type TxSetComponentWire } from "./tx-set-component.js";
import {
  ParallelTxsComponent,
  type ParallelTxsComponentWire,
} from "./parallel-txs-component.js";

export type TransactionPhaseWire =
  | { v: 0; v0Components: TxSetComponentWire[] }
  | { v: 1; parallelTxsComponent: ParallelTxsComponentWire };

export type TransactionPhaseVariantName =
  | "v0Components"
  | "parallelTxsComponent";

/**
 * ```xdr
 * union TransactionPhase switch (int v)
 * {
 * case 0:
 *     TxSetComponent v0Components<>;
 * case 1:
 *     ParallelTxsComponent parallelTxsComponent;
 * };
 * ```
 */
abstract class TransactionPhaseBase extends XdrValue {
  abstract readonly type: TransactionPhaseVariantName;

  static readonly schema: XdrType<TransactionPhaseWire> = union(
    "TransactionPhase",
    {
      switchOn: int32(),
      cases: [
        case_(
          "v0Components",
          0,
          field(
            "v0Components",
            array(TxSetComponent.schema, UNBOUNDED_MAX_LENGTH),
          ),
        ),
        case_(
          "parallelTxsComponent",
          1,
          field("parallelTxsComponent", ParallelTxsComponent.schema),
        ),
      ],
      switchKey: "v",
    },
  );

  static v0Components(
    v0Components: TxSetComponent[],
  ): TransactionPhaseV0Components {
    return new TransactionPhaseV0Components(v0Components);
  }

  static parallelTxsComponent(
    parallelTxsComponent: ParallelTxsComponent,
  ): TransactionPhaseParallelTxsComponent {
    return new TransactionPhaseParallelTxsComponent(parallelTxsComponent);
  }

  static fromXdrObject(wire: TransactionPhaseWire): TransactionPhase {
    switch (wire.v) {
      case 0:
        return new TransactionPhaseV0Components(
          wire.v0Components.map((w) => TxSetComponent.fromXdrObject(w)),
        );
      case 1:
        return new TransactionPhaseParallelTxsComponent(
          ParallelTxsComponent.fromXdrObject(wire.parallelTxsComponent),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete TransactionPhase variant.
   * Use this instead of `instanceof TransactionPhase`: the exported `TransactionPhase` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `TransactionPhase.is(x)` narrows to the union.
   */
  static is(value: unknown): value is TransactionPhase {
    return value instanceof TransactionPhaseBase;
  }

  abstract toXdrObject(): TransactionPhaseWire;
}

export class TransactionPhaseV0Components extends TransactionPhaseBase {
  readonly type = "v0Components" as const;
  readonly v0Components: TxSetComponent[];

  constructor(v0Components: TxSetComponent[]) {
    super();
    this.v0Components = v0Components;
  }

  get value(): TxSetComponent[] {
    return this.v0Components;
  }

  toXdrObject(): Extract<TransactionPhaseWire, { v: 0 }> {
    return {
      v: 0,
      v0Components: this.v0Components.map((v) => v.toXdrObject()),
    };
  }
}

export class TransactionPhaseParallelTxsComponent extends TransactionPhaseBase {
  readonly type = "parallelTxsComponent" as const;
  readonly parallelTxsComponent: ParallelTxsComponent;

  constructor(parallelTxsComponent: ParallelTxsComponent) {
    super();
    this.parallelTxsComponent = parallelTxsComponent;
  }

  get value(): ParallelTxsComponent {
    return this.parallelTxsComponent;
  }

  toXdrObject(): Extract<TransactionPhaseWire, { v: 1 }> {
    return {
      v: 1,
      parallelTxsComponent: this.parallelTxsComponent.toXdrObject(),
    };
  }
}

export type TransactionPhase =
  | TransactionPhaseV0Components
  | TransactionPhaseParallelTxsComponent;
export const TransactionPhase = TransactionPhaseBase;
