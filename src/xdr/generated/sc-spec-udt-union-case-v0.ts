/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ScSpecUdtUnionCaseV0Kind } from "./sc-spec-udt-union-case-v0-kind.js";
import {
  ScSpecUdtUnionCaseVoidV0,
  type ScSpecUdtUnionCaseVoidV0Wire,
} from "./sc-spec-udt-union-case-void-v0.js";
import {
  ScSpecUdtUnionCaseTupleV0,
  type ScSpecUdtUnionCaseTupleV0Wire,
} from "./sc-spec-udt-union-case-tuple-v0.js";

export type ScSpecUdtUnionCaseV0Wire =
  | { kind: 0; voidCase: ScSpecUdtUnionCaseVoidV0Wire }
  | { kind: 1; tupleCase: ScSpecUdtUnionCaseTupleV0Wire };

export type ScSpecUdtUnionCaseV0VariantName =
  | "scSpecUdtUnionCaseVoidV0"
  | "scSpecUdtUnionCaseTupleV0";

/**
 * ```xdr
 * union SCSpecUDTUnionCaseV0 switch (SCSpecUDTUnionCaseV0Kind kind)
 * {
 * case SC_SPEC_UDT_UNION_CASE_VOID_V0:
 *     SCSpecUDTUnionCaseVoidV0 voidCase;
 * case SC_SPEC_UDT_UNION_CASE_TUPLE_V0:
 *     SCSpecUDTUnionCaseTupleV0 tupleCase;
 * };
 * ```
 */
abstract class ScSpecUdtUnionCaseV0Base extends XdrValue {
  abstract readonly type: ScSpecUdtUnionCaseV0VariantName;

  static readonly schema: XdrType<ScSpecUdtUnionCaseV0Wire> = union(
    "ScSpecUdtUnionCaseV0",
    {
      switchOn: ScSpecUdtUnionCaseV0Kind.schema,
      cases: [
        case_(
          "scSpecUdtUnionCaseVoidV0",
          0,
          field("voidCase", ScSpecUdtUnionCaseVoidV0.schema),
        ),
        case_(
          "scSpecUdtUnionCaseTupleV0",
          1,
          field("tupleCase", ScSpecUdtUnionCaseTupleV0.schema),
        ),
      ],
      switchKey: "kind",
    },
  );

  static scSpecUdtUnionCaseVoidV0(
    voidCase: ScSpecUdtUnionCaseVoidV0,
  ): ScSpecUdtUnionCaseV0VoidV0 {
    return new ScSpecUdtUnionCaseV0VoidV0(voidCase);
  }

  static scSpecUdtUnionCaseTupleV0(
    tupleCase: ScSpecUdtUnionCaseTupleV0,
  ): ScSpecUdtUnionCaseV0TupleV0 {
    return new ScSpecUdtUnionCaseV0TupleV0(tupleCase);
  }

  static fromXdrObject(wire: ScSpecUdtUnionCaseV0Wire): ScSpecUdtUnionCaseV0 {
    switch (wire.kind) {
      case 0:
        return new ScSpecUdtUnionCaseV0VoidV0(
          ScSpecUdtUnionCaseVoidV0.fromXdrObject(wire.voidCase),
        );
      case 1:
        return new ScSpecUdtUnionCaseV0TupleV0(
          ScSpecUdtUnionCaseTupleV0.fromXdrObject(wire.tupleCase),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ScSpecUdtUnionCaseV0 variant.
   * Use this instead of `instanceof ScSpecUdtUnionCaseV0`: the exported `ScSpecUdtUnionCaseV0` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ScSpecUdtUnionCaseV0.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ScSpecUdtUnionCaseV0 {
    return value instanceof ScSpecUdtUnionCaseV0Base;
  }

  abstract toXdrObject(): ScSpecUdtUnionCaseV0Wire;
}

export class ScSpecUdtUnionCaseV0VoidV0 extends ScSpecUdtUnionCaseV0Base {
  readonly type = "scSpecUdtUnionCaseVoidV0" as const;
  readonly voidCase: ScSpecUdtUnionCaseVoidV0;

  constructor(voidCase: ScSpecUdtUnionCaseVoidV0) {
    super();
    this.voidCase = voidCase;
  }

  get value(): ScSpecUdtUnionCaseVoidV0 {
    return this.voidCase;
  }

  toXdrObject(): Extract<ScSpecUdtUnionCaseV0Wire, { kind: 0 }> {
    return { kind: 0, voidCase: this.voidCase.toXdrObject() };
  }
}

export class ScSpecUdtUnionCaseV0TupleV0 extends ScSpecUdtUnionCaseV0Base {
  readonly type = "scSpecUdtUnionCaseTupleV0" as const;
  readonly tupleCase: ScSpecUdtUnionCaseTupleV0;

  constructor(tupleCase: ScSpecUdtUnionCaseTupleV0) {
    super();
    this.tupleCase = tupleCase;
  }

  get value(): ScSpecUdtUnionCaseTupleV0 {
    return this.tupleCase;
  }

  toXdrObject(): Extract<ScSpecUdtUnionCaseV0Wire, { kind: 1 }> {
    return { kind: 1, tupleCase: this.tupleCase.toXdrObject() };
  }
}

export type ScSpecUdtUnionCaseV0 =
  | ScSpecUdtUnionCaseV0VoidV0
  | ScSpecUdtUnionCaseV0TupleV0;
export const ScSpecUdtUnionCaseV0 = ScSpecUdtUnionCaseV0Base;
