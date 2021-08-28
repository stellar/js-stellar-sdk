import { Asset } from "stellar-base";
import { Omit } from "utility-types";
import { Horizon } from "./horizon_api";

// more types
import { AccountRecordSigners as AccountRecordSignersType } from "./types/account";
import { AssetRecord as AssetRecordType } from "./types/assets";
import * as Effects from "./types/effects";
import { OfferRecord as OfferRecordType } from "./types/offer";
import { Trade } from "./types/trade";

/* tslint:disable-next-line: no-namespace */
export namespace ServerApi {
  export type OfferRecord = OfferRecordType;
  export type AccountRecordSigners = AccountRecordSignersType;
  export type AssetRecord = AssetRecordType;
  export interface CollectionPage<
    T extends Horizon.BaseResponse = Horizon.BaseResponse
  > {
    records: T[];
    next: () => Promise<CollectionPage<T>>;
    prev: () => Promise<CollectionPage<T>>;
  }

  export interface CallFunctionTemplateOptions {
    cursor?: string | number;
    limit?: number;
    order?: "asc" | "desc";
  }

  export type CallFunction<
    T extends Horizon.BaseResponse = Horizon.BaseResponse
  > = () => Promise<T>;
  export type CallCollectionFunction<
    T extends Horizon.BaseResponse = Horizon.BaseResponse
  > = (options?: CallFunctionTemplateOptions) => Promise<CollectionPage<T>>;

  type BaseEffectRecordFromTypes =
    | Effects.AccountCreated
    | Effects.AccountCredited
    | Effects.AccountDebited
    | Effects.AccountThresholdsUpdated
    | Effects.AccountHomeDomainUpdated
    | Effects.AccountFlagsUpdated
    | Effects.DataCreated
    | Effects.DataRemoved
    | Effects.DataUpdated
    | Effects.SequenceBumped
    | Effects.SignerCreated
    | Effects.SignerRemoved
    | Effects.SignerUpdated
    | Effects.TrustlineCreated
    | Effects.TrustlineRemoved
    | Effects.TrustlineUpdated
    | Effects.TrustlineAuthorized
    | Effects.TrustlineDeauthorized
    | Effects.TrustlineAuthorizedToMaintainLiabilities
    | Effects.ClaimableBalanceCreated
    | Effects.ClaimableBalanceClaimed
    | Effects.ClaimableBalanceClaimantCreated
    | Effects.AccountSponsorshipCreated
    | Effects.AccountSponsorshipRemoved
    | Effects.AccountSponsorshipUpdated
    | Effects.TrustlineSponsorshipCreated
    | Effects.TrustlineSponsorshipUpdated
    | Effects.TrustlineSponsorshipRemoved
    | Effects.DateSponsorshipCreated
    | Effects.DateSponsorshipUpdated
    | Effects.DateSponsorshipRemoved
    | Effects.ClaimableBalanceSponsorshipCreated
    | Effects.ClaimableBalanceSponsorshipRemoved
    | Effects.ClaimableBalanceSponsorshipUpdated
    | Effects.SignerSponsorshipCreated
    | Effects.SignerSponsorshipUpdated
    | Effects.SignerSponsorshipRemoved
    | Trade;

