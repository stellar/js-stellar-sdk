import { AccountId, AssetType, MemoType, PublicKey } from "stellar-base";

/* tslint:disable-next-line:no-namespace */
export namespace Horizon {
  export interface ResponseLink {
    href: string;
    templated?: boolean;
  }
  export interface BaseResponse<T extends string = never> {
    _links: { [key in T | "self"]: ResponseLink };
  }
  export interface TransactionResponse
    extends BaseResponse<
      "account" | "ledger" | "operations" | "effects" | "succeeds" | "precedes"
    > {
    created_at: string;
    envelope_xdr: string;
    fee_meta_xdr: string;
    fee_paid: number;
    hash: string;
    id: string;
    ledger: number;
    memo_type: MemoType;
    memo?: string;
    operation_count: number;
    paging_token: string;
    result_meta_xdr: string;
    result_xdr: string;
    signatures: string[];
    source_account: AccountId;
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
    asset_issuer: AccountId;
    buying_liabilities: string;
    selling_liabilities: string;
    last_modified_ledger: number;
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
    key: PublicKey;
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
    account_id: AccountId;
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
    pathPayment = "path_payment",
    createPassiveOffer = "create_passive_offer",
    manageOffer = "manage_offer",
    setOptions = "set_options",
    changeTrust = "change_trust",
    allowTrust = "allow_trust",
    accountMerge = "account_merge",
    inflation = "inflation",
    manageData = "manage_data",
    bumpSequence = "bump_sequence",
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
  }
  export interface BaseOperationResponse<
    T extends OperationResponseType = OperationResponseType,
    TI extends OperationResponseTypeI = OperationResponseTypeI
  > extends BaseResponse<"succeeds" | "precedes" | "effects" | "transaction"> {
    id: string;
    paging_token: string;
    source_account: AccountId;
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
    account: AccountId;
    funder: AccountId;
    starting_balance: string;
  }
  export interface PaymentOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.payment,
      OperationResponseTypeI.payment
    > {
    from: AccountId;
    to: AccountId;
    asset_type: AssetType;
    asset_code?: string;
    asset_issuer?: AccountId;
    amount: string;
  }
  export interface PathPaymentOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.pathPayment,
      OperationResponseTypeI.pathPayment
    > {
    from: AccountId;
    to: AccountId;
    asset_type: AssetType;
    asset_code?: string;
    asset_issuer?: AccountId;
    amount: string;
    source_asset_type: AssetType;
    source_asset_code?: string;
    source_asset_issuer?: AccountId;
    source_max: string;
    source_amount: string;
  }
  export interface ManageOfferOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.manageOffer,
      OperationResponseTypeI.manageOffer
    > {
    offer_id: number;
    amount: string;
    buying_asset_type: AssetType;
    buying_asset_code?: string;
    buying_asset_issuer?: AccountId;
    price: string;
    price_r: PriceR;
    selling_asset_type: AssetType;
    selling_asset_code?: string;
    selling_asset_issuer?: AccountId;
  }
  export interface PassiveOfferOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.createPassiveOffer,
      OperationResponseTypeI.createPassiveOffer
    > {
    offer_id: number;
    amount: string;
    buying_asset_type: AssetType;
    buying_asset_code?: string;
    buying_asset_issuer?: AccountId;
    price: string;
    price_r: PriceR;
    selling_asset_type: AssetType;
    selling_asset_code?: string;
    selling_asset_issuer?: AccountId;
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
    asset_issuer: AccountId;
    trustee: AccountId;
    trustor: AccountId;
    limit: string;
  }
  export interface AllowTrustOperationResponse
    extends BaseOperationResponse<
      OperationResponseType.allowTrust,
      OperationResponseTypeI.allowTrust
    > {
    asset_type: AssetType;
    asset_code: string;
    asset_issuer: AccountId;
    authorize: boolean;
    trustee: AccountId;
    trustor: AccountId;
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

  export interface OperationFeeStatsResponse {
    last_ledger: string;
    last_ledger_base_fee: string;
    ledger_capacity_usage: string;
    min_accepted_fee: string;
    mode_accepted_fee: string;
    p10_accepted_fee: string;
    p20_accepted_fee: string;
    p30_accepted_fee: string;
    p40_accepted_fee: string;
    p50_accepted_fee: string;
    p60_accepted_fee: string;
    p70_accepted_fee: string;
    p80_accepted_fee: string;
    p90_accepted_fee: string;
    p95_accepted_fee: string;
    p99_accepted_fee: string;
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

  export interface TransactionFailedExtras {
    envelope_xdr: string; // base64
    result_codes: {
      transaction: "tx_failed" | "tx_bad_seq";
      operations: string[];
    };
    result_xdr: string;
  }
}
