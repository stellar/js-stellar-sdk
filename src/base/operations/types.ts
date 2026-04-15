/* eslint-disable @typescript-eslint/no-namespace */
import { Asset } from "../asset.js";
import { Address } from "../address.js";
import { Claimant } from "../claimant.js";
import { LiquidityPoolAsset } from "../liquidity_pool_asset.js";
import { LiquidityPoolId } from "../liquidity_pool_id.js";
import xdr from "../xdr.js";

export interface OperationAttributes {
  body: xdr.OperationBody;
  sourceAccount: xdr.MuxedAccount | null;
}

export interface ChangeTrustOpts {
  asset: Asset | LiquidityPoolAsset;
  limit?: string;
  source?: string;
}

export interface RestoreFootprintOpts {
  source?: string;
}

export interface ManageDataOpts {
  name: string;
  value: Buffer | string | null;
  source?: string;
}

export interface InflationOpts {
  source?: string;
}

export interface ExtendFootprintTtlOpts {
  extendTo: number;
  source?: string;
}

export interface EndSponsoringFutureReservesOpts {
  source?: string;
}
export interface LiquidityPoolWithdrawOpts {
  liquidityPoolId: string;
  amount: string;
  minAmountA: string;
  minAmountB: string;
  source?: string;
}

export interface AllowTrustOpts {
  trustor: string;
  assetCode: string;
  authorize?: TrustLineFlag | boolean;
  source?: string;
}

export interface BeginSponsoringFutureReservesOpts {
  sponsoredId: string;
  source?: string;
}

export interface TrustLineFlagMap {
  authorized?: boolean;
  authorizedToMaintainLiabilities?: boolean;
  clawbackEnabled?: boolean;
}

export interface SetTrustLineFlagsOpts {
  trustor: string;
  asset: Asset;
  flags: TrustLineFlagMap;
  source?: string;
}
export interface BaseSignerOpt {
  weight?: number | string;
}

export interface Ed25519PublicKeySignerOpt {
  ed25519PublicKey: string;
  sha256Hash?: never;
  preAuthTx?: never;
  ed25519SignedPayload?: never;
}

export interface Sha256HashSignerOpt {
  ed25519PublicKey?: never;
  sha256Hash: Buffer | string;
  preAuthTx?: never;
  ed25519SignedPayload?: never;
}

export interface PreAuthTxSignerOpt {
  ed25519PublicKey?: never;
  sha256Hash?: never;
  preAuthTx: Buffer | string;
  ed25519SignedPayload?: never;
}

export interface Ed25519SignedPayloadSignerOpt {
  ed25519PublicKey?: never;
  sha256Hash?: never;
  preAuthTx?: never;
  ed25519SignedPayload: string;
}
export type SignerOpts = BaseSignerOpt &
  (
    | Ed25519PublicKeySignerOpt
    | Ed25519SignedPayloadSignerOpt
    | PreAuthTxSignerOpt
    | Sha256HashSignerOpt
  ); // weight is required for SetOptions, but not for RevokeSignerSponsorship
export interface SetOptionsOpts<T extends SignerOpts = never> {
  inflationDest?: string;
  clearFlags?: AuthFlags;
  setFlags?: AuthFlags;
  masterWeight?: number | string;
  lowThreshold?: number | string;
  medThreshold?: number | string;
  highThreshold?: number | string;
  // The weight field is optional in SignerOpts, but if a signer is provided in SetOptionsOpts, it must include a weight.
  // Leaving the weight undefined would result in the signer no longer having signing power
  signer?: T & { weight: number | string };
  homeDomain?: string;
  source?: string;
}

export interface CreatePassiveSellOfferOpts {
  selling: Asset;
  buying: Asset;
  amount: string;
  price: BigNumber | number | string | { n: number; d: number };
  source?: string;
}

export interface ManageSellOfferOpts extends CreatePassiveSellOfferOpts {
  offerId?: number | string;
}

export interface ManageBuyOfferOpts {
  selling: Asset;
  buying: Asset;
  buyAmount: string;
  price: BigNumber | number | string | { n: number; d: number };
  offerId?: number | string;
  source?: string;
}

export interface PathPaymentStrictSendOpts {
  sendAsset: Asset;
  sendAmount: string;
  destination: string;
  destAsset: Asset;
  destMin: string;
  path?: Asset[];
  source?: string;
}

export interface CreateClaimableBalanceOpts {
  asset: Asset;
  amount: string;
  claimants: Claimant[];
  source?: string;
}

export interface ClaimClaimableBalanceOpts {
  balanceId: string;
  source?: string;
}

