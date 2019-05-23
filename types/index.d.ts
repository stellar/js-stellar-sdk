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

export const HorizonAxiosClient: AxiosInstance;
