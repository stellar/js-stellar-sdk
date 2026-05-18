import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type OperationTypeWire = number;

export type OperationTypeName =
  | "createAccount"
  | "payment"
  | "pathPaymentStrictReceive"
  | "manageSellOffer"
  | "createPassiveSellOffer"
  | "setOptions"
  | "changeTrust"
  | "allowTrust"
  | "accountMerge"
  | "inflation"
  | "manageData"
  | "bumpSequence"
  | "manageBuyOffer"
  | "pathPaymentStrictSend"
  | "createClaimableBalance"
  | "claimClaimableBalance"
  | "beginSponsoringFutureReserves"
  | "endSponsoringFutureReserves"
  | "revokeSponsorship"
  | "clawback"
  | "clawbackClaimableBalance"
  | "setTrustLineFlags"
  | "liquidityPoolDeposit"
  | "liquidityPoolWithdraw"
  | "invokeHostFunction"
  | "extendFootprintTtl"
  | "restoreFootprint";

/**
 * ```xdr
 * enum OperationType
 * {
 *     CREATE_ACCOUNT = 0,
 *     PAYMENT = 1,
 *     PATH_PAYMENT_STRICT_RECEIVE = 2,
 *     MANAGE_SELL_OFFER = 3,
 *     CREATE_PASSIVE_SELL_OFFER = 4,
 *     SET_OPTIONS = 5,
 *     CHANGE_TRUST = 6,
 *     ALLOW_TRUST = 7,
 *     ACCOUNT_MERGE = 8,
 *     INFLATION = 9,
 *     MANAGE_DATA = 10,
 *     BUMP_SEQUENCE = 11,
 *     MANAGE_BUY_OFFER = 12,
 *     PATH_PAYMENT_STRICT_SEND = 13,
 *     CREATE_CLAIMABLE_BALANCE = 14,
 *     CLAIM_CLAIMABLE_BALANCE = 15,
 *     BEGIN_SPONSORING_FUTURE_RESERVES = 16,
 *     END_SPONSORING_FUTURE_RESERVES = 17,
 *     REVOKE_SPONSORSHIP = 18,
 *     CLAWBACK = 19,
 *     CLAWBACK_CLAIMABLE_BALANCE = 20,
 *     SET_TRUST_LINE_FLAGS = 21,
 *     LIQUIDITY_POOL_DEPOSIT = 22,
 *     LIQUIDITY_POOL_WITHDRAW = 23,
 *     INVOKE_HOST_FUNCTION = 24,
 *     EXTEND_FOOTPRINT_TTL = 25,
 *     RESTORE_FOOTPRINT = 26
 * };
 * ```
 */
export class OperationType extends EnumValue<OperationTypeName> {
  static readonly createAccount = new OperationType("createAccount", 0);
  static readonly payment = new OperationType("payment", 1);
  static readonly pathPaymentStrictReceive = new OperationType(
    "pathPaymentStrictReceive",
    2,
  );
  static readonly manageSellOffer = new OperationType("manageSellOffer", 3);
  static readonly createPassiveSellOffer = new OperationType(
    "createPassiveSellOffer",
    4,
  );
  static readonly setOptions = new OperationType("setOptions", 5);
  static readonly changeTrust = new OperationType("changeTrust", 6);
  static readonly allowTrust = new OperationType("allowTrust", 7);
  static readonly accountMerge = new OperationType("accountMerge", 8);
  static readonly inflation = new OperationType("inflation", 9);
  static readonly manageData = new OperationType("manageData", 10);
  static readonly bumpSequence = new OperationType("bumpSequence", 11);
  static readonly manageBuyOffer = new OperationType("manageBuyOffer", 12);
  static readonly pathPaymentStrictSend = new OperationType(
    "pathPaymentStrictSend",
    13,
  );
  static readonly createClaimableBalance = new OperationType(
    "createClaimableBalance",
    14,
  );
  static readonly claimClaimableBalance = new OperationType(
    "claimClaimableBalance",
    15,
  );
  static readonly beginSponsoringFutureReserves = new OperationType(
    "beginSponsoringFutureReserves",
    16,
  );
  static readonly endSponsoringFutureReserves = new OperationType(
    "endSponsoringFutureReserves",
    17,
  );
  static readonly revokeSponsorship = new OperationType(
    "revokeSponsorship",
    18,
  );
  static readonly clawback = new OperationType("clawback", 19);
  static readonly clawbackClaimableBalance = new OperationType(
    "clawbackClaimableBalance",
    20,
  );
  static readonly setTrustLineFlags = new OperationType(
    "setTrustLineFlags",
    21,
  );
  static readonly liquidityPoolDeposit = new OperationType(
    "liquidityPoolDeposit",
    22,
  );
  static readonly liquidityPoolWithdraw = new OperationType(
    "liquidityPoolWithdraw",
    23,
  );
  static readonly invokeHostFunction = new OperationType(
    "invokeHostFunction",
    24,
  );
  static readonly extendFootprintTtl = new OperationType(
    "extendFootprintTtl",
    25,
  );
  static readonly restoreFootprint = new OperationType("restoreFootprint", 26);