export interface ClawbackClaimableBalanceOpts {
  balanceId: string;
  source?: string;
}

export interface BumpSequenceOpts {
  bumpTo: string;
  source?: string;
}

export interface SignerKeyOptions {
  ed25519PublicKey?: string;
  sha256Hash?: Buffer | string;
  preAuthTx?: Buffer | string;
  ed25519SignedPayload?: string;
}

export interface RevokeAccountSponsorshipOpts {
  account: string;
  source?: string;
}

export interface RevokeTrustlineSponsorshipOpts {
  account: string;
  asset: Asset | LiquidityPoolId;
  source?: string;
}

export interface RevokeOfferSponsorshipOpts {
  seller: string;
  offerId: string;
  source?: string;
}

export interface RevokeDataSponsorshipOpts {
  account: string;
  name: string;
  source?: string;
}

export interface RevokeClaimableBalanceSponsorshipOpts {
  balanceId: string;
  source?: string;
}

export interface RevokeLiquidityPoolSponsorshipOpts {
  liquidityPoolId: string;
  source?: string;
}

export type RevokeSignerOpts =
  | Ed25519PublicKeySignerOpt
  | Ed25519SignedPayloadSignerOpt
  | PreAuthTxSignerOpt
  | Sha256HashSignerOpt;

export interface RevokeSignerSponsorshipOpts {
  account: string;
  signer: RevokeSignerOpts; // weight is not needed to identify the signer to revoke sponsorship for
  source?: string;
}

export interface LiquidityPoolDepositOpts {
  liquidityPoolId: string;
  maxAmountA: string;
  maxAmountB: string;
  minPrice: BigNumber | number | string | { n: number; d: number };
  maxPrice: BigNumber | number | string | { n: number; d: number };
  source?: string;
}

export interface InvokeHostFunctionOpts {
  func: xdr.HostFunction;
  auth?: xdr.SorobanAuthorizationEntry[];
  source?: string;
}

export interface InvokeContractFunctionOpts {
  contract: string;
  function: string;
  args: xdr.ScVal[];
  auth?: xdr.SorobanAuthorizationEntry[];
  source?: string;
}

export interface CreateCustomContractOpts {
  address: Address;
  wasmHash: Buffer | Uint8Array;
  constructorArgs?: xdr.ScVal[];
  salt?: Buffer | Uint8Array;
  auth?: xdr.SorobanAuthorizationEntry[];
  source?: string;
}

export interface CreateStellarAssetContractOpts {
  asset: Asset | string;
  auth?: xdr.SorobanAuthorizationEntry[];
  source?: string;
}

export interface UploadContractWasmOpts {
  wasm: Buffer | Uint8Array;
  auth?: xdr.SorobanAuthorizationEntry[];
  source?: string;
}

export interface CreateAccountOpts {
  destination: string;
  startingBalance: string;
  source?: string;
}

export interface AccountMergeOpts {
  destination: string;
  source?: string;
}

export interface PaymentOpts {
  destination: string;
  asset: Asset;
  amount: string;
  source?: string;
}

export interface ClawbackOpts {
  asset: Asset;
  amount: string;
  from: string;
  source?: string;
}

export interface PathPaymentStrictReceiveOpts {
  sendAsset: Asset;
  sendMax: string;
  destination: string;
  destAsset: Asset;
  destAmount: string;
  path?: Asset[];
  source?: string;
}

export type OperationOptions =
  | AccountMergeOpts
  | AllowTrustOpts
  | BeginSponsoringFutureReservesOpts
  | BumpSequenceOpts
  | ChangeTrustOpts
  | ClaimClaimableBalanceOpts
  | ClawbackClaimableBalanceOpts
  | ClawbackOpts
  | CreateAccountOpts
  | CreateClaimableBalanceOpts
  | CreateCustomContractOpts
  | CreatePassiveSellOfferOpts
  | CreateStellarAssetContractOpts
  | EndSponsoringFutureReservesOpts
  | ExtendFootprintTtlOpts
  | InflationOpts
  | InvokeContractFunctionOpts
  | InvokeHostFunctionOpts
  | LiquidityPoolDepositOpts
  | LiquidityPoolWithdrawOpts
  | ManageBuyOfferOpts
  | ManageDataOpts
  | ManageSellOfferOpts
  | PathPaymentStrictReceiveOpts
  | PathPaymentStrictSendOpts
  | PaymentOpts
  | RestoreFootprintOpts
  | RevokeAccountSponsorshipOpts
  | RevokeClaimableBalanceSponsorshipOpts
  | RevokeDataSponsorshipOpts
  | RevokeLiquidityPoolSponsorshipOpts
  | RevokeOfferSponsorshipOpts
  | RevokeSignerSponsorshipOpts
  | RevokeTrustlineSponsorshipOpts
  | SetOptionsOpts
  | SetTrustLineFlagsOpts
  | UploadContractWasmOpts;

