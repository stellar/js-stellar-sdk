import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type PaymentResultCodeWire = number;

export type PaymentResultCodeName =
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
 * enum PaymentResultCode
 * {
 *     // codes considered as "success" for the operation
 *     PAYMENT_SUCCESS = 0, // payment successfully completed
 *
 *     // codes considered as "failure" for the operation
 *     PAYMENT_MALFORMED = -1,          // bad input
 *     PAYMENT_UNDERFUNDED = -2,        // not enough funds in source account
 *     PAYMENT_SRC_NO_TRUST = -3,       // no trust line on source account
 *     PAYMENT_SRC_NOT_AUTHORIZED = -4, // source not authorized to transfer
 *     PAYMENT_NO_DESTINATION = -5,     // destination account does not exist
 *     PAYMENT_NO_TRUST = -6,       // destination missing a trust line for asset
 *     PAYMENT_NOT_AUTHORIZED = -7, // destination not authorized to hold asset
 *     PAYMENT_LINE_FULL = -8,      // destination would go above their limit
 *     PAYMENT_NO_ISSUER = -9       // missing issuer on asset
 * };
 * ```
 */
export class PaymentResultCode extends EnumValue<PaymentResultCodeName> {
  static readonly paymentSuccess = new PaymentResultCode("paymentSuccess", 0);
  static readonly paymentMalformed = new PaymentResultCode(
    "paymentMalformed",
    -1,
  );
  static readonly paymentUnderfunded = new PaymentResultCode(
    "paymentUnderfunded",
    -2,
  );
  static readonly paymentSrcNoTrust = new PaymentResultCode(
    "paymentSrcNoTrust",
    -3,
  );
  static readonly paymentSrcNotAuthorized = new PaymentResultCode(
    "paymentSrcNotAuthorized",
    -4,
  );
  static readonly paymentNoDestination = new PaymentResultCode(
    "paymentNoDestination",
    -5,
  );
  static readonly paymentNoTrust = new PaymentResultCode("paymentNoTrust", -6);
  static readonly paymentNotAuthorized = new PaymentResultCode(
    "paymentNotAuthorized",
    -7,
  );
  static readonly paymentLineFull = new PaymentResultCode(
    "paymentLineFull",
    -8,
  );
  static readonly paymentNoIssuer = new PaymentResultCode(
    "paymentNoIssuer",
    -9,
  );

  private static readonly byValue: Readonly<Record<number, PaymentResultCode>> =
    {
      0: PaymentResultCode.paymentSuccess,
      "-1": PaymentResultCode.paymentMalformed,
      "-2": PaymentResultCode.paymentUnderfunded,
      "-3": PaymentResultCode.paymentSrcNoTrust,
      "-4": PaymentResultCode.paymentSrcNotAuthorized,
      "-5": PaymentResultCode.paymentNoDestination,
      "-6": PaymentResultCode.paymentNoTrust,
      "-7": PaymentResultCode.paymentNotAuthorized,
      "-8": PaymentResultCode.paymentLineFull,
      "-9": PaymentResultCode.paymentNoIssuer,
    };

  static readonly schema = enumType("PaymentResultCode", {
    paymentSuccess: 0,
    paymentMalformed: -1,
    paymentUnderfunded: -2,
    paymentSrcNoTrust: -3,
    paymentSrcNotAuthorized: -4,
    paymentNoDestination: -5,
    paymentNoTrust: -6,
    paymentNotAuthorized: -7,
    paymentLineFull: -8,
    paymentNoIssuer: -9,
  });

  static fromValue(value: number): PaymentResultCode {
    return enumLookup(
      "PaymentResultCode",
      PaymentResultCode.byValue,
      value,
    ) as PaymentResultCode;
  }

  static fromName(name: PaymentResultCodeName): PaymentResultCode {
    switch (name) {
      case "paymentSuccess":
        return PaymentResultCode.paymentSuccess;
      case "paymentMalformed":
        return PaymentResultCode.paymentMalformed;
      case "paymentUnderfunded":
        return PaymentResultCode.paymentUnderfunded;
      case "paymentSrcNoTrust":
        return PaymentResultCode.paymentSrcNoTrust;
      case "paymentSrcNotAuthorized":
        return PaymentResultCode.paymentSrcNotAuthorized;
      case "paymentNoDestination":
        return PaymentResultCode.paymentNoDestination;
      case "paymentNoTrust":
        return PaymentResultCode.paymentNoTrust;
      case "paymentNotAuthorized":
        return PaymentResultCode.paymentNotAuthorized;
      case "paymentLineFull":
        return PaymentResultCode.paymentLineFull;
      case "paymentNoIssuer":
        return PaymentResultCode.paymentNoIssuer;
      default:
        throw new XdrError(`PaymentResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): PaymentResultCode {
    return PaymentResultCode.fromValue(wire);
  }
}
