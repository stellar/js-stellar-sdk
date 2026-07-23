/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ScSpecEntryKind } from "./sc-spec-entry-kind.js";
import {
  ScSpecFunctionV0,
  type ScSpecFunctionV0Wire,
} from "./sc-spec-function-v0.js";
import {
  ScSpecUdtStructV0,
  type ScSpecUdtStructV0Wire,
} from "./sc-spec-udt-struct-v0.js";
import {
  ScSpecUdtUnionV0,
  type ScSpecUdtUnionV0Wire,
} from "./sc-spec-udt-union-v0.js";
import {
  ScSpecUdtEnumV0,
  type ScSpecUdtEnumV0Wire,
} from "./sc-spec-udt-enum-v0.js";
import {
  ScSpecUdtErrorEnumV0,
  type ScSpecUdtErrorEnumV0Wire,
} from "./sc-spec-udt-error-enum-v0.js";
import { ScSpecEventV0, type ScSpecEventV0Wire } from "./sc-spec-event-v0.js";

export type ScSpecEntryWire =
  | { kind: 0; functionV0: ScSpecFunctionV0Wire }
  | { kind: 1; udtStructV0: ScSpecUdtStructV0Wire }
  | { kind: 2; udtUnionV0: ScSpecUdtUnionV0Wire }
  | { kind: 3; udtEnumV0: ScSpecUdtEnumV0Wire }
  | { kind: 4; udtErrorEnumV0: ScSpecUdtErrorEnumV0Wire }
  | { kind: 5; eventV0: ScSpecEventV0Wire };

export type ScSpecEntryVariantName =
  | "scSpecEntryFunctionV0"
  | "scSpecEntryUdtStructV0"
  | "scSpecEntryUdtUnionV0"
  | "scSpecEntryUdtEnumV0"
  | "scSpecEntryUdtErrorEnumV0"
  | "scSpecEntryEventV0";

/**
 * ```xdr
 * union SCSpecEntry switch (SCSpecEntryKind kind)
 * {
 * case SC_SPEC_ENTRY_FUNCTION_V0:
 *     SCSpecFunctionV0 functionV0;
 * case SC_SPEC_ENTRY_UDT_STRUCT_V0:
 *     SCSpecUDTStructV0 udtStructV0;
 * case SC_SPEC_ENTRY_UDT_UNION_V0:
 *     SCSpecUDTUnionV0 udtUnionV0;
 * case SC_SPEC_ENTRY_UDT_ENUM_V0:
 *     SCSpecUDTEnumV0 udtEnumV0;
 * case SC_SPEC_ENTRY_UDT_ERROR_ENUM_V0:
 *     SCSpecUDTErrorEnumV0 udtErrorEnumV0;
 * case SC_SPEC_ENTRY_EVENT_V0:
 *     SCSpecEventV0 eventV0;
 * };
 * ```
 */
abstract class ScSpecEntryBase extends XdrValue {
  abstract readonly type: ScSpecEntryVariantName;

  static readonly schema: XdrType<ScSpecEntryWire> = union("ScSpecEntry", {
    switchOn: ScSpecEntryKind.schema,
    cases: [
      case_(
        "scSpecEntryFunctionV0",
        0,
        field("functionV0", ScSpecFunctionV0.schema),
      ),
      case_(
        "scSpecEntryUdtStructV0",
        1,
        field("udtStructV0", ScSpecUdtStructV0.schema),
      ),
      case_(
        "scSpecEntryUdtUnionV0",
        2,
        field("udtUnionV0", ScSpecUdtUnionV0.schema),
      ),
      case_(
        "scSpecEntryUdtEnumV0",
        3,
        field("udtEnumV0", ScSpecUdtEnumV0.schema),
      ),
      case_(
        "scSpecEntryUdtErrorEnumV0",
        4,
        field("udtErrorEnumV0", ScSpecUdtErrorEnumV0.schema),
      ),
      case_("scSpecEntryEventV0", 5, field("eventV0", ScSpecEventV0.schema)),
    ],
    switchKey: "kind",
  });

  static scSpecEntryFunctionV0(
    functionV0: ScSpecFunctionV0,
  ): ScSpecEntryFunctionV0 {
    return new ScSpecEntryFunctionV0(functionV0);
  }

  static scSpecEntryUdtStructV0(
    udtStructV0: ScSpecUdtStructV0,
  ): ScSpecEntryUdtStructV0 {
    return new ScSpecEntryUdtStructV0(udtStructV0);
  }

  static scSpecEntryUdtUnionV0(
    udtUnionV0: ScSpecUdtUnionV0,
  ): ScSpecEntryUdtUnionV0 {
    return new ScSpecEntryUdtUnionV0(udtUnionV0);
  }

  static scSpecEntryUdtEnumV0(
    udtEnumV0: ScSpecUdtEnumV0,
  ): ScSpecEntryUdtEnumV0 {
    return new ScSpecEntryUdtEnumV0(udtEnumV0);
  }

  static scSpecEntryUdtErrorEnumV0(
    udtErrorEnumV0: ScSpecUdtErrorEnumV0,
  ): ScSpecEntryUdtErrorEnumV0 {
    return new ScSpecEntryUdtErrorEnumV0(udtErrorEnumV0);
  }

  static scSpecEntryEventV0(eventV0: ScSpecEventV0): ScSpecEntryEventV0 {
    return new ScSpecEntryEventV0(eventV0);
  }

