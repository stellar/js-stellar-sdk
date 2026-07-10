/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { LedgerEntryType } from "./ledger-entry-type.js";
import { AccountEntry, type AccountEntryWire } from "./account-entry.js";
import { TrustLineEntry, type TrustLineEntryWire } from "./trust-line-entry.js";
import { OfferEntry, type OfferEntryWire } from "./offer-entry.js";
import { DataEntry, type DataEntryWire } from "./data-entry.js";
import {
  ClaimableBalanceEntry,
  type ClaimableBalanceEntryWire,
} from "./claimable-balance-entry.js";
import {
  LiquidityPoolEntry,
  type LiquidityPoolEntryWire,
} from "./liquidity-pool-entry.js";
import {
  ContractDataEntry,
  type ContractDataEntryWire,
} from "./contract-data-entry.js";
import {
  ContractCodeEntry,
  type ContractCodeEntryWire,
} from "./contract-code-entry.js";
import {
  ConfigSettingEntry,
  type ConfigSettingEntryWire,
} from "./config-setting-entry.js";
import { TtlEntry, type TtlEntryWire } from "./ttl-entry.js";

export type LedgerEntryDataWire =
  | { type: 0; account: AccountEntryWire }
  | { type: 1; trustLine: TrustLineEntryWire }
  | { type: 2; offer: OfferEntryWire }
  | { type: 3; data: DataEntryWire }
  | { type: 4; claimableBalance: ClaimableBalanceEntryWire }
  | { type: 5; liquidityPool: LiquidityPoolEntryWire }
  | { type: 6; contractData: ContractDataEntryWire }
  | { type: 7; contractCode: ContractCodeEntryWire }
  | { type: 8; configSetting: ConfigSettingEntryWire }
  | { type: 9; ttl: TtlEntryWire };

export type LedgerEntryDataVariantName =
  | "account"
  | "trustline"
  | "offer"
  | "data"
  | "claimableBalance"
  | "liquidityPool"
  | "contractData"
  | "contractCode"
  | "configSetting"
  | "ttl";

/**
 * ```xdr
 * union switch (LedgerEntryType type)
 *     {
 *     case ACCOUNT:
 *         AccountEntry account;
 *     case TRUSTLINE:
 *         TrustLineEntry trustLine;
 *     case OFFER:
 *         OfferEntry offer;
 *     case DATA:
 *         DataEntry data;
 *     case CLAIMABLE_BALANCE:
 *         ClaimableBalanceEntry claimableBalance;
 *     case LIQUIDITY_POOL:
 *         LiquidityPoolEntry liquidityPool;
 *     case CONTRACT_DATA:
 *         ContractDataEntry contractData;
 *     case CONTRACT_CODE:
 *         ContractCodeEntry contractCode;
 *     case CONFIG_SETTING:
 *         ConfigSettingEntry configSetting;
 *     case TTL:
 *         TTLEntry ttl;
 *     }
 * ```
 */
abstract class LedgerEntryDataBase extends XdrValue {
  abstract readonly type: LedgerEntryDataVariantName;

  static readonly schema: XdrType<LedgerEntryDataWire> = union(
    "LedgerEntryData",
    {
      switchOn: LedgerEntryType.schema,
      cases: [
        case_("account", 0, field("account", AccountEntry.schema)),
        case_("trustline", 1, field("trustLine", TrustLineEntry.schema)),
        case_("offer", 2, field("offer", OfferEntry.schema)),
        case_("data", 3, field("data", DataEntry.schema)),
        case_(
          "claimableBalance",
          4,
          field("claimableBalance", ClaimableBalanceEntry.schema),
        ),
        case_(
          "liquidityPool",
          5,
          field("liquidityPool", LiquidityPoolEntry.schema),
        ),
        case_(
          "contractData",
          6,
          field("contractData", ContractDataEntry.schema),
        ),
        case_(
          "contractCode",
          7,
          field("contractCode", ContractCodeEntry.schema),
        ),
        case_(
          "configSetting",
          8,
          field("configSetting", ConfigSettingEntry.schema),
        ),
        case_("ttl", 9, field("ttl", TtlEntry.schema)),
      ],
    },
  );

