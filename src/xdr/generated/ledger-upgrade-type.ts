import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
  withMemberPrefix,
} from "../values/enum-value.js";

export type LedgerUpgradeTypeWire = number;

export type LedgerUpgradeTypeName =
  | "ledgerUpgradeVersion"
  | "ledgerUpgradeBaseFee"
  | "ledgerUpgradeMaxTxSetSize"
  | "ledgerUpgradeBaseReserve"
  | "ledgerUpgradeFlags"
  | "ledgerUpgradeConfig"
  | "ledgerUpgradeMaxSorobanTxSetSize";

/**
 * ```xdr
 * enum LedgerUpgradeType
 * {
 *     LEDGER_UPGRADE_VERSION = 1,
 *     LEDGER_UPGRADE_BASE_FEE = 2,
 *     LEDGER_UPGRADE_MAX_TX_SET_SIZE = 3,
 *     LEDGER_UPGRADE_BASE_RESERVE = 4,
 *     LEDGER_UPGRADE_FLAGS = 5,
 *     LEDGER_UPGRADE_CONFIG = 6,
 *     LEDGER_UPGRADE_MAX_SOROBAN_TX_SET_SIZE = 7
 * };
 * ```
 */
export class LedgerUpgradeType extends EnumValue<LedgerUpgradeTypeName> {
  static readonly ledgerUpgradeVersion = new LedgerUpgradeType(
    "ledgerUpgradeVersion",
    1,
  );
  static readonly ledgerUpgradeBaseFee = new LedgerUpgradeType(
    "ledgerUpgradeBaseFee",
    2,
  );
  static readonly ledgerUpgradeMaxTxSetSize = new LedgerUpgradeType(
    "ledgerUpgradeMaxTxSetSize",
    3,
  );
  static readonly ledgerUpgradeBaseReserve = new LedgerUpgradeType(
    "ledgerUpgradeBaseReserve",
    4,
  );
  static readonly ledgerUpgradeFlags = new LedgerUpgradeType(
    "ledgerUpgradeFlags",
    5,
  );
  static readonly ledgerUpgradeConfig = new LedgerUpgradeType(
    "ledgerUpgradeConfig",
    6,
  );
  static readonly ledgerUpgradeMaxSorobanTxSetSize = new LedgerUpgradeType(
    "ledgerUpgradeMaxSorobanTxSetSize",
    7,
  );

  static readonly schema = withMemberPrefix(
    enumType("LedgerUpgradeType", {
      ledgerUpgradeVersion: 1,
      ledgerUpgradeBaseFee: 2,
      ledgerUpgradeMaxTxSetSize: 3,
      ledgerUpgradeBaseReserve: 4,
      ledgerUpgradeFlags: 5,
      ledgerUpgradeConfig: 6,
      ledgerUpgradeMaxSorobanTxSetSize: 7,
    }),
    "ledgerUpgrade",
  );

  static fromValue(value: number): LedgerUpgradeType {
    return enumFromValue(
      "LedgerUpgradeType",
      LedgerUpgradeType.schema,
      LedgerUpgradeType,
      value,
    );
  }

  static fromName(name: LedgerUpgradeTypeName): LedgerUpgradeType {
    return enumFromName("LedgerUpgradeType", LedgerUpgradeType, name);
  }

  static fromXdrObject(wire: number): LedgerUpgradeType {
    return LedgerUpgradeType.fromValue(wire);
  }
}
