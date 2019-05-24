import { Horizon } from './horizon_api';
import { Omit } from 'lodash';
import { AssetType, Asset } from 'stellar-base';

export namespace ServerApi {

  export interface CollectionPage<
    T extends Horizon.BaseResponse = Horizon.BaseResponse
  > {
    records: T[];
    next: () => Promise<CollectionPage<T>>;
    prev: () => Promise<CollectionPage<T>>;
  }

  interface CallFunctionTemplateOptions {
    cursor?: string | number;
    limit?: number;
    order?: 'asc' | 'desc';
  }

  type CallFunction<
    T extends Horizon.BaseResponse = Horizon.BaseResponse
  > = () => Promise<T>;
  export type CallCollectionFunction<
    T extends Horizon.BaseResponse = Horizon.BaseResponse
  > = (options?: CallFunctionTemplateOptions) => Promise<CollectionPage<T>>;

  export interface AccountRecordSigners {
    key: string;
    weight: number;
    type: string;
  }
  export interface AccountRecord extends Horizon.BaseResponse {
    id: string;
    paging_token: string;
    account_id: string;
    sequence: number;
    subentry_count: number;
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
    effects: CallCollectionFunction<EffectRecord>;
    offers: CallCollectionFunction<OfferRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    payments: CallCollectionFunction<PaymentOperationRecord>;
    trades: CallCollectionFunction<TradeRecord>;
  }

  export interface EffectRecord extends Horizon.BaseResponse {
    account: string;
    paging_token: string;
    starting_balance: string;
    type_i: string;
    type: string;
    amount?: any;

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

  interface OfferAsset {
    asset_type: AssetType;
    asset_code?: string;
    asset_issuer?: string;
  }

  export interface OfferRecord extends Horizon.BaseResponse {
    id: string;
    paging_token: string;
    seller: string;
    selling: OfferAsset;
    buying: OfferAsset;
    amount: string;
    price_r: Horizon.PriceRShorthand;
    price: string;
    last_modified_ledger: number;
    last_modified_time: string;
  }

  import OperationResponseType = Horizon.OperationResponseType;
  import OperationResponseTypeI = Horizon.OperationResponseTypeI;
  interface BaseOperationRecord<
    T extends OperationResponseType = OperationResponseType,
    TI extends OperationResponseTypeI = OperationResponseTypeI
  > extends Horizon.BaseOperationResponse<T, TI> {
    self: CallFunction<OperationRecord>;
    succeeds: CallFunction<OperationRecord>;
    precedes: CallFunction<OperationRecord>;
    effects: CallCollectionFunction<EffectRecord>;
    transaction: CallFunction<TransactionRecord>;
  }

  interface CreateAccountOperationRecord
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
  interface PathPaymentOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.pathPayment,
        OperationResponseTypeI.pathPayment
      >,
      Horizon.PathPaymentOperationResponse {}
  interface ManageOfferOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.manageOffer,
        OperationResponseTypeI.manageOffer
      >,
      Horizon.ManageOfferOperationResponse {}
  interface PassiveOfferOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.createPassiveOffer,
        OperationResponseTypeI.createPassiveOffer
      >,
      Horizon.PassiveOfferOperationResponse {}
  interface SetOptionsOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.setOptions,
        OperationResponseTypeI.setOptions
      >,
      Horizon.SetOptionsOperationResponse {}
  interface ChangeTrustOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.changeTrust,
        OperationResponseTypeI.changeTrust
      >,
      Horizon.ChangeTrustOperationResponse {}
  interface AllowTrustOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.allowTrust,
        OperationResponseTypeI.allowTrust
      >,
      Horizon.AllowTrustOperationResponse {}
  interface AccountMergeOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.accountMerge,
        OperationResponseTypeI.accountMerge
      >,
      Horizon.AccountMergeOperationResponse {}
  interface InflationOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.inflation,
        OperationResponseTypeI.inflation
      >,
      Horizon.InflationOperationResponse {}
  interface ManageDataOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.manageData,
        OperationResponseTypeI.manageData
      >,
      Horizon.ManageDataOperationResponse {}
  interface BumpSequenceOperationRecord
    extends BaseOperationRecord<
        OperationResponseType.bumpSequence,
        OperationResponseTypeI.bumpSequence
      >,
      Horizon.BumpSequenceOperationResponse {}

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
    | BumpSequenceOperationRecord;

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
    extends Omit<Horizon.TransactionResponse, 'ledger'> {
    ledger_attr: Horizon.TransactionResponse['ledger'];

    account: CallFunction<AccountRecord>;
    effects: CallCollectionFunction<EffectRecord>;
    ledger: CallFunction<LedgerRecord>;
    operations: CallCollectionFunction<OperationRecord>;
    precedes: CallFunction<TransactionRecord>;
    self: CallFunction<TransactionRecord>;
    succeeds: CallFunction<TransactionRecord>;
  }

  export interface AssetRecord extends Horizon.BaseResponse {
    asset_type: AssetType.credit4 | AssetType.credit12;
    asset_code: string;
    asset_issuer: string;
    paging_token: string;
    amount: string;
    num_accounts: number;
    flags: Horizon.Flags;
  }

  export interface OrderbookRecord extends Horizon.BaseResponse {
    bids: Array<{ price_r: {}; price: number; amount: string }>;
    asks: Array<{ price_r: {}; price: number; amount: string }>;
    selling: Asset;
    buying: Asset;
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