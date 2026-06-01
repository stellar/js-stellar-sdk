import { enumType } from "../types/enum.js";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type LedgerEntryChangeTypeWire = number;

export type LedgerEntryChangeTypeName =
  | "ledgerEntryCreated"
  | "ledgerEntryUpdated"
  | "ledgerEntryRemoved"
  | "ledgerEntryState"
  | "ledgerEntryRestored";

/**
 * ```xdr
 * enum LedgerEntryChangeType
 * {
 *     LEDGER_ENTRY_CREATED = 0, // entry was added to the ledger
 *     LEDGER_ENTRY_UPDATED = 1, // entry was modified in the ledger
 *     LEDGER_ENTRY_REMOVED = 2, // entry was removed from the ledger
 *     LEDGER_ENTRY_STATE    = 3, // value of the entry
 *     LEDGER_ENTRY_RESTORED = 4  // archived entry was restored in the ledger
 * };
 * ```
 */
export class LedgerEntryChangeType extends EnumValue<LedgerEntryChangeTypeName> {
  static readonly ledgerEntryCreated = new LedgerEntryChangeType(
    "ledgerEntryCreated",
    0,
  );
  static readonly ledgerEntryUpdated = new LedgerEntryChangeType(
    "ledgerEntryUpdated",
    1,
  );
  static readonly ledgerEntryRemoved = new LedgerEntryChangeType(
    "ledgerEntryRemoved",
    2,
  );
  static readonly ledgerEntryState = new LedgerEntryChangeType(
    "ledgerEntryState",
    3,
  );
  static readonly ledgerEntryRestored = new LedgerEntryChangeType(
    "ledgerEntryRestored",
    4,
  );

  static readonly schema = withMemberPrefix(
    enumType("LedgerEntryChangeType", {
      ledgerEntryCreated: 0,
      ledgerEntryUpdated: 1,
      ledgerEntryRemoved: 2,
      ledgerEntryState: 3,
      ledgerEntryRestored: 4,
    }),
    "ledgerEntry",
  );

  static fromValue(value: number): LedgerEntryChangeType {
    return enumFromValue(
      "LedgerEntryChangeType",
      LedgerEntryChangeType.schema,
      LedgerEntryChangeType,
      value,
    );
  }

  static fromName(name: LedgerEntryChangeTypeName): LedgerEntryChangeType {
    return enumFromName("LedgerEntryChangeType", LedgerEntryChangeType, name);
  }

  static fromXdrObject(wire: number): LedgerEntryChangeType {
    return LedgerEntryChangeType.fromValue(wire);
  }
}
