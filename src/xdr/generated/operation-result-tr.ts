/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { OperationType } from "./operation-type.js";
import {
  CreateAccountResult,
  type CreateAccountResultWire,
} from "./create-account-result.js";
import { PaymentResult, type PaymentResultWire } from "./payment-result.js";
import {
  PathPaymentStrictReceiveResult,
  type PathPaymentStrictReceiveResultWire,
} from "./path-payment-strict-receive-result.js";
import {
  ManageSellOfferResult,
  type ManageSellOfferResultWire,
} from "./manage-sell-offer-result.js";
import {
  SetOptionsResult,
  type SetOptionsResultWire,
} from "./set-options-result.js";
import {
  ChangeTrustResult,
  type ChangeTrustResultWire,
} from "./change-trust-result.js";
import {
  AllowTrustResult,
  type AllowTrustResultWire,
} from "./allow-trust-result.js";
import {
  AccountMergeResult,
  type AccountMergeResultWire,
} from "./account-merge-result.js";
import {
  InflationResult,
  type InflationResultWire,
} from "./inflation-result.js";
import {
  ManageDataResult,
  type ManageDataResultWire,
} from "./manage-data-result.js";
import {
  BumpSequenceResult,
  type BumpSequenceResultWire,
} from "./bump-sequence-result.js";
import {
  ManageBuyOfferResult,
  type ManageBuyOfferResultWire,
} from "./manage-buy-offer-result.js";
import {
  PathPaymentStrictSendResult,
  type PathPaymentStrictSendResultWire,
} from "./path-payment-strict-send-result.js";
import {
  CreateClaimableBalanceResult,
  type CreateClaimableBalanceResultWire,
} from "./create-claimable-balance-result.js";
import {
  ClaimClaimableBalanceResult,
  type ClaimClaimableBalanceResultWire,
} from "./claim-claimable-balance-result.js";
import {
  BeginSponsoringFutureReservesResult,
  type BeginSponsoringFutureReservesResultWire,
} from "./begin-sponsoring-future-reserves-result.js";
import {
  EndSponsoringFutureReservesResult,
  type EndSponsoringFutureReservesResultWire,
} from "./end-sponsoring-future-reserves-result.js";
import {
  RevokeSponsorshipResult,
  type RevokeSponsorshipResultWire,
} from "./revoke-sponsorship-result.js";
import { ClawbackResult, type ClawbackResultWire } from "./clawback-result.js";
import {
  ClawbackClaimableBalanceResult,
  type ClawbackClaimableBalanceResultWire,
} from "./clawback-claimable-balance-result.js";
import {
  SetTrustLineFlagsResult,
  type SetTrustLineFlagsResultWire,
} from "./set-trust-line-flags-result.js";
import {
  LiquidityPoolDepositResult,
  type LiquidityPoolDepositResultWire,
} from "./liquidity-pool-deposit-result.js";
import {
  LiquidityPoolWithdrawResult,
  type LiquidityPoolWithdrawResultWire,
} from "./liquidity-pool-withdraw-result.js";
import {
  InvokeHostFunctionResult,
  type InvokeHostFunctionResultWire,
} from "./invoke-host-function-result.js";
import {
  ExtendFootprintTtlResult,
  type ExtendFootprintTtlResultWire,
} from "./extend-footprint-ttl-result.js";
import {
  RestoreFootprintResult,
  type RestoreFootprintResultWire,
} from "./restore-footprint-result.js";

export type OperationResultTrWire =
  | { type: 0; createAccountResult: CreateAccountResultWire }
  | { type: 1; paymentResult: PaymentResultWire }
  | {
      type: 2;
      pathPaymentStrictReceiveResult: PathPaymentStrictReceiveResultWire;
    }
  | { type: 3; manageSellOfferResult: ManageSellOfferResultWire }
  | { type: 4; createPassiveSellOfferResult: ManageSellOfferResultWire }
  | { type: 5; setOptionsResult: SetOptionsResultWire }
  | { type: 6; changeTrustResult: ChangeTrustResultWire }
  | { type: 7; allowTrustResult: AllowTrustResultWire }
  | { type: 8; accountMergeResult: AccountMergeResultWire }
  | { type: 9; inflationResult: InflationResultWire }
  | { type: 10; manageDataResult: ManageDataResultWire }
  | { type: 11; bumpSeqResult: BumpSequenceResultWire }
  | { type: 12; manageBuyOfferResult: ManageBuyOfferResultWire }
  | { type: 13; pathPaymentStrictSendResult: PathPaymentStrictSendResultWire }
  | { type: 14; createClaimableBalanceResult: CreateClaimableBalanceResultWire }
  | { type: 15; claimClaimableBalanceResult: ClaimClaimableBalanceResultWire }
  | {
      type: 16;
      beginSponsoringFutureReservesResult: BeginSponsoringFutureReservesResultWire;
    }
  | {
      type: 17;
      endSponsoringFutureReservesResult: EndSponsoringFutureReservesResultWire;
    }
  | { type: 18; revokeSponsorshipResult: RevokeSponsorshipResultWire }
  | { type: 19; clawbackResult: ClawbackResultWire }
  | {
      type: 20;
      clawbackClaimableBalanceResult: ClawbackClaimableBalanceResultWire;
    }
  | { type: 21; setTrustLineFlagsResult: SetTrustLineFlagsResultWire }
  | { type: 22; liquidityPoolDepositResult: LiquidityPoolDepositResultWire }
  | { type: 23; liquidityPoolWithdrawResult: LiquidityPoolWithdrawResultWire }
  | { type: 24; invokeHostFunctionResult: InvokeHostFunctionResultWire }
  | { type: 25; extendFootprintTtlResult: ExtendFootprintTtlResultWire }
  | { type: 26; restoreFootprintResult: RestoreFootprintResultWire };

