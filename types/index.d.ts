// TypeScript Version: 2.9

/// <reference types="node" />

import { AxiosInstance } from "axios";
import { xdr as xdr2, AssetType, Asset, Memo, MemoType, Transaction } from 'stellar-base';
import { Horizon } from '../src/horizon_api'
// Re-StellarBase
export {
  Account,
  Asset,
  AssetType,
  AuthFlag,
  AuthImmutableFlag,
  AuthRequiredFlag,
  AuthRevocableFlag,
  FastSigning,
  Keypair,
  Memo,
  MemoType,
  MemoValue,
  MemoHash,
  MemoID,
  MemoNone,
  MemoReturn,
  MemoText,
  Network,
  Networks,
  Operation,
  OperationOptions,
  OperationType,
  StrKey,
  Signer,
  SignerOptions,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  hash,
  sign,
  verify,
  xdr
} from 'stellar-base';

// Shorthands, not-to-export.
export {};
type Key = string | number | symbol;
type Diff<T extends Key, U extends Key> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export class NetworkError extends Error {
  private response: any;
  constructor(message: string, response: any);
  getResponse(): any;
}
export class NotFoundError extends NetworkError {}
export class BadRequestError extends NetworkError {}
export class BadResponseError extends NetworkError {}

export namespace Config {
  function setAllowHttp(allow: boolean): void;
  function isAllowHttp(): boolean;
  function setDefault(): void;
}

type CallBuilderResponse = Horizon.BaseResponse | Server.CollectionPage;

export const HorizonAxiosClient: AxiosInstance;

export namespace Server {

  interface CollectionPage<
    T extends Horizon.BaseResponse = Horizon.BaseResponse
  > {
    records: T[];
    next: () => Promise<CollectionPage<T>>;
    prev: () => Promise<CollectionPage<T>>;
  }

  interface AssetRecord extends Horizon.BaseResponse {
    asset_type: AssetType.credit4 | AssetType.credit12;
    asset_code: string;
    asset_issuer: string;
    paging_token: string;
    amount: string;
    num_accounts: number;
    flags: Horizon.Flags;
  }

  interface OrderbookRecord extends Horizon.BaseResponse {
    bids: Array<{ price_r: {}; price: number; amount: string }>;
    asks: Array<{ price_r: {}; price: number; amount: string }>;
    selling: Asset;
    buying: Asset;
  }

  interface PaymentPathRecord extends Horizon.BaseResponse {
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

  interface TradeAggregationRecord extends Horizon.BaseResponse {
    timestamp: string;
    trade_count: number;
    base_volume: string;
    counter_volume: string;
    avg: string;
    high: string;
    low: string;
    open: string;
    close: string;
  }

}