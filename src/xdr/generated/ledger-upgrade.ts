/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { LedgerUpgradeType } from "./ledger-upgrade-type.js";
import {
  ConfigUpgradeSetKey,
  type ConfigUpgradeSetKeyWire,
} from "./config-upgrade-set-key.js";

export type LedgerUpgradeWire =
  | { type: 1; newLedgerVersion: number }
  | { type: 2; newBaseFee: number }
  | { type: 3; newMaxTxSetSize: number }
  | { type: 4; newBaseReserve: number }
  | { type: 5; newFlags: number }
  | { type: 6; newConfig: ConfigUpgradeSetKeyWire }
  | { type: 7; newMaxSorobanTxSetSize: number };

export type LedgerUpgradeVariantName =
  | "ledgerUpgradeVersion"
  | "ledgerUpgradeBaseFee"
  | "ledgerUpgradeMaxTxSetSize"
  | "ledgerUpgradeBaseReserve"
  | "ledgerUpgradeFlags"
  | "ledgerUpgradeConfig"
  | "ledgerUpgradeMaxSorobanTxSetSize";

/**
 * ```xdr
 * union LedgerUpgrade switch (LedgerUpgradeType type)
 * {
 * case LEDGER_UPGRADE_VERSION:
 *     uint32 newLedgerVersion; // update ledgerVersion
 * case LEDGER_UPGRADE_BASE_FEE:
 *     uint32 newBaseFee; // update baseFee
 * case LEDGER_UPGRADE_MAX_TX_SET_SIZE:
 *     uint32 newMaxTxSetSize; // update maxTxSetSize
 * case LEDGER_UPGRADE_BASE_RESERVE:
 *     uint32 newBaseReserve; // update baseReserve
 * case LEDGER_UPGRADE_FLAGS:
 *     uint32 newFlags; // update flags
 * case LEDGER_UPGRADE_CONFIG:
 *     // Update arbitrary `ConfigSetting` entries identified by the key.
 *     ConfigUpgradeSetKey newConfig;
 * case LEDGER_UPGRADE_MAX_SOROBAN_TX_SET_SIZE:
 *     // Update ConfigSettingContractExecutionLanesV0.ledgerMaxTxCount without
 *     // using `LEDGER_UPGRADE_CONFIG`.
 *     uint32 newMaxSorobanTxSetSize;
 * };
 * ```
 */
abstract class LedgerUpgradeBase extends XdrValue {
  abstract readonly type: LedgerUpgradeVariantName;

  static readonly schema: XdrType<LedgerUpgradeWire> = union("LedgerUpgrade", {
    switchOn: LedgerUpgradeType.schema,
    cases: [
      case_("ledgerUpgradeVersion", 1, field("newLedgerVersion", uint32())),
      case_("ledgerUpgradeBaseFee", 2, field("newBaseFee", uint32())),
      case_("ledgerUpgradeMaxTxSetSize", 3, field("newMaxTxSetSize", uint32())),
      case_("ledgerUpgradeBaseReserve", 4, field("newBaseReserve", uint32())),
      case_("ledgerUpgradeFlags", 5, field("newFlags", uint32())),
      case_(
        "ledgerUpgradeConfig",
        6,
        field("newConfig", ConfigUpgradeSetKey.schema),
      ),
      case_(
        "ledgerUpgradeMaxSorobanTxSetSize",
        7,
        field("newMaxSorobanTxSetSize", uint32()),
      ),
    ],
  });

  static ledgerUpgradeVersion(newLedgerVersion: number): LedgerUpgradeVersion {
    return new LedgerUpgradeVersion(newLedgerVersion);
  }

  static ledgerUpgradeBaseFee(newBaseFee: number): LedgerUpgradeBaseFee {
    return new LedgerUpgradeBaseFee(newBaseFee);
  }

  static ledgerUpgradeMaxTxSetSize(
    newMaxTxSetSize: number,
  ): LedgerUpgradeMaxTxSetSize {
    return new LedgerUpgradeMaxTxSetSize(newMaxTxSetSize);
  }

  static ledgerUpgradeBaseReserve(
    newBaseReserve: number,
  ): LedgerUpgradeBaseReserve {
    return new LedgerUpgradeBaseReserve(newBaseReserve);
  }

  static ledgerUpgradeFlags(newFlags: number): LedgerUpgradeFlags {
    return new LedgerUpgradeFlags(newFlags);
  }

  static ledgerUpgradeConfig(
    newConfig: ConfigUpgradeSetKey,
  ): LedgerUpgradeConfig {
    return new LedgerUpgradeConfig(newConfig);
  }

  static ledgerUpgradeMaxSorobanTxSetSize(
    newMaxSorobanTxSetSize: number,
  ): LedgerUpgradeMaxSorobanTxSetSize {
    return new LedgerUpgradeMaxSorobanTxSetSize(newMaxSorobanTxSetSize);
  }

