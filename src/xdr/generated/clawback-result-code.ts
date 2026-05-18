import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type ClawbackResultCodeWire = number;

export type ClawbackResultCodeName =
  | "clawbackSuccess"
  | "clawbackMalformed"
  | "clawbackNotClawbackEnabled"
  | "clawbackNoTrust"
  | "clawbackUnderfunded";

/**
 * ```xdr
 * enum ClawbackResultCode
 * {
 *     // codes considered as "success" for the operation
 *     CLAWBACK_SUCCESS = 0,
 *
 *     // codes considered as "failure" for the operation
 *     CLAWBACK_MALFORMED = -1,
 *     CLAWBACK_NOT_CLAWBACK_ENABLED = -2,
 *     CLAWBACK_NO_TRUST = -3,
 *     CLAWBACK_UNDERFUNDED = -4
 * };
 * ```
 */
export class ClawbackResultCode extends EnumValue<ClawbackResultCodeName> {
  static readonly clawbackSuccess = new ClawbackResultCode(
    "clawbackSuccess",
    0,
  );
  static readonly clawbackMalformed = new ClawbackResultCode(
    "clawbackMalformed",
    -1,
  );
  static readonly clawbackNotClawbackEnabled = new ClawbackResultCode(
    "clawbackNotClawbackEnabled",
    -2,
  );
  static readonly clawbackNoTrust = new ClawbackResultCode(
    "clawbackNoTrust",
    -3,
  );
  static readonly clawbackUnderfunded = new ClawbackResultCode(
    "clawbackUnderfunded",
    -4,
  );

  private static readonly byValue: Readonly<
    Record<number, ClawbackResultCode>
  > = {
    0: ClawbackResultCode.clawbackSuccess,
    "-1": ClawbackResultCode.clawbackMalformed,
    "-2": ClawbackResultCode.clawbackNotClawbackEnabled,
    "-3": ClawbackResultCode.clawbackNoTrust,
    "-4": ClawbackResultCode.clawbackUnderfunded,
  };

  static readonly schema = enumType("ClawbackResultCode", {
    clawbackSuccess: 0,
    clawbackMalformed: -1,
    clawbackNotClawbackEnabled: -2,
    clawbackNoTrust: -3,
    clawbackUnderfunded: -4,
  });

  static fromValue(value: number): ClawbackResultCode {
    return enumLookup(
      "ClawbackResultCode",
      ClawbackResultCode.byValue,
      value,
    ) as ClawbackResultCode;
  }

  static fromName(name: ClawbackResultCodeName): ClawbackResultCode {
    switch (name) {
      case "clawbackSuccess":
        return ClawbackResultCode.clawbackSuccess;
      case "clawbackMalformed":
        return ClawbackResultCode.clawbackMalformed;
      case "clawbackNotClawbackEnabled":
        return ClawbackResultCode.clawbackNotClawbackEnabled;
      case "clawbackNoTrust":
        return ClawbackResultCode.clawbackNoTrust;
      case "clawbackUnderfunded":
        return ClawbackResultCode.clawbackUnderfunded;
      default:
        throw new XdrError(`ClawbackResultCode: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): ClawbackResultCode {
    return ClawbackResultCode.fromValue(wire);
  }
}