  private static readonly byValue: Readonly<Record<number, OperationType>> = {
    0: OperationType.createAccount,
    1: OperationType.payment,
    2: OperationType.pathPaymentStrictReceive,
    3: OperationType.manageSellOffer,
    4: OperationType.createPassiveSellOffer,
    5: OperationType.setOptions,
    6: OperationType.changeTrust,
    7: OperationType.allowTrust,
    8: OperationType.accountMerge,
    9: OperationType.inflation,
    10: OperationType.manageData,
    11: OperationType.bumpSequence,
    12: OperationType.manageBuyOffer,
    13: OperationType.pathPaymentStrictSend,
    14: OperationType.createClaimableBalance,
    15: OperationType.claimClaimableBalance,
    16: OperationType.beginSponsoringFutureReserves,
    17: OperationType.endSponsoringFutureReserves,
    18: OperationType.revokeSponsorship,
    19: OperationType.clawback,
    20: OperationType.clawbackClaimableBalance,
    21: OperationType.setTrustLineFlags,
    22: OperationType.liquidityPoolDeposit,
    23: OperationType.liquidityPoolWithdraw,
    24: OperationType.invokeHostFunction,
    25: OperationType.extendFootprintTtl,
    26: OperationType.restoreFootprint,
  };

  static readonly schema = enumType("OperationType", {
    createAccount: 0,
    payment: 1,
    pathPaymentStrictReceive: 2,
    manageSellOffer: 3,
    createPassiveSellOffer: 4,
    setOptions: 5,
    changeTrust: 6,
    allowTrust: 7,
    accountMerge: 8,
    inflation: 9,
    manageData: 10,
    bumpSequence: 11,
    manageBuyOffer: 12,
    pathPaymentStrictSend: 13,
    createClaimableBalance: 14,
    claimClaimableBalance: 15,
    beginSponsoringFutureReserves: 16,
    endSponsoringFutureReserves: 17,
    revokeSponsorship: 18,
    clawback: 19,
    clawbackClaimableBalance: 20,
    setTrustLineFlags: 21,
    liquidityPoolDeposit: 22,
    liquidityPoolWithdraw: 23,
    invokeHostFunction: 24,
    extendFootprintTtl: 25,
    restoreFootprint: 26,
  });

  static fromValue(value: number): OperationType {
    return enumLookup(
      "OperationType",
      OperationType.byValue,
      value,
    ) as OperationType;
  }

  static fromName(name: OperationTypeName): OperationType {
    switch (name) {
      case "createAccount":
        return OperationType.createAccount;
      case "payment":
        return OperationType.payment;
      case "pathPaymentStrictReceive":
        return OperationType.pathPaymentStrictReceive;
      case "manageSellOffer":
        return OperationType.manageSellOffer;
      case "createPassiveSellOffer":
        return OperationType.createPassiveSellOffer;
      case "setOptions":
        return OperationType.setOptions;
      case "changeTrust":
        return OperationType.changeTrust;
      case "allowTrust":
        return OperationType.allowTrust;
      case "accountMerge":
        return OperationType.accountMerge;
      case "inflation":
        return OperationType.inflation;
      case "manageData":
        return OperationType.manageData;
      case "bumpSequence":
        return OperationType.bumpSequence;
      case "manageBuyOffer":
        return OperationType.manageBuyOffer;
      case "pathPaymentStrictSend":
        return OperationType.pathPaymentStrictSend;
      case "createClaimableBalance":
        return OperationType.createClaimableBalance;
      case "claimClaimableBalance":
        return OperationType.claimClaimableBalance;
      case "beginSponsoringFutureReserves":
        return OperationType.beginSponsoringFutureReserves;
      case "endSponsoringFutureReserves":
        return OperationType.endSponsoringFutureReserves;
      case "revokeSponsorship":
        return OperationType.revokeSponsorship;
      case "clawback":
        return OperationType.clawback;
      case "clawbackClaimableBalance":
        return OperationType.clawbackClaimableBalance;
      case "setTrustLineFlags":
        return OperationType.setTrustLineFlags;
      case "liquidityPoolDeposit":
        return OperationType.liquidityPoolDeposit;
      case "liquidityPoolWithdraw":
        return OperationType.liquidityPoolWithdraw;
      case "invokeHostFunction":
        return OperationType.invokeHostFunction;
      case "extendFootprintTtl":
        return OperationType.extendFootprintTtl;
      case "restoreFootprint":
        return OperationType.restoreFootprint;
      default:
        throw new XdrError(`OperationType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): OperationType {
    return OperationType.fromValue(wire);
  }
}
