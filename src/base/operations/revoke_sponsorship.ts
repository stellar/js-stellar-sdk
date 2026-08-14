import {
  ClaimableBalanceId,
  Int64,
  LedgerKey,
  LedgerKeyAccount,
  LedgerKeyClaimableBalance,
  LedgerKeyData,
  LedgerKeyLiquidityPool,
  LedgerKeyOffer,
  LedgerKeyTrustLine,
  Operation,
  OperationBody,
  PoolId,
  RevokeSponsorshipOp,
  RevokeSponsorshipOpSigner,
  SignerKey,
  SignerKeyEd25519SignedPayload,
  TrustLineAsset,
} from "../../xdr/index.js";
import { hexToUint8Array } from "uint8array-extras";
import { StrKey } from "../strkey.js";
import { Keypair } from "../keypair.js";
import { Asset } from "../asset.js";
import { LiquidityPoolId } from "../liquidity_pool_id.js";
import {
  RevokeAccountSponsorshipOpts,
  RevokeTrustlineSponsorshipOpts,
  RevokeOfferSponsorshipOpts,
  RevokeDataSponsorshipOpts,
  RevokeClaimableBalanceSponsorshipOpts,
  RevokeLiquidityPoolSponsorshipOpts,
  RevokeSignerSponsorshipOpts,
  OperationAttributes,
} from "./types.js";
import { setSourceAccount } from "../util/operations.js";

/**
 * Create a "revoke sponsorship" operation for an account.
 *
 * @param opts - Options object
 *   - `account`: The sponsored account ID.
 *   - `source`: The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * ```ts
 * const op = Operation.revokeAccountSponsorship({
 *   account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
 * });
 * ```
 */
export function revokeAccountSponsorship(
  opts: RevokeAccountSponsorshipOpts = {} as RevokeAccountSponsorshipOpts,
): Operation {
  if (!StrKey.isValidEd25519PublicKey(opts.account)) {
    throw new Error("account is invalid");
  }

  const ledgerKey = LedgerKey.account(
    new LedgerKeyAccount({
      accountId: Keypair.fromPublicKey(opts.account).xdrAccountId(),
    }),
  );
  const op = RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.revokeSponsorship(op),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}

/**
 * Create a "revoke sponsorship" operation for a trustline.
 *
 * @param opts - Options object
 *   - `account`: The account ID which owns the trustline.
 *   - `asset`: The trustline asset.
 *   - `source`: The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * ```ts
 * const op = Operation.revokeTrustlineSponsorship({
 *   account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
 *   asset: new StellarBase.LiquidityPoolId(
 *     'USDUSD',
 *     'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7'
 *   )
 * });
 * ```
 */
export function revokeTrustlineSponsorship(
  opts: RevokeTrustlineSponsorshipOpts = {} as RevokeTrustlineSponsorshipOpts,
): Operation {
  if (!StrKey.isValidEd25519PublicKey(opts.account)) {
    throw new Error("account is invalid");
  }

  let asset: TrustLineAsset;

  if (opts.asset instanceof Asset) {
    asset = opts.asset.toTrustLineXdrObject();
  } else if (opts.asset instanceof LiquidityPoolId) {
    asset = opts.asset.toXdrObject();
  } else {
    throw new TypeError("asset must be an Asset or LiquidityPoolId");
  }

  const ledgerKey = LedgerKey.trustline(
    new LedgerKeyTrustLine({
      accountId: Keypair.fromPublicKey(opts.account).xdrAccountId(),
      asset,
    }),
  );
  const op = RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.revokeSponsorship(op),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}

/**
 * Create a "revoke sponsorship" operation for an offer.
 *
 * @param opts - Options object
 *   - `seller`: The account ID which created the offer.
 *   - `offerId`: The offer ID.
 *   - `source`: The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * ```ts
 * const op = Operation.revokeOfferSponsorship({
 *   seller: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
 *   offerId: '1234'
 * });
 * ```
 */
export function revokeOfferSponsorship(
  opts: RevokeOfferSponsorshipOpts = {} as RevokeOfferSponsorshipOpts,
): Operation {
  if (!StrKey.isValidEd25519PublicKey(opts.seller)) {
    throw new Error("seller is invalid");
  }

  if (typeof opts.offerId !== "string") {
    throw new Error("offerId is invalid");
  }

  const ledgerKey = LedgerKey.offer(
    new LedgerKeyOffer({
      sellerId: Keypair.fromPublicKey(opts.seller).xdrAccountId(),
      offerId: Int64.fromString(opts.offerId),
    }),
  );
  const op = RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.revokeSponsorship(op),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}

/**
 * Create a "revoke sponsorship" operation for a data entry.
 *
 * @param opts - Options object
 *   - `account`: The account ID which owns the data entry.
 *   - `name`: The name of the data entry.
 *   - `source`: The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * ```ts
 * const op = Operation.revokeDataSponsorship({
 *   account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
 *   name: 'foo'
 * });
 * ```
 */
export function revokeDataSponsorship(
  opts: RevokeDataSponsorshipOpts = {} as RevokeDataSponsorshipOpts,
): Operation {
  if (!StrKey.isValidEd25519PublicKey(opts.account)) {
    throw new Error("account is invalid");
  }

  if (typeof opts.name !== "string" || opts.name.length > 64) {
    throw new Error("name must be a string, up to 64 characters");
  }

  const ledgerKey = LedgerKey.data(
    new LedgerKeyData({
      accountId: Keypair.fromPublicKey(opts.account).xdrAccountId(),
      dataName: opts.name,
    }),
  );
  const op = RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.revokeSponsorship(op),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}

