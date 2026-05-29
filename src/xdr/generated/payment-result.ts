/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PaymentResultCode } from "./payment-result-code.js";

export type PaymentResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 }
  | { code: -7 }
  | { code: -8 }
  | { code: -9 };

export type PaymentResultVariantName =
  | "paymentSuccess"
  | "paymentMalformed"
  | "paymentUnderfunded"
  | "paymentSrcNoTrust"
  | "paymentSrcNotAuthorized"
  | "paymentNoDestination"
  | "paymentNoTrust"
  | "paymentNotAuthorized"
  | "paymentLineFull"
  | "paymentNoIssuer";

/**
 * ```xdr
 * union PaymentResult switch (PaymentResultCode code)
 * {
 * case PAYMENT_SUCCESS:
 *     void;
 * case PAYMENT_MALFORMED:
 * case PAYMENT_UNDERFUNDED:
 * case PAYMENT_SRC_NO_TRUST:
 * case PAYMENT_SRC_NOT_AUTHORIZED:
 * case PAYMENT_NO_DESTINATION:
 * case PAYMENT_NO_TRUST:
 * case PAYMENT_NOT_AUTHORIZED:
 * case PAYMENT_LINE_FULL:
 * case PAYMENT_NO_ISSUER:
 *     void;
 * };
 * ```
 */
abstract class PaymentResultBase extends XdrValue {
  abstract readonly type: PaymentResultVariantName;

  static readonly schema: XdrType<PaymentResultWire> = union("PaymentResult", {
    switchOn: PaymentResultCode.schema,
    cases: [
      case_("paymentSuccess", 0, voidType()),
      case_("paymentMalformed", -1, voidType()),
      case_("paymentUnderfunded", -2, voidType()),
      case_("paymentSrcNoTrust", -3, voidType()),
      case_("paymentSrcNotAuthorized", -4, voidType()),
      case_("paymentNoDestination", -5, voidType()),
      case_("paymentNoTrust", -6, voidType()),
      case_("paymentNotAuthorized", -7, voidType()),
      case_("paymentLineFull", -8, voidType()),
      case_("paymentNoIssuer", -9, voidType()),
    ],
    switchKey: "code",
  });

  static paymentSuccess(): PaymentResultSuccess {
    return new PaymentResultSuccess();
  }

  static paymentMalformed(): PaymentResultMalformed {
    return new PaymentResultMalformed();
  }

  static paymentUnderfunded(): PaymentResultUnderfunded {
    return new PaymentResultUnderfunded();
  }

  static paymentSrcNoTrust(): PaymentResultSrcNoTrust {
    return new PaymentResultSrcNoTrust();
  }

  static paymentSrcNotAuthorized(): PaymentResultSrcNotAuthorized {
    return new PaymentResultSrcNotAuthorized();
  }

  static paymentNoDestination(): PaymentResultNoDestination {
    return new PaymentResultNoDestination();
  }

  static paymentNoTrust(): PaymentResultNoTrust {
    return new PaymentResultNoTrust();
  }

  static paymentNotAuthorized(): PaymentResultNotAuthorized {
    return new PaymentResultNotAuthorized();
  }

  static paymentLineFull(): PaymentResultLineFull {
    return new PaymentResultLineFull();
  }

  static paymentNoIssuer(): PaymentResultNoIssuer {
    return new PaymentResultNoIssuer();
  }

  static fromXdrObject(wire: PaymentResultWire): PaymentResult {
    switch (wire.code) {
      case 0:
        return new PaymentResultSuccess();
      case -1:
        return new PaymentResultMalformed();
      case -2:
        return new PaymentResultUnderfunded();
      case -3:
        return new PaymentResultSrcNoTrust();
      case -4:
        return new PaymentResultSrcNotAuthorized();
      case -5:
        return new PaymentResultNoDestination();
      case -6:
        return new PaymentResultNoTrust();
      case -7:
        return new PaymentResultNotAuthorized();
      case -8:
        return new PaymentResultLineFull();
      case -9:
        return new PaymentResultNoIssuer();
    }
  }

  abstract toXdrObject(): PaymentResultWire;
}

export class PaymentResultSuccess extends PaymentResultBase {
  readonly type = "paymentSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class PaymentResultMalformed extends PaymentResultBase {
  readonly type = "paymentMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class PaymentResultUnderfunded extends PaymentResultBase {
  readonly type = "paymentUnderfunded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class PaymentResultSrcNoTrust extends PaymentResultBase {
  readonly type = "paymentSrcNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class PaymentResultSrcNotAuthorized extends PaymentResultBase {
  readonly type = "paymentSrcNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class PaymentResultNoDestination extends PaymentResultBase {
  readonly type = "paymentNoDestination" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class PaymentResultNoTrust extends PaymentResultBase {
  readonly type = "paymentNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class PaymentResultNotAuthorized extends PaymentResultBase {
  readonly type = "paymentNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class PaymentResultLineFull extends PaymentResultBase {
  readonly type = "paymentLineFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export class PaymentResultNoIssuer extends PaymentResultBase {
  readonly type = "paymentNoIssuer" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<PaymentResultWire, { code: -9 }> {
    return { code: -9 };
  }
}

export type PaymentResult =
  | PaymentResultSuccess
  | PaymentResultMalformed
  | PaymentResultUnderfunded
  | PaymentResultSrcNoTrust
  | PaymentResultSrcNotAuthorized
  | PaymentResultNoDestination
  | PaymentResultNoTrust
  | PaymentResultNotAuthorized
  | PaymentResultLineFull
  | PaymentResultNoIssuer;
export const PaymentResult = PaymentResultBase;