  static fromXdrObject(wire: LedgerUpgradeWire): LedgerUpgrade {
    switch (wire.type) {
      case 1:
        return new LedgerUpgradeVersion(wire.newLedgerVersion);
      case 2:
        return new LedgerUpgradeBaseFee(wire.newBaseFee);
      case 3:
        return new LedgerUpgradeMaxTxSetSize(wire.newMaxTxSetSize);
      case 4:
        return new LedgerUpgradeBaseReserve(wire.newBaseReserve);
      case 5:
        return new LedgerUpgradeFlags(wire.newFlags);
      case 6:
        return new LedgerUpgradeConfig(
          ConfigUpgradeSetKey.fromXdrObject(wire.newConfig),
        );
      case 7:
        return new LedgerUpgradeMaxSorobanTxSetSize(
          wire.newMaxSorobanTxSetSize,
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LedgerUpgrade variant.
   * Use this instead of `instanceof LedgerUpgrade`: the exported `LedgerUpgrade` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LedgerUpgrade.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LedgerUpgrade {
    return value instanceof LedgerUpgradeBase;
  }

  abstract toXdrObject(): LedgerUpgradeWire;
}

export class LedgerUpgradeVersion extends LedgerUpgradeBase {
  readonly type = "ledgerUpgradeVersion" as const;
  readonly newLedgerVersion: number;

  constructor(newLedgerVersion: number) {
    super();
    this.newLedgerVersion = newLedgerVersion;
  }

  get value(): number {
    return this.newLedgerVersion;
  }

  toXdrObject(): Extract<LedgerUpgradeWire, { type: 1 }> {
    return { type: 1, newLedgerVersion: this.newLedgerVersion };
  }
}

export class LedgerUpgradeBaseFee extends LedgerUpgradeBase {
  readonly type = "ledgerUpgradeBaseFee" as const;
  readonly newBaseFee: number;

  constructor(newBaseFee: number) {
    super();
    this.newBaseFee = newBaseFee;
  }

  get value(): number {
    return this.newBaseFee;
  }

  toXdrObject(): Extract<LedgerUpgradeWire, { type: 2 }> {
    return { type: 2, newBaseFee: this.newBaseFee };
  }
}

export class LedgerUpgradeMaxTxSetSize extends LedgerUpgradeBase {
  readonly type = "ledgerUpgradeMaxTxSetSize" as const;
  readonly newMaxTxSetSize: number;

  constructor(newMaxTxSetSize: number) {
    super();
    this.newMaxTxSetSize = newMaxTxSetSize;
  }

  get value(): number {
    return this.newMaxTxSetSize;
  }

  toXdrObject(): Extract<LedgerUpgradeWire, { type: 3 }> {
    return { type: 3, newMaxTxSetSize: this.newMaxTxSetSize };
  }
}

export class LedgerUpgradeBaseReserve extends LedgerUpgradeBase {
  readonly type = "ledgerUpgradeBaseReserve" as const;
  readonly newBaseReserve: number;

  constructor(newBaseReserve: number) {
    super();
    this.newBaseReserve = newBaseReserve;
  }

  get value(): number {
    return this.newBaseReserve;
  }

  toXdrObject(): Extract<LedgerUpgradeWire, { type: 4 }> {
    return { type: 4, newBaseReserve: this.newBaseReserve };
  }
}

export class LedgerUpgradeFlags extends LedgerUpgradeBase {
  readonly type = "ledgerUpgradeFlags" as const;
  readonly newFlags: number;

  constructor(newFlags: number) {
    super();
    this.newFlags = newFlags;
  }

  get value(): number {
    return this.newFlags;
  }

  toXdrObject(): Extract<LedgerUpgradeWire, { type: 5 }> {
    return { type: 5, newFlags: this.newFlags };
  }
}

export class LedgerUpgradeConfig extends LedgerUpgradeBase {
  readonly type = "ledgerUpgradeConfig" as const;
  readonly newConfig: ConfigUpgradeSetKey;

  constructor(newConfig: ConfigUpgradeSetKey) {
    super();
    this.newConfig = newConfig;
  }

  get value(): ConfigUpgradeSetKey {
    return this.newConfig;
  }

  toXdrObject(): Extract<LedgerUpgradeWire, { type: 6 }> {
    return { type: 6, newConfig: this.newConfig.toXdrObject() };
  }
}

export class LedgerUpgradeMaxSorobanTxSetSize extends LedgerUpgradeBase {
  readonly type = "ledgerUpgradeMaxSorobanTxSetSize" as const;
  readonly newMaxSorobanTxSetSize: number;

  constructor(newMaxSorobanTxSetSize: number) {
    super();
    this.newMaxSorobanTxSetSize = newMaxSorobanTxSetSize;
  }

  get value(): number {
    return this.newMaxSorobanTxSetSize;
  }

  toXdrObject(): Extract<LedgerUpgradeWire, { type: 7 }> {
    return { type: 7, newMaxSorobanTxSetSize: this.newMaxSorobanTxSetSize };
  }
}

export type LedgerUpgrade =
  | LedgerUpgradeVersion
  | LedgerUpgradeBaseFee
  | LedgerUpgradeMaxTxSetSize
  | LedgerUpgradeBaseReserve
  | LedgerUpgradeFlags
  | LedgerUpgradeConfig
  | LedgerUpgradeMaxSorobanTxSetSize;
export const LedgerUpgrade = LedgerUpgradeBase;