// ─── Operation Result Types ───────────────────────────────────────────────────
// These are the shapes returned by Operation.fromXDRObject, mirroring the
// namespace Operation interfaces in types/index.d.ts.

export namespace OperationType {
  export type CreateAccount = "createAccount";
  export type Payment = "payment";
  export type PathPaymentStrictReceive = "pathPaymentStrictReceive";
  export type PathPaymentStrictSend = "pathPaymentStrictSend";
  export type CreatePassiveSellOffer = "createPassiveSellOffer";
  export type ManageSellOffer = "manageSellOffer";
  export type ManageBuyOffer = "manageBuyOffer";
  export type SetOptions = "setOptions";
  export type ChangeTrust = "changeTrust";
  export type AllowTrust = "allowTrust";
  export type AccountMerge = "accountMerge";
  export type Inflation = "inflation";
  export type ManageData = "manageData";
  export type BumpSequence = "bumpSequence";
  export type CreateClaimableBalance = "createClaimableBalance";
  export type ClaimClaimableBalance = "claimClaimableBalance";
  export type BeginSponsoringFutureReserves = "beginSponsoringFutureReserves";
  export type EndSponsoringFutureReserves = "endSponsoringFutureReserves";
  /** @deprecated Never emitted by fromXDRObject — use the specific Revoke* types instead. */
  export type RevokeSponsorship = "revokeSponsorship";
  export type RevokeAccountSponsorship = "revokeAccountSponsorship";
  export type RevokeTrustlineSponsorship = "revokeTrustlineSponsorship";
  export type RevokeOfferSponsorship = "revokeOfferSponsorship";
  export type RevokeDataSponsorship = "revokeDataSponsorship";
  export type RevokeClaimableBalanceSponsorship =
    "revokeClaimableBalanceSponsorship";
  export type RevokeLiquidityPoolSponsorship = "revokeLiquidityPoolSponsorship";
  export type RevokeSignerSponsorship = "revokeSignerSponsorship";
  export type Clawback = "clawback";
  export type ClawbackClaimableBalance = "clawbackClaimableBalance";
  export type SetTrustLineFlags = "setTrustLineFlags";
  export type LiquidityPoolDeposit = "liquidityPoolDeposit";
  export type LiquidityPoolWithdraw = "liquidityPoolWithdraw";
  export type InvokeHostFunction = "invokeHostFunction";
  export type ExtendFootprintTTL = "extendFootprintTtl";
  export type RestoreFootprint = "restoreFootprint";
}

export type OperationType =
  | OperationType.AccountMerge
  | OperationType.AllowTrust
  | OperationType.BeginSponsoringFutureReserves
  | OperationType.BumpSequence
  | OperationType.ChangeTrust
  | OperationType.ClaimClaimableBalance
  | OperationType.Clawback
  | OperationType.ClawbackClaimableBalance
  | OperationType.CreateAccount
  | OperationType.CreateClaimableBalance
  | OperationType.CreatePassiveSellOffer
  | OperationType.EndSponsoringFutureReserves
  | OperationType.ExtendFootprintTTL
  | OperationType.Inflation
  | OperationType.InvokeHostFunction
  | OperationType.LiquidityPoolDeposit
  | OperationType.LiquidityPoolWithdraw
  | OperationType.ManageBuyOffer
  | OperationType.ManageData
  | OperationType.ManageSellOffer
  | OperationType.PathPaymentStrictReceive
  | OperationType.PathPaymentStrictSend
  | OperationType.Payment
  | OperationType.RestoreFootprint
  | OperationType.RevokeAccountSponsorship
  | OperationType.RevokeClaimableBalanceSponsorship
  | OperationType.RevokeDataSponsorship
  | OperationType.RevokeLiquidityPoolSponsorship
  | OperationType.RevokeOfferSponsorship
  | OperationType.RevokeSignerSponsorship
  | OperationType.RevokeTrustlineSponsorship
  | OperationType.SetOptions
  | OperationType.SetTrustLineFlags;

// Literal types matching the AuthRequiredFlag/AuthRevocableFlag/AuthImmutableFlag/AuthClawbackEnabledFlag
// constants exported from src/operation.ts.

