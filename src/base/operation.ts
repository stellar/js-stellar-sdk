import { Asset } from "./asset.js";
import { LiquidityPoolAsset } from "./liquidity_pool_asset.js";
import { Claimant } from "./claimant.js";
import { StrKey } from "./strkey.js";
import { LiquidityPoolId } from "./liquidity_pool_id.js";
import xdr from "./xdr.js";

import { trimEnd } from "./util/util.js";
import { encodeMuxedAccountToAddress } from "./util/decode_encode_muxed_account.js";

import * as ops from "./operations/index.js";
import type {
  OperationRecord,
  OperationType as _OperationType,
  BaseOperation as _BaseOperation,
  CreateAccountResult,
  PaymentResult,
  PathPaymentStrictReceiveResult,
  PathPaymentStrictSendResult,
  CreatePassiveSellOfferResult,
  ManageSellOfferResult,
  ManageBuyOfferResult,
  SetOptionsResult,
  ChangeTrustResult,
  AllowTrustResult,
  AccountMergeResult,
  InflationResult,
  ManageDataResult,
  BumpSequenceResult,
  CreateClaimableBalanceResult,
  ClaimClaimableBalanceResult,
  BeginSponsoringFutureReservesResult,
  EndSponsoringFutureReservesResult,
  RevokeAccountSponsorshipResult,
  RevokeTrustlineSponsorshipResult,
  RevokeOfferSponsorshipResult,
  RevokeDataSponsorshipResult,
  RevokeClaimableBalanceSponsorshipResult,
  RevokeLiquidityPoolSponsorshipResult,
  RevokeSignerSponsorshipResult,
  ClawbackResult,
  ClawbackClaimableBalanceResult,
  SetTrustLineFlagsResult,
  LiquidityPoolDepositResult,
  LiquidityPoolWithdrawResult,
  InvokeHostFunctionResult,
  ExtendFootprintTTLResult,
  RestoreFootprintResult,
  Signer,
} from "./operations/types.js";
import { fromXDRAmount, fromXDRPrice } from "./util/operations.js";

/**
 * When set using `{@link Operation.setOptions}` option, requires the issuing
 * account to give other accounts permission before they can hold the issuing
 * account’s credit.
 *
 * @see [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)
 */
export const AuthRequiredFlag = 1 << 0;
/**
 * When set using `{@link Operation.setOptions}` option, allows the issuing
 * account to revoke its credit held by other accounts.
 *
 * @see [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)
 */
export const AuthRevocableFlag = 1 << 1;
/**
 * When set using `{@link Operation.setOptions}` option, then none of the
 * authorization flags can be set and the account can never be deleted.
 *
 * @see [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)
 */
export const AuthImmutableFlag = 1 << 2;

/**
 * When set using `{@link Operation.setOptions}` option, then any trustlines
 * created by this account can have a ClawbackOp operation submitted for the
 * corresponding asset.
 *
 * @see [Account flags](https://developers.stellar.org/docs/glossary/accounts/#flags)
 */
export const AuthClawbackEnabledFlag = 1 << 3;

