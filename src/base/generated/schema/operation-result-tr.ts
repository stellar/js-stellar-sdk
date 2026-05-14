// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AccountMergeResult } from "./account-merge-result.js";
import { AllowTrustResult } from "./allow-trust-result.js";
import { BeginSponsoringFutureReservesResult } from "./begin-sponsoring-future-reserves-result.js";
import { BumpSequenceResult } from "./bump-sequence-result.js";
import { ChangeTrustResult } from "./change-trust-result.js";
import { ClaimClaimableBalanceResult } from "./claim-claimable-balance-result.js";
import { ClawbackClaimableBalanceResult } from "./clawback-claimable-balance-result.js";
import { ClawbackResult } from "./clawback-result.js";
import { CreateAccountResult } from "./create-account-result.js";
import { CreateClaimableBalanceResult } from "./create-claimable-balance-result.js";
import { EndSponsoringFutureReservesResult } from "./end-sponsoring-future-reserves-result.js";
import { ExtendFootprintTTLResult } from "./extend-footprint-ttl-result.js";
import { InflationResult } from "./inflation-result.js";
import { InvokeHostFunctionResult } from "./invoke-host-function-result.js";
import { LiquidityPoolDepositResult } from "./liquidity-pool-deposit-result.js";
import { LiquidityPoolWithdrawResult } from "./liquidity-pool-withdraw-result.js";
import { ManageBuyOfferResult } from "./manage-buy-offer-result.js";
import { ManageDataResult } from "./manage-data-result.js";
import { ManageSellOfferResult } from "./manage-sell-offer-result.js";
import { OperationType } from "./operation-type.js";
import { PathPaymentStrictReceiveResult } from "./path-payment-strict-receive-result.js";
import { PathPaymentStrictSendResult } from "./path-payment-strict-send-result.js";
import { PaymentResult } from "./payment-result.js";
import { RestoreFootprintResult } from "./restore-footprint-result.js";
import { RevokeSponsorshipResult } from "./revoke-sponsorship-result.js";
import { SetOptionsResult } from "./set-options-result.js";
import { SetTrustLineFlagsResult } from "./set-trust-line-flags-result.js";
export type OperationResultTr =
  | {
      readonly type: 0;
      readonly createAccountResult: CreateAccountResult;
    }
  | {
      readonly type: 1;
      readonly paymentResult: PaymentResult;
    }
  | {
      readonly type: 2;
      readonly pathPaymentStrictReceiveResult: PathPaymentStrictReceiveResult;
    }
  | {
      readonly type: 3;
      readonly manageSellOfferResult: ManageSellOfferResult;
    }
  | {
      readonly type: 4;
      readonly createPassiveSellOfferResult: ManageSellOfferResult;
    }
  | {
      readonly type: 5;
      readonly setOptionsResult: SetOptionsResult;
    }
  | {
      readonly type: 6;
      readonly changeTrustResult: ChangeTrustResult;
    }
  | {
      readonly type: 7;
      readonly allowTrustResult: AllowTrustResult;
    }
  | {
      readonly type: 8;
      readonly accountMergeResult: AccountMergeResult;
    }
  | {
      readonly type: 9;
      readonly inflationResult: InflationResult;
    }
  | {
      readonly type: 10;
      readonly manageDataResult: ManageDataResult;
    }
  | {
      readonly type: 11;
      readonly bumpSeqResult: BumpSequenceResult;
    }
  | {
      readonly type: 12;
      readonly manageBuyOfferResult: ManageBuyOfferResult;
    }
  | {
      readonly type: 13;
      readonly pathPaymentStrictSendResult: PathPaymentStrictSendResult;
    }
  | {
      readonly type: 14;
      readonly createClaimableBalanceResult: CreateClaimableBalanceResult;
    }
  | {
      readonly type: 15;
      readonly claimClaimableBalanceResult: ClaimClaimableBalanceResult;
    }
  | {
      readonly type: 16;
      readonly beginSponsoringFutureReservesResult: BeginSponsoringFutureReservesResult;
    }
  | {
      readonly type: 17;
      readonly endSponsoringFutureReservesResult: EndSponsoringFutureReservesResult;
    }
  | {
      readonly type: 18;
      readonly revokeSponsorshipResult: RevokeSponsorshipResult;
    }
  | {
      readonly type: 19;
      readonly clawbackResult: ClawbackResult;
    }
  | {
      readonly type: 20;
      readonly clawbackClaimableBalanceResult: ClawbackClaimableBalanceResult;
    }
  | {
      readonly type: 21;
      readonly setTrustLineFlagsResult: SetTrustLineFlagsResult;
    }
  | {
      readonly type: 22;
      readonly liquidityPoolDepositResult: LiquidityPoolDepositResult;
    }
  | {
      readonly type: 23;
      readonly liquidityPoolWithdrawResult: LiquidityPoolWithdrawResult;
    }
  | {
      readonly type: 24;
      readonly invokeHostFunctionResult: InvokeHostFunctionResult;
    }
  | {
      readonly type: 25;
      readonly extendFootprintTTLResult: ExtendFootprintTTLResult;
    }
  | {
      readonly type: 26;
      readonly restoreFootprintResult: RestoreFootprintResult;
    };
