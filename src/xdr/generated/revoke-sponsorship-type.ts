import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type RevokeSponsorshipTypeWire = number;

export type RevokeSponsorshipTypeName =
  | "revokeSponsorshipLedgerEntry"
  | "revokeSponsorshipSigner";

/**
 * ```xdr
 * enum RevokeSponsorshipType
 * {
 *     REVOKE_SPONSORSHIP_LEDGER_ENTRY = 0,
 *     REVOKE_SPONSORSHIP_SIGNER = 1
 * };
 * ```
 */
export class RevokeSponsorshipType extends EnumValue<RevokeSponsorshipTypeName> {
  static readonly revokeSponsorshipLedgerEntry = new RevokeSponsorshipType(
    "revokeSponsorshipLedgerEntry",
    0,
  );
  static readonly revokeSponsorshipSigner = new RevokeSponsorshipType(
    "revokeSponsorshipSigner",
    1,
  );

  static readonly schema = withMemberPrefix(
    enumType("RevokeSponsorshipType", {
      revokeSponsorshipLedgerEntry: 0,
      revokeSponsorshipSigner: 1,
    }),
    "revokeSponsorship",
  );

  static fromValue(value: number): RevokeSponsorshipType {
    return enumFromValue(
      "RevokeSponsorshipType",
      RevokeSponsorshipType.schema,
      RevokeSponsorshipType,
      value,
    );
  }

  static fromName(name: RevokeSponsorshipTypeName): RevokeSponsorshipType {
    return enumFromName("RevokeSponsorshipType", RevokeSponsorshipType, name);
  }

  static fromXdrObject(wire: number): RevokeSponsorshipType {
    return RevokeSponsorshipType.fromValue(wire);
  }
}
