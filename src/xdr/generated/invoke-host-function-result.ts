/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { InvokeHostFunctionResultCode } from "./invoke-host-function-result-code.js";
import { Hash, type HashWire } from "./hash.js";

export type InvokeHostFunctionResultWire =
  | { code: 0; success: HashWire }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 };

export type InvokeHostFunctionResultVariantName =
  | "invokeHostFunctionSuccess"
  | "invokeHostFunctionMalformed"
  | "invokeHostFunctionTrapped"
  | "invokeHostFunctionResourceLimitExceeded"
  | "invokeHostFunctionEntryArchived"
  | "invokeHostFunctionInsufficientRefundableFee";

/**
 * ```xdr
 * union InvokeHostFunctionResult switch (InvokeHostFunctionResultCode code)
 * {
 * case INVOKE_HOST_FUNCTION_SUCCESS:
 *     Hash success; // sha256(InvokeHostFunctionSuccessPreImage)
 * case INVOKE_HOST_FUNCTION_MALFORMED:
 * case INVOKE_HOST_FUNCTION_TRAPPED:
 * case INVOKE_HOST_FUNCTION_RESOURCE_LIMIT_EXCEEDED:
 * case INVOKE_HOST_FUNCTION_ENTRY_ARCHIVED:
 * case INVOKE_HOST_FUNCTION_INSUFFICIENT_REFUNDABLE_FEE:
 *     void;
 * };
 * ```
 */
abstract class InvokeHostFunctionResultBase extends XdrValue {
  abstract readonly type: InvokeHostFunctionResultVariantName;

  static readonly schema: XdrType<InvokeHostFunctionResultWire> = union(
    "InvokeHostFunctionResult",
    {
      switchOn: InvokeHostFunctionResultCode.schema,
      cases: [
        case_("invokeHostFunctionSuccess", 0, field("success", Hash.schema)),
        case_("invokeHostFunctionMalformed", -1, voidType()),
        case_("invokeHostFunctionTrapped", -2, voidType()),
        case_("invokeHostFunctionResourceLimitExceeded", -3, voidType()),
        case_("invokeHostFunctionEntryArchived", -4, voidType()),
        case_("invokeHostFunctionInsufficientRefundableFee", -5, voidType()),
      ],
      switchKey: "code",
    },
  );

  static invokeHostFunctionSuccess(
    success: Hash | Uint8Array | string,
  ): InvokeHostFunctionResultSuccess {
    return new InvokeHostFunctionResultSuccess(success);
  }

  static invokeHostFunctionMalformed(): InvokeHostFunctionResultMalformed {
    return new InvokeHostFunctionResultMalformed();
  }

  static invokeHostFunctionTrapped(): InvokeHostFunctionResultTrapped {
    return new InvokeHostFunctionResultTrapped();
  }

  static invokeHostFunctionResourceLimitExceeded(): InvokeHostFunctionResultResourceLimitExceeded {
    return new InvokeHostFunctionResultResourceLimitExceeded();
  }

  static invokeHostFunctionEntryArchived(): InvokeHostFunctionResultEntryArchived {
    return new InvokeHostFunctionResultEntryArchived();
  }

  static invokeHostFunctionInsufficientRefundableFee(): InvokeHostFunctionResultInsufficientRefundableFee {
    return new InvokeHostFunctionResultInsufficientRefundableFee();
  }

  static fromXdrObject(
    wire: InvokeHostFunctionResultWire,
  ): InvokeHostFunctionResult {
    switch (wire.code) {
      case 0:
        return new InvokeHostFunctionResultSuccess(
          Hash.fromXdrObject(wire.success),
        );
      case -1:
        return new InvokeHostFunctionResultMalformed();
      case -2:
        return new InvokeHostFunctionResultTrapped();
      case -3:
        return new InvokeHostFunctionResultResourceLimitExceeded();
      case -4:
        return new InvokeHostFunctionResultEntryArchived();
      case -5:
        return new InvokeHostFunctionResultInsufficientRefundableFee();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete InvokeHostFunctionResult variant.
   * Use this instead of `instanceof InvokeHostFunctionResult`: the exported `InvokeHostFunctionResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `InvokeHostFunctionResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is InvokeHostFunctionResult {
    return value instanceof InvokeHostFunctionResultBase;
  }

  abstract toXdrObject(): InvokeHostFunctionResultWire;
}

export class InvokeHostFunctionResultSuccess extends InvokeHostFunctionResultBase {
  readonly type = "invokeHostFunctionSuccess" as const;
  readonly success: Hash;

  constructor(success: Hash | Uint8Array | string) {
    super();
    this.success = success instanceof Hash ? success : new Hash(success);
  }

  get value(): Hash {
    return this.success;
  }

  toXdrObject(): Extract<InvokeHostFunctionResultWire, { code: 0 }> {
    return { code: 0, success: this.success.toXdrObject() };
  }
}

export class InvokeHostFunctionResultMalformed extends InvokeHostFunctionResultBase {
  readonly type = "invokeHostFunctionMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<InvokeHostFunctionResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class InvokeHostFunctionResultTrapped extends InvokeHostFunctionResultBase {
  readonly type = "invokeHostFunctionTrapped" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<InvokeHostFunctionResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class InvokeHostFunctionResultResourceLimitExceeded extends InvokeHostFunctionResultBase {
  readonly type = "invokeHostFunctionResourceLimitExceeded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<InvokeHostFunctionResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class InvokeHostFunctionResultEntryArchived extends InvokeHostFunctionResultBase {
  readonly type = "invokeHostFunctionEntryArchived" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<InvokeHostFunctionResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class InvokeHostFunctionResultInsufficientRefundableFee extends InvokeHostFunctionResultBase {
  readonly type = "invokeHostFunctionInsufficientRefundableFee" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<InvokeHostFunctionResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export type InvokeHostFunctionResult =
  | InvokeHostFunctionResultSuccess
  | InvokeHostFunctionResultMalformed
  | InvokeHostFunctionResultTrapped
  | InvokeHostFunctionResultResourceLimitExceeded
  | InvokeHostFunctionResultEntryArchived
  | InvokeHostFunctionResultInsufficientRefundableFee;
export const InvokeHostFunctionResult = InvokeHostFunctionResultBase;