  static account(account: AccountEntry): LedgerEntryDataAccount {
    return new LedgerEntryDataAccount(account);
  }

  static trustline(trustLine: TrustLineEntry): LedgerEntryDataTrustline {
    return new LedgerEntryDataTrustline(trustLine);
  }

  static offer(offer: OfferEntry): LedgerEntryDataOffer {
    return new LedgerEntryDataOffer(offer);
  }

  static data(data: DataEntry): LedgerEntryDataData {
    return new LedgerEntryDataData(data);
  }

  static claimableBalance(
    claimableBalance: ClaimableBalanceEntry,
  ): LedgerEntryDataClaimableBalance {
    return new LedgerEntryDataClaimableBalance(claimableBalance);
  }

  static liquidityPool(
    liquidityPool: LiquidityPoolEntry,
  ): LedgerEntryDataLiquidityPool {
    return new LedgerEntryDataLiquidityPool(liquidityPool);
  }

  static contractData(
    contractData: ContractDataEntry,
  ): LedgerEntryDataContractData {
    return new LedgerEntryDataContractData(contractData);
  }

  static contractCode(
    contractCode: ContractCodeEntry,
  ): LedgerEntryDataContractCode {
    return new LedgerEntryDataContractCode(contractCode);
  }

  static configSetting(
    configSetting: ConfigSettingEntry,
  ): LedgerEntryDataConfigSetting {
    return new LedgerEntryDataConfigSetting(configSetting);
  }

  static ttl(ttl: TtlEntry): LedgerEntryDataTtl {
    return new LedgerEntryDataTtl(ttl);
  }

