/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { array } from "../types/array.js";
import { int32 } from "../types/int32.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { OperationMeta, type OperationMetaWire } from "./operation-meta.js";
import {
  TransactionMetaV1,
  type TransactionMetaV1Wire,
} from "./transaction-meta-v1.js";
import {
  TransactionMetaV2,
  type TransactionMetaV2Wire,
} from "./transaction-meta-v2.js";
import {
  TransactionMetaV3,
  type TransactionMetaV3Wire,
} from "./transaction-meta-v3.js";
import {
  TransactionMetaV4,
  type TransactionMetaV4Wire,
} from "./transaction-meta-v4.js";

export type TransactionMetaWire =
  | { v: 0; operations: OperationMetaWire[] }
  | { v: 1; v1: TransactionMetaV1Wire }
  | { v: 2; v2: TransactionMetaV2Wire }
  | { v: 3; v3: TransactionMetaV3Wire }
  | { v: 4; v4: TransactionMetaV4Wire };

export type TransactionMetaVariantName =
  | "operations"
  | "v1"
  | "v2"
  | "v3"
  | "v4";

/**
 * ```xdr
 * union TransactionMeta switch (int v)
 * {
 * case 0:
 *     OperationMeta operations<>;
 * case 1:
 *     TransactionMetaV1 v1;
 * case 2:
 *     TransactionMetaV2 v2;
 * case 3:
 *     TransactionMetaV3 v3;
 * case 4:
 *     TransactionMetaV4 v4;
 * };
 * ```
 */
abstract class TransactionMetaBase extends XdrValue {
  abstract readonly type: TransactionMetaVariantName;

  static readonly schema: XdrType<TransactionMetaWire> = union(
    "TransactionMeta",
    {
      switchOn: int32(),
      cases: [
        case_(
          "operations",
          0,
          field(
            "operations",
            array(OperationMeta.schema, UNBOUNDED_MAX_LENGTH),
          ),
        ),
        case_("v1", 1, field("v1", TransactionMetaV1.schema)),
        case_("v2", 2, field("v2", TransactionMetaV2.schema)),
        case_("v3", 3, field("v3", TransactionMetaV3.schema)),
        case_("v4", 4, field("v4", TransactionMetaV4.schema)),
      ],
      switchKey: "v",
    },
  );

  static operations(operations: OperationMeta[]): TransactionMetaOperations {
    return new TransactionMetaOperations(operations);
  }

  static v1(v1: TransactionMetaV1): TransactionMetaV1Arm {
    return new TransactionMetaV1Arm(v1);
  }

  static v2(v2: TransactionMetaV2): TransactionMetaV2Arm {
    return new TransactionMetaV2Arm(v2);
  }

  static v3(v3: TransactionMetaV3): TransactionMetaV3Arm {
    return new TransactionMetaV3Arm(v3);
  }

  static v4(v4: TransactionMetaV4): TransactionMetaV4Arm {
    return new TransactionMetaV4Arm(v4);
  }

  static fromXdrObject(wire: TransactionMetaWire): TransactionMeta {
    switch (wire.v) {
      case 0:
        return new TransactionMetaOperations(
          wire.operations.map((w) => OperationMeta.fromXdrObject(w)),
        );
      case 1:
        return new TransactionMetaV1Arm(
          TransactionMetaV1.fromXdrObject(wire.v1),
        );
      case 2:
        return new TransactionMetaV2Arm(
          TransactionMetaV2.fromXdrObject(wire.v2),
        );
      case 3:
        return new TransactionMetaV3Arm(
          TransactionMetaV3.fromXdrObject(wire.v3),
        );
      case 4:
        return new TransactionMetaV4Arm(
          TransactionMetaV4.fromXdrObject(wire.v4),
        );
    }
  }

  abstract toXdrObject(): TransactionMetaWire;
}

export class TransactionMetaOperations extends TransactionMetaBase {
  readonly type = "operations" as const;
  readonly operations: OperationMeta[];

  constructor(operations: OperationMeta[]) {
    super();
    this.operations = operations;
  }

  get value(): OperationMeta[] {
    return this.operations;
  }

  toXdrObject(): Extract<TransactionMetaWire, { v: 0 }> {
    return { v: 0, operations: this.operations.map((v) => v.toXdrObject()) };
  }
}

export class TransactionMetaV1Arm extends TransactionMetaBase {
  readonly type = "v1" as const;
  readonly v1: TransactionMetaV1;

  constructor(v1: TransactionMetaV1) {
    super();
    this.v1 = v1;
  }

  get value(): TransactionMetaV1 {
    return this.v1;
  }

  toXdrObject(): Extract<TransactionMetaWire, { v: 1 }> {
    return { v: 1, v1: this.v1.toXdrObject() };
  }
}

export class TransactionMetaV2Arm extends TransactionMetaBase {
  readonly type = "v2" as const;
  readonly v2: TransactionMetaV2;

  constructor(v2: TransactionMetaV2) {
    super();
    this.v2 = v2;
  }

  get value(): TransactionMetaV2 {
    return this.v2;
  }

  toXdrObject(): Extract<TransactionMetaWire, { v: 2 }> {
    return { v: 2, v2: this.v2.toXdrObject() };
  }
}

export class TransactionMetaV3Arm extends TransactionMetaBase {
  readonly type = "v3" as const;
  readonly v3: TransactionMetaV3;

  constructor(v3: TransactionMetaV3) {
    super();
    this.v3 = v3;
  }

  get value(): TransactionMetaV3 {
    return this.v3;
  }

  toXdrObject(): Extract<TransactionMetaWire, { v: 3 }> {
    return { v: 3, v3: this.v3.toXdrObject() };
  }
}

export class TransactionMetaV4Arm extends TransactionMetaBase {
  readonly type = "v4" as const;
  readonly v4: TransactionMetaV4;

  constructor(v4: TransactionMetaV4) {
    super();
    this.v4 = v4;
  }

  get value(): TransactionMetaV4 {
    return this.v4;
  }

  toXdrObject(): Extract<TransactionMetaWire, { v: 4 }> {
    return { v: 4, v4: this.v4.toXdrObject() };
  }
}

export type TransactionMeta =
  | TransactionMetaOperations
  | TransactionMetaV1Arm
  | TransactionMetaV2Arm
  | TransactionMetaV3Arm
  | TransactionMetaV4Arm;
export const TransactionMeta = TransactionMetaBase;
