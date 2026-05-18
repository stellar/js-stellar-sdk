/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { OperationType } from "./operation-type.js";
import {
  CreateAccountOp,
  type CreateAccountOpWire,
} from "./create-account-op.js";
import { PaymentOp, type PaymentOpWire } from "./payment-op.js";
import {
  PathPaymentStrictReceiveOp,
  type PathPaymentStrictReceiveOpWire,
} from "./path-payment-strict-receive-op.js";
import {
  ManageSellOfferOp,
  type ManageSellOfferOpWire,
} from "./manage-sell-offer-op.js";
import {
  CreatePassiveSellOfferOp,
  type CreatePassiveSellOfferOpWire,
} from "./create-passive-sell-offer-op.js";
import { SetOptionsOp, type SetOptionsOpWire } from "./set-options-op.js";
import { ChangeTrustOp, type ChangeTrustOpWire } from "./change-trust-op.js";
import { AllowTrustOp, type AllowTrustOpWire } from "./allow-trust-op.js";
import { MuxedAccount, type MuxedAccountWire } from "./muxed-account.js";
import { ManageDataOp, type ManageDataOpWire } from "./manage-data-op.js";
import { BumpSequenceOp, type BumpSequenceOpWire } from "./bump-sequence-op.js";
import {
  ManageBuyOfferOp,
  type ManageBuyOfferOpWire,
} from "./manage-buy-offer-op.js";
import {
  PathPaymentStrictSendOp,
  type PathPaymentStrictSendOpWire,
} from "./path-payment-strict-send-op.js";
import {
  CreateClaimableBalanceOp,
  type CreateClaimableBalanceOpWire,
} from "./create-claimable-balance-op.js";
import {
  ClaimClaimableBalanceOp,
  type ClaimClaimableBalanceOpWire,
} from "./claim-claimable-balance-op.js";
import {
  BeginSponsoringFutureReservesOp,
  type BeginSponsoringFutureReservesOpWire,
} from "./begin-sponsoring-future-reserves-op.js";
import {
  RevokeSponsorshipOp,
  type RevokeSponsorshipOpWire,
} from "./revoke-sponsorship-op.js";
import { ClawbackOp, type ClawbackOpWire } from "./clawback-op.js";
import {
  ClawbackClaimableBalanceOp,
  type ClawbackClaimableBalanceOpWire,
} from "./clawback-claimable-balance-op.js";
import {
  SetTrustLineFlagsOp,
  type SetTrustLineFlagsOpWire,
} from "./set-trust-line-flags-op.js";
import {
  LiquidityPoolDepositOp,
  type LiquidityPoolDepositOpWire,
} from "./liquidity-pool-deposit-op.js";
import {
  LiquidityPoolWithdrawOp,
  type LiquidityPoolWithdrawOpWire,
} from "./liquidity-pool-withdraw-op.js";
import {
  InvokeHostFunctionOp,
  type InvokeHostFunctionOpWire,
} from "./invoke-host-function-op.js";
import {
  ExtendFootprintTtlOp,
  type ExtendFootprintTtlOpWire,
} from "./extend-footprint-ttl-op.js";
import {
  RestoreFootprintOp,
  type RestoreFootprintOpWire,
} from "./restore-footprint-op.js";

export type OperationBodyWire =
  | { type: 0; createAccountOp: CreateAccountOpWire }
  | { type: 1; paymentOp: PaymentOpWire }
  | { type: 2; pathPaymentStrictReceiveOp: PathPaymentStrictReceiveOpWire }
  | { type: 3; manageSellOfferOp: ManageSellOfferOpWire }
  | { type: 4; createPassiveSellOfferOp: CreatePassiveSellOfferOpWire }
  | { type: 5; setOptionsOp: SetOptionsOpWire }
  | { type: 6; changeTrustOp: ChangeTrustOpWire }
  | { type: 7; allowTrustOp: AllowTrustOpWire }
  | { type: 8; destination: MuxedAccountWire }
  | { type: 9 }
  | { type: 10; manageDataOp: ManageDataOpWire }
  | { type: 11; bumpSequenceOp: BumpSequenceOpWire }
  | { type: 12; manageBuyOfferOp: ManageBuyOfferOpWire }
  | { type: 13; pathPaymentStrictSendOp: PathPaymentStrictSendOpWire }
  | { type: 14; createClaimableBalanceOp: CreateClaimableBalanceOpWire }
  | { type: 15; claimClaimableBalanceOp: ClaimClaimableBalanceOpWire }
  | {
      type: 16;
      beginSponsoringFutureReservesOp: BeginSponsoringFutureReservesOpWire;
    }
  | { type: 17 }
  | { type: 18; revokeSponsorshipOp: RevokeSponsorshipOpWire }
  | { type: 19; clawbackOp: ClawbackOpWire }
  | { type: 20; clawbackClaimableBalanceOp: ClawbackClaimableBalanceOpWire }
  | { type: 21; setTrustLineFlagsOp: SetTrustLineFlagsOpWire }
  | { type: 22; liquidityPoolDepositOp: LiquidityPoolDepositOpWire }
  | { type: 23; liquidityPoolWithdrawOp: LiquidityPoolWithdrawOpWire }
  | { type: 24; invokeHostFunctionOp: InvokeHostFunctionOpWire }
  | { type: 25; extendFootprintTtlOp: ExtendFootprintTtlOpWire }
  | { type: 26; restoreFootprintOp: RestoreFootprintOpWire };

