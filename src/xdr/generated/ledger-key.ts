/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { LedgerEntryType } from "./ledger-entry-type.js";
import {
  LedgerKeyAccount,
  type LedgerKeyAccountWire,
} from "./ledger-key-account.js";
import {
  LedgerKeyTrustLine,
  type LedgerKeyTrustLineWire,
} from "./ledger-key-trust-line.js";
import { LedgerKeyOffer, type LedgerKeyOfferWire } from "./ledger-key-offer.js";
import { LedgerKeyData, type LedgerKeyDataWire } from "./ledger-key-data.js";
import {
  LedgerKeyClaimableBalance,
  type LedgerKeyClaimableBalanceWire,
} from "./ledger-key-claimable-balance.js";
import {
  LedgerKeyLiquidityPool,
  type LedgerKeyLiquidityPoolWire,
} from "./ledger-key-liquidity-pool.js";
import {
  LedgerKeyContractData,
  type LedgerKeyContractDataWire,
} from "./ledger-key-contract-data.js";
import {
  LedgerKeyContractCode,
  type LedgerKeyContractCodeWire,
} from "./ledger-key-contract-code.js";
import {
  LedgerKeyConfigSetting,
  type LedgerKeyConfigSettingWire,
} from "./ledger-key-config-setting.js";
import { LedgerKeyTtl, type LedgerKeyTtlWire } from "./ledger-key-ttl.js";

export type LedgerKeyWire =
  | { type: 0; account: LedgerKeyAccountWire }
  | { type: 1; trustLine: LedgerKeyTrustLineWire }
  | { type: 2; offer: LedgerKeyOfferWire }
  | { type: 3; data: LedgerKeyDataWire }
  | { type: 4; claimableBalance: LedgerKeyClaimableBalanceWire }
  | { type: 5; liquidityPool: LedgerKeyLiquidityPoolWire }
  | { type: 6; contractData: LedgerKeyContractDataWire }
  | { type: 7; contractCode: LedgerKeyContractCodeWire }
  | { type: 8; configSetting: LedgerKeyConfigSettingWire }
  | { type: 9; ttl: LedgerKeyTtlWire };