  export type EffectRecord = BaseEffectRecordFromTypes & EffectRecordMethods;
  export interface ClaimableBalanceRecord extends Horizon.BaseResponse {
    id: string;
    paging_token: string;
    asset: string;
    amount: string;
    sponsor?: string;
    last_modified_ledger: number;
    claimants: Horizon.Claimant[];
  }
  export interface AccountRecord extends Horizon.BaseResponse {
    id: string;
    paging_token: string;
    account_id: string;
    sequence: string;
    subentry_count: number;
    home_domain?: string;
    inflation_destination?: string;
    last_modified_ledger: number;
    thresholds: Horizon.AccountThresholds;
    flags: Horizon.Flags;
    balances: Horizon.BalanceLine[];
    signers: AccountRecordSigners[];
    data: (options: { value: string }) => Promise<{ value: string }>;
    data_attr: {
      [key: string]: string;
    };
    sponsor?: string;
    num_sponsoring: number;
    num_sponsored: number;
    effects: CallCollectionFunction<EffectRecord>;
    offers: CallCollectionFunction<OfferRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    payments: CallCollectionFunction<PaymentOperationRecord>;
    trades: CallCollectionFunction<TradeRecord>;
  }
  export interface LiquidityPoolRecord extends Horizon.BaseResponse {
    id: string;
    paging_token: string;
    fee_bp: number;
    type: Horizon.LiquidityPoolType;
    total_trustlines: string;
    total_shares: string;
    reserves: {
      amount: string;
      asset: string;
    };
  }
  interface EffectRecordMethods {
    operation?: CallFunction<OperationRecord>;
    precedes?: CallFunction<EffectRecord>;
    succeeds?: CallFunction<EffectRecord>;
  }
  export interface LedgerRecord extends Horizon.BaseResponse {
    id: string;
    paging_token: string;
    hash: string;
    prev_hash: string;
    sequence: number;
    transaction_count: number;
    operation_count: number;
    tx_set_operation_count: number | null;
    closed_at: string;
    total_coins: string;
    fee_pool: string;
    base_fee: number;
    base_reserve: string;
    max_tx_set_size: number;
    protocol_version: number;
    header_xdr: string;
    base_fee_in_stroops: number;
    base_reserve_in_stroops: number;

    effects: CallCollectionFunction<EffectRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    self: CallFunction<LedgerRecord>;
    transactions: CallCollectionFunction<TransactionRecord>;
  }

  import OperationResponseType = Horizon.OperationResponseType;
  import OperationResponseTypeI = Horizon.OperationResponseTypeI;
  export interface BaseOperationRecord<
    T extends OperationResponseType = OperationResponseType,
    TI extends OperationResponseTypeI = OperationResponseTypeI
  > extends Horizon.BaseOperationResponse<T, TI> {
    self: CallFunction<OperationRecord>;
    succeeds: CallFunction<OperationRecord>;
    precedes: CallFunction<OperationRecord>;
    effects: CallCollectionFunction<EffectRecord>;
    transaction: CallFunction<TransactionRecord>;
  }
  export interface CreateAccountOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.createAccount,
        OperationResponseTypeI.createAccount
      >,
      Horizon.CreateAccountOperationResponse {}
  export interface PaymentOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.payment,
        OperationResponseTypeI.payment
      >,
      Horizon.PaymentOperationResponse {
    sender: CallFunction<AccountRecord>;
    receiver: CallFunction<AccountRecord>;
  }
  export interface PathPaymentOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.pathPayment,
        OperationResponseTypeI.pathPayment
      >,
      Horizon.PathPaymentOperationResponse {}
  export interface PathPaymentStrictSendOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.pathPaymentStrictSend,
        OperationResponseTypeI.pathPaymentStrictSend
      >,
      Horizon.PathPaymentStrictSendOperationResponse {}
  export interface ManageOfferOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.manageOffer,
        OperationResponseTypeI.manageOffer
      >,
      Horizon.ManageOfferOperationResponse {}
  export interface PassiveOfferOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.createPassiveOffer,
        OperationResponseTypeI.createPassiveOffer
      >,
      Horizon.PassiveOfferOperationResponse {}
  export interface SetOptionsOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.setOptions,
        OperationResponseTypeI.setOptions
      >,
      Horizon.SetOptionsOperationResponse {}
  export interface ChangeTrustOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.changeTrust,
        OperationResponseTypeI.changeTrust
      >,
      Horizon.ChangeTrustOperationResponse {}
  export interface AllowTrustOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.allowTrust,
        OperationResponseTypeI.allowTrust
      >,
      Horizon.AllowTrustOperationResponse {}
  export interface AccountMergeOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.accountMerge,
        OperationResponseTypeI.accountMerge
      >,
      Horizon.AccountMergeOperationResponse {}
  export interface InflationOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.inflation,
        OperationResponseTypeI.inflation
      >,
      Horizon.InflationOperationResponse {}
  export interface ManageDataOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.manageData,
        OperationResponseTypeI.manageData
      >,
      Horizon.ManageDataOperationResponse {}
  export interface BumpSequenceOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.bumpSequence,
        OperationResponseTypeI.bumpSequence
      >,
      Horizon.BumpSequenceOperationResponse {}
  export interface CreateClaimableBalanceOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.createClaimableBalance,
        OperationResponseTypeI.createClaimableBalance
      >,
      Horizon.CreateClaimableBalanceOperationResponse {}
  export interface ClaimClaimableBalanceOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.claimClaimableBalance,
        OperationResponseTypeI.claimClaimableBalance
      >,
      Horizon.ClaimClaimableBalanceOperationResponse {}
  export interface BeginSponsoringFutureReservesOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.beginSponsoringFutureReserves,
        OperationResponseTypeI.beginSponsoringFutureReserves
      >,
      Horizon.BeginSponsoringFutureReservesOperationResponse {}
  export interface EndSponsoringFutureReservesOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.endSponsoringFutureReserves,
        OperationResponseTypeI.endSponsoringFutureReserves
      >,
      Horizon.EndSponsoringFutureReservesOperationResponse {}
  export interface RevokeSponsorshipOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.revokeSponsorship,
        OperationResponseTypeI.revokeSponsorship
      >,
      Horizon.RevokeSponsorshipOperationResponse {}

