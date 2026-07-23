import { option, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { MuxedAccount, type MuxedAccountWire } from "./muxed-account.js";
import { OperationBody, type OperationBodyWire } from "./operation-body.js";

export interface OperationWire {
  sourceAccount: MuxedAccountWire | null;
  body: OperationBodyWire;
}

/**
 * ```xdr
 * struct Operation
 * {
 *     // sourceAccount is the account used to run the operation
 *     // if not set, the runtime defaults to "sourceAccount" specified at
 *     // the transaction level
 *     MuxedAccount* sourceAccount;
 *
 *     union switch (OperationType type)
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
 *     body;
 * };
 * ```
 */
export class Operation extends XdrValue {
  readonly sourceAccount: MuxedAccount | null;
  readonly body: OperationBody;

  static readonly schema: XdrType<OperationWire> = struct("Operation", {
    sourceAccount: option(MuxedAccount.schema),
    body: OperationBody.schema,
  });

  constructor(input: {
    sourceAccount: MuxedAccount | null;
    body: OperationBody;
  }) {
    super();
    this.sourceAccount = input.sourceAccount;
    this.body = input.body;
  }

  toXdrObject(): OperationWire {
    return {
      sourceAccount:
        this.sourceAccount === null ? null : this.sourceAccount.toXdrObject(),
      body: this.body.toXdrObject(),
    };
  }

  static fromXdrObject(wire: OperationWire): Operation {
    return new Operation({
      sourceAccount:
        wire.sourceAccount === null
          ? null
          : MuxedAccount.fromXdrObject(wire.sourceAccount),
      body: OperationBody.fromXdrObject(wire.body),
    });
  }
}
