import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

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

  static readonly schema = withMemberPrefix(
    enumType("ClawbackResultCode", {
      clawbackSuccess: 0,
      clawbackMalformed: -1,
      clawbackNotClawbackEnabled: -2,
      clawbackNoTrust: -3,
      clawbackUnderfunded: -4,
    }),
    "clawback",
  );

  static fromValue(value: number): ClawbackResultCode {
    return enumFromValue(
      "ClawbackResultCode",
      ClawbackResultCode.schema,
      ClawbackResultCode,
      value,
    );
  }

  static fromName(name: ClawbackResultCodeName): ClawbackResultCode {
    return enumFromName("ClawbackResultCode", ClawbackResultCode, name);
  }

  static fromXdrObject(wire: number): ClawbackResultCode {
    return ClawbackResultCode.fromValue(wire);
  }
}
