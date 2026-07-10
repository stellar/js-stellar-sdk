import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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
    return enumFromValue(
      "LedgerEntryType",
      LedgerEntryType.schema,
      LedgerEntryType,
      value,
    );
  }

  static fromName(name: LedgerEntryTypeName): LedgerEntryType {
    return enumFromName("LedgerEntryType", LedgerEntryType, name);
  }

  static fromXdrObject(wire: number): LedgerEntryType {
    return LedgerEntryType.fromValue(wire);
  }
}
