// Automatically generated from /Users/ryanyang/dev/js-stellar-sdk/xdr/xdr.json
// DO NOT EDIT.

import * as xdr from "../../new-xdr/index.js";
import { AllowTrustOp } from "./allow-trust-op.js";
import { BeginSponsoringFutureReservesOp } from "./begin-sponsoring-future-reserves-op.js";
import { BumpSequenceOp } from "./bump-sequence-op.js";
import { ChangeTrustOp } from "./change-trust-op.js";
import { ClaimClaimableBalanceOp } from "./claim-claimable-balance-op.js";
import { ClawbackClaimableBalanceOp } from "./clawback-claimable-balance-op.js";
import { ClawbackOp } from "./clawback-op.js";
import { CreateAccountOp } from "./create-account-op.js";
import { CreateClaimableBalanceOp } from "./create-claimable-balance-op.js";
import { CreatePassiveSellOfferOp } from "./create-passive-sell-offer-op.js";
import { ExtendFootprintTTLOp } from "./extend-footprint-ttl-op.js";
import { InvokeHostFunctionOp } from "./invoke-host-function-op.js";
import { LiquidityPoolDepositOp } from "./liquidity-pool-deposit-op.js";
import { LiquidityPoolWithdrawOp } from "./liquidity-pool-withdraw-op.js";
import { ManageBuyOfferOp } from "./manage-buy-offer-op.js";
import { ManageDataOp } from "./manage-data-op.js";
import { ManageSellOfferOp } from "./manage-sell-offer-op.js";
import { MuxedAccount } from "./muxed-account.js";
import { OperationType } from "./operation-type.js";
import { PathPaymentStrictReceiveOp } from "./path-payment-strict-receive-op.js";
import { PathPaymentStrictSendOp } from "./path-payment-strict-send-op.js";
import { PaymentOp } from "./payment-op.js";
import { RestoreFootprintOp } from "./restore-footprint-op.js";
import { RevokeSponsorshipOp } from "./revoke-sponsorship-op.js";
import { SetOptionsOp } from "./set-options-op.js";
import { SetTrustLineFlagsOp } from "./set-trust-line-flags-op.js";
export type OperationBody =
  | {
      readonly type: 0;
      readonly createAccountOp: CreateAccountOp;
    }
  | {
      readonly type: 1;
      readonly paymentOp: PaymentOp;
    }
  | {
      readonly type: 2;
      readonly pathPaymentStrictReceiveOp: PathPaymentStrictReceiveOp;
    }
  | {
      readonly type: 3;
      readonly manageSellOfferOp: ManageSellOfferOp;
    }
  | {
      readonly type: 4;
      readonly createPassiveSellOfferOp: CreatePassiveSellOfferOp;
    }
  | {
      readonly type: 5;
      readonly setOptionsOp: SetOptionsOp;
    }
  | {
      readonly type: 6;
      readonly changeTrustOp: ChangeTrustOp;
    }
  | {
      readonly type: 7;
      readonly allowTrustOp: AllowTrustOp;
    }
  | {
      readonly type: 8;
      readonly destination: MuxedAccount;
    }
  | {
      readonly type: 9;
    }
  | {
      readonly type: 10;
      readonly manageDataOp: ManageDataOp;
    }
  | {
      readonly type: 11;
      readonly bumpSequenceOp: BumpSequenceOp;
    }
  | {
      readonly type: 12;
      readonly manageBuyOfferOp: ManageBuyOfferOp;
    }
  | {
      readonly type: 13;
      readonly pathPaymentStrictSendOp: PathPaymentStrictSendOp;
    }
  | {
      readonly type: 14;
      readonly createClaimableBalanceOp: CreateClaimableBalanceOp;
    }
  | {
      readonly type: 15;
      readonly claimClaimableBalanceOp: ClaimClaimableBalanceOp;
    }
  | {
      readonly type: 16;
      readonly beginSponsoringFutureReservesOp: BeginSponsoringFutureReservesOp;
    }
  | {
      readonly type: 17;
    }
  | {
      readonly type: 18;
      readonly revokeSponsorshipOp: RevokeSponsorshipOp;
    }
  | {
      readonly type: 19;
      readonly clawbackOp: ClawbackOp;
    }
  | {
      readonly type: 20;
      readonly clawbackClaimableBalanceOp: ClawbackClaimableBalanceOp;
    }
  | {
      readonly type: 21;
      readonly setTrustLineFlagsOp: SetTrustLineFlagsOp;
    }
  | {
      readonly type: 22;
      readonly liquidityPoolDepositOp: LiquidityPoolDepositOp;
    }
  | {
      readonly type: 23;
      readonly liquidityPoolWithdrawOp: LiquidityPoolWithdrawOp;
    }
  | {
      readonly type: 24;
      readonly invokeHostFunctionOp: InvokeHostFunctionOp;
    }
  | {
      readonly type: 25;
      readonly extendFootprintTTLOp: ExtendFootprintTTLOp;
    }
  | {
      readonly type: 26;
      readonly restoreFootprintOp: RestoreFootprintOp;
    };