/**
 * `Operation` class represents
 * [operations](https://developers.stellar.org/docs/glossary/operations/) in
 * Stellar network.
 *
 * Use one of static methods to create operations:
 * * `{@link Operation.createAccount}`
 * * `{@link Operation.payment}`
 * * `{@link Operation.pathPaymentStrictReceive}`
 * * `{@link Operation.pathPaymentStrictSend}`
 * * `{@link Operation.manageSellOffer}`
 * * `{@link Operation.manageBuyOffer}`
 * * `{@link Operation.createPassiveSellOffer}`
 * * `{@link Operation.setOptions}`
 * * `{@link Operation.changeTrust}`
 * * `{@link Operation.allowTrust}`
 * * `{@link Operation.accountMerge}`
 * * `{@link Operation.inflation}`
 * * `{@link Operation.manageData}`
 * * `{@link Operation.bumpSequence}`
 * * `{@link Operation.createClaimableBalance}`
 * * `{@link Operation.claimClaimableBalance}`
 * * `{@link Operation.beginSponsoringFutureReserves}`
 * * `{@link Operation.endSponsoringFutureReserves}`
 * * `{@link Operation.revokeAccountSponsorship}`
 * * `{@link Operation.revokeTrustlineSponsorship}`
 * * `{@link Operation.revokeOfferSponsorship}`
 * * `{@link Operation.revokeDataSponsorship}`
 * * `{@link Operation.revokeClaimableBalanceSponsorship}`
 * * `{@link Operation.revokeLiquidityPoolSponsorship}`
 * * `{@link Operation.revokeSignerSponsorship}`
 * * `{@link Operation.clawback}`
 * * `{@link Operation.clawbackClaimableBalance}`
 * * `{@link Operation.setTrustLineFlags}`
 * * `{@link Operation.liquidityPoolDeposit}`
 * * `{@link Operation.liquidityPoolWithdraw}`
 * * `{@link Operation.invokeHostFunction}`, which has the following additional
 *   "pseudo-operations" that make building host functions easier:
 *   - `{@link Operation.createStellarAssetContract}`
 *   - `{@link Operation.invokeContractFunction}`
 *   - `{@link Operation.createCustomContract}`
 *   - `{@link Operation.uploadContractWasm}`
 * * `{@link Operation.extendFootprintTtlOp}`
 * * `{@link Operation.restoreFootprint}`
 *
 */