export type OperationBodyVariantName =
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
 *         CreateAccountOp createAccountOp;
 *     case PAYMENT:
 *         PaymentOp paymentOp;
 *     case PATH_PAYMENT_STRICT_RECEIVE:
 *         PathPaymentStrictReceiveOp pathPaymentStrictReceiveOp;
 *     case MANAGE_SELL_OFFER:
 *         ManageSellOfferOp manageSellOfferOp;
 *     case CREATE_PASSIVE_SELL_OFFER:
 *         CreatePassiveSellOfferOp createPassiveSellOfferOp;
 *     case SET_OPTIONS:
 *         SetOptionsOp setOptionsOp;
 *     case CHANGE_TRUST:
 *         ChangeTrustOp changeTrustOp;
 *     case ALLOW_TRUST:
 *         AllowTrustOp allowTrustOp;
 *     case ACCOUNT_MERGE:
 *         MuxedAccount destination;
 *     case INFLATION:
 *         void;
 *     case MANAGE_DATA:
 *         ManageDataOp manageDataOp;
 *     case BUMP_SEQUENCE:
 *         BumpSequenceOp bumpSequenceOp;
 *     case MANAGE_BUY_OFFER:
 *         ManageBuyOfferOp manageBuyOfferOp;
 *     case PATH_PAYMENT_STRICT_SEND:
 *         PathPaymentStrictSendOp pathPaymentStrictSendOp;
 *     case CREATE_CLAIMABLE_BALANCE:
 *         CreateClaimableBalanceOp createClaimableBalanceOp;
 *     case CLAIM_CLAIMABLE_BALANCE:
 *         ClaimClaimableBalanceOp claimClaimableBalanceOp;
 *     case BEGIN_SPONSORING_FUTURE_RESERVES:
 *         BeginSponsoringFutureReservesOp beginSponsoringFutureReservesOp;
 *     case END_SPONSORING_FUTURE_RESERVES:
 *         void;
 *     case REVOKE_SPONSORSHIP:
 *         RevokeSponsorshipOp revokeSponsorshipOp;
 *     case CLAWBACK:
 *         ClawbackOp clawbackOp;
 *     case CLAWBACK_CLAIMABLE_BALANCE:
 *         ClawbackClaimableBalanceOp clawbackClaimableBalanceOp;
 *     case SET_TRUST_LINE_FLAGS:
 *         SetTrustLineFlagsOp setTrustLineFlagsOp;
 *     case LIQUIDITY_POOL_DEPOSIT:
 *         LiquidityPoolDepositOp liquidityPoolDepositOp;
 *     case LIQUIDITY_POOL_WITHDRAW:
 *         LiquidityPoolWithdrawOp liquidityPoolWithdrawOp;
 *     case INVOKE_HOST_FUNCTION:
 *         InvokeHostFunctionOp invokeHostFunctionOp;
 *     case EXTEND_FOOTPRINT_TTL:
 *         ExtendFootprintTTLOp extendFootprintTTLOp;
 *     case RESTORE_FOOTPRINT:
 *         RestoreFootprintOp restoreFootprintOp;
 *     }
 * ```
 */
abstract class OperationBodyBase extends XdrValue {
  abstract readonly type: OperationBodyVariantName;

  static readonly schema: XdrType<OperationBodyWire> = union("OperationBody", {
    switchOn: OperationType.schema,
    cases: [
      case_(
        "createAccount",
        0,
        field("createAccountOp", CreateAccountOp.schema),
      ),
      case_("payment", 1, field("paymentOp", PaymentOp.schema)),
      case_(
        "pathPaymentStrictReceive",
        2,
        field("pathPaymentStrictReceiveOp", PathPaymentStrictReceiveOp.schema),
      ),
      case_(
        "manageSellOffer",
        3,
        field("manageSellOfferOp", ManageSellOfferOp.schema),
      ),
      case_(
        "createPassiveSellOffer",
        4,
        field("createPassiveSellOfferOp", CreatePassiveSellOfferOp.schema),
      ),
      case_("setOptions", 5, field("setOptionsOp", SetOptionsOp.schema)),
      case_("changeTrust", 6, field("changeTrustOp", ChangeTrustOp.schema)),
      case_("allowTrust", 7, field("allowTrustOp", AllowTrustOp.schema)),
      case_("accountMerge", 8, field("destination", MuxedAccount.schema)),
      case_("inflation", 9, voidType()),
      case_("manageData", 10, field("manageDataOp", ManageDataOp.schema)),
      case_("bumpSequence", 11, field("bumpSequenceOp", BumpSequenceOp.schema)),
      case_(
        "manageBuyOffer",
        12,
        field("manageBuyOfferOp", ManageBuyOfferOp.schema),
      ),
      case_(
        "pathPaymentStrictSend",
        13,
        field("pathPaymentStrictSendOp", PathPaymentStrictSendOp.schema),
      ),
      case_(
        "createClaimableBalance",
        14,
        field("createClaimableBalanceOp", CreateClaimableBalanceOp.schema),
      ),
      case_(
        "claimClaimableBalance",
        15,
        field("claimClaimableBalanceOp", ClaimClaimableBalanceOp.schema),
      ),
      case_(
        "beginSponsoringFutureReserves",
        16,
        field(
          "beginSponsoringFutureReservesOp",
          BeginSponsoringFutureReservesOp.schema,
        ),
      ),
      case_("endSponsoringFutureReserves", 17, voidType()),
      case_(
        "revokeSponsorship",
        18,
        field("revokeSponsorshipOp", RevokeSponsorshipOp.schema),
      ),
      case_("clawback", 19, field("clawbackOp", ClawbackOp.schema)),
      case_(
        "clawbackClaimableBalance",
        20,
        field("clawbackClaimableBalanceOp", ClawbackClaimableBalanceOp.schema),
      ),
      case_(
        "setTrustLineFlags",
        21,
        field("setTrustLineFlagsOp", SetTrustLineFlagsOp.schema),
      ),
      case_(
        "liquidityPoolDeposit",
        22,
        field("liquidityPoolDepositOp", LiquidityPoolDepositOp.schema),
      ),
      case_(
        "liquidityPoolWithdraw",
        23,
        field("liquidityPoolWithdrawOp", LiquidityPoolWithdrawOp.schema),
      ),
      case_(
        "invokeHostFunction",
        24,
        field("invokeHostFunctionOp", InvokeHostFunctionOp.schema),
      ),
      case_(
        "extendFootprintTtl",
        25,
        field("extendFootprintTtlOp", ExtendFootprintTtlOp.schema),
      ),
      case_(
        "restoreFootprint",
        26,
        field("restoreFootprintOp", RestoreFootprintOp.schema),
      ),
    ],
  });

  static createAccount(
    createAccountOp: CreateAccountOp,
  ): OperationBodyCreateAccount {
    return new OperationBodyCreateAccount(createAccountOp);
  }

  static payment(paymentOp: PaymentOp): OperationBodyPayment {
    return new OperationBodyPayment(paymentOp);
  }

  static pathPaymentStrictReceive(
    pathPaymentStrictReceiveOp: PathPaymentStrictReceiveOp,
  ): OperationBodyPathPaymentStrictReceive {
    return new OperationBodyPathPaymentStrictReceive(
      pathPaymentStrictReceiveOp,
    );
  }

  static manageSellOffer(
    manageSellOfferOp: ManageSellOfferOp,
  ): OperationBodyManageSellOffer {
    return new OperationBodyManageSellOffer(manageSellOfferOp);
  }

  static createPassiveSellOffer(
    createPassiveSellOfferOp: CreatePassiveSellOfferOp,
  ): OperationBodyCreatePassiveSellOffer {
    return new OperationBodyCreatePassiveSellOffer(createPassiveSellOfferOp);
  }

  static setOptions(setOptionsOp: SetOptionsOp): OperationBodySetOptions {
    return new OperationBodySetOptions(setOptionsOp);
  }

  static changeTrust(changeTrustOp: ChangeTrustOp): OperationBodyChangeTrust {
    return new OperationBodyChangeTrust(changeTrustOp);
  }

  static allowTrust(allowTrustOp: AllowTrustOp): OperationBodyAllowTrust {
    return new OperationBodyAllowTrust(allowTrustOp);
  }

  static accountMerge(destination: MuxedAccount): OperationBodyAccountMerge {
    return new OperationBodyAccountMerge(destination);
  }

  static inflation(): OperationBodyInflation {
    return new OperationBodyInflation();
  }

  static manageData(manageDataOp: ManageDataOp): OperationBodyManageData {
    return new OperationBodyManageData(manageDataOp);
  }

  static bumpSequence(
    bumpSequenceOp: BumpSequenceOp,
  ): OperationBodyBumpSequence {
    return new OperationBodyBumpSequence(bumpSequenceOp);
  }

  static manageBuyOffer(
    manageBuyOfferOp: ManageBuyOfferOp,
  ): OperationBodyManageBuyOffer {
    return new OperationBodyManageBuyOffer(manageBuyOfferOp);
  }

  static pathPaymentStrictSend(
    pathPaymentStrictSendOp: PathPaymentStrictSendOp,
  ): OperationBodyPathPaymentStrictSend {
    return new OperationBodyPathPaymentStrictSend(pathPaymentStrictSendOp);
  }

  static createClaimableBalance(
    createClaimableBalanceOp: CreateClaimableBalanceOp,
  ): OperationBodyCreateClaimableBalance {
    return new OperationBodyCreateClaimableBalance(createClaimableBalanceOp);
  }

  static claimClaimableBalance(
    claimClaimableBalanceOp: ClaimClaimableBalanceOp,
  ): OperationBodyClaimClaimableBalance {
    return new OperationBodyClaimClaimableBalance(claimClaimableBalanceOp);
  }

  static beginSponsoringFutureReserves(
    beginSponsoringFutureReservesOp: BeginSponsoringFutureReservesOp,
  ): OperationBodyBeginSponsoringFutureReserves {
    return new OperationBodyBeginSponsoringFutureReserves(
      beginSponsoringFutureReservesOp,
    );
  }

  static endSponsoringFutureReserves(): OperationBodyEndSponsoringFutureReserves {
    return new OperationBodyEndSponsoringFutureReserves();
  }

  static revokeSponsorship(
    revokeSponsorshipOp: RevokeSponsorshipOp,
  ): OperationBodyRevokeSponsorship {
    return new OperationBodyRevokeSponsorship(revokeSponsorshipOp);
  }

  static clawback(clawbackOp: ClawbackOp): OperationBodyClawback {
    return new OperationBodyClawback(clawbackOp);
  }

  static clawbackClaimableBalance(
    clawbackClaimableBalanceOp: ClawbackClaimableBalanceOp,
  ): OperationBodyClawbackClaimableBalance {
    return new OperationBodyClawbackClaimableBalance(
      clawbackClaimableBalanceOp,
    );
  }

  static setTrustLineFlags(
    setTrustLineFlagsOp: SetTrustLineFlagsOp,
  ): OperationBodySetTrustLineFlags {
    return new OperationBodySetTrustLineFlags(setTrustLineFlagsOp);
  }

  static liquidityPoolDeposit(
    liquidityPoolDepositOp: LiquidityPoolDepositOp,
  ): OperationBodyLiquidityPoolDeposit {
    return new OperationBodyLiquidityPoolDeposit(liquidityPoolDepositOp);
  }

  static liquidityPoolWithdraw(
    liquidityPoolWithdrawOp: LiquidityPoolWithdrawOp,
  ): OperationBodyLiquidityPoolWithdraw {
    return new OperationBodyLiquidityPoolWithdraw(liquidityPoolWithdrawOp);
  }

  static invokeHostFunction(
    invokeHostFunctionOp: InvokeHostFunctionOp,
  ): OperationBodyInvokeHostFunction {
    return new OperationBodyInvokeHostFunction(invokeHostFunctionOp);
  }

  static extendFootprintTtl(
    extendFootprintTtlOp: ExtendFootprintTtlOp,
  ): OperationBodyExtendFootprintTtl {
    return new OperationBodyExtendFootprintTtl(extendFootprintTtlOp);
  }

  static restoreFootprint(
    restoreFootprintOp: RestoreFootprintOp,
  ): OperationBodyRestoreFootprint {
    return new OperationBodyRestoreFootprint(restoreFootprintOp);
  }

  static fromXdrObject(wire: OperationBodyWire): OperationBody {
    switch (wire.type) {
      case 0:
        return new OperationBodyCreateAccount(
          CreateAccountOp.fromXdrObject(wire.createAccountOp),
        );
      case 1:
        return new OperationBodyPayment(
          PaymentOp.fromXdrObject(wire.paymentOp),
        );
      case 2:
        return new OperationBodyPathPaymentStrictReceive(
          PathPaymentStrictReceiveOp.fromXdrObject(
            wire.pathPaymentStrictReceiveOp,
          ),
        );
      case 3:
        return new OperationBodyManageSellOffer(
          ManageSellOfferOp.fromXdrObject(wire.manageSellOfferOp),
        );
      case 4:
        return new OperationBodyCreatePassiveSellOffer(
          CreatePassiveSellOfferOp.fromXdrObject(wire.createPassiveSellOfferOp),
        );
      case 5:
        return new OperationBodySetOptions(
          SetOptionsOp.fromXdrObject(wire.setOptionsOp),
        );
      case 6:
        return new OperationBodyChangeTrust(
          ChangeTrustOp.fromXdrObject(wire.changeTrustOp),
        );
      case 7:
        return new OperationBodyAllowTrust(
          AllowTrustOp.fromXdrObject(wire.allowTrustOp),
        );
      case 8:
        return new OperationBodyAccountMerge(
          MuxedAccount.fromXdrObject(wire.destination),
        );
      case 9:
        return new OperationBodyInflation();
      case 10:
        return new OperationBodyManageData(
          ManageDataOp.fromXdrObject(wire.manageDataOp),
        );
      case 11:
        return new OperationBodyBumpSequence(
          BumpSequenceOp.fromXdrObject(wire.bumpSequenceOp),
        );
      case 12:
        return new OperationBodyManageBuyOffer(
          ManageBuyOfferOp.fromXdrObject(wire.manageBuyOfferOp),
        );
      case 13:
        return new OperationBodyPathPaymentStrictSend(
          PathPaymentStrictSendOp.fromXdrObject(wire.pathPaymentStrictSendOp),
        );
      case 14:
        return new OperationBodyCreateClaimableBalance(
          CreateClaimableBalanceOp.fromXdrObject(wire.createClaimableBalanceOp),
        );
      case 15:
        return new OperationBodyClaimClaimableBalance(
          ClaimClaimableBalanceOp.fromXdrObject(wire.claimClaimableBalanceOp),
        );
      case 16:
        return new OperationBodyBeginSponsoringFutureReserves(
          BeginSponsoringFutureReservesOp.fromXdrObject(
            wire.beginSponsoringFutureReservesOp,
          ),
        );
      case 17:
        return new OperationBodyEndSponsoringFutureReserves();
      case 18:
        return new OperationBodyRevokeSponsorship(
          RevokeSponsorshipOp.fromXdrObject(wire.revokeSponsorshipOp),
        );
      case 19:
        return new OperationBodyClawback(
          ClawbackOp.fromXdrObject(wire.clawbackOp),
        );
      case 20:
        return new OperationBodyClawbackClaimableBalance(
          ClawbackClaimableBalanceOp.fromXdrObject(
            wire.clawbackClaimableBalanceOp,
          ),
        );
      case 21:
        return new OperationBodySetTrustLineFlags(
          SetTrustLineFlagsOp.fromXdrObject(wire.setTrustLineFlagsOp),
        );
      case 22:
        return new OperationBodyLiquidityPoolDeposit(
          LiquidityPoolDepositOp.fromXdrObject(wire.liquidityPoolDepositOp),
        );
      case 23:
        return new OperationBodyLiquidityPoolWithdraw(
          LiquidityPoolWithdrawOp.fromXdrObject(wire.liquidityPoolWithdrawOp),
        );
      case 24:
        return new OperationBodyInvokeHostFunction(
          InvokeHostFunctionOp.fromXdrObject(wire.invokeHostFunctionOp),
        );
      case 25:
        return new OperationBodyExtendFootprintTtl(
          ExtendFootprintTtlOp.fromXdrObject(wire.extendFootprintTtlOp),
        );
      case 26:
        return new OperationBodyRestoreFootprint(
          RestoreFootprintOp.fromXdrObject(wire.restoreFootprintOp),
        );
    }
  }

  abstract toXdrObject(): OperationBodyWire;
}

export class OperationBodyCreateAccount extends OperationBodyBase {
  readonly type = "createAccount" as const;
  readonly createAccountOp: CreateAccountOp;

  constructor(createAccountOp: CreateAccountOp) {
    super();
    this.createAccountOp = createAccountOp;
  }

  get value(): CreateAccountOp {
    return this.createAccountOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 0 }> {
    return { type: 0, createAccountOp: this.createAccountOp.toXdrObject() };
  }
}

export class OperationBodyPayment extends OperationBodyBase {
  readonly type = "payment" as const;
  readonly paymentOp: PaymentOp;

  constructor(paymentOp: PaymentOp) {
    super();
    this.paymentOp = paymentOp;
  }

  get value(): PaymentOp {
    return this.paymentOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 1 }> {
    return { type: 1, paymentOp: this.paymentOp.toXdrObject() };
  }
}

export class OperationBodyPathPaymentStrictReceive extends OperationBodyBase {
  readonly type = "pathPaymentStrictReceive" as const;
  readonly pathPaymentStrictReceiveOp: PathPaymentStrictReceiveOp;

  constructor(pathPaymentStrictReceiveOp: PathPaymentStrictReceiveOp) {
    super();
    this.pathPaymentStrictReceiveOp = pathPaymentStrictReceiveOp;
  }

  get value(): PathPaymentStrictReceiveOp {
    return this.pathPaymentStrictReceiveOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 2 }> {
    return {
      type: 2,
      pathPaymentStrictReceiveOp: this.pathPaymentStrictReceiveOp.toXdrObject(),
    };
  }
}

export class OperationBodyManageSellOffer extends OperationBodyBase {
  readonly type = "manageSellOffer" as const;
  readonly manageSellOfferOp: ManageSellOfferOp;

  constructor(manageSellOfferOp: ManageSellOfferOp) {
    super();
    this.manageSellOfferOp = manageSellOfferOp;
  }

  get value(): ManageSellOfferOp {
    return this.manageSellOfferOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 3 }> {
    return { type: 3, manageSellOfferOp: this.manageSellOfferOp.toXdrObject() };
  }
}

export class OperationBodyCreatePassiveSellOffer extends OperationBodyBase {
  readonly type = "createPassiveSellOffer" as const;
  readonly createPassiveSellOfferOp: CreatePassiveSellOfferOp;

  constructor(createPassiveSellOfferOp: CreatePassiveSellOfferOp) {
    super();
    this.createPassiveSellOfferOp = createPassiveSellOfferOp;
  }

  get value(): CreatePassiveSellOfferOp {
    return this.createPassiveSellOfferOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 4 }> {
    return {
      type: 4,
      createPassiveSellOfferOp: this.createPassiveSellOfferOp.toXdrObject(),
    };
  }
}

export class OperationBodySetOptions extends OperationBodyBase {
  readonly type = "setOptions" as const;
  readonly setOptionsOp: SetOptionsOp;

  constructor(setOptionsOp: SetOptionsOp) {
    super();
    this.setOptionsOp = setOptionsOp;
  }

  get value(): SetOptionsOp {
    return this.setOptionsOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 5 }> {
    return { type: 5, setOptionsOp: this.setOptionsOp.toXdrObject() };
  }
}

export class OperationBodyChangeTrust extends OperationBodyBase {
  readonly type = "changeTrust" as const;
  readonly changeTrustOp: ChangeTrustOp;

  constructor(changeTrustOp: ChangeTrustOp) {
    super();
    this.changeTrustOp = changeTrustOp;
  }

  get value(): ChangeTrustOp {
    return this.changeTrustOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 6 }> {
    return { type: 6, changeTrustOp: this.changeTrustOp.toXdrObject() };
  }
}

export class OperationBodyAllowTrust extends OperationBodyBase {
  readonly type = "allowTrust" as const;
  readonly allowTrustOp: AllowTrustOp;

  constructor(allowTrustOp: AllowTrustOp) {
    super();
    this.allowTrustOp = allowTrustOp;
  }

  get value(): AllowTrustOp {
    return this.allowTrustOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 7 }> {
    return { type: 7, allowTrustOp: this.allowTrustOp.toXdrObject() };
  }
}

export class OperationBodyAccountMerge extends OperationBodyBase {
  readonly type = "accountMerge" as const;
  readonly destination: MuxedAccount;

  constructor(destination: MuxedAccount) {
    super();
    this.destination = destination;
  }

  get value(): MuxedAccount {
    return this.destination;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 8 }> {
    return { type: 8, destination: this.destination.toXdrObject() };
  }
}

export class OperationBodyInflation extends OperationBodyBase {
  readonly type = "inflation" as const;

  toXdrObject(): Extract<OperationBodyWire, { type: 9 }> {
    return { type: 9 };
  }
}

export class OperationBodyManageData extends OperationBodyBase {
  readonly type = "manageData" as const;
  readonly manageDataOp: ManageDataOp;

  constructor(manageDataOp: ManageDataOp) {
    super();
    this.manageDataOp = manageDataOp;
  }

  get value(): ManageDataOp {
    return this.manageDataOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 10 }> {
    return { type: 10, manageDataOp: this.manageDataOp.toXdrObject() };
  }
}

export class OperationBodyBumpSequence extends OperationBodyBase {
  readonly type = "bumpSequence" as const;
  readonly bumpSequenceOp: BumpSequenceOp;

  constructor(bumpSequenceOp: BumpSequenceOp) {
    super();
    this.bumpSequenceOp = bumpSequenceOp;
  }

  get value(): BumpSequenceOp {
    return this.bumpSequenceOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 11 }> {
    return { type: 11, bumpSequenceOp: this.bumpSequenceOp.toXdrObject() };
  }
}

export class OperationBodyManageBuyOffer extends OperationBodyBase {
  readonly type = "manageBuyOffer" as const;
  readonly manageBuyOfferOp: ManageBuyOfferOp;

  constructor(manageBuyOfferOp: ManageBuyOfferOp) {
    super();
    this.manageBuyOfferOp = manageBuyOfferOp;
  }

  get value(): ManageBuyOfferOp {
    return this.manageBuyOfferOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 12 }> {
    return { type: 12, manageBuyOfferOp: this.manageBuyOfferOp.toXdrObject() };
  }
}

export class OperationBodyPathPaymentStrictSend extends OperationBodyBase {
  readonly type = "pathPaymentStrictSend" as const;
  readonly pathPaymentStrictSendOp: PathPaymentStrictSendOp;

  constructor(pathPaymentStrictSendOp: PathPaymentStrictSendOp) {
    super();
    this.pathPaymentStrictSendOp = pathPaymentStrictSendOp;
  }

  get value(): PathPaymentStrictSendOp {
    return this.pathPaymentStrictSendOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 13 }> {
    return {
      type: 13,
      pathPaymentStrictSendOp: this.pathPaymentStrictSendOp.toXdrObject(),
    };
  }
}

export class OperationBodyCreateClaimableBalance extends OperationBodyBase {
  readonly type = "createClaimableBalance" as const;
  readonly createClaimableBalanceOp: CreateClaimableBalanceOp;

  constructor(createClaimableBalanceOp: CreateClaimableBalanceOp) {
    super();
    this.createClaimableBalanceOp = createClaimableBalanceOp;
  }

  get value(): CreateClaimableBalanceOp {
    return this.createClaimableBalanceOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 14 }> {
    return {
      type: 14,
      createClaimableBalanceOp: this.createClaimableBalanceOp.toXdrObject(),
    };
  }
}

export class OperationBodyClaimClaimableBalance extends OperationBodyBase {
  readonly type = "claimClaimableBalance" as const;
  readonly claimClaimableBalanceOp: ClaimClaimableBalanceOp;

  constructor(claimClaimableBalanceOp: ClaimClaimableBalanceOp) {
    super();
    this.claimClaimableBalanceOp = claimClaimableBalanceOp;
  }

  get value(): ClaimClaimableBalanceOp {
    return this.claimClaimableBalanceOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 15 }> {
    return {
      type: 15,
      claimClaimableBalanceOp: this.claimClaimableBalanceOp.toXdrObject(),
    };
  }
}

export class OperationBodyBeginSponsoringFutureReserves extends OperationBodyBase {
  readonly type = "beginSponsoringFutureReserves" as const;
  readonly beginSponsoringFutureReservesOp: BeginSponsoringFutureReservesOp;

  constructor(
    beginSponsoringFutureReservesOp: BeginSponsoringFutureReservesOp,
  ) {
    super();
    this.beginSponsoringFutureReservesOp = beginSponsoringFutureReservesOp;
  }

  get value(): BeginSponsoringFutureReservesOp {
    return this.beginSponsoringFutureReservesOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 16 }> {
    return {
      type: 16,
      beginSponsoringFutureReservesOp:
        this.beginSponsoringFutureReservesOp.toXdrObject(),
    };
  }
}

export class OperationBodyEndSponsoringFutureReserves extends OperationBodyBase {
  readonly type = "endSponsoringFutureReserves" as const;

  toXdrObject(): Extract<OperationBodyWire, { type: 17 }> {
    return { type: 17 };
  }
}

export class OperationBodyRevokeSponsorship extends OperationBodyBase {
  readonly type = "revokeSponsorship" as const;
  readonly revokeSponsorshipOp: RevokeSponsorshipOp;

  constructor(revokeSponsorshipOp: RevokeSponsorshipOp) {
    super();
    this.revokeSponsorshipOp = revokeSponsorshipOp;
  }

  get value(): RevokeSponsorshipOp {
    return this.revokeSponsorshipOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 18 }> {
    return {
      type: 18,
      revokeSponsorshipOp: this.revokeSponsorshipOp.toXdrObject(),
    };
  }
}

export class OperationBodyClawback extends OperationBodyBase {
  readonly type = "clawback" as const;
  readonly clawbackOp: ClawbackOp;

  constructor(clawbackOp: ClawbackOp) {
    super();
    this.clawbackOp = clawbackOp;
  }

  get value(): ClawbackOp {
    return this.clawbackOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 19 }> {
    return { type: 19, clawbackOp: this.clawbackOp.toXdrObject() };
  }
}

export class OperationBodyClawbackClaimableBalance extends OperationBodyBase {
  readonly type = "clawbackClaimableBalance" as const;
  readonly clawbackClaimableBalanceOp: ClawbackClaimableBalanceOp;

  constructor(clawbackClaimableBalanceOp: ClawbackClaimableBalanceOp) {
    super();
    this.clawbackClaimableBalanceOp = clawbackClaimableBalanceOp;
  }

  get value(): ClawbackClaimableBalanceOp {
    return this.clawbackClaimableBalanceOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 20 }> {
    return {
      type: 20,
      clawbackClaimableBalanceOp: this.clawbackClaimableBalanceOp.toXdrObject(),
    };
  }
}

export class OperationBodySetTrustLineFlags extends OperationBodyBase {
  readonly type = "setTrustLineFlags" as const;
  readonly setTrustLineFlagsOp: SetTrustLineFlagsOp;

  constructor(setTrustLineFlagsOp: SetTrustLineFlagsOp) {
    super();
    this.setTrustLineFlagsOp = setTrustLineFlagsOp;
  }

  get value(): SetTrustLineFlagsOp {
    return this.setTrustLineFlagsOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 21 }> {
    return {
      type: 21,
      setTrustLineFlagsOp: this.setTrustLineFlagsOp.toXdrObject(),
    };
  }
}

export class OperationBodyLiquidityPoolDeposit extends OperationBodyBase {
  readonly type = "liquidityPoolDeposit" as const;
  readonly liquidityPoolDepositOp: LiquidityPoolDepositOp;

  constructor(liquidityPoolDepositOp: LiquidityPoolDepositOp) {
    super();
    this.liquidityPoolDepositOp = liquidityPoolDepositOp;
  }

  get value(): LiquidityPoolDepositOp {
    return this.liquidityPoolDepositOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 22 }> {
    return {
      type: 22,
      liquidityPoolDepositOp: this.liquidityPoolDepositOp.toXdrObject(),
    };
  }
}

export class OperationBodyLiquidityPoolWithdraw extends OperationBodyBase {
  readonly type = "liquidityPoolWithdraw" as const;
  readonly liquidityPoolWithdrawOp: LiquidityPoolWithdrawOp;

  constructor(liquidityPoolWithdrawOp: LiquidityPoolWithdrawOp) {
    super();
    this.liquidityPoolWithdrawOp = liquidityPoolWithdrawOp;
  }

  get value(): LiquidityPoolWithdrawOp {
    return this.liquidityPoolWithdrawOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 23 }> {
    return {
      type: 23,
      liquidityPoolWithdrawOp: this.liquidityPoolWithdrawOp.toXdrObject(),
    };
  }
}

export class OperationBodyInvokeHostFunction extends OperationBodyBase {
  readonly type = "invokeHostFunction" as const;
  readonly invokeHostFunctionOp: InvokeHostFunctionOp;

  constructor(invokeHostFunctionOp: InvokeHostFunctionOp) {
    super();
    this.invokeHostFunctionOp = invokeHostFunctionOp;
  }

  get value(): InvokeHostFunctionOp {
    return this.invokeHostFunctionOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 24 }> {
    return {
      type: 24,
      invokeHostFunctionOp: this.invokeHostFunctionOp.toXdrObject(),
    };
  }
}

export class OperationBodyExtendFootprintTtl extends OperationBodyBase {
  readonly type = "extendFootprintTtl" as const;
  readonly extendFootprintTtlOp: ExtendFootprintTtlOp;

  constructor(extendFootprintTtlOp: ExtendFootprintTtlOp) {
    super();
    this.extendFootprintTtlOp = extendFootprintTtlOp;
  }

  get value(): ExtendFootprintTtlOp {
    return this.extendFootprintTtlOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 25 }> {
    return {
      type: 25,
      extendFootprintTtlOp: this.extendFootprintTtlOp.toXdrObject(),
    };
  }
}

export class OperationBodyRestoreFootprint extends OperationBodyBase {
  readonly type = "restoreFootprint" as const;
  readonly restoreFootprintOp: RestoreFootprintOp;

  constructor(restoreFootprintOp: RestoreFootprintOp) {
    super();
    this.restoreFootprintOp = restoreFootprintOp;
  }

  get value(): RestoreFootprintOp {
    return this.restoreFootprintOp;
  }

  toXdrObject(): Extract<OperationBodyWire, { type: 26 }> {
    return {
      type: 26,
      restoreFootprintOp: this.restoreFootprintOp.toXdrObject(),
    };
  }
}

export type OperationBody =
  | OperationBodyCreateAccount
  | OperationBodyPayment
  | OperationBodyPathPaymentStrictReceive
  | OperationBodyManageSellOffer
  | OperationBodyCreatePassiveSellOffer
  | OperationBodySetOptions
  | OperationBodyChangeTrust
  | OperationBodyAllowTrust
  | OperationBodyAccountMerge
  | OperationBodyInflation
  | OperationBodyManageData
  | OperationBodyBumpSequence
  | OperationBodyManageBuyOffer
  | OperationBodyPathPaymentStrictSend
  | OperationBodyCreateClaimableBalance
  | OperationBodyClaimClaimableBalance
  | OperationBodyBeginSponsoringFutureReserves
  | OperationBodyEndSponsoringFutureReserves
  | OperationBodyRevokeSponsorship
  | OperationBodyClawback
  | OperationBodyClawbackClaimableBalance
  | OperationBodySetTrustLineFlags
  | OperationBodyLiquidityPoolDeposit
  | OperationBodyLiquidityPoolWithdraw
  | OperationBodyInvokeHostFunction
  | OperationBodyExtendFootprintTtl
  | OperationBodyRestoreFootprint;
export const OperationBody = OperationBodyBase;