  static fromXdrObject(wire: ScSpecEntryWire): ScSpecEntry {
    switch (wire.kind) {
      case 0:
        return new ScSpecEntryFunctionV0(
          ScSpecFunctionV0.fromXdrObject(wire.functionV0),
        );
      case 1:
        return new ScSpecEntryUdtStructV0(
          ScSpecUdtStructV0.fromXdrObject(wire.udtStructV0),
        );
      case 2:
        return new ScSpecEntryUdtUnionV0(
          ScSpecUdtUnionV0.fromXdrObject(wire.udtUnionV0),
        );
      case 3:
        return new ScSpecEntryUdtEnumV0(
          ScSpecUdtEnumV0.fromXdrObject(wire.udtEnumV0),
        );
      case 4:
        return new ScSpecEntryUdtErrorEnumV0(
          ScSpecUdtErrorEnumV0.fromXdrObject(wire.udtErrorEnumV0),
        );
      case 5:
        return new ScSpecEntryEventV0(
          ScSpecEventV0.fromXdrObject(wire.eventV0),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ScSpecEntry variant.
   * Use this instead of `instanceof ScSpecEntry`: the exported `ScSpecEntry` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ScSpecEntry.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ScSpecEntry {
    return value instanceof ScSpecEntryBase;
  }

  abstract toXdrObject(): ScSpecEntryWire;
}

export class ScSpecEntryFunctionV0 extends ScSpecEntryBase {
  readonly type = "scSpecEntryFunctionV0" as const;
  readonly functionV0: ScSpecFunctionV0;

  constructor(functionV0: ScSpecFunctionV0) {
    super();
    this.functionV0 = functionV0;
  }

  get value(): ScSpecFunctionV0 {
    return this.functionV0;
  }

  toXdrObject(): Extract<ScSpecEntryWire, { kind: 0 }> {
    return { kind: 0, functionV0: this.functionV0.toXdrObject() };
  }
}

export class ScSpecEntryUdtStructV0 extends ScSpecEntryBase {
  readonly type = "scSpecEntryUdtStructV0" as const;
  readonly udtStructV0: ScSpecUdtStructV0;

  constructor(udtStructV0: ScSpecUdtStructV0) {
    super();
    this.udtStructV0 = udtStructV0;
  }

  get value(): ScSpecUdtStructV0 {
    return this.udtStructV0;
  }

  toXdrObject(): Extract<ScSpecEntryWire, { kind: 1 }> {
    return { kind: 1, udtStructV0: this.udtStructV0.toXdrObject() };
  }
}

export class ScSpecEntryUdtUnionV0 extends ScSpecEntryBase {
  readonly type = "scSpecEntryUdtUnionV0" as const;
  readonly udtUnionV0: ScSpecUdtUnionV0;

  constructor(udtUnionV0: ScSpecUdtUnionV0) {
    super();
    this.udtUnionV0 = udtUnionV0;
  }

  get value(): ScSpecUdtUnionV0 {
    return this.udtUnionV0;
  }

  toXdrObject(): Extract<ScSpecEntryWire, { kind: 2 }> {
    return { kind: 2, udtUnionV0: this.udtUnionV0.toXdrObject() };
  }
}

export class ScSpecEntryUdtEnumV0 extends ScSpecEntryBase {
  readonly type = "scSpecEntryUdtEnumV0" as const;
  readonly udtEnumV0: ScSpecUdtEnumV0;

  constructor(udtEnumV0: ScSpecUdtEnumV0) {
    super();
    this.udtEnumV0 = udtEnumV0;
  }

  get value(): ScSpecUdtEnumV0 {
    return this.udtEnumV0;
  }

  toXdrObject(): Extract<ScSpecEntryWire, { kind: 3 }> {
    return { kind: 3, udtEnumV0: this.udtEnumV0.toXdrObject() };
  }
}

export class ScSpecEntryUdtErrorEnumV0 extends ScSpecEntryBase {
  readonly type = "scSpecEntryUdtErrorEnumV0" as const;
  readonly udtErrorEnumV0: ScSpecUdtErrorEnumV0;

  constructor(udtErrorEnumV0: ScSpecUdtErrorEnumV0) {
    super();
    this.udtErrorEnumV0 = udtErrorEnumV0;
  }

  get value(): ScSpecUdtErrorEnumV0 {
    return this.udtErrorEnumV0;
  }

  toXdrObject(): Extract<ScSpecEntryWire, { kind: 4 }> {
    return { kind: 4, udtErrorEnumV0: this.udtErrorEnumV0.toXdrObject() };
  }
}

export class ScSpecEntryEventV0 extends ScSpecEntryBase {
  readonly type = "scSpecEntryEventV0" as const;
  readonly eventV0: ScSpecEventV0;

  constructor(eventV0: ScSpecEventV0) {
    super();
    this.eventV0 = eventV0;
  }

  get value(): ScSpecEventV0 {
    return this.eventV0;
  }

  toXdrObject(): Extract<ScSpecEntryWire, { kind: 5 }> {
    return { kind: 5, eventV0: this.eventV0.toXdrObject() };
  }
}

export type ScSpecEntry =
  | ScSpecEntryFunctionV0
  | ScSpecEntryUdtStructV0
  | ScSpecEntryUdtUnionV0
  | ScSpecEntryUdtEnumV0
  | ScSpecEntryUdtErrorEnumV0
  | ScSpecEntryEventV0;
export const ScSpecEntry = ScSpecEntryBase;