  static fromXdrObject(wire: LedgerEntryDataWire): LedgerEntryData {
    switch (wire.type) {
      case 0:
        return new LedgerEntryDataAccount(
          AccountEntry.fromXdrObject(wire.account),
        );
      case 1:
        return new LedgerEntryDataTrustline(
          TrustLineEntry.fromXdrObject(wire.trustLine),
        );
      case 2:
        return new LedgerEntryDataOffer(OfferEntry.fromXdrObject(wire.offer));
      case 3:
        return new LedgerEntryDataData(DataEntry.fromXdrObject(wire.data));
      case 4:
        return new LedgerEntryDataClaimableBalance(
          ClaimableBalanceEntry.fromXdrObject(wire.claimableBalance),
        );
      case 5:
        return new LedgerEntryDataLiquidityPool(
          LiquidityPoolEntry.fromXdrObject(wire.liquidityPool),
        );
      case 6:
        return new LedgerEntryDataContractData(
          ContractDataEntry.fromXdrObject(wire.contractData),
        );
      case 7:
        return new LedgerEntryDataContractCode(
          ContractCodeEntry.fromXdrObject(wire.contractCode),
        );
      case 8:
        return new LedgerEntryDataConfigSetting(
          ConfigSettingEntry.fromXdrObject(wire.configSetting),
        );
      case 9:
        return new LedgerEntryDataTtl(TtlEntry.fromXdrObject(wire.ttl));
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LedgerEntryData variant.
   * Use this instead of `instanceof LedgerEntryData`: the exported `LedgerEntryData` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LedgerEntryData.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LedgerEntryData {
    return value instanceof LedgerEntryDataBase;
  }

  abstract toXdrObject(): LedgerEntryDataWire;
}

export class LedgerEntryDataAccount extends LedgerEntryDataBase {
  readonly type = "account" as const;
  readonly account: AccountEntry;

  constructor(account: AccountEntry) {
    super();
    this.account = account;
  }

  get value(): AccountEntry {
    return this.account;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 0 }> {
    return { type: 0, account: this.account.toXdrObject() };
  }
}

export class LedgerEntryDataTrustline extends LedgerEntryDataBase {
  readonly type = "trustline" as const;
  readonly trustLine: TrustLineEntry;

  constructor(trustLine: TrustLineEntry) {
    super();
    this.trustLine = trustLine;
  }

  get value(): TrustLineEntry {
    return this.trustLine;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 1 }> {
    return { type: 1, trustLine: this.trustLine.toXdrObject() };
  }
}

export class LedgerEntryDataOffer extends LedgerEntryDataBase {
  readonly type = "offer" as const;
  readonly offer: OfferEntry;

  constructor(offer: OfferEntry) {
    super();
    this.offer = offer;
  }

  get value(): OfferEntry {
    return this.offer;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 2 }> {
    return { type: 2, offer: this.offer.toXdrObject() };
  }
}

export class LedgerEntryDataData extends LedgerEntryDataBase {
  readonly type = "data" as const;
  readonly data: DataEntry;

  constructor(data: DataEntry) {
    super();
    this.data = data;
  }

  get value(): DataEntry {
    return this.data;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 3 }> {
    return { type: 3, data: this.data.toXdrObject() };
  }
}

export class LedgerEntryDataClaimableBalance extends LedgerEntryDataBase {
  readonly type = "claimableBalance" as const;
  readonly claimableBalance: ClaimableBalanceEntry;

  constructor(claimableBalance: ClaimableBalanceEntry) {
    super();
    this.claimableBalance = claimableBalance;
  }

  get value(): ClaimableBalanceEntry {
    return this.claimableBalance;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 4 }> {
    return { type: 4, claimableBalance: this.claimableBalance.toXdrObject() };
  }
}

export class LedgerEntryDataLiquidityPool extends LedgerEntryDataBase {
  readonly type = "liquidityPool" as const;
  readonly liquidityPool: LiquidityPoolEntry;

  constructor(liquidityPool: LiquidityPoolEntry) {
    super();
    this.liquidityPool = liquidityPool;
  }

  get value(): LiquidityPoolEntry {
    return this.liquidityPool;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 5 }> {
    return { type: 5, liquidityPool: this.liquidityPool.toXdrObject() };
  }
}

export class LedgerEntryDataContractData extends LedgerEntryDataBase {
  readonly type = "contractData" as const;
  readonly contractData: ContractDataEntry;

  constructor(contractData: ContractDataEntry) {
    super();
    this.contractData = contractData;
  }

  get value(): ContractDataEntry {
    return this.contractData;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 6 }> {
    return { type: 6, contractData: this.contractData.toXdrObject() };
  }
}

export class LedgerEntryDataContractCode extends LedgerEntryDataBase {
  readonly type = "contractCode" as const;
  readonly contractCode: ContractCodeEntry;

  constructor(contractCode: ContractCodeEntry) {
    super();
    this.contractCode = contractCode;
  }

  get value(): ContractCodeEntry {
    return this.contractCode;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 7 }> {
    return { type: 7, contractCode: this.contractCode.toXdrObject() };
  }
}

export class LedgerEntryDataConfigSetting extends LedgerEntryDataBase {
  readonly type = "configSetting" as const;
  readonly configSetting: ConfigSettingEntry;

  constructor(configSetting: ConfigSettingEntry) {
    super();
    this.configSetting = configSetting;
  }

  get value(): ConfigSettingEntry {
    return this.configSetting;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 8 }> {
    return { type: 8, configSetting: this.configSetting.toXdrObject() };
  }
}

export class LedgerEntryDataTtl extends LedgerEntryDataBase {
  readonly type = "ttl" as const;
  readonly ttl: TtlEntry;

  constructor(ttl: TtlEntry) {
    super();
    this.ttl = ttl;
  }

  get value(): TtlEntry {
    return this.ttl;
  }

  toXdrObject(): Extract<LedgerEntryDataWire, { type: 9 }> {
    return { type: 9, ttl: this.ttl.toXdrObject() };
  }
}

export type LedgerEntryData =
  | LedgerEntryDataAccount
  | LedgerEntryDataTrustline
  | LedgerEntryDataOffer
  | LedgerEntryDataData
  | LedgerEntryDataClaimableBalance
  | LedgerEntryDataLiquidityPool
  | LedgerEntryDataContractData
  | LedgerEntryDataContractCode
  | LedgerEntryDataConfigSetting
  | LedgerEntryDataTtl;
export const LedgerEntryData = LedgerEntryDataBase;