export const AuthFlag = {
  required: 1,
  revocable: 2,
  immutable: 4,
  clawbackEnabled: 8,
} as const;
export type AuthFlag = (typeof AuthFlag)[keyof typeof AuthFlag];
/**
 * A single {@link AuthFlag} or multiple flags combined with `|` (e.g. `AuthRequiredFlag | AuthRevocableFlag`).
 */
export type AuthFlags = AuthFlag | (number & {});
export namespace TrustLineFlag {
  export type deauthorize = 0;
  export type authorize = 1;
  export type authorizeToMaintainLiabilities = 2;
}
export type TrustLineFlag =
  | TrustLineFlag.authorize
  | TrustLineFlag.authorizeToMaintainLiabilities
  | TrustLineFlag.deauthorize;

// Signer result types used in the SetOptions result interface (weight included).
export namespace Signer {
  export interface Ed25519PublicKey {
    ed25519PublicKey: string;
    weight?: number;
  }
  export interface Sha256Hash {
    sha256Hash: Buffer;
    weight?: number;
  }
  export interface PreAuthTx {
    preAuthTx: Buffer;
    weight?: number;
  }
  export interface Ed25519SignedPayload {
    ed25519SignedPayload: string;
    weight?: number;
  }
}
export type Signer =
  | Signer.Ed25519PublicKey
  | Signer.Ed25519SignedPayload
  | Signer.PreAuthTx
  | Signer.Sha256Hash;

export interface BaseOperation<T extends OperationType = OperationType> {
  type: T;
  source?: string;
}

export interface CreateAccountResult extends BaseOperation<OperationType.CreateAccount> {
  destination: string;
  startingBalance: string;
}

export interface PaymentResult extends BaseOperation<OperationType.Payment> {
  destination: string;
  asset: Asset;
  amount: string;
}

export interface PathPaymentStrictReceiveResult extends BaseOperation<OperationType.PathPaymentStrictReceive> {
  sendAsset: Asset;
  sendMax: string;
  destination: string;
  destAsset: Asset;
  destAmount: string;
  path: Asset[];
}

export interface PathPaymentStrictSendResult extends BaseOperation<OperationType.PathPaymentStrictSend> {
  sendAsset: Asset;
  sendAmount: string;
  destination: string;
  destAsset: Asset;
  destMin: string;
  path: Asset[];
}

export interface CreatePassiveSellOfferResult extends BaseOperation<OperationType.CreatePassiveSellOffer> {
  selling: Asset;
  buying: Asset;
  amount: string;
  price: string;
}

export interface ManageSellOfferResult extends BaseOperation<OperationType.ManageSellOffer> {
  selling: Asset;
  buying: Asset;
  amount: string;
  price: string;
  offerId: string;
}

export interface ManageBuyOfferResult extends BaseOperation<OperationType.ManageBuyOffer> {
  selling: Asset;
  buying: Asset;
  buyAmount: string;
  price: string;
  offerId: string;
}

export interface SetOptionsResult<
  T extends SignerOpts = never,
> extends BaseOperation<OperationType.SetOptions> {
  inflationDest?: string;
  // AuthFlag represents individual flag bits (1, 2, 4, 8). At runtime these fields
  // hold raw uint32 bitmasks, so combined values (e.g. AuthRequired | AuthRevocable = 3)
  // are valid but not expressible as AuthFlag. Use bitwise AND to test individual flags:
  //   if (result.clearFlags & AuthRequiredFlag) { ... }
  clearFlags?: AuthFlags;
  setFlags?: AuthFlags;
  masterWeight?: number;
  lowThreshold?: number;
  medThreshold?: number;
  highThreshold?: number;
  homeDomain?: string;
  signer?: T;
}

export interface ChangeTrustResult extends BaseOperation<OperationType.ChangeTrust> {
  line: Asset | LiquidityPoolAsset;
  limit: string;
}

export interface AllowTrustResult extends BaseOperation<OperationType.AllowTrust> {
  trustor: string;
  assetCode: string;
  authorize: TrustLineFlag | boolean | undefined;
}

export interface AccountMergeResult extends BaseOperation<OperationType.AccountMerge> {
  destination: string;
}

export type InflationResult = BaseOperation<OperationType.Inflation>;

export interface ManageDataResult extends BaseOperation<OperationType.ManageData> {
  name: string;
  value?: Buffer;
}

export interface BumpSequenceResult extends BaseOperation<OperationType.BumpSequence> {
  bumpTo: string;
}

export interface CreateClaimableBalanceResult extends BaseOperation<OperationType.CreateClaimableBalance> {
  asset: Asset;
  amount: string;
  claimants: Claimant[];
}