export type LedgerKeyVariantName =
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
 * union LedgerKey switch (LedgerEntryType type)
 * {
 * case ACCOUNT:
 *     struct
 *     {
 *         AccountID accountID;
 *     } account;
 *
 * case TRUSTLINE:
 *     struct
 *     {
 *         AccountID accountID;
 *         TrustLineAsset asset;
 *     } trustLine;
 *
 * case OFFER:
 *     struct
 *     {
 *         AccountID sellerID;
 *         int64 offerID;
 *     } offer;
 *
 * case DATA:
 *     struct
 *     {
 *         AccountID accountID;
 *         string64 dataName;
 *     } data;
 *
 * case CLAIMABLE_BALANCE:
 *     struct
 *     {
 *         ClaimableBalanceID balanceID;
 *     } claimableBalance;
 *
 * case LIQUIDITY_POOL:
 *     struct
 *     {
 *         PoolID liquidityPoolID;
 *     } liquidityPool;
 * case CONTRACT_DATA:
 *     struct
 *     {
 *         SCAddress contract;
 *         SCVal key;
 *         ContractDataDurability durability;
 *     } contractData;
 * case CONTRACT_CODE:
 *     struct
 *     {
 *         Hash hash;
 *     } contractCode;
 * case CONFIG_SETTING:
 *     struct
 *     {
 *         ConfigSettingID configSettingID;
 *     } configSetting;
 * case TTL:
 *     struct
 *     {
 *         // Hash of the LedgerKey that is associated with this TTLEntry
 *         Hash keyHash;
 *     } ttl;
 * };
 * ```
 */
abstract class LedgerKeyBase extends XdrValue {
  abstract readonly type: LedgerKeyVariantName;

  static readonly schema: XdrType<LedgerKeyWire> = union("LedgerKey", {
    switchOn: LedgerEntryType.schema,
    cases: [
      case_("account", 0, field("account", LedgerKeyAccount.schema)),
      case_("trustline", 1, field("trustLine", LedgerKeyTrustLine.schema)),
      case_("offer", 2, field("offer", LedgerKeyOffer.schema)),
      case_("data", 3, field("data", LedgerKeyData.schema)),
      case_(
        "claimableBalance",
        4,
        field("claimableBalance", LedgerKeyClaimableBalance.schema),
      ),
      case_(
        "liquidityPool",
        5,
        field("liquidityPool", LedgerKeyLiquidityPool.schema),
      ),
      case_(
        "contractData",
        6,
        field("contractData", LedgerKeyContractData.schema),
      ),
      case_(
        "contractCode",
        7,
        field("contractCode", LedgerKeyContractCode.schema),
      ),
      case_(
        "configSetting",
        8,
        field("configSetting", LedgerKeyConfigSetting.schema),
      ),
      case_("ttl", 9, field("ttl", LedgerKeyTtl.schema)),
    ],
  });

  static account(account: LedgerKeyAccount): LedgerKeyAccountArm {
    return new LedgerKeyAccountArm(account);
  }

  static trustline(trustLine: LedgerKeyTrustLine): LedgerKeyTrustline {
    return new LedgerKeyTrustline(trustLine);
  }

  static offer(offer: LedgerKeyOffer): LedgerKeyOfferArm {
    return new LedgerKeyOfferArm(offer);
  }

  static data(data: LedgerKeyData): LedgerKeyDataArm {
    return new LedgerKeyDataArm(data);
  }

  static claimableBalance(
    claimableBalance: LedgerKeyClaimableBalance,
  ): LedgerKeyClaimableBalanceArm {
    return new LedgerKeyClaimableBalanceArm(claimableBalance);
  }

  static liquidityPool(
    liquidityPool: LedgerKeyLiquidityPool,
  ): LedgerKeyLiquidityPoolArm {
    return new LedgerKeyLiquidityPoolArm(liquidityPool);
  }

  static contractData(
    contractData: LedgerKeyContractData,
  ): LedgerKeyContractDataArm {
    return new LedgerKeyContractDataArm(contractData);
  }

  static contractCode(
    contractCode: LedgerKeyContractCode,
  ): LedgerKeyContractCodeArm {
    return new LedgerKeyContractCodeArm(contractCode);
  }

  static configSetting(
    configSetting: LedgerKeyConfigSetting,
  ): LedgerKeyConfigSettingArm {
    return new LedgerKeyConfigSettingArm(configSetting);
  }

  static ttl(ttl: LedgerKeyTtl): LedgerKeyTtlArm {
    return new LedgerKeyTtlArm(ttl);
  }

  static fromXdrObject(wire: LedgerKeyWire): LedgerKey {
    switch (wire.type) {
      case 0:
        return new LedgerKeyAccountArm(
          LedgerKeyAccount.fromXdrObject(wire.account),
        );
      case 1:
        return new LedgerKeyTrustline(
          LedgerKeyTrustLine.fromXdrObject(wire.trustLine),
        );
      case 2:
        return new LedgerKeyOfferArm(LedgerKeyOffer.fromXdrObject(wire.offer));
      case 3:
        return new LedgerKeyDataArm(LedgerKeyData.fromXdrObject(wire.data));
      case 4:
        return new LedgerKeyClaimableBalanceArm(
          LedgerKeyClaimableBalance.fromXdrObject(wire.claimableBalance),
        );
      case 5:
        return new LedgerKeyLiquidityPoolArm(
          LedgerKeyLiquidityPool.fromXdrObject(wire.liquidityPool),
        );
      case 6:
        return new LedgerKeyContractDataArm(
          LedgerKeyContractData.fromXdrObject(wire.contractData),
        );
      case 7:
        return new LedgerKeyContractCodeArm(
          LedgerKeyContractCode.fromXdrObject(wire.contractCode),
        );
      case 8:
        return new LedgerKeyConfigSettingArm(
          LedgerKeyConfigSetting.fromXdrObject(wire.configSetting),
        );
      case 9:
        return new LedgerKeyTtlArm(LedgerKeyTtl.fromXdrObject(wire.ttl));
    }
  }

  abstract toXdrObject(): LedgerKeyWire;
}

export class LedgerKeyAccountArm extends LedgerKeyBase {
  readonly type = "account" as const;
  readonly account: LedgerKeyAccount;

  constructor(account: LedgerKeyAccount) {
    super();
    this.account = account;
  }

  get value(): LedgerKeyAccount {
    return this.account;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 0 }> {
    return { type: 0, account: this.account.toXdrObject() };
  }
}

export class LedgerKeyTrustline extends LedgerKeyBase {
  readonly type = "trustline" as const;
  readonly trustLine: LedgerKeyTrustLine;

  constructor(trustLine: LedgerKeyTrustLine) {
    super();
    this.trustLine = trustLine;
  }

  get value(): LedgerKeyTrustLine {
    return this.trustLine;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 1 }> {
    return { type: 1, trustLine: this.trustLine.toXdrObject() };
  }
}

export class LedgerKeyOfferArm extends LedgerKeyBase {
  readonly type = "offer" as const;
  readonly offer: LedgerKeyOffer;

  constructor(offer: LedgerKeyOffer) {
    super();
    this.offer = offer;
  }

  get value(): LedgerKeyOffer {
    return this.offer;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 2 }> {
    return { type: 2, offer: this.offer.toXdrObject() };
  }
}

export class LedgerKeyDataArm extends LedgerKeyBase {
  readonly type = "data" as const;
  readonly data: LedgerKeyData;

  constructor(data: LedgerKeyData) {
    super();
    this.data = data;
  }

  get value(): LedgerKeyData {
    return this.data;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 3 }> {
    return { type: 3, data: this.data.toXdrObject() };
  }
}

export class LedgerKeyClaimableBalanceArm extends LedgerKeyBase {
  readonly type = "claimableBalance" as const;
  readonly claimableBalance: LedgerKeyClaimableBalance;

  constructor(claimableBalance: LedgerKeyClaimableBalance) {
    super();
    this.claimableBalance = claimableBalance;
  }

  get value(): LedgerKeyClaimableBalance {
    return this.claimableBalance;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 4 }> {
    return { type: 4, claimableBalance: this.claimableBalance.toXdrObject() };
  }
}

export class LedgerKeyLiquidityPoolArm extends LedgerKeyBase {
  readonly type = "liquidityPool" as const;
  readonly liquidityPool: LedgerKeyLiquidityPool;

  constructor(liquidityPool: LedgerKeyLiquidityPool) {
    super();
    this.liquidityPool = liquidityPool;
  }

  get value(): LedgerKeyLiquidityPool {
    return this.liquidityPool;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 5 }> {
    return { type: 5, liquidityPool: this.liquidityPool.toXdrObject() };
  }
}

export class LedgerKeyContractDataArm extends LedgerKeyBase {
  readonly type = "contractData" as const;
  readonly contractData: LedgerKeyContractData;

  constructor(contractData: LedgerKeyContractData) {
    super();
    this.contractData = contractData;
  }

  get value(): LedgerKeyContractData {
    return this.contractData;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 6 }> {
    return { type: 6, contractData: this.contractData.toXdrObject() };
  }
}

export class LedgerKeyContractCodeArm extends LedgerKeyBase {
  readonly type = "contractCode" as const;
  readonly contractCode: LedgerKeyContractCode;

  constructor(contractCode: LedgerKeyContractCode) {
    super();
    this.contractCode = contractCode;
  }

  get value(): LedgerKeyContractCode {
    return this.contractCode;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 7 }> {
    return { type: 7, contractCode: this.contractCode.toXdrObject() };
  }
}

export class LedgerKeyConfigSettingArm extends LedgerKeyBase {
  readonly type = "configSetting" as const;
  readonly configSetting: LedgerKeyConfigSetting;

  constructor(configSetting: LedgerKeyConfigSetting) {
    super();
    this.configSetting = configSetting;
  }

  get value(): LedgerKeyConfigSetting {
    return this.configSetting;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 8 }> {
    return { type: 8, configSetting: this.configSetting.toXdrObject() };
  }
}

export class LedgerKeyTtlArm extends LedgerKeyBase {
  readonly type = "ttl" as const;
  readonly ttl: LedgerKeyTtl;

  constructor(ttl: LedgerKeyTtl) {
    super();
    this.ttl = ttl;
  }

  get value(): LedgerKeyTtl {
    return this.ttl;
  }

  toXdrObject(): Extract<LedgerKeyWire, { type: 9 }> {
    return { type: 9, ttl: this.ttl.toXdrObject() };
  }
}

export type LedgerKey =
  | LedgerKeyAccountArm
  | LedgerKeyTrustline
  | LedgerKeyOfferArm
  | LedgerKeyDataArm
  | LedgerKeyClaimableBalanceArm
  | LedgerKeyLiquidityPoolArm
  | LedgerKeyContractDataArm
  | LedgerKeyContractCodeArm
  | LedgerKeyConfigSettingArm
  | LedgerKeyTtlArm;
export const LedgerKey = LedgerKeyBase;
