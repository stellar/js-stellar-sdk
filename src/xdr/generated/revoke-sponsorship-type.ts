import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<
    Record<number, RevokeSponsorshipType>
  > = {
    0: RevokeSponsorshipType.revokeSponsorshipLedgerEntry,
    1: RevokeSponsorshipType.revokeSponsorshipSigner,
  };

  static readonly schema = enumType("RevokeSponsorshipType", {
    revokeSponsorshipLedgerEntry: 0,
    revokeSponsorshipSigner: 1,
  });

  static fromValue(value: number): RevokeSponsorshipType {
    return enumLookup(
      "RevokeSponsorshipType",
      RevokeSponsorshipType.byValue,
      value,
    ) as RevokeSponsorshipType;
  }

  static fromName(name: RevokeSponsorshipTypeName): RevokeSponsorshipType {
    switch (name) {
      case "revokeSponsorshipLedgerEntry":
        return RevokeSponsorshipType.revokeSponsorshipLedgerEntry;
      case "revokeSponsorshipSigner":
        return RevokeSponsorshipType.revokeSponsorshipSigner;
      default:
        throw new XdrError(`RevokeSponsorshipType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): RevokeSponsorshipType {
    return RevokeSponsorshipType.fromValue(wire);
  }
}