export class Operation {
  /**
   * Deconstructs the raw XDR operation object into the structured object that
   * was used to create the operation (i.e. the `opts` parameter to most ops).
   *
   * @param operation - An XDR Operation.
   */
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
  static fromXDRObject<T extends OperationRecord = OperationRecord>(
    operation: xdr.Operation<T>,
  ): T {
    const result: Record<string, unknown> = {};
    const sourceAccount = operation.sourceAccount();

    if (sourceAccount) {
      result.source = encodeMuxedAccountToAddress(sourceAccount);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrs: any = operation.body().value();
    const operationName: string = operation.body().switch().name;

    switch (operationName) {
      case "createAccount": {
        result.type = "createAccount";
        result.destination = accountIdtoAddress(attrs.destination());
        result.startingBalance = fromXDRAmount(attrs.startingBalance());
        break;
      }
      case "payment": {
        result.type = "payment";
        result.destination = encodeMuxedAccountToAddress(attrs.destination());
        result.asset = Asset.fromOperation(attrs.asset());
        result.amount = fromXDRAmount(attrs.amount());
        break;
      }
      case "pathPaymentStrictReceive": {
        result.type = "pathPaymentStrictReceive";
        result.sendAsset = Asset.fromOperation(attrs.sendAsset());
        result.sendMax = fromXDRAmount(attrs.sendMax());
        result.destination = encodeMuxedAccountToAddress(attrs.destination());
        result.destAsset = Asset.fromOperation(attrs.destAsset());
        result.destAmount = fromXDRAmount(attrs.destAmount());
        result.path = [];

        const path = attrs.path();

        Object.keys(path).forEach((pathKey) => {
          (result.path as Asset[]).push(Asset.fromOperation(path[pathKey]));
        });
        break;
      }
      case "pathPaymentStrictSend": {
        result.type = "pathPaymentStrictSend";
        result.sendAsset = Asset.fromOperation(attrs.sendAsset());
        result.sendAmount = fromXDRAmount(attrs.sendAmount());
        result.destination = encodeMuxedAccountToAddress(attrs.destination());
        result.destAsset = Asset.fromOperation(attrs.destAsset());
        result.destMin = fromXDRAmount(attrs.destMin());
        result.path = [];

        const path = attrs.path();

        Object.keys(path).forEach((pathKey) => {
          (result.path as Asset[]).push(Asset.fromOperation(path[pathKey]));
        });
        break;
      }
      case "changeTrust": {
        result.type = "changeTrust";

        switch (attrs.line().switch()) {
          case xdr.AssetType.assetTypePoolShare():
            result.line = LiquidityPoolAsset.fromOperation(attrs.line());
            break;
          default:
            result.line = Asset.fromOperation(attrs.line());
            break;
        }

        result.limit = fromXDRAmount(attrs.limit());
        break;
      }
      case "allowTrust": {
        result.type = "allowTrust";
        result.trustor = accountIdtoAddress(attrs.trustor());
        result.assetCode = attrs.asset().value().toString();
        result.assetCode = trimEnd(result.assetCode as string, "\0");
        result.authorize = attrs.authorize();
        break;
      }
      case "setOptions": {
        result.type = "setOptions";

        if (attrs.inflationDest()) {
          result.inflationDest = accountIdtoAddress(attrs.inflationDest());
        }

        result.clearFlags = attrs.clearFlags();
        result.setFlags = attrs.setFlags();
        result.masterWeight = attrs.masterWeight();
        result.lowThreshold = attrs.lowThreshold();
        result.medThreshold = attrs.medThreshold();
        result.highThreshold = attrs.highThreshold();
        // home_domain is checked by iscntrl in stellar-core
        result.homeDomain =
          attrs.homeDomain() !== undefined
            ? attrs.homeDomain().toString("ascii")
            : undefined;

        if (attrs.signer()) {
          const signer: Record<string, unknown> = {};
          const arm = attrs.signer().key().arm();

          if (arm === "ed25519") {
            signer.ed25519PublicKey = accountIdtoAddress(attrs.signer().key());
          } else if (arm === "preAuthTx") {
            signer.preAuthTx = attrs.signer().key().preAuthTx();
          } else if (arm === "hashX") {
            signer.sha256Hash = attrs.signer().key().hashX();
          } else if (arm === "ed25519SignedPayload") {
            const signedPayload = attrs.signer().key().ed25519SignedPayload();
            signer.ed25519SignedPayload = StrKey.encodeSignedPayload(
              signedPayload.toXDR(),
            );
          }

          signer.weight = attrs.signer().weight();
          result.signer = signer;
        }
        break;
      }
      // the next case intentionally falls through!
      case "manageOffer":
      case "manageSellOffer": {
        result.type = "manageSellOffer";
        result.selling = Asset.fromOperation(attrs.selling());
        result.buying = Asset.fromOperation(attrs.buying());
        result.amount = fromXDRAmount(attrs.amount());
        result.price = fromXDRPrice(attrs.price());
        result.offerId = attrs.offerId().toString();
        break;
      }
      case "manageBuyOffer": {
        result.type = "manageBuyOffer";
        result.selling = Asset.fromOperation(attrs.selling());
        result.buying = Asset.fromOperation(attrs.buying());
        result.buyAmount = fromXDRAmount(attrs.buyAmount());
        result.price = fromXDRPrice(attrs.price());
        result.offerId = attrs.offerId().toString();
        break;
      }
      // the next case intentionally falls through!
      case "createPassiveOffer":
      case "createPassiveSellOffer": {
        result.type = "createPassiveSellOffer";
        result.selling = Asset.fromOperation(attrs.selling());
        result.buying = Asset.fromOperation(attrs.buying());
        result.amount = fromXDRAmount(attrs.amount());
        result.price = fromXDRPrice(attrs.price());
        break;
      }
      case "accountMerge": {
        result.type = "accountMerge";
        result.destination = encodeMuxedAccountToAddress(attrs);
        break;
      }
      case "manageData": {
        result.type = "manageData";
        // manage_data.name is checked by iscntrl in stellar-core
        result.name = attrs.dataName().toString("ascii");
        result.value = attrs.dataValue();
        break;
      }
      case "inflation": {
        result.type = "inflation";
        break;
      }
      case "bumpSequence": {
        result.type = "bumpSequence";
        result.bumpTo = attrs.bumpTo().toString();
        break;
      }
      case "createClaimableBalance": {
        result.type = "createClaimableBalance";
        result.asset = Asset.fromOperation(attrs.asset());
        result.amount = fromXDRAmount(attrs.amount());
        result.claimants = [];

        attrs.claimants().forEach((claimant: xdr.Claimant) => {
          (result.claimants as Claimant[]).push(Claimant.fromXDR(claimant));
        });
        break;
      }
      case "claimClaimableBalance": {
        result.type = "claimClaimableBalance";
        result.balanceId = attrs.toXDR("hex");
        break;
      }
      case "beginSponsoringFutureReserves": {
        result.type = "beginSponsoringFutureReserves";
        result.sponsoredId = accountIdtoAddress(attrs.sponsoredId());
        break;
      }
      case "endSponsoringFutureReserves": {
        result.type = "endSponsoringFutureReserves";
        break;
      }
      case "revokeSponsorship": {
        extractRevokeSponshipDetails(attrs, result);
        break;
      }
      case "clawback": {
        result.type = "clawback";
        result.amount = fromXDRAmount(attrs.amount());
        result.from = encodeMuxedAccountToAddress(attrs.from());
        result.asset = Asset.fromOperation(attrs.asset());
        break;
      }
      case "clawbackClaimableBalance": {
        result.type = "clawbackClaimableBalance";
        result.balanceId = attrs.toXDR("hex");
        break;
      }
      case "setTrustLineFlags": {
        result.type = "setTrustLineFlags";
        result.asset = Asset.fromOperation(attrs.asset());
        result.trustor = accountIdtoAddress(attrs.trustor());

        // Convert from the integer-bitwised flag into a sensible object that
        // indicates true/false for each flag that's on/off.
        const clears = attrs.clearFlags();
        const sets = attrs.setFlags();

        const mapping: Record<string, xdr.TrustLineFlags> = {
          authorized: xdr.TrustLineFlags.authorizedFlag(),
          authorizedToMaintainLiabilities:
            xdr.TrustLineFlags.authorizedToMaintainLiabilitiesFlag(),
          clawbackEnabled: xdr.TrustLineFlags.trustlineClawbackEnabledFlag(),
        };

        const getFlagValue = (key: string) => {
          const bit = mapping[key]?.value ?? 0;

          if (sets & bit) {
            return true;
          }

          if (clears & bit) {
            return false;
          }

          return undefined;
        };

        const flags: Record<string, boolean | undefined> = {};

        Object.keys(mapping).forEach((flagName) => {
          flags[flagName] = getFlagValue(flagName);
        });

        result.flags = flags;

        break;
      }
      case "liquidityPoolDeposit": {
        result.type = "liquidityPoolDeposit";
        result.liquidityPoolId = attrs.liquidityPoolId().toString("hex");
        result.maxAmountA = fromXDRAmount(attrs.maxAmountA());
        result.maxAmountB = fromXDRAmount(attrs.maxAmountB());
        result.minPrice = fromXDRPrice(attrs.minPrice());
        result.maxPrice = fromXDRPrice(attrs.maxPrice());
        break;
      }
      case "liquidityPoolWithdraw": {
        result.type = "liquidityPoolWithdraw";
        result.liquidityPoolId = attrs.liquidityPoolId().toString("hex");
        result.amount = fromXDRAmount(attrs.amount());
        result.minAmountA = fromXDRAmount(attrs.minAmountA());
        result.minAmountB = fromXDRAmount(attrs.minAmountB());
        break;
      }
      case "invokeHostFunction": {
        result.type = "invokeHostFunction";
        result.func = attrs.hostFunction();
        result.auth = attrs.auth() ?? [];
        break;
      }
      case "extendFootprintTtl": {
        result.type = "extendFootprintTtl";
        result.extendTo = attrs.extendTo();
        break;
      }
      case "restoreFootprint": {
        result.type = "restoreFootprint";
        break;
      }
      default: {
        throw new Error(`Unknown operation: ${operationName}`);
      }
    }

    return result as unknown as T;
  }
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */

  // Attach all imported operations as static methods on the Operation class
  static accountMerge = ops.accountMerge;
  static allowTrust = ops.allowTrust;
  static bumpSequence = ops.bumpSequence;
  static changeTrust = ops.changeTrust;
  static createAccount = ops.createAccount;
  static createClaimableBalance = ops.createClaimableBalance;
  static claimClaimableBalance = ops.claimClaimableBalance;
  static clawbackClaimableBalance = ops.clawbackClaimableBalance;
  static createPassiveSellOffer = ops.createPassiveSellOffer;
  static inflation = ops.inflation;
  static manageData = ops.manageData;
  static manageSellOffer = ops.manageSellOffer;
  static manageBuyOffer = ops.manageBuyOffer;
  static pathPaymentStrictReceive = ops.pathPaymentStrictReceive;
  static pathPaymentStrictSend = ops.pathPaymentStrictSend;
  static payment = ops.payment;
  static setOptions = ops.setOptions;
  static beginSponsoringFutureReserves = ops.beginSponsoringFutureReserves;
  static endSponsoringFutureReserves = ops.endSponsoringFutureReserves;
  static revokeAccountSponsorship = ops.revokeAccountSponsorship;
  static revokeTrustlineSponsorship = ops.revokeTrustlineSponsorship;
  static revokeOfferSponsorship = ops.revokeOfferSponsorship;
  static revokeDataSponsorship = ops.revokeDataSponsorship;
  static revokeClaimableBalanceSponsorship =
    ops.revokeClaimableBalanceSponsorship;
  static revokeLiquidityPoolSponsorship = ops.revokeLiquidityPoolSponsorship;
  static revokeSignerSponsorship = ops.revokeSignerSponsorship;
  static clawback = ops.clawback;
  static setTrustLineFlags = ops.setTrustLineFlags;
  static liquidityPoolDeposit = ops.liquidityPoolDeposit;
  static liquidityPoolWithdraw = ops.liquidityPoolWithdraw;
  static invokeHostFunction = ops.invokeHostFunction;
  static extendFootprintTtl = ops.extendFootprintTtl;
  static restoreFootprint = ops.restoreFootprint;

  // These are not `xdr.Operation`s directly, but proxies for common
  // versions of `Operation.invokeHostFunction`
  static createStellarAssetContract = ops.createStellarAssetContract;
  static invokeContractFunction = ops.invokeContractFunction;
  static createCustomContract = ops.createCustomContract;
  static uploadContractWasm = ops.uploadContractWasm;
}

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
function extractRevokeSponshipDetails(
  attrs: any,
  result: Record<string, unknown>,
) {
  switch (attrs.switch().name) {
    case "revokeSponsorshipLedgerEntry": {
      const ledgerKey = attrs.ledgerKey();

      switch (ledgerKey.switch().name) {
        case xdr.LedgerEntryType.account().name: {
          result.type = "revokeAccountSponsorship";
          result.account = accountIdtoAddress(ledgerKey.account().accountId());
          break;
        }
        case xdr.LedgerEntryType.trustline().name: {
          result.type = "revokeTrustlineSponsorship";
          result.account = accountIdtoAddress(
            ledgerKey.trustLine().accountId(),
          );
          const xdrAsset = ledgerKey.trustLine().asset();
          switch (xdrAsset.switch()) {
            case xdr.AssetType.assetTypePoolShare():
              result.asset = LiquidityPoolId.fromOperation(xdrAsset);
              break;
            default:
              result.asset = Asset.fromOperation(xdrAsset);
              break;
          }
          break;
        }
        case xdr.LedgerEntryType.offer().name: {
          result.type = "revokeOfferSponsorship";
          result.seller = accountIdtoAddress(ledgerKey.offer().sellerId());
          result.offerId = ledgerKey.offer().offerId().toString();
          break;
        }
        case xdr.LedgerEntryType.data().name: {
          result.type = "revokeDataSponsorship";
          result.account = accountIdtoAddress(ledgerKey.data().accountId());
          result.name = ledgerKey.data().dataName().toString("ascii");
          break;
        }
        case xdr.LedgerEntryType.claimableBalance().name: {
          result.type = "revokeClaimableBalanceSponsorship";
          result.balanceId = ledgerKey
            .claimableBalance()
            .balanceId()
            .toXDR("hex");
          break;
        }
        case xdr.LedgerEntryType.liquidityPool().name: {
          result.type = "revokeLiquidityPoolSponsorship";
          result.liquidityPoolId = ledgerKey
            .liquidityPool()
            .liquidityPoolId()
            .toString("hex");
          break;
        }
        default: {
          throw new Error(`Unknown ledgerKey: ${attrs.switch().name}`);
        }
      }
      break;
    }
    case "revokeSponsorshipSigner": {
      result.type = "revokeSignerSponsorship";
      result.account = accountIdtoAddress(attrs.signer().accountId());
      result.signer = convertXDRSignerKeyToObject(attrs.signer().signerKey());
      break;
    }
    default: {
      throw new Error(`Unknown revokeSponsorship: ${attrs.switch().name}`);
    }
  }
}

function convertXDRSignerKeyToObject(
  signerKey: xdr.SignerKey,
): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};

  switch (signerKey.switch().name) {
    case xdr.SignerKeyType.signerKeyTypeEd25519().name: {
      attrs.ed25519PublicKey = StrKey.encodeEd25519PublicKey(
        signerKey.ed25519(),
      );
      break;
    }
    case xdr.SignerKeyType.signerKeyTypePreAuthTx().name: {
      attrs.preAuthTx = signerKey.preAuthTx().toString("hex");
      break;
    }
    case xdr.SignerKeyType.signerKeyTypeHashX().name: {
      attrs.sha256Hash = signerKey.hashX().toString("hex");
      break;
    }
    case xdr.SignerKeyType.signerKeyTypeEd25519SignedPayload().name: {
      const signedPayload = signerKey.ed25519SignedPayload();

      attrs.ed25519SignedPayload = StrKey.encodeSignedPayload(
        signedPayload.toXDR(),
      );
      break;
    }
    default: {
      throw new Error(`Unknown signerKey: ${signerKey.switch().name}`);
    }
  }

  return attrs;
}
/* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */

function accountIdtoAddress(accountId: xdr.AccountId): string {
  return StrKey.encodeEd25519PublicKey(accountId.ed25519());
}

// Namespace merged with the Operation class to expose operation result types as
// `Operation.CreateAccount`, `Operation.Payment`, etc. — matching the public API
// declared in types/index.d.ts.
// The static methods (e.g. Operation.createAccount) are defined on the class above.

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Operation {
  export type BaseOperation<T extends _OperationType = _OperationType> =
    _BaseOperation<T>;
  export type CreateAccount = CreateAccountResult;
  export type Payment = PaymentResult;
  export type PathPaymentStrictReceive = PathPaymentStrictReceiveResult;
  export type PathPaymentStrictSend = PathPaymentStrictSendResult;
  export type CreatePassiveSellOffer = CreatePassiveSellOfferResult;
  export type ManageSellOffer = ManageSellOfferResult;
  export type ManageBuyOffer = ManageBuyOfferResult;
  export type SetOptions = SetOptionsResult<Signer>;
  export type ChangeTrust = ChangeTrustResult;
  export type AllowTrust = AllowTrustResult;
  export type AccountMerge = AccountMergeResult;
  export type Inflation = InflationResult;
  export type ManageData = ManageDataResult;
  export type BumpSequence = BumpSequenceResult;
  export type CreateClaimableBalance = CreateClaimableBalanceResult;
  export type ClaimClaimableBalance = ClaimClaimableBalanceResult;
  export type BeginSponsoringFutureReserves =
    BeginSponsoringFutureReservesResult;
  export type EndSponsoringFutureReserves = EndSponsoringFutureReservesResult;
  export type RevokeAccountSponsorship = RevokeAccountSponsorshipResult;
  export type RevokeTrustlineSponsorship = RevokeTrustlineSponsorshipResult;
  export type RevokeOfferSponsorship = RevokeOfferSponsorshipResult;
  export type RevokeDataSponsorship = RevokeDataSponsorshipResult;
  export type RevokeClaimableBalanceSponsorship =
    RevokeClaimableBalanceSponsorshipResult;
  export type RevokeLiquidityPoolSponsorship =
    RevokeLiquidityPoolSponsorshipResult;
  export type RevokeSignerSponsorship = RevokeSignerSponsorshipResult;
  export type Clawback = ClawbackResult;
  export type ClawbackClaimableBalance = ClawbackClaimableBalanceResult;
  export type SetTrustLineFlags = SetTrustLineFlagsResult;
  export type LiquidityPoolDeposit = LiquidityPoolDepositResult;
  export type LiquidityPoolWithdraw = LiquidityPoolWithdrawResult;
  export type InvokeHostFunction = InvokeHostFunctionResult;
  export type ExtendFootprintTTL = ExtendFootprintTTLResult;
  export type RestoreFootprint = RestoreFootprintResult;
}
