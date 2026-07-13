// Build the `xdr` namespace once from the class-XDR layer and re-export it.
// We *don't* `export *` from the XDR module — that would leak every XDR
// type (Memo, Asset, Operation, …) as top-level named exports and collide
// with the SDK wrapper classes exported below. Consumers reach XDR types
// through `xdr.X` exclusively (matching the legacy SDK surface).
import * as xdr from "../xdr/index.js";
export { xdr };

//
// Global exports
//

export { hash } from "./hashing.js";
export { sign, verify } from "./signing.js";
export {
  getLiquidityPoolId,
  LiquidityPoolFeeV18,
} from "./get_liquidity_pool_id.js";
export { Keypair } from "./keypair.js";
export { TransactionBase } from "./transaction_base.js";
export { Transaction } from "./transaction.js";
export { FeeBumpTransaction } from "./fee_bump_transaction.js";
export {
  TransactionBuilder,
  TimeoutInfinite,
  BASE_FEE,
} from "./transaction_builder.js";
export type { SorobanFees } from "./transaction_builder.js";
export { Asset, AssetType } from "./asset.js";
export { LiquidityPoolAsset } from "./liquidity_pool_asset.js";
export { LiquidityPoolId } from "./liquidity_pool_id.js";
export type {
  LiquidityPoolType,
  LiquidityPoolParameters,
} from "./get_liquidity_pool_id.js";
export {
  Operation,
  AuthRequiredFlag,
  AuthRevocableFlag,
  AuthImmutableFlag,
  AuthClawbackEnabledFlag,
} from "./operation.js";
export type {
  AuthFlag,
  TrustLineFlag,
  OperationOptions,
  OperationType,
  OperationRecord,
  Signer,
} from "./operations/index.js";
export * from "./memo.js";
export { Account } from "./account.js";
export { MuxedAccount } from "./muxed_account.js";
export type { TransactionSource } from "./transaction_source.js";
export { Claimant } from "./claimant.js";
export { Networks } from "./network.js";
export { StrKey } from "./strkey.js";
export { SignerKey } from "./signerkey.js";
export { Soroban } from "./soroban.js";
export {
  decodeAddressToMuxedAccount,
  encodeMuxedAccountToAddress,
  extractBaseAddress,
  encodeMuxedAccount,
} from "./util/decode_encode_muxed_account.js";

//
// Soroban
//

export { Contract } from "./contract.js";
export { Address } from "./address.js";

export * from "./scval.js";
export * from "./events.js";
export * from "./sorobandata_builder.js";
// Explicit (not `export *`) so `getAddressCredentials` stays internal: it's
// shared with the contract package but intentionally excluded from the public API.
export {
  authorizeEntry,
  authorizeInvocation,
  buildAuthorizationEntryPreimage,
  buildWithDelegatesEntry,
} from "./auth.js";
export type {
  SigningCallback,
  AuthorizeInvocationParams,
  DelegateSignature,
  BuildWithDelegatesParams,
} from "./auth.js";
export * from "./invocation.js";
export * from "./numbers/index.js";
