import { AssetType, MemoType } from "stellar-base";

/* tslint:disable-next-line:no-namespace */
export namespace Horizon {
  export interface ResponseLink {
    href: string;
    templated?: boolean;
  }
  export interface BaseResponse<T extends string = never> {
    _links: { [key in T | "self"]: ResponseLink };
  }

  export interface SubmitTransactionResponse {
    hash: string;
    ledger: number;
    envelope_xdr: string;
    result_xdr: string;
    result_meta_xdr: string;
  }

  export interface TransactionResponse
    extends SubmitTransactionResponse,
      BaseResponse<
        | "account"
        | "ledger"
        | "operations"
        | "effects"
        | "succeeds"
        | "precedes"
      > {
    created_at: string;
    fee_meta_xdr: string;
    fee_charged: number | string;
    max_fee: number | string;
    id: string;
    memo_type: MemoType;
    memo?: string;
    operation_count: number;
    paging_token: string;
    signatures: string[];
    source_account: string;
    source_account_sequence: string;
  }

  export interface BalanceLineNative {
    balance: string;
    asset_type: AssetType.native;
    buying_liabilities: string;
    selling_liabilities: string;
  }
  export interface BalanceLineAsset<
    T extends AssetType.credit4 | AssetType.credit12 =
      | AssetType.credit4
      | AssetType.credit12
  > {
    balance: string;
    limit: string;
    asset_type: T;
    asset_code: string;
    asset_issuer: string;
    buying_liabilities: string;
    selling_liabilities: string;
    last_modified_ledger: number;
    is_authorized: boolean;
  }
  export type BalanceLine<
    T extends AssetType = AssetType
  > = T extends AssetType.native
    ? BalanceLineNative
    : T extends AssetType.credit4 | AssetType.credit12
    ? BalanceLineAsset<T>
    : BalanceLineNative | BalanceLineAsset;

  export interface PriceR {
    numerator: number;
    denominator: number;
  }

  export interface PriceRShorthand {
    n: number;
    d: number;
  }

  export interface AccountThresholds {
    low_threshold: number;
    med_threshold: number;
    high_threshold: number;
  }
  export interface Flags {
    auth_immutable: boolean;
    auth_required: boolean;
    auth_revocable: boolean;
  }
  export interface AccountSigner {
    key: string;
    weight: number;
    type: string;
  }
  export interface AccountResponse
    extends BaseResponse<
      | "transactions"
      | "operations"
      | "payments"
      | "effects"
      | "offers"
      | "trades"
      | "data"
    > {
    id: string;
    paging_token: string;
    account_id: string;
    sequence: string;
    subentry_count: number;
    thresholds: AccountThresholds;
    flags: Flags;
    balances: BalanceLine[];
    signers: AccountSigner[];
    data: {
      [key: string]: string;
    };
  }

