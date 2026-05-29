/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScErrorType } from "./sc-error-type.js";
import { ScErrorCode, type ScErrorCodeWire } from "./sc-error-code.js";

export type ScErrorWire =
  | { type: 0; contractCode: number }
  | { type: 1; code: ScErrorCodeWire }
  | { type: 2; code: ScErrorCodeWire }
  | { type: 3; code: ScErrorCodeWire }
  | { type: 4; code: ScErrorCodeWire }
  | { type: 5; code: ScErrorCodeWire }
  | { type: 6; code: ScErrorCodeWire }
  | { type: 7; code: ScErrorCodeWire }
  | { type: 8; code: ScErrorCodeWire }
  | { type: 9; code: ScErrorCodeWire };

export type ScErrorVariantName =
  | "sceContract"
  | "sceWasmVm"
  | "sceContext"
  | "sceStorage"
  | "sceObject"
  | "sceCrypto"
  | "sceEvents"
  | "sceBudget"
  | "sceValue"
  | "sceAuth";

/**
 * ```xdr
 * union SCError switch (SCErrorType type)
 * {
 * case SCE_CONTRACT:
 *     uint32 contractCode;
 * case SCE_WASM_VM:
 * case SCE_CONTEXT:
 * case SCE_STORAGE:
 * case SCE_OBJECT:
 * case SCE_CRYPTO:
 * case SCE_EVENTS:
 * case SCE_BUDGET:
 * case SCE_VALUE:
 * case SCE_AUTH:
 *     SCErrorCode code;
 * };
 * ```
 */
abstract class ScErrorBase extends XdrValue {
  abstract readonly type: ScErrorVariantName;

  static readonly schema: XdrType<ScErrorWire> = union("ScError", {
    switchOn: ScErrorType.schema,
    cases: [
      case_("sceContract", 0, field("contractCode", uint32())),
      case_("sceWasmVm", 1, field("code", ScErrorCode.schema)),
      case_("sceContext", 2, field("code", ScErrorCode.schema)),
      case_("sceStorage", 3, field("code", ScErrorCode.schema)),
      case_("sceObject", 4, field("code", ScErrorCode.schema)),
      case_("sceCrypto", 5, field("code", ScErrorCode.schema)),
      case_("sceEvents", 6, field("code", ScErrorCode.schema)),
      case_("sceBudget", 7, field("code", ScErrorCode.schema)),
      case_("sceValue", 8, field("code", ScErrorCode.schema)),
      case_("sceAuth", 9, field("code", ScErrorCode.schema)),
    ],
  });

  static sceContract(contractCode: number): ScErrorContract {
    return new ScErrorContract(contractCode);
  }

  static sceWasmVm(code: ScErrorCode): ScErrorWasmVm {
    return new ScErrorWasmVm(code);
  }

  static sceContext(code: ScErrorCode): ScErrorContext {
    return new ScErrorContext(code);
  }

  static sceStorage(code: ScErrorCode): ScErrorStorage {
    return new ScErrorStorage(code);
  }

  static sceObject(code: ScErrorCode): ScErrorObject {
    return new ScErrorObject(code);
  }

  static sceCrypto(code: ScErrorCode): ScErrorCrypto {
    return new ScErrorCrypto(code);
  }

  static sceEvents(code: ScErrorCode): ScErrorEvents {
    return new ScErrorEvents(code);
  }

  static sceBudget(code: ScErrorCode): ScErrorBudget {
    return new ScErrorBudget(code);
  }

  static sceValue(code: ScErrorCode): ScErrorValue {
    return new ScErrorValue(code);
  }

  static sceAuth(code: ScErrorCode): ScErrorAuth {
    return new ScErrorAuth(code);
  }

  static fromXdrObject(wire: ScErrorWire): ScError {
    switch (wire.type) {
      case 0:
        return new ScErrorContract(wire.contractCode);
      case 1:
        return new ScErrorWasmVm(ScErrorCode.fromXdrObject(wire.code));
      case 2:
        return new ScErrorContext(ScErrorCode.fromXdrObject(wire.code));
      case 3:
        return new ScErrorStorage(ScErrorCode.fromXdrObject(wire.code));
      case 4:
        return new ScErrorObject(ScErrorCode.fromXdrObject(wire.code));
      case 5:
        return new ScErrorCrypto(ScErrorCode.fromXdrObject(wire.code));
      case 6:
        return new ScErrorEvents(ScErrorCode.fromXdrObject(wire.code));
      case 7:
        return new ScErrorBudget(ScErrorCode.fromXdrObject(wire.code));
      case 8:
        return new ScErrorValue(ScErrorCode.fromXdrObject(wire.code));
      case 9:
        return new ScErrorAuth(ScErrorCode.fromXdrObject(wire.code));
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ScError variant.
   * Use this instead of `instanceof ScError`: the exported `ScError` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ScError.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ScError {
    return value instanceof ScErrorBase;
  }

  abstract toXdrObject(): ScErrorWire;
}

export class ScErrorContract extends ScErrorBase {
  readonly type = "sceContract" as const;
  readonly contractCode: number;

  constructor(contractCode: number) {
    super();
    this.contractCode = contractCode;
  }

  get value(): number {
    return this.contractCode;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 0 }> {
    return { type: 0, contractCode: this.contractCode };
  }
}

export class ScErrorWasmVm extends ScErrorBase {
  readonly type = "sceWasmVm" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 1 }> {
    return { type: 1, code: this.code.toXdrObject() };
  }
}

export class ScErrorContext extends ScErrorBase {
  readonly type = "sceContext" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 2 }> {
    return { type: 2, code: this.code.toXdrObject() };
  }
}

export class ScErrorStorage extends ScErrorBase {
  readonly type = "sceStorage" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 3 }> {
    return { type: 3, code: this.code.toXdrObject() };
  }
}

export class ScErrorObject extends ScErrorBase {
  readonly type = "sceObject" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 4 }> {
    return { type: 4, code: this.code.toXdrObject() };
  }
}

export class ScErrorCrypto extends ScErrorBase {
  readonly type = "sceCrypto" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 5 }> {
    return { type: 5, code: this.code.toXdrObject() };
  }
}

export class ScErrorEvents extends ScErrorBase {
  readonly type = "sceEvents" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 6 }> {
    return { type: 6, code: this.code.toXdrObject() };
  }
}

export class ScErrorBudget extends ScErrorBase {
  readonly type = "sceBudget" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 7 }> {
    return { type: 7, code: this.code.toXdrObject() };
  }
}

export class ScErrorValue extends ScErrorBase {
  readonly type = "sceValue" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 8 }> {
    return { type: 8, code: this.code.toXdrObject() };
  }
}

export class ScErrorAuth extends ScErrorBase {
  readonly type = "sceAuth" as const;
  readonly code: ScErrorCode;

  constructor(code: ScErrorCode) {
    super();
    this.code = code;
  }

  get value(): ScErrorCode {
    return this.code;
  }

  toXdrObject(): Extract<ScErrorWire, { type: 9 }> {
    return { type: 9, code: this.code.toXdrObject() };
  }
}

export type ScError =
  | ScErrorContract
  | ScErrorWasmVm
  | ScErrorContext
  | ScErrorStorage
  | ScErrorObject
  | ScErrorCrypto
  | ScErrorEvents
  | ScErrorBudget
  | ScErrorValue
  | ScErrorAuth;
export const ScError = ScErrorBase;