export const OperationResultTr = xdr.union("OperationResultTr", {
  switchOn: xdr.lazy(() => OperationType),
  switchKey: "type",
  cases: [
    xdr.case(
      "createAccount",
      0,
      xdr.field(
        "createAccountResult",
        xdr.lazy(() => CreateAccountResult),
      ),
    ),
    xdr.case(
      "payment",
      1,
      xdr.field(
        "paymentResult",
        xdr.lazy(() => PaymentResult),
      ),
    ),
    xdr.case(
      "pathPaymentStrictReceive",
      2,
      xdr.field(
        "pathPaymentStrictReceiveResult",
        xdr.lazy(() => PathPaymentStrictReceiveResult),
      ),
    ),
    xdr.case(
      "manageSellOffer",
      3,
      xdr.field(
        "manageSellOfferResult",
        xdr.lazy(() => ManageSellOfferResult),
      ),
    ),
    xdr.case(
      "createPassiveSellOffer",
      4,
      xdr.field(
        "createPassiveSellOfferResult",
        xdr.lazy(() => ManageSellOfferResult),
      ),
    ),
    xdr.case(
      "setOptions",
      5,
      xdr.field(
        "setOptionsResult",
        xdr.lazy(() => SetOptionsResult),
      ),
    ),
    xdr.case(
      "changeTrust",
      6,
      xdr.field(
        "changeTrustResult",
        xdr.lazy(() => ChangeTrustResult),
      ),
    ),
    xdr.case(
      "allowTrust",
      7,
      xdr.field(
        "allowTrustResult",
        xdr.lazy(() => AllowTrustResult),
      ),
    ),
    xdr.case(
      "accountMerge",
      8,
      xdr.field(
        "accountMergeResult",
        xdr.lazy(() => AccountMergeResult),
      ),
    ),
    xdr.case(
      "inflation",
      9,
      xdr.field(
        "inflationResult",
        xdr.lazy(() => InflationResult),
      ),
    ),
    xdr.case(
      "manageData",
      10,
      xdr.field(
        "manageDataResult",
        xdr.lazy(() => ManageDataResult),
      ),
    ),
    xdr.case(
      "bumpSequence",
      11,
      xdr.field(
        "bumpSeqResult",
        xdr.lazy(() => BumpSequenceResult),
      ),
    ),
    xdr.case(
      "manageBuyOffer",
      12,
      xdr.field(
        "manageBuyOfferResult",
        xdr.lazy(() => ManageBuyOfferResult),
      ),
    ),
    xdr.case(
      "pathPaymentStrictSend",
      13,
      xdr.field(
        "pathPaymentStrictSendResult",
        xdr.lazy(() => PathPaymentStrictSendResult),
      ),
    ),
    xdr.case(
      "createClaimableBalance",
      14,
      xdr.field(
        "createClaimableBalanceResult",
        xdr.lazy(() => CreateClaimableBalanceResult),
      ),
    ),
    xdr.case(
      "claimClaimableBalance",
      15,
      xdr.field(
        "claimClaimableBalanceResult",
        xdr.lazy(() => ClaimClaimableBalanceResult),
      ),
    ),
    xdr.case(
      "beginSponsoringFutureReserves",
      16,
      xdr.field(
        "beginSponsoringFutureReservesResult",
        xdr.lazy(() => BeginSponsoringFutureReservesResult),
      ),
    ),
    xdr.case(
      "endSponsoringFutureReserves",
      17,
      xdr.field(
        "endSponsoringFutureReservesResult",
        xdr.lazy(() => EndSponsoringFutureReservesResult),
      ),
    ),
    xdr.case(
      "revokeSponsorship",
      18,
      xdr.field(
        "revokeSponsorshipResult",
        xdr.lazy(() => RevokeSponsorshipResult),
      ),
    ),
    xdr.case(
      "clawback",
      19,
      xdr.field(
        "clawbackResult",
        xdr.lazy(() => ClawbackResult),
      ),
    ),
    xdr.case(
      "clawbackClaimableBalance",
      20,
      xdr.field(
        "clawbackClaimableBalanceResult",
        xdr.lazy(() => ClawbackClaimableBalanceResult),
      ),
    ),
    xdr.case(
      "setTrustLineFlags",
      21,
      xdr.field(
        "setTrustLineFlagsResult",
        xdr.lazy(() => SetTrustLineFlagsResult),
      ),
    ),
    xdr.case(
      "liquidityPoolDeposit",
      22,
      xdr.field(
        "liquidityPoolDepositResult",
        xdr.lazy(() => LiquidityPoolDepositResult),
      ),
    ),
    xdr.case(
      "liquidityPoolWithdraw",
      23,
      xdr.field(
        "liquidityPoolWithdrawResult",
        xdr.lazy(() => LiquidityPoolWithdrawResult),
      ),
    ),
    xdr.case(
      "invokeHostFunction",
      24,
      xdr.field(
        "invokeHostFunctionResult",
        xdr.lazy(() => InvokeHostFunctionResult),
      ),
    ),
    xdr.case(
      "extendFootprintTtl",
      25,
      xdr.field(
        "extendFootprintTTLResult",
        xdr.lazy(() => ExtendFootprintTTLResult),
      ),
    ),
    xdr.case(
      "restoreFootprint",
      26,
      xdr.field(
        "restoreFootprintResult",
        xdr.lazy(() => RestoreFootprintResult),
      ),
    ),
  ] as const,
}) as xdr.XdrType<OperationResultTr>;