  export enum OperationResponseType {
    createAccount = "create_account",
    payment = "payment",
    pathPayment = "path_payment_strict_receive",
    createPassiveOffer = "create_passive_sell_offer",
    manageOffer = "manage_sell_offer",
    setOptions = "set_options",
    changeTrust = "change_trust",
    allowTrust = "allow_trust",
    accountMerge = "account_merge",
    inflation = "inflation",
    manageData = "manage_data",
    bumpSequence = "bump_sequence",
    manageBuyOffer = "manage_buy_offer",
    pathPaymentStrictSend = "path_payment_strict_send",
  }
  export enum OperationResponseTypeI {
    createAccount = 0,
    payment = 1,
    pathPayment = 2,
    createPassiveOffer = 3,
    manageOffer = 4,
    setOptions = 5,
    changeTrust = 6,
    allowTrust = 7,
    accountMerge = 8,
    inflation = 9,
    manageData = 10,
    bumpSequence = 11,
    manageBuyOffer = 12,
    pathPaymentStrictSend = 13,
  }
  export interface BaseOperationResponse<
    T extends OperationResponseType = OperationResponseType,
    TI extends OperationResponseTypeI = OperationResponseTypeI
  > extends BaseResponse<"succeeds" | "precedes" | "effects" | "transaction"> {
    id: string;
    paging_token: string;
    source_account: string;
    type: T;
    type_i: TI;
    created_at: string;
    transaction_hash: string;
  }
  export interface CreateAccountOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.createAccount,
      OperationResponseTypeI.createAccount
    > {
    account: string;
    funder: string;
    starting_balance: string;
  }
  export interface PaymentOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.payment,
      OperationResponseTypeI.payment
    > {
    from: string;
    to: string;
    asset_type: AssetType;
    asset_code?: string;
    asset_issuer?: string;
    amount: string;
  }
  export interface PathPaymentOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.pathPayment,
      OperationResponseTypeI.pathPayment
    > {
    amount: string;
    asset_code?: string;
    asset_issuer?: string;
    asset_type: AssetType;
    from: string;
    path: Array<{
      asset_code: string;
      asset_issuer: string;
      asset_type: AssetType;
    }>;
    source_amount: string;
    source_asset_code?: string;
    source_asset_issuer?: string;
    source_asset_type: AssetType;
    source_max: string;
    to: string;
  }
  export interface PathPaymentStrictSendOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.pathPaymentStrictSend,
      OperationResponseTypeI.pathPaymentStrictSend
    > {
    amount: string;
    asset_code?: string;
    asset_issuer?: string;
    asset_type: AssetType;
    destination_min: string;
    from: string;
    path: Array<{
      asset_code: string;
      asset_issuer: string;
      asset_type: AssetType;
    }>;
    source_amount: string;
    source_asset_code?: string;
    source_asset_issuer?: string;
    source_asset_type: AssetType;
    to: string;
  }
  export interface ManageOfferOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.manageOffer,
      OperationResponseTypeI.manageOffer
    > {
    offer_id: number | string;
    amount: string;
    buying_asset_type: AssetType;
    buying_asset_code?: string;
    buying_asset_issuer?: string;
    price: string;
    price_r: PriceR;
    selling_asset_type: AssetType;
    selling_asset_code?: string;
    selling_asset_issuer?: string;
  }
  export interface PassiveOfferOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.createPassiveOffer,
      OperationResponseTypeI.createPassiveOffer
    > {
    offer_id: number | string;
    amount: string;
    buying_asset_type: AssetType;
    buying_asset_code?: string;
    buying_asset_issuer?: string;
    price: string;
    price_r: PriceR;
    selling_asset_type: AssetType;
    selling_asset_code?: string;
    selling_asset_issuer?: string;
  }
  export interface SetOptionsOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.setOptions,
      OperationResponseTypeI.setOptions
    > {
    signer_key?: string;
    signer_weight?: number;
    master_key_weight?: number;
    low_threshold?: number;
    med_threshold?: number;
    high_threshold?: number;
    home_domain?: string;
    set_flags: Array<1 | 2>;
    set_flags_s: Array<"auth_required_flag" | "auth_revocable_flag">;
    clear_flags: Array<1 | 2>;
    clear_flags_s: Array<"auth_required_flag" | "auth_revocable_flag">;
  }
  export interface ChangeTrustOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.changeTrust,
      OperationResponseTypeI.changeTrust
    > {
    asset_type: AssetType.credit4 | AssetType.credit12;
    asset_code: string;
    asset_issuer: string;
    trustee: string;
    trustor: string;
    limit: string;
  }
  export interface AllowTrustOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.allowTrust,
      OperationResponseTypeI.allowTrust
    > {
    asset_type: AssetType;
    asset_code: string;
    asset_issuer: string;
    authorize: boolean;
    trustee: string;
    trustor: string;
  }
  export interface AccountMergeOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.accountMerge,
      OperationResponseTypeI.accountMerge
    > {
    into: string;
  }
  export interface InflationOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.inflation,
      OperationResponseTypeI.inflation
    > {}
  export interface ManageDataOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.manageData,
      OperationResponseTypeI.manageData
    > {
    name: string;
    value: Buffer;
  }
  export interface BumpSequenceOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.bumpSequence,
      OperationResponseTypeI.bumpSequence
    > {
    bump_to: string;
  }

  export interface ResponseCollection<T extends BaseResponse = BaseResponse> {
    _links: {
      self: ResponseLink;
      next: ResponseLink;
      prev: ResponseLink;
    };
    _embedded: {
      records: T[];
    };
  }
  export interface TransactionResponseCollection
    extends ResponseCollection<TransactionResponse> {}

  export interface FeeDistribution {
    max: string;
    min: string;
    mode: string;
    p10: string;
    p20: string;
    p30: string;
    p40: string;
    p50: string;
    p60: string;
    p70: string;
    p80: string;
    p90: string;
    p95: string;
    p99: string;
  }
  export interface FeeStatsResponse {
    last_ledger: string;
    last_ledger_base_fee: string;
    ledger_capacity_usage: string;
    fee_charged: FeeDistribution;
    max_fee: FeeDistribution;
  }

  export type ErrorResponseData =
    | ErrorResponseData.RateLimitExceeded
    | ErrorResponseData.InternalServerError
    | ErrorResponseData.TransactionFailed;

  export namespace ErrorResponseData {
    export interface Base {
      status: number;
      title: string;
      type: string; // TODO
      details: string; // TODO
      instance: string; // TODO
    }

    export interface RateLimitExceeded extends Base {
      status: 429;
      title: "Rate Limit Exceeded";
    }
    export interface InternalServerError extends Base {
      status: 500;
      title: "Internal Server Error";
    }
    export interface TransactionFailed extends Base {
      status: 400;
      title: "Transaction Failed";
      extras: TransactionFailedExtras;
    }
  }

  export enum TransactionFailedResultCodes {
    TX_FAILED = "tx_failed",
    TX_BAD_SEQ = "tx_bad_seq",
    TX_BAD_AUTH = "tx_bad_auth",
    TX_BAD_AUTH_EXTRA = "tx_bad_auth_extra",
  }

  export interface TransactionFailedExtras {
    envelope_xdr: string; // base64
    result_codes: {
      transaction: TransactionFailedResultCodes;
      operations: string[];
    };
    result_xdr: string;
  }
}