/**
 * Create a "revoke sponsorship" operation for a claimable balance.
 *
 * @param opts - Options object
 *   - `balanceId`: The sponsored claimable balance ID.
 *   - `source`: The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * ```ts
 * const op = Operation.revokeClaimableBalanceSponsorship({
 *   balanceId: '00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be',
 * });
 * ```
 */
export function revokeClaimableBalanceSponsorship(
  opts: RevokeClaimableBalanceSponsorshipOpts = {} as RevokeClaimableBalanceSponsorshipOpts,
): Operation {
  if (typeof opts.balanceId !== "string") {
    throw new Error("balanceId is invalid");
  }

  const ledgerKey = LedgerKey.claimableBalance(
    new LedgerKeyClaimableBalance({
      balanceId: ClaimableBalanceId.fromXdr(opts.balanceId, "hex"),
    }),
  );
  const op = RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.revokeSponsorship(op),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}

/**
 * Creates a "revoke sponsorship" operation for a liquidity pool.
 *
 * @param opts - Options object.
 *   - `liquidityPoolId`: The sponsored liquidity pool ID in 'hex' string.
 *   - `source`: The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * ```ts
 * const op = Operation.revokeLiquidityPoolSponsorship({
 *   liquidityPoolId: 'dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7',
 * });
 * ```
 */
export function revokeLiquidityPoolSponsorship(
  opts: RevokeLiquidityPoolSponsorshipOpts = {} as RevokeLiquidityPoolSponsorshipOpts,
): Operation {
  if (typeof opts.liquidityPoolId !== "string") {
    throw new Error("liquidityPoolId is invalid");
  }

  const ledgerKey = LedgerKey.liquidityPool(
    new LedgerKeyLiquidityPool({
      liquidityPoolId: new PoolId(hexToUint8Array(opts.liquidityPoolId)),
    }),
  );
  const op = RevokeSponsorshipOp.revokeSponsorshipLedgerEntry(ledgerKey);

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.revokeSponsorship(op),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}

/**
 * Create a "revoke sponsorship" operation for a signer.
 *
 * @param opts - Options object
 *   - `account`: The account ID where the signer sponsorship is being removed from.
 *   - `signer`: The signer whose sponsorship is being removed. Exactly one of the following must be set:
 *     - `ed25519PublicKey`: (optional) The ed25519 public key of the signer.
 *     - `sha256Hash`: (optional) sha256 hash (Uint8Array or hex string).
 *     - `preAuthTx`: (optional) Hash (Uint8Array or hex string) of transaction.
 *     - `ed25519SignedPayload`: (optional) Signed payload signer (StrKey P... address).
 *   - `source`: The source account for the operation. Defaults to the transaction's source account.
 *
 * @example
 * ```ts
 * const op = Operation.revokeSignerSponsorship({
 *   account: 'GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7',
 *   signer: {
 *     ed25519PublicKey: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ'
 *   }
 * })
 * ```
 */
export function revokeSignerSponsorship(
  opts: RevokeSignerSponsorshipOpts = {} as RevokeSignerSponsorshipOpts,
): Operation {
  if (!StrKey.isValidEd25519PublicKey(opts.account)) {
    throw new Error("account is invalid");
  }

  let key: SignerKey;

  if (opts.signer.ed25519PublicKey) {
    if (!StrKey.isValidEd25519PublicKey(opts.signer.ed25519PublicKey)) {
      throw new Error("signer.ed25519PublicKey is invalid.");
    }
    const rawKey = StrKey.decodeEd25519PublicKey(opts.signer.ed25519PublicKey);
    key = SignerKey.signerKeyTypeEd25519(rawKey);
  } else if (opts.signer.preAuthTx) {
    let buffer: Uint8Array;

    if (typeof opts.signer.preAuthTx === "string") {
      buffer = hexToUint8Array(opts.signer.preAuthTx);
    } else {
      buffer = opts.signer.preAuthTx;
    }

    if (!(buffer instanceof Uint8Array && buffer.length === 32)) {
      throw new Error("signer.preAuthTx must be 32 bytes Uint8Array.");
    }

    key = SignerKey.signerKeyTypePreAuthTx(buffer);
  } else if (opts.signer.sha256Hash) {
    let buffer: Uint8Array;

    if (typeof opts.signer.sha256Hash === "string") {
      buffer = hexToUint8Array(opts.signer.sha256Hash);
    } else {
      buffer = opts.signer.sha256Hash;
    }

    if (!(buffer instanceof Uint8Array && buffer.length === 32)) {
      throw new Error("signer.sha256Hash must be 32 bytes Uint8Array.");
    }

    key = SignerKey.signerKeyTypeHashX(buffer);
  } else if (opts.signer.ed25519SignedPayload) {
    if (!StrKey.isValidSignedPayload(opts.signer.ed25519SignedPayload)) {
      throw new Error("signer.ed25519SignedPayload is invalid.");
    }

    const rawPayload = StrKey.decodeSignedPayload(
      opts.signer.ed25519SignedPayload,
    );

    const signedPayloadXdr = SignerKeyEd25519SignedPayload.fromXdr(rawPayload);

    key = SignerKey.signerKeyTypeEd25519SignedPayload(signedPayloadXdr);
  } else {
    throw new Error("signer is invalid");
  }

  const signer = new RevokeSponsorshipOpSigner({
    accountId: Keypair.fromPublicKey(opts.account).xdrAccountId(),
    signerKey: key,
  });

  const op = RevokeSponsorshipOp.revokeSponsorshipSigner(signer);

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: OperationBody.revokeSponsorship(op),
  };
  setSourceAccount(opAttributes, opts);

  return new Operation(opAttributes);
}