  export type OperationRecord =
    | CreateAccountOperationRecord
    | PaymentOperationRecord
    | PathPaymentOperationRecord
    | ManageOfferOperationRecord
    | PassiveOfferOperationRecord
    | SetOptionsOperationRecord
    | ChangeTrustOperationRecord
    | AllowTrustOperationRecord
    | AccountMergeOperationRecord
    | InflationOperationRecord
    | ManageDataOperationRecord
    | BumpSequenceOperationRecord
    | PathPaymentStrictSendOperationRecord
    | CreateClaimableBalanceOperationRecord
    | ClaimClaimableBalanceOperationRecord
    | BeginSponsoringFutureReservesOperationRecord
    | EndSponsoringFutureReservesOperationRecord
    | RevokeSponsorshipOperationRecord;
  export interface TradeRecord extends Horizon.BaseResponse {
    id: string;
    paging_token: string;
    ledger_close_time: string;
    offer_id: string;
    base_offer_id: string;
    base_account: string;
    base_amount: string;
    base_asset_type: string;
    base_asset_code?: string;
    base_asset_issuer?: string;
    counter_offer_id: string;
    counter_account: string;
    counter_amount: string;
    counter_asset_type: string;
    counter_asset_code?: string;
    counter_asset_issuer?: string;
    base_is_seller: boolean;

    base: CallFunction<AccountRecord>;
    counter: CallFunction<AccountRecord>;
    operation: CallFunction<OperationRecord>;
  }
  export interface TransactionRecord
    extends Omit<Horizon.TransactionResponse, "ledger"> {
    ledger_attr: Horizon.TransactionResponse["ledger"];

    account: CallFunction<AccountRecord>;
    effects: CallCollectionFunction<EffectRecord>;
    ledger: CallFunction<LedgerRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    precedes: CallFunction<TransactionRecord>;
    self: CallFunction<TransactionRecord>;
    succeeds: CallFunction<TransactionRecord>;
  }
  export interface OrderbookRecord extends Horizon.BaseResponse {
    bids: Array<{
      price_r: {
        d: number;
        n: number;
      };
      price: string;
      amount: string;
    }>;
    asks: Array<{
      price_r: {
        d: number;
        n: number;
      };
      price: string;
      amount: string;
    }>;
    base: Asset;
    counter: Asset;
  }
  export interface PaymentPathRecord extends Horizon.BaseResponse {
    path: Array<{
      asset_code: string;
      asset_issuer: string;
      asset_type: string;
    }>;
    source_amount: string;
    source_asset_type: string;
    source_asset_code: string;
    source_asset_issuer: string;
    destination_amount: string;
    destination_asset_type: string;
    destination_asset_code: string;
    destination_asset_issuer: string;
  }
}