export const OperationBody = xdr.union("OperationBody", {
  switchOn: xdr.lazy(() => OperationType),
  switchKey: "type",
  cases: [
    xdr.case(
      "createAccount",
      0,
      xdr.field(
        "createAccountOp",
        xdr.lazy(() => CreateAccountOp),
      ),
    ),
    xdr.case(
      "payment",
      1,
      xdr.field(
        "paymentOp",
        xdr.lazy(() => PaymentOp),
      ),
    ),
    xdr.case(
      "pathPaymentStrictReceive",
      2,
      xdr.field(
        "pathPaymentStrictReceiveOp",
        xdr.lazy(() => PathPaymentStrictReceiveOp),
      ),
    ),
    xdr.case(
      "manageSellOffer",
      3,
      xdr.field(
        "manageSellOfferOp",
        xdr.lazy(() => ManageSellOfferOp),
      ),
    ),
    xdr.case(
      "createPassiveSellOffer",
      4,
      xdr.field(
        "createPassiveSellOfferOp",
        xdr.lazy(() => CreatePassiveSellOfferOp),
      ),
    ),
    xdr.case(
      "setOptions",
      5,
      xdr.field(
        "setOptionsOp",
        xdr.lazy(() => SetOptionsOp),
      ),
    ),
    xdr.case(
      "changeTrust",
      6,
      xdr.field(
        "changeTrustOp",
        xdr.lazy(() => ChangeTrustOp),
      ),
    ),
    xdr.case(
      "allowTrust",
      7,
      xdr.field(
        "allowTrustOp",
        xdr.lazy(() => AllowTrustOp),
      ),
    ),
    xdr.case(
      "accountMerge",
      8,
      xdr.field(
        "destination",
        xdr.lazy(() => MuxedAccount),
      ),
    ),
    xdr.case("inflation", 9, xdr.void()),
    xdr.case(
      "manageData",
      10,
      xdr.field(
        "manageDataOp",
        xdr.lazy(() => ManageDataOp),
      ),
    ),
    xdr.case(
      "bumpSequence",
      11,
      xdr.field(
        "bumpSequenceOp",
        xdr.lazy(() => BumpSequenceOp),
      ),
    ),
    xdr.case(
      "manageBuyOffer",
      12,
      xdr.field(
        "manageBuyOfferOp",
        xdr.lazy(() => ManageBuyOfferOp),
      ),
    ),
    xdr.case(
      "pathPaymentStrictSend",
      13,
      xdr.field(
        "pathPaymentStrictSendOp",
        xdr.lazy(() => PathPaymentStrictSendOp),
      ),
    ),
    xdr.case(
      "createClaimableBalance",
      14,
      xdr.field(
        "createClaimableBalanceOp",
        xdr.lazy(() => CreateClaimableBalanceOp),
      ),
    ),
    xdr.case(
      "claimClaimableBalance",
      15,
      xdr.field(
        "claimClaimableBalanceOp",
        xdr.lazy(() => ClaimClaimableBalanceOp),
      ),
    ),
    xdr.case(
      "beginSponsoringFutureReserves",
      16,
      xdr.field(
        "beginSponsoringFutureReservesOp",
        xdr.lazy(() => BeginSponsoringFutureReservesOp),
      ),
    ),
    xdr.case("endSponsoringFutureReserves", 17, xdr.void()),
    xdr.case(
      "revokeSponsorship",
      18,
      xdr.field(
        "revokeSponsorshipOp",
        xdr.lazy(() => RevokeSponsorshipOp),
      ),
    ),
    xdr.case(
      "clawback",
      19,
      xdr.field(
        "clawbackOp",
        xdr.lazy(() => ClawbackOp),
      ),
    ),
    xdr.case(
      "clawbackClaimableBalance",
      20,
      xdr.field(
        "clawbackClaimableBalanceOp",
        xdr.lazy(() => ClawbackClaimableBalanceOp),
      ),
    ),
    xdr.case(
      "setTrustLineFlags",
      21,
      xdr.field(
        "setTrustLineFlagsOp",
        xdr.lazy(() => SetTrustLineFlagsOp),
      ),
    ),
    xdr.case(
      "liquidityPoolDeposit",
      22,
      xdr.field(
        "liquidityPoolDepositOp",
        xdr.lazy(() => LiquidityPoolDepositOp),
      ),
    ),
    xdr.case(
      "liquidityPoolWithdraw",
      23,
      xdr.field(
        "liquidityPoolWithdrawOp",
        xdr.lazy(() => LiquidityPoolWithdrawOp),
      ),
    ),
    xdr.case(
      "invokeHostFunction",
      24,
      xdr.field(
        "invokeHostFunctionOp",
        xdr.lazy(() => InvokeHostFunctionOp),
      ),
    ),
    xdr.case(
      "extendFootprintTtl",
      25,
      xdr.field(
        "extendFootprintTTLOp",
        xdr.lazy(() => ExtendFootprintTTLOp),
      ),
    ),
    xdr.case(
      "restoreFootprint",
      26,
      xdr.field(
        "restoreFootprintOp",
        xdr.lazy(() => RestoreFootprintOp),
      ),
    ),
  ] as const,
}) as xdr.XdrType<OperationBody>;
