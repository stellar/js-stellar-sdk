/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { OperationResultCode } from "./operation-result-code.js";
import {
  OperationResultTr,
  type OperationResultTrWire,
} from "./operation-result-tr.js";

export type OperationResultWire =
  | { code: 0; tr: OperationResultTrWire }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 };

export type OperationResultVariantName =
  | "opInner"
  | "opBadAuth"
  | "opNoAccount"
  | "opNotSupported"
  | "opTooManySubentries"
  | "opExceededWorkLimit"
  | "opTooManySponsoring";

/**
 * ```xdr
 * union OperationResult switch (OperationResultCode code)
 * {
 * case opINNER:
 *     union switch (OperationType type)
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
 *     tr;
 * case opBAD_AUTH:
 * case opNO_ACCOUNT:
 * case opNOT_SUPPORTED:
 * case opTOO_MANY_SUBENTRIES:
 * case opEXCEEDED_WORK_LIMIT:
 * case opTOO_MANY_SPONSORING:
 *     void;
 * };
 * ```
 */
abstract class OperationResultBase extends XdrValue {
  abstract readonly type: OperationResultVariantName;

  static readonly schema: XdrType<OperationResultWire> = union(
    "OperationResult",
    {
      switchOn: OperationResultCode.schema,
      cases: [
        case_("opInner", 0, field("tr", OperationResultTr.schema)),
        case_("opBadAuth", -1, voidType()),
        case_("opNoAccount", -2, voidType()),
        case_("opNotSupported", -3, voidType()),
        case_("opTooManySubentries", -4, voidType()),
        case_("opExceededWorkLimit", -5, voidType()),
        case_("opTooManySponsoring", -6, voidType()),
      ],
      switchKey: "code",
    },
  );

  static opInner(tr: OperationResultTr): OperationResultOpInner {
    return new OperationResultOpInner(tr);
  }

  static opBadAuth(): OperationResultOpBadAuth {
    return new OperationResultOpBadAuth();
  }

  static opNoAccount(): OperationResultOpNoAccount {
    return new OperationResultOpNoAccount();
  }

  static opNotSupported(): OperationResultOpNotSupported {
    return new OperationResultOpNotSupported();
  }

  static opTooManySubentries(): OperationResultOpTooManySubentries {
    return new OperationResultOpTooManySubentries();
  }

  static opExceededWorkLimit(): OperationResultOpExceededWorkLimit {
    return new OperationResultOpExceededWorkLimit();
  }

  static opTooManySponsoring(): OperationResultOpTooManySponsoring {
    return new OperationResultOpTooManySponsoring();
  }

  static fromXdrObject(wire: OperationResultWire): OperationResult {
    switch (wire.code) {
      case 0:
        return new OperationResultOpInner(
          OperationResultTr.fromXdrObject(wire.tr),
        );
      case -1:
        return new OperationResultOpBadAuth();
      case -2:
        return new OperationResultOpNoAccount();
      case -3:
        return new OperationResultOpNotSupported();
      case -4:
        return new OperationResultOpTooManySubentries();
      case -5:
        return new OperationResultOpExceededWorkLimit();
      case -6:
        return new OperationResultOpTooManySponsoring();
    }
  }

  abstract toXdrObject(): OperationResultWire;
}

export class OperationResultOpInner extends OperationResultBase {
  readonly type = "opInner" as const;
  readonly tr: OperationResultTr;

  constructor(tr: OperationResultTr) {
    super();
    this.tr = tr;
  }

  get value(): OperationResultTr {
    return this.tr;
  }

  toXdrObject(): Extract<OperationResultWire, { code: 0 }> {
    return { code: 0, tr: this.tr.toXdrObject() };
  }
}

export class OperationResultOpBadAuth extends OperationResultBase {
  readonly type = "opBadAuth" as const;

  toXdrObject(): Extract<OperationResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class OperationResultOpNoAccount extends OperationResultBase {
  readonly type = "opNoAccount" as const;

  toXdrObject(): Extract<OperationResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class OperationResultOpNotSupported extends OperationResultBase {
  readonly type = "opNotSupported" as const;

  toXdrObject(): Extract<OperationResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class OperationResultOpTooManySubentries extends OperationResultBase {
  readonly type = "opTooManySubentries" as const;

  toXdrObject(): Extract<OperationResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class OperationResultOpExceededWorkLimit extends OperationResultBase {
  readonly type = "opExceededWorkLimit" as const;

  toXdrObject(): Extract<OperationResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class OperationResultOpTooManySponsoring extends OperationResultBase {
  readonly type = "opTooManySponsoring" as const;

  toXdrObject(): Extract<OperationResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export type OperationResult =
  | OperationResultOpInner
  | OperationResultOpBadAuth
  | OperationResultOpNoAccount
  | OperationResultOpNotSupported
  | OperationResultOpTooManySubentries
  | OperationResultOpExceededWorkLimit
  | OperationResultOpTooManySponsoring;
export const OperationResult = OperationResultBase;