export interface ClaimClaimableBalanceResult extends BaseOperation<OperationType.ClaimClaimableBalance> {
  balanceId: string;
}

export interface BeginSponsoringFutureReservesResult extends BaseOperation<OperationType.BeginSponsoringFutureReserves> {
  sponsoredId: string;
}

export type EndSponsoringFutureReservesResult =
  BaseOperation<OperationType.EndSponsoringFutureReserves>;

export interface RevokeAccountSponsorshipResult extends BaseOperation<OperationType.RevokeAccountSponsorship> {
  account: string;
}

export interface RevokeTrustlineSponsorshipResult extends BaseOperation<OperationType.RevokeTrustlineSponsorship> {
  account: string;
  asset: Asset | LiquidityPoolId;
}

export interface RevokeOfferSponsorshipResult extends BaseOperation<OperationType.RevokeOfferSponsorship> {
  seller: string;
  offerId: string;
}

export interface RevokeDataSponsorshipResult extends BaseOperation<OperationType.RevokeDataSponsorship> {
  account: string;
  name: string;
}

export interface RevokeClaimableBalanceSponsorshipResult extends BaseOperation<OperationType.RevokeClaimableBalanceSponsorship> {
  balanceId: string;
}

export interface RevokeLiquidityPoolSponsorshipResult extends BaseOperation<OperationType.RevokeLiquidityPoolSponsorship> {
  liquidityPoolId: string;
}

export interface RevokeSignerSponsorshipResult extends BaseOperation<OperationType.RevokeSignerSponsorship> {
  account: string;
  signer: RevokeSignerOpts;
}

export interface ClawbackResult extends BaseOperation<OperationType.Clawback> {
  asset: Asset;
  amount: string;
  from: string;
}

export interface ClawbackClaimableBalanceResult extends BaseOperation<OperationType.ClawbackClaimableBalance> {
  balanceId: string;
}

export interface SetTrustLineFlagsResult extends BaseOperation<OperationType.SetTrustLineFlags> {
  trustor: string;
  asset: Asset;
  flags: {
    authorized?: boolean;
    authorizedToMaintainLiabilities?: boolean;
    clawbackEnabled?: boolean;
  };
}

export interface LiquidityPoolDepositResult extends BaseOperation<OperationType.LiquidityPoolDeposit> {
  liquidityPoolId: string;
  maxAmountA: string;
  maxAmountB: string;
  minPrice: string;
  maxPrice: string;
}

export interface LiquidityPoolWithdrawResult extends BaseOperation<OperationType.LiquidityPoolWithdraw> {
  liquidityPoolId: string;
  amount: string;
  minAmountA: string;
  minAmountB: string;
}

export interface InvokeHostFunctionResult extends BaseOperation<OperationType.InvokeHostFunction> {
  func: xdr.HostFunction;
  auth?: xdr.SorobanAuthorizationEntry[];
}

export interface ExtendFootprintTTLResult extends BaseOperation<OperationType.ExtendFootprintTTL> {
  extendTo: number;
}

export type RestoreFootprintResult =
  BaseOperation<OperationType.RestoreFootprint>;

/**
 * Union of all possible operation objects returned by Operation.fromXDRObject.
 */
export type OperationRecord =
  | AccountMergeResult
  | AllowTrustResult
  | BeginSponsoringFutureReservesResult
  | BumpSequenceResult
  | ChangeTrustResult
  | ClaimClaimableBalanceResult
  | ClawbackClaimableBalanceResult
  | ClawbackResult
  | CreateAccountResult
  | CreateClaimableBalanceResult
  | CreatePassiveSellOfferResult
  | EndSponsoringFutureReservesResult
  | ExtendFootprintTTLResult
  | InflationResult
  | InvokeHostFunctionResult
  | LiquidityPoolDepositResult
  | LiquidityPoolWithdrawResult
  | ManageBuyOfferResult
  | ManageDataResult
  | ManageSellOfferResult
  | PathPaymentStrictReceiveResult
  | PathPaymentStrictSendResult
  | PaymentResult
  | RestoreFootprintResult
  | RevokeAccountSponsorshipResult
  | RevokeClaimableBalanceSponsorshipResult
  | RevokeDataSponsorshipResult
  | RevokeLiquidityPoolSponsorshipResult
  | RevokeOfferSponsorshipResult
  | RevokeSignerSponsorshipResult
  | RevokeTrustlineSponsorshipResult
  | SetOptionsResult<SignerOpts>
  | SetTrustLineFlagsResult;
