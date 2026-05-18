import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type LedgerEntryTypeWire = number;

export type LedgerEntryTypeName =
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
 * enum LedgerEntryType
 * {
 *     ACCOUNT = 0,
 *     TRUSTLINE = 1,
 *     OFFER = 2,
 *     DATA = 3,
 *     CLAIMABLE_BALANCE = 4,
 *     LIQUIDITY_POOL = 5,
 *     CONTRACT_DATA = 6,
 *     CONTRACT_CODE = 7,
 *     CONFIG_SETTING = 8,
 *     TTL = 9
 * };
 * ```
 */
export class LedgerEntryType extends EnumValue<LedgerEntryTypeName> {
  static readonly account = new LedgerEntryType("account", 0);
  static readonly trustline = new LedgerEntryType("trustline", 1);
  static readonly offer = new LedgerEntryType("offer", 2);
  static readonly data = new LedgerEntryType("data", 3);
  static readonly claimableBalance = new LedgerEntryType("claimableBalance", 4);
  static readonly liquidityPool = new LedgerEntryType("liquidityPool", 5);
  static readonly contractData = new LedgerEntryType("contractData", 6);
  static readonly contractCode = new LedgerEntryType("contractCode", 7);
  static readonly configSetting = new LedgerEntryType("configSetting", 8);
  static readonly ttl = new LedgerEntryType("ttl", 9);

  private static readonly byValue: Readonly<Record<number, LedgerEntryType>> = {
    0: LedgerEntryType.account,
    1: LedgerEntryType.trustline,
    2: LedgerEntryType.offer,
    3: LedgerEntryType.data,
    4: LedgerEntryType.claimableBalance,
    5: LedgerEntryType.liquidityPool,
    6: LedgerEntryType.contractData,
    7: LedgerEntryType.contractCode,
    8: LedgerEntryType.configSetting,
    9: LedgerEntryType.ttl,
  };

  static readonly schema = enumType("LedgerEntryType", {
    account: 0,
    trustline: 1,
    offer: 2,
    data: 3,
    claimableBalance: 4,
    liquidityPool: 5,
    contractData: 6,
    contractCode: 7,
    configSetting: 8,
    ttl: 9,
  });

  static fromValue(value: number): LedgerEntryType {
    return enumLookup(
      "LedgerEntryType",
      LedgerEntryType.byValue,
      value,
    ) as LedgerEntryType;
  }

  static fromName(name: LedgerEntryTypeName): LedgerEntryType {
    switch (name) {
      case "account":
        return LedgerEntryType.account;
      case "trustline":
        return LedgerEntryType.trustline;
      case "offer":
        return LedgerEntryType.offer;
      case "data":
        return LedgerEntryType.data;
      case "claimableBalance":
        return LedgerEntryType.claimableBalance;
      case "liquidityPool":
        return LedgerEntryType.liquidityPool;
      case "contractData":
        return LedgerEntryType.contractData;
      case "contractCode":
        return LedgerEntryType.contractCode;
      case "configSetting":
        return LedgerEntryType.configSetting;
      case "ttl":
        return LedgerEntryType.ttl;
      default:
        throw new XdrError(`LedgerEntryType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): LedgerEntryType {
    return LedgerEntryType.fromValue(wire);
  }
}