export type OperationResultTrVariantName =
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
 * union switch (OperationType type)
 *     {
 *     case CREATE_ACCOUNT:
 *         CreateAccountResult createAccountResult;
 *     case PAYMENT:
 *         PaymentResult paymentResult;
 *     case PATH_PAYMENT_STRICT_RECEIVE:
 *         PathPaymentStrictReceiveResult pathPaymentStrictReceiveResult;
 *     case MANAGE_SELL_OFFER:
 *         ManageSellOfferResult manageSellOfferResult;
 *     case CREATE_PASSIVE_SELL_OFFER:
 *         ManageSellOfferResult createPassiveSellOfferResult;
 *     case SET_OPTIONS:
 *         SetOptionsResult setOptionsResult;
 *     case CHANGE_TRUST:
 *         ChangeTrustResult changeTrustResult;
 *     case ALLOW_TRUST:
 *         AllowTrustResult allowTrustResult;
 *     case ACCOUNT_MERGE:
 *         AccountMergeResult accountMergeResult;
 *     case INFLATION:
 *         InflationResult inflationResult;
 *     case MANAGE_DATA:
 *         ManageDataResult manageDataResult;
 *     case BUMP_SEQUENCE:
 *         BumpSequenceResult bumpSeqResult;
 *     case MANAGE_BUY_OFFER:
 *         ManageBuyOfferResult manageBuyOfferResult;
 *     case PATH_PAYMENT_STRICT_SEND:
 *         PathPaymentStrictSendResult pathPaymentStrictSendResult;
 *     case CREATE_CLAIMABLE_BALANCE:
 *         CreateClaimableBalanceResult createClaimableBalanceResult;
 *     case CLAIM_CLAIMABLE_BALANCE:
 *         ClaimClaimableBalanceResult claimClaimableBalanceResult;
 *     case BEGIN_SPONSORING_FUTURE_RESERVES:
 *         BeginSponsoringFutureReservesResult beginSponsoringFutureReservesResult;
 *     case END_SPONSORING_FUTURE_RESERVES:
 *         EndSponsoringFutureReservesResult endSponsoringFutureReservesResult;
 *     case REVOKE_SPONSORSHIP:
 *         RevokeSponsorshipResult revokeSponsorshipResult;
 *     case CLAWBACK:
 *         ClawbackResult clawbackResult;
 *     case CLAWBACK_CLAIMABLE_BALANCE:
 *         ClawbackClaimableBalanceResult clawbackClaimableBalanceResult;
 *     case SET_TRUST_LINE_FLAGS:
 *         SetTrustLineFlagsResult setTrustLineFlagsResult;
 *     case LIQUIDITY_POOL_DEPOSIT:
 *         LiquidityPoolDepositResult liquidityPoolDepositResult;
 *     case LIQUIDITY_POOL_WITHDRAW:
 *         LiquidityPoolWithdrawResult liquidityPoolWithdrawResult;
 *     case INVOKE_HOST_FUNCTION:
 *         InvokeHostFunctionResult invokeHostFunctionResult;
 *     case EXTEND_FOOTPRINT_TTL:
 *         ExtendFootprintTTLResult extendFootprintTTLResult;
 *     case RESTORE_FOOTPRINT:
 *         RestoreFootprintResult restoreFootprintResult;
 *     }
 * ```
 */
abstract class OperationResultTrBase extends XdrValue {
  abstract readonly type: OperationResultTrVariantName;

  static readonly schema: XdrType<OperationResultTrWire> = union(
    "OperationResultTr",
    {
      switchOn: OperationType.schema,
      cases: [
        case_(
          "createAccount",
          0,
          field("createAccountResult", CreateAccountResult.schema),
        ),
        case_("payment", 1, field("paymentResult", PaymentResult.schema)),
        case_(
          "pathPaymentStrictReceive",
          2,
          field(
            "pathPaymentStrictReceiveResult",
            PathPaymentStrictReceiveResult.schema,
          ),
        ),
        case_(
          "manageSellOffer",
          3,
          field("manageSellOfferResult", ManageSellOfferResult.schema),
        ),
        case_(
          "createPassiveSellOffer",
          4,
          field("createPassiveSellOfferResult", ManageSellOfferResult.schema),
        ),
        case_(
          "setOptions",
          5,
          field("setOptionsResult", SetOptionsResult.schema),
        ),
        case_(
          "changeTrust",
          6,
          field("changeTrustResult", ChangeTrustResult.schema),
        ),
        case_(
          "allowTrust",
          7,
          field("allowTrustResult", AllowTrustResult.schema),
        ),
        case_(
          "accountMerge",
          8,
          field("accountMergeResult", AccountMergeResult.schema),
        ),
        case_("inflation", 9, field("inflationResult", InflationResult.schema)),
        case_(
          "manageData",
          10,
          field("manageDataResult", ManageDataResult.schema),
        ),
        case_(
          "bumpSequence",
          11,
          field("bumpSeqResult", BumpSequenceResult.schema),
        ),
        case_(
          "manageBuyOffer",
          12,
          field("manageBuyOfferResult", ManageBuyOfferResult.schema),
        ),
        case_(
          "pathPaymentStrictSend",
          13,
          field(
            "pathPaymentStrictSendResult",
            PathPaymentStrictSendResult.schema,
          ),
        ),
        case_(
          "createClaimableBalance",
          14,
          field(
            "createClaimableBalanceResult",
            CreateClaimableBalanceResult.schema,
          ),
        ),
        case_(
          "claimClaimableBalance",
          15,
          field(
            "claimClaimableBalanceResult",
            ClaimClaimableBalanceResult.schema,
          ),
        ),
        case_(
          "beginSponsoringFutureReserves",
          16,
          field(
            "beginSponsoringFutureReservesResult",
            BeginSponsoringFutureReservesResult.schema,
          ),
        ),
        case_(
          "endSponsoringFutureReserves",
          17,
          field(
            "endSponsoringFutureReservesResult",
            EndSponsoringFutureReservesResult.schema,
          ),
        ),
        case_(
          "revokeSponsorship",
          18,
          field("revokeSponsorshipResult", RevokeSponsorshipResult.schema),
        ),
        case_("clawback", 19, field("clawbackResult", ClawbackResult.schema)),
        case_(
          "clawbackClaimableBalance",
          20,
          field(
            "clawbackClaimableBalanceResult",
            ClawbackClaimableBalanceResult.schema,
          ),
        ),
        case_(
          "setTrustLineFlags",
          21,
          field("setTrustLineFlagsResult", SetTrustLineFlagsResult.schema),
        ),
        case_(
          "liquidityPoolDeposit",
          22,
          field(
            "liquidityPoolDepositResult",
            LiquidityPoolDepositResult.schema,
          ),
        ),
        case_(
          "liquidityPoolWithdraw",
          23,
          field(
            "liquidityPoolWithdrawResult",
            LiquidityPoolWithdrawResult.schema,
          ),
        ),
        case_(
          "invokeHostFunction",
          24,
          field("invokeHostFunctionResult", InvokeHostFunctionResult.schema),
        ),
        case_(
          "extendFootprintTtl",
          25,
          field("extendFootprintTtlResult", ExtendFootprintTtlResult.schema),
        ),
        case_(
          "restoreFootprint",
          26,
          field("restoreFootprintResult", RestoreFootprintResult.schema),
        ),
      ],
    },
  );

  static createAccount(
    createAccountResult: CreateAccountResult,
  ): OperationResultTrCreateAccount {
    return new OperationResultTrCreateAccount(createAccountResult);
  }

  static payment(paymentResult: PaymentResult): OperationResultTrPayment {
    return new OperationResultTrPayment(paymentResult);
  }

  static pathPaymentStrictReceive(
    pathPaymentStrictReceiveResult: PathPaymentStrictReceiveResult,
  ): OperationResultTrPathPaymentStrictReceive {
    return new OperationResultTrPathPaymentStrictReceive(
      pathPaymentStrictReceiveResult,
    );
  }

  static manageSellOffer(
    manageSellOfferResult: ManageSellOfferResult,
  ): OperationResultTrManageSellOffer {
    return new OperationResultTrManageSellOffer(manageSellOfferResult);
  }

  static createPassiveSellOffer(
    createPassiveSellOfferResult: ManageSellOfferResult,
  ): OperationResultTrCreatePassiveSellOffer {
    return new OperationResultTrCreatePassiveSellOffer(
      createPassiveSellOfferResult,
    );
  }

  static setOptions(
    setOptionsResult: SetOptionsResult,
  ): OperationResultTrSetOptions {
    return new OperationResultTrSetOptions(setOptionsResult);
  }

  static changeTrust(
    changeTrustResult: ChangeTrustResult,
  ): OperationResultTrChangeTrust {
    return new OperationResultTrChangeTrust(changeTrustResult);
  }

  static allowTrust(
    allowTrustResult: AllowTrustResult,
  ): OperationResultTrAllowTrust {
    return new OperationResultTrAllowTrust(allowTrustResult);
  }

  static accountMerge(
    accountMergeResult: AccountMergeResult,
  ): OperationResultTrAccountMerge {
    return new OperationResultTrAccountMerge(accountMergeResult);
  }

  static inflation(
    inflationResult: InflationResult,
  ): OperationResultTrInflation {
    return new OperationResultTrInflation(inflationResult);
  }

  static manageData(
    manageDataResult: ManageDataResult,
  ): OperationResultTrManageData {
    return new OperationResultTrManageData(manageDataResult);
  }

  static bumpSequence(
    bumpSeqResult: BumpSequenceResult,
  ): OperationResultTrBumpSequence {
    return new OperationResultTrBumpSequence(bumpSeqResult);
  }

  static manageBuyOffer(
    manageBuyOfferResult: ManageBuyOfferResult,
  ): OperationResultTrManageBuyOffer {
    return new OperationResultTrManageBuyOffer(manageBuyOfferResult);
  }

  static pathPaymentStrictSend(
    pathPaymentStrictSendResult: PathPaymentStrictSendResult,
  ): OperationResultTrPathPaymentStrictSend {
    return new OperationResultTrPathPaymentStrictSend(
      pathPaymentStrictSendResult,
    );
  }

  static createClaimableBalance(
    createClaimableBalanceResult: CreateClaimableBalanceResult,
  ): OperationResultTrCreateClaimableBalance {
    return new OperationResultTrCreateClaimableBalance(
      createClaimableBalanceResult,
    );
  }

  static claimClaimableBalance(
    claimClaimableBalanceResult: ClaimClaimableBalanceResult,
  ): OperationResultTrClaimClaimableBalance {
    return new OperationResultTrClaimClaimableBalance(
      claimClaimableBalanceResult,
    );
  }

  static beginSponsoringFutureReserves(
    beginSponsoringFutureReservesResult: BeginSponsoringFutureReservesResult,
  ): OperationResultTrBeginSponsoringFutureReserves {
    return new OperationResultTrBeginSponsoringFutureReserves(
      beginSponsoringFutureReservesResult,
    );
  }

  static endSponsoringFutureReserves(
    endSponsoringFutureReservesResult: EndSponsoringFutureReservesResult,
  ): OperationResultTrEndSponsoringFutureReserves {
    return new OperationResultTrEndSponsoringFutureReserves(
      endSponsoringFutureReservesResult,
    );
  }

  static revokeSponsorship(
    revokeSponsorshipResult: RevokeSponsorshipResult,
  ): OperationResultTrRevokeSponsorship {
    return new OperationResultTrRevokeSponsorship(revokeSponsorshipResult);
  }

  static clawback(clawbackResult: ClawbackResult): OperationResultTrClawback {
    return new OperationResultTrClawback(clawbackResult);
  }

  static clawbackClaimableBalance(
    clawbackClaimableBalanceResult: ClawbackClaimableBalanceResult,
  ): OperationResultTrClawbackClaimableBalance {
    return new OperationResultTrClawbackClaimableBalance(
      clawbackClaimableBalanceResult,
    );
  }

  static setTrustLineFlags(
    setTrustLineFlagsResult: SetTrustLineFlagsResult,
  ): OperationResultTrSetTrustLineFlags {
    return new OperationResultTrSetTrustLineFlags(setTrustLineFlagsResult);
  }

  static liquidityPoolDeposit(
    liquidityPoolDepositResult: LiquidityPoolDepositResult,
  ): OperationResultTrLiquidityPoolDeposit {
    return new OperationResultTrLiquidityPoolDeposit(
      liquidityPoolDepositResult,
    );
  }

  static liquidityPoolWithdraw(
    liquidityPoolWithdrawResult: LiquidityPoolWithdrawResult,
  ): OperationResultTrLiquidityPoolWithdraw {
    return new OperationResultTrLiquidityPoolWithdraw(
      liquidityPoolWithdrawResult,
    );
  }

  static invokeHostFunction(
    invokeHostFunctionResult: InvokeHostFunctionResult,
  ): OperationResultTrInvokeHostFunction {
    return new OperationResultTrInvokeHostFunction(invokeHostFunctionResult);
  }

  static extendFootprintTtl(
    extendFootprintTtlResult: ExtendFootprintTtlResult,
  ): OperationResultTrExtendFootprintTtl {
    return new OperationResultTrExtendFootprintTtl(extendFootprintTtlResult);
  }

  static restoreFootprint(
    restoreFootprintResult: RestoreFootprintResult,
  ): OperationResultTrRestoreFootprint {
    return new OperationResultTrRestoreFootprint(restoreFootprintResult);
  }

  static fromXdrObject(wire: OperationResultTrWire): OperationResultTr {
    switch (wire.type) {
      case 0:
        return new OperationResultTrCreateAccount(
          CreateAccountResult.fromXdrObject(wire.createAccountResult),
        );
      case 1:
        return new OperationResultTrPayment(
          PaymentResult.fromXdrObject(wire.paymentResult),
        );
      case 2:
        return new OperationResultTrPathPaymentStrictReceive(
          PathPaymentStrictReceiveResult.fromXdrObject(
            wire.pathPaymentStrictReceiveResult,
          ),
        );
      case 3:
        return new OperationResultTrManageSellOffer(
          ManageSellOfferResult.fromXdrObject(wire.manageSellOfferResult),
        );
      case 4:
        return new OperationResultTrCreatePassiveSellOffer(
          ManageSellOfferResult.fromXdrObject(
            wire.createPassiveSellOfferResult,
          ),
        );
      case 5:
        return new OperationResultTrSetOptions(
          SetOptionsResult.fromXdrObject(wire.setOptionsResult),
        );
      case 6:
        return new OperationResultTrChangeTrust(
          ChangeTrustResult.fromXdrObject(wire.changeTrustResult),
        );
      case 7:
        return new OperationResultTrAllowTrust(
          AllowTrustResult.fromXdrObject(wire.allowTrustResult),
        );
      case 8:
        return new OperationResultTrAccountMerge(
          AccountMergeResult.fromXdrObject(wire.accountMergeResult),
        );
      case 9:
        return new OperationResultTrInflation(
          InflationResult.fromXdrObject(wire.inflationResult),
        );
      case 10:
        return new OperationResultTrManageData(
          ManageDataResult.fromXdrObject(wire.manageDataResult),
        );
      case 11:
        return new OperationResultTrBumpSequence(
          BumpSequenceResult.fromXdrObject(wire.bumpSeqResult),
        );
      case 12:
        return new OperationResultTrManageBuyOffer(
          ManageBuyOfferResult.fromXdrObject(wire.manageBuyOfferResult),
        );
      case 13:
        return new OperationResultTrPathPaymentStrictSend(
          PathPaymentStrictSendResult.fromXdrObject(
            wire.pathPaymentStrictSendResult,
          ),
        );
      case 14:
        return new OperationResultTrCreateClaimableBalance(
          CreateClaimableBalanceResult.fromXdrObject(
            wire.createClaimableBalanceResult,
          ),
        );
      case 15:
        return new OperationResultTrClaimClaimableBalance(
          ClaimClaimableBalanceResult.fromXdrObject(
            wire.claimClaimableBalanceResult,
          ),
        );
      case 16:
        return new OperationResultTrBeginSponsoringFutureReserves(
          BeginSponsoringFutureReservesResult.fromXdrObject(
            wire.beginSponsoringFutureReservesResult,
          ),
        );
      case 17:
        return new OperationResultTrEndSponsoringFutureReserves(
          EndSponsoringFutureReservesResult.fromXdrObject(
            wire.endSponsoringFutureReservesResult,
          ),
        );
      case 18:
        return new OperationResultTrRevokeSponsorship(
          RevokeSponsorshipResult.fromXdrObject(wire.revokeSponsorshipResult),
        );
      case 19:
        return new OperationResultTrClawback(
          ClawbackResult.fromXdrObject(wire.clawbackResult),
        );
      case 20:
        return new OperationResultTrClawbackClaimableBalance(
          ClawbackClaimableBalanceResult.fromXdrObject(
            wire.clawbackClaimableBalanceResult,
          ),
        );
      case 21:
        return new OperationResultTrSetTrustLineFlags(
          SetTrustLineFlagsResult.fromXdrObject(wire.setTrustLineFlagsResult),
        );
      case 22:
        return new OperationResultTrLiquidityPoolDeposit(
          LiquidityPoolDepositResult.fromXdrObject(
            wire.liquidityPoolDepositResult,
          ),
        );
      case 23:
        return new OperationResultTrLiquidityPoolWithdraw(
          LiquidityPoolWithdrawResult.fromXdrObject(
            wire.liquidityPoolWithdrawResult,
          ),
        );
      case 24:
        return new OperationResultTrInvokeHostFunction(
          InvokeHostFunctionResult.fromXdrObject(wire.invokeHostFunctionResult),
        );
      case 25:
        return new OperationResultTrExtendFootprintTtl(
          ExtendFootprintTtlResult.fromXdrObject(wire.extendFootprintTtlResult),
        );
      case 26:
        return new OperationResultTrRestoreFootprint(
          RestoreFootprintResult.fromXdrObject(wire.restoreFootprintResult),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete OperationResultTr variant.
   * Use this instead of `instanceof OperationResultTr`: the exported `OperationResultTr` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `OperationResultTr.is(x)` narrows to the union.
   */
  static is(value: unknown): value is OperationResultTr {
    return value instanceof OperationResultTrBase;
  }

  abstract toXdrObject(): OperationResultTrWire;
}

export class OperationResultTrCreateAccount extends OperationResultTrBase {
  readonly type = "createAccount" as const;
  readonly createAccountResult: CreateAccountResult;

  constructor(createAccountResult: CreateAccountResult) {
    super();
    this.createAccountResult = createAccountResult;
  }

  get value(): CreateAccountResult {
    return this.createAccountResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 0 }> {
    return {
      type: 0,
      createAccountResult: this.createAccountResult.toXdrObject(),
    };
  }
}

export class OperationResultTrPayment extends OperationResultTrBase {
  readonly type = "payment" as const;
  readonly paymentResult: PaymentResult;

  constructor(paymentResult: PaymentResult) {
    super();
    this.paymentResult = paymentResult;
  }

  get value(): PaymentResult {
    return this.paymentResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 1 }> {
    return { type: 1, paymentResult: this.paymentResult.toXdrObject() };
  }
}

export class OperationResultTrPathPaymentStrictReceive extends OperationResultTrBase {
  readonly type = "pathPaymentStrictReceive" as const;
  readonly pathPaymentStrictReceiveResult: PathPaymentStrictReceiveResult;

  constructor(pathPaymentStrictReceiveResult: PathPaymentStrictReceiveResult) {
    super();
    this.pathPaymentStrictReceiveResult = pathPaymentStrictReceiveResult;
  }

  get value(): PathPaymentStrictReceiveResult {
    return this.pathPaymentStrictReceiveResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 2 }> {
    return {
      type: 2,
      pathPaymentStrictReceiveResult:
        this.pathPaymentStrictReceiveResult.toXdrObject(),
    };
  }
}

export class OperationResultTrManageSellOffer extends OperationResultTrBase {
  readonly type = "manageSellOffer" as const;
  readonly manageSellOfferResult: ManageSellOfferResult;

  constructor(manageSellOfferResult: ManageSellOfferResult) {
    super();
    this.manageSellOfferResult = manageSellOfferResult;
  }

  get value(): ManageSellOfferResult {
    return this.manageSellOfferResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 3 }> {
    return {
      type: 3,
      manageSellOfferResult: this.manageSellOfferResult.toXdrObject(),
    };
  }
}

export class OperationResultTrCreatePassiveSellOffer extends OperationResultTrBase {
  readonly type = "createPassiveSellOffer" as const;
  readonly createPassiveSellOfferResult: ManageSellOfferResult;

  constructor(createPassiveSellOfferResult: ManageSellOfferResult) {
    super();
    this.createPassiveSellOfferResult = createPassiveSellOfferResult;
  }

  get value(): ManageSellOfferResult {
    return this.createPassiveSellOfferResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 4 }> {
    return {
      type: 4,
      createPassiveSellOfferResult:
        this.createPassiveSellOfferResult.toXdrObject(),
    };
  }
}

export class OperationResultTrSetOptions extends OperationResultTrBase {
  readonly type = "setOptions" as const;
  readonly setOptionsResult: SetOptionsResult;

  constructor(setOptionsResult: SetOptionsResult) {
    super();
    this.setOptionsResult = setOptionsResult;
  }

  get value(): SetOptionsResult {
    return this.setOptionsResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 5 }> {
    return { type: 5, setOptionsResult: this.setOptionsResult.toXdrObject() };
  }
}

export class OperationResultTrChangeTrust extends OperationResultTrBase {
  readonly type = "changeTrust" as const;
  readonly changeTrustResult: ChangeTrustResult;

  constructor(changeTrustResult: ChangeTrustResult) {
    super();
    this.changeTrustResult = changeTrustResult;
  }

  get value(): ChangeTrustResult {
    return this.changeTrustResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 6 }> {
    return { type: 6, changeTrustResult: this.changeTrustResult.toXdrObject() };
  }
}

export class OperationResultTrAllowTrust extends OperationResultTrBase {
  readonly type = "allowTrust" as const;
  readonly allowTrustResult: AllowTrustResult;

  constructor(allowTrustResult: AllowTrustResult) {
    super();
    this.allowTrustResult = allowTrustResult;
  }

  get value(): AllowTrustResult {
    return this.allowTrustResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 7 }> {
    return { type: 7, allowTrustResult: this.allowTrustResult.toXdrObject() };
  }
}

export class OperationResultTrAccountMerge extends OperationResultTrBase {
  readonly type = "accountMerge" as const;
  readonly accountMergeResult: AccountMergeResult;

  constructor(accountMergeResult: AccountMergeResult) {
    super();
    this.accountMergeResult = accountMergeResult;
  }

  get value(): AccountMergeResult {
    return this.accountMergeResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 8 }> {
    return {
      type: 8,
      accountMergeResult: this.accountMergeResult.toXdrObject(),
    };
  }
}

export class OperationResultTrInflation extends OperationResultTrBase {
  readonly type = "inflation" as const;
  readonly inflationResult: InflationResult;

  constructor(inflationResult: InflationResult) {
    super();
    this.inflationResult = inflationResult;
  }

  get value(): InflationResult {
    return this.inflationResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 9 }> {
    return { type: 9, inflationResult: this.inflationResult.toXdrObject() };
  }
}

export class OperationResultTrManageData extends OperationResultTrBase {
  readonly type = "manageData" as const;
  readonly manageDataResult: ManageDataResult;

  constructor(manageDataResult: ManageDataResult) {
    super();
    this.manageDataResult = manageDataResult;
  }

  get value(): ManageDataResult {
    return this.manageDataResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 10 }> {
    return { type: 10, manageDataResult: this.manageDataResult.toXdrObject() };
  }
}

export class OperationResultTrBumpSequence extends OperationResultTrBase {
  readonly type = "bumpSequence" as const;
  readonly bumpSeqResult: BumpSequenceResult;

  constructor(bumpSeqResult: BumpSequenceResult) {
    super();
    this.bumpSeqResult = bumpSeqResult;
  }

  get value(): BumpSequenceResult {
    return this.bumpSeqResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 11 }> {
    return { type: 11, bumpSeqResult: this.bumpSeqResult.toXdrObject() };
  }
}

export class OperationResultTrManageBuyOffer extends OperationResultTrBase {
  readonly type = "manageBuyOffer" as const;
  readonly manageBuyOfferResult: ManageBuyOfferResult;

  constructor(manageBuyOfferResult: ManageBuyOfferResult) {
    super();
    this.manageBuyOfferResult = manageBuyOfferResult;
  }

  get value(): ManageBuyOfferResult {
    return this.manageBuyOfferResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 12 }> {
    return {
      type: 12,
      manageBuyOfferResult: this.manageBuyOfferResult.toXdrObject(),
    };
  }
}

export class OperationResultTrPathPaymentStrictSend extends OperationResultTrBase {
  readonly type = "pathPaymentStrictSend" as const;
  readonly pathPaymentStrictSendResult: PathPaymentStrictSendResult;

  constructor(pathPaymentStrictSendResult: PathPaymentStrictSendResult) {
    super();
    this.pathPaymentStrictSendResult = pathPaymentStrictSendResult;
  }

  get value(): PathPaymentStrictSendResult {
    return this.pathPaymentStrictSendResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 13 }> {
    return {
      type: 13,
      pathPaymentStrictSendResult:
        this.pathPaymentStrictSendResult.toXdrObject(),
    };
  }
}

export class OperationResultTrCreateClaimableBalance extends OperationResultTrBase {
  readonly type = "createClaimableBalance" as const;
  readonly createClaimableBalanceResult: CreateClaimableBalanceResult;

  constructor(createClaimableBalanceResult: CreateClaimableBalanceResult) {
    super();
    this.createClaimableBalanceResult = createClaimableBalanceResult;
  }

  get value(): CreateClaimableBalanceResult {
    return this.createClaimableBalanceResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 14 }> {
    return {
      type: 14,
      createClaimableBalanceResult:
        this.createClaimableBalanceResult.toXdrObject(),
    };
  }
}

export class OperationResultTrClaimClaimableBalance extends OperationResultTrBase {
  readonly type = "claimClaimableBalance" as const;
  readonly claimClaimableBalanceResult: ClaimClaimableBalanceResult;

  constructor(claimClaimableBalanceResult: ClaimClaimableBalanceResult) {
    super();
    this.claimClaimableBalanceResult = claimClaimableBalanceResult;
  }

  get value(): ClaimClaimableBalanceResult {
    return this.claimClaimableBalanceResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 15 }> {
    return {
      type: 15,
      claimClaimableBalanceResult:
        this.claimClaimableBalanceResult.toXdrObject(),
    };
  }
}

export class OperationResultTrBeginSponsoringFutureReserves extends OperationResultTrBase {
  readonly type = "beginSponsoringFutureReserves" as const;
  readonly beginSponsoringFutureReservesResult: BeginSponsoringFutureReservesResult;

  constructor(
    beginSponsoringFutureReservesResult: BeginSponsoringFutureReservesResult,
  ) {
    super();
    this.beginSponsoringFutureReservesResult =
      beginSponsoringFutureReservesResult;
  }

  get value(): BeginSponsoringFutureReservesResult {
    return this.beginSponsoringFutureReservesResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 16 }> {
    return {
      type: 16,
      beginSponsoringFutureReservesResult:
        this.beginSponsoringFutureReservesResult.toXdrObject(),
    };
  }
}

export class OperationResultTrEndSponsoringFutureReserves extends OperationResultTrBase {
  readonly type = "endSponsoringFutureReserves" as const;
  readonly endSponsoringFutureReservesResult: EndSponsoringFutureReservesResult;

  constructor(
    endSponsoringFutureReservesResult: EndSponsoringFutureReservesResult,
  ) {
    super();
    this.endSponsoringFutureReservesResult = endSponsoringFutureReservesResult;
  }

  get value(): EndSponsoringFutureReservesResult {
    return this.endSponsoringFutureReservesResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 17 }> {
    return {
      type: 17,
      endSponsoringFutureReservesResult:
        this.endSponsoringFutureReservesResult.toXdrObject(),
    };
  }
}

export class OperationResultTrRevokeSponsorship extends OperationResultTrBase {
  readonly type = "revokeSponsorship" as const;
  readonly revokeSponsorshipResult: RevokeSponsorshipResult;

  constructor(revokeSponsorshipResult: RevokeSponsorshipResult) {
    super();
    this.revokeSponsorshipResult = revokeSponsorshipResult;
  }

  get value(): RevokeSponsorshipResult {
    return this.revokeSponsorshipResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 18 }> {
    return {
      type: 18,
      revokeSponsorshipResult: this.revokeSponsorshipResult.toXdrObject(),
    };
  }
}

export class OperationResultTrClawback extends OperationResultTrBase {
  readonly type = "clawback" as const;
  readonly clawbackResult: ClawbackResult;

  constructor(clawbackResult: ClawbackResult) {
    super();
    this.clawbackResult = clawbackResult;
  }

  get value(): ClawbackResult {
    return this.clawbackResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 19 }> {
    return { type: 19, clawbackResult: this.clawbackResult.toXdrObject() };
  }
}

export class OperationResultTrClawbackClaimableBalance extends OperationResultTrBase {
  readonly type = "clawbackClaimableBalance" as const;
  readonly clawbackClaimableBalanceResult: ClawbackClaimableBalanceResult;

  constructor(clawbackClaimableBalanceResult: ClawbackClaimableBalanceResult) {
    super();
    this.clawbackClaimableBalanceResult = clawbackClaimableBalanceResult;
  }

  get value(): ClawbackClaimableBalanceResult {
    return this.clawbackClaimableBalanceResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 20 }> {
    return {
      type: 20,
      clawbackClaimableBalanceResult:
        this.clawbackClaimableBalanceResult.toXdrObject(),
    };
  }
}

export class OperationResultTrSetTrustLineFlags extends OperationResultTrBase {
  readonly type = "setTrustLineFlags" as const;
  readonly setTrustLineFlagsResult: SetTrustLineFlagsResult;

  constructor(setTrustLineFlagsResult: SetTrustLineFlagsResult) {
    super();
    this.setTrustLineFlagsResult = setTrustLineFlagsResult;
  }

  get value(): SetTrustLineFlagsResult {
    return this.setTrustLineFlagsResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 21 }> {
    return {
      type: 21,
      setTrustLineFlagsResult: this.setTrustLineFlagsResult.toXdrObject(),
    };
  }
}

export class OperationResultTrLiquidityPoolDeposit extends OperationResultTrBase {
  readonly type = "liquidityPoolDeposit" as const;
  readonly liquidityPoolDepositResult: LiquidityPoolDepositResult;

  constructor(liquidityPoolDepositResult: LiquidityPoolDepositResult) {
    super();
    this.liquidityPoolDepositResult = liquidityPoolDepositResult;
  }

  get value(): LiquidityPoolDepositResult {
    return this.liquidityPoolDepositResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 22 }> {
    return {
      type: 22,
      liquidityPoolDepositResult: this.liquidityPoolDepositResult.toXdrObject(),
    };
  }
}

export class OperationResultTrLiquidityPoolWithdraw extends OperationResultTrBase {
  readonly type = "liquidityPoolWithdraw" as const;
  readonly liquidityPoolWithdrawResult: LiquidityPoolWithdrawResult;

  constructor(liquidityPoolWithdrawResult: LiquidityPoolWithdrawResult) {
    super();
    this.liquidityPoolWithdrawResult = liquidityPoolWithdrawResult;
  }

  get value(): LiquidityPoolWithdrawResult {
    return this.liquidityPoolWithdrawResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 23 }> {
    return {
      type: 23,
      liquidityPoolWithdrawResult:
        this.liquidityPoolWithdrawResult.toXdrObject(),
    };
  }
}

export class OperationResultTrInvokeHostFunction extends OperationResultTrBase {
  readonly type = "invokeHostFunction" as const;
  readonly invokeHostFunctionResult: InvokeHostFunctionResult;

  constructor(invokeHostFunctionResult: InvokeHostFunctionResult) {
    super();
    this.invokeHostFunctionResult = invokeHostFunctionResult;
  }

  get value(): InvokeHostFunctionResult {
    return this.invokeHostFunctionResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 24 }> {
    return {
      type: 24,
      invokeHostFunctionResult: this.invokeHostFunctionResult.toXdrObject(),
    };
  }
}

export class OperationResultTrExtendFootprintTtl extends OperationResultTrBase {
  readonly type = "extendFootprintTtl" as const;
  readonly extendFootprintTtlResult: ExtendFootprintTtlResult;

  constructor(extendFootprintTtlResult: ExtendFootprintTtlResult) {
    super();
    this.extendFootprintTtlResult = extendFootprintTtlResult;
  }

  get value(): ExtendFootprintTtlResult {
    return this.extendFootprintTtlResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 25 }> {
    return {
      type: 25,
      extendFootprintTtlResult: this.extendFootprintTtlResult.toXdrObject(),
    };
  }
}

export class OperationResultTrRestoreFootprint extends OperationResultTrBase {
  readonly type = "restoreFootprint" as const;
  readonly restoreFootprintResult: RestoreFootprintResult;

  constructor(restoreFootprintResult: RestoreFootprintResult) {
    super();
    this.restoreFootprintResult = restoreFootprintResult;
  }

  get value(): RestoreFootprintResult {
    return this.restoreFootprintResult;
  }

  toXdrObject(): Extract<OperationResultTrWire, { type: 26 }> {
    return {
      type: 26,
      restoreFootprintResult: this.restoreFootprintResult.toXdrObject(),
    };
  }
}

export type OperationResultTr =
  | OperationResultTrCreateAccount
  | OperationResultTrPayment
  | OperationResultTrPathPaymentStrictReceive
  | OperationResultTrManageSellOffer
  | OperationResultTrCreatePassiveSellOffer
  | OperationResultTrSetOptions
  | OperationResultTrChangeTrust
  | OperationResultTrAllowTrust
  | OperationResultTrAccountMerge
  | OperationResultTrInflation
  | OperationResultTrManageData
  | OperationResultTrBumpSequence
  | OperationResultTrManageBuyOffer
  | OperationResultTrPathPaymentStrictSend
  | OperationResultTrCreateClaimableBalance
  | OperationResultTrClaimClaimableBalance
  | OperationResultTrBeginSponsoringFutureReserves
  | OperationResultTrEndSponsoringFutureReserves
  | OperationResultTrRevokeSponsorship
  | OperationResultTrClawback
  | OperationResultTrClawbackClaimableBalance
  | OperationResultTrSetTrustLineFlags
  | OperationResultTrLiquidityPoolDeposit
  | OperationResultTrLiquidityPoolWithdraw
  | OperationResultTrInvokeHostFunction
  | OperationResultTrExtendFootprintTtl
  | OperationResultTrRestoreFootprint;
export const OperationResultTr = OperationResultTrBase;
