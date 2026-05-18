import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

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

  private static readonly byValue: Readonly<Record<number, LedgerUpgradeType>> =
    {
      1: LedgerUpgradeType.ledgerUpgradeVersion,
      2: LedgerUpgradeType.ledgerUpgradeBaseFee,
      3: LedgerUpgradeType.ledgerUpgradeMaxTxSetSize,
      4: LedgerUpgradeType.ledgerUpgradeBaseReserve,
      5: LedgerUpgradeType.ledgerUpgradeFlags,
      6: LedgerUpgradeType.ledgerUpgradeConfig,
      7: LedgerUpgradeType.ledgerUpgradeMaxSorobanTxSetSize,
    };

  static readonly schema = enumType("LedgerUpgradeType", {
    ledgerUpgradeVersion: 1,
    ledgerUpgradeBaseFee: 2,
    ledgerUpgradeMaxTxSetSize: 3,
    ledgerUpgradeBaseReserve: 4,
    ledgerUpgradeFlags: 5,
    ledgerUpgradeConfig: 6,
    ledgerUpgradeMaxSorobanTxSetSize: 7,
  });

  static fromValue(value: number): LedgerUpgradeType {
    return enumLookup(
      "LedgerUpgradeType",
      LedgerUpgradeType.byValue,
      value,
    ) as LedgerUpgradeType;
  }

  static fromName(name: LedgerUpgradeTypeName): LedgerUpgradeType {
    switch (name) {
      case "ledgerUpgradeVersion":
        return LedgerUpgradeType.ledgerUpgradeVersion;
      case "ledgerUpgradeBaseFee":
        return LedgerUpgradeType.ledgerUpgradeBaseFee;
      case "ledgerUpgradeMaxTxSetSize":
        return LedgerUpgradeType.ledgerUpgradeMaxTxSetSize;
      case "ledgerUpgradeBaseReserve":
        return LedgerUpgradeType.ledgerUpgradeBaseReserve;
      case "ledgerUpgradeFlags":
        return LedgerUpgradeType.ledgerUpgradeFlags;
      case "ledgerUpgradeConfig":
        return LedgerUpgradeType.ledgerUpgradeConfig;
      case "ledgerUpgradeMaxSorobanTxSetSize":
        return LedgerUpgradeType.ledgerUpgradeMaxSorobanTxSetSize;
      default:
        throw new XdrError(`LedgerUpgradeType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): LedgerUpgradeType {
    return LedgerUpgradeType.fromValue(wire);
  }
}
