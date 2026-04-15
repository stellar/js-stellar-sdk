import xdr from "./xdr.js";

import { Keypair } from "./keypair.js";
import { StrKey } from "./strkey.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Networks } from "./network.js";
import { hash } from "./hashing.js";

import { Address } from "./address.js";
import { nativeToScVal } from "./scval.js";

type BufferLike = ArrayBuffer | Buffer | Uint8Array;

function toBuffer(value: BufferLike): Buffer {
  if (value instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(value));
  }
  return Buffer.from(value);
}

/**
 * A callback for signing an XDR structure representing all of the details
 * necessary to authorize an invocation tree.
 *
 * @param preimage - the entire authorization envelope whose hash you should
 *    sign, so that you can inspect the entire structure if necessary (rather
 *    than blindly signing a hash)
 *
 * @returns the signature of the raw payload (which is the sha256 hash of the
 *    preimage bytes, so `hash(preimage.toXDR())`) either naked, implying it is
 *    signed by the key corresponding to the public key in the entry you pass to
 *    {@link authorizeEntry} (decipherable from its
 *    `credentials().address().address()`), or alongside an explicit `publicKey`.
 */
export type SigningCallback = (
  preimage: xdr.HashIdPreimage,
) => Promise<BufferLike | { signature: BufferLike; publicKey: string }>;

/**
 * Actually authorizes an existing authorization entry using the given
 * credentials and expiration details, returning a signed copy.
 *
 * This "fills out" the authorization entry with a signature, indicating to the
 * {@link Operation.invokeHostFunction} its attached to that:
 *   - a particular identity (i.e. signing {@link Keypair} or other signer)
 *   - approving the execution of an invocation tree (i.e. a simulation-acquired
 *     {@link xdr.SorobanAuthorizedInvocation} or otherwise built)
 *   - on a particular network (uniquely identified by its passphrase, see
 *     {@link Networks})
 *   - until a particular ledger sequence is reached.
 *
 * This one lets you pass either a {@link Keypair} (or, more accurately,
 * anything with a `sign(Buffer): Buffer` method) or a callback function (see
 * {@link SigningCallback}) to handle signing the envelope hash.
 *
 * @param entry - an unsigned authorization entry
 * @param signer - either a {@link Keypair} instance or a function which takes a
 *    {@link xdr.HashIdPreimageSorobanAuthorization} input payload and returns
 *    EITHER
 *
 *      (a) an object containing a `signature` of the hash of the raw payload
 *          bytes as a Buffer-like and a `publicKey` string representing who just
 *          created this signature, or
 *      (b) just the naked signature of the hash of the raw payload bytes (where
 *          the signing key is implied to be the address in the `entry`).
 *
 *    The latter option (b) is JUST for backwards compatibility and will be
 *    removed in the future.
 * @param validUntilLedgerSeq - the (exclusive) future ledger sequence number
 *    until which this authorization entry should be valid (if
 *    `currentLedgerSeq==validUntil`, this is expired)
 * @param networkPassphrase - the network passphrase is incorporated into the
 *    signature (see {@link Networks} for options)
 *
 * @note If using the `SigningCallback` variation, the signer is assumed to be
 *    the entry's credential address unless you use the variant that returns
 *    the object.
 *
 * @see authorizeInvocation
 * @example
 * ```ts
 * import {
 *   SorobanRpc,
 *   Transaction,
 *   Networks,
 *   authorizeEntry
 * } from '@stellar/stellar-sdk';
 *
 * // Assume signPayloadCallback is a well-formed signing callback.
 * //
 * // It might, for example, pop up a modal from a browser extension, send the
 * // transaction to a third-party service for signing, or just do simple
 * // signing via Keypair like it does here:
 * function signPayloadCallback(payload) {
 *    return signer.sign(hash(payload.toXDR()));
 * }
 *
 * function multiPartyAuth(
 *    server: SorobanRpc.Server,
 *    // assume this involves multi-party auth
 *    tx: Transaction,
 * ) {
 *    return server
 *      .simulateTransaction(tx)
 *      .then((simResult) => {
 *          tx.operations[0].auth.map(entry =>
 *            authorizeEntry(
 *              entry,
 *              signPayloadCallback,
 *              currentLedger + 1000,
 *              Networks.TESTNET)
 *          );
 *
 *          return server.prepareTransaction(tx, simResult);
 *      })
 *      .then((preppedTx) => {
 *        preppedTx.sign(source);
 *        return server.sendTransaction(preppedTx);
 *      });
 * }
 * ```
 */
export async function authorizeEntry(
  entry: xdr.SorobanAuthorizationEntry,
  signer: Keypair | SigningCallback,
  validUntilLedgerSeq: number,
  networkPassphrase: string,
): Promise<xdr.SorobanAuthorizationEntry> {
  // no-op if it's source account auth
  if (
    entry.credentials().switch().value !==
    xdr.SorobanCredentialsType.sorobanCredentialsAddress().value
  ) {
    return entry;
  }

  const clone = xdr.SorobanAuthorizationEntry.fromXDR(entry.toXDR());

  const addrAuth: xdr.SorobanAddressCredentials = clone.credentials().address();
  addrAuth.signatureExpirationLedger(validUntilLedgerSeq);

  const networkId = hash(Buffer.from(networkPassphrase));
  const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
    new xdr.HashIdPreimageSorobanAuthorization({
      networkId,
      nonce: addrAuth.nonce(),
      invocation: clone.rootInvocation(),
      signatureExpirationLedger: addrAuth.signatureExpirationLedger(),
    }),
  );
  const payload = hash(preimage.toXDR());

  let signature: Buffer;
  let publicKey: string;
  if (typeof signer === "function") {
    const sigResult = await signer(preimage);
    if (
      sigResult !== null &&
      typeof sigResult === "object" &&
      "signature" in sigResult
    ) {
      signature = toBuffer(sigResult.signature);
      publicKey = sigResult.publicKey;
    } else {
      // if using the deprecated form, assume it's for the entry
      signature = toBuffer(sigResult);
      publicKey = Address.fromScAddress(addrAuth.address()).toString();
    }
  } else {
    signature = toBuffer(signer.sign(payload));
    publicKey = signer.publicKey();
  }

  if (!Keypair.fromPublicKey(publicKey).verify(payload, signature)) {
    throw new Error(`signature doesn't match payload`);
  }

  // This structure is defined here:
  // https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#stellar-account-signatures
  //
  // Encoding a contract structure as an ScVal means the map keys are supposed
  // to be symbols, hence the forced typing here.
  const sigScVal = nativeToScVal(
    {
      public_key: StrKey.decodeEd25519PublicKey(publicKey),
      signature,
    },
    {
      type: {
        public_key: ["symbol", null],
        signature: ["symbol", null],
      },
    },
  );

  addrAuth.signature(xdr.ScVal.scvVec([sigScVal]));
  return clone;
}

/**
 * This builds an entry from scratch, allowing you to express authorization as a
 * function of:
 *   - a particular identity (i.e. signing {@link Keypair} or other signer)
 *   - approving the execution of an invocation tree (i.e. a simulation-acquired
 *     {@link xdr.SorobanAuthorizedInvocation} or otherwise built)
 *   - on a particular network (uniquely identified by its passphrase, see
 *     {@link Networks})
 *   - until a particular ledger sequence is reached.
 *
 * This is in contrast to {@link authorizeEntry}, which signs an existing entry.
 *
 * @param params - the parameters for building and signing the authorization
 * @param params.signer - either a {@link Keypair} instance (or anything with a
 *    `.sign(buf): Buffer-like` method) or a function which takes a payload (a
 *    {@link xdr.HashIdPreimageSorobanAuthorization} instance) input and returns
 *    the signature of the hash of the raw payload bytes (where the signing key
 *    should correspond to the address in the `entry`)
 * @param params.validUntilLedgerSeq - the (exclusive) future ledger sequence
 *    number until which this authorization entry should be valid (if
 *    `currentLedgerSeq==validUntilLedgerSeq`, this is expired)
 * @param params.invocation - the invocation tree that we're authorizing
 *    (likely, this comes from transaction simulation)
 * @param params.networkPassphrase - the network passphrase is incorporated into
 *    the signature (see {@link Networks} for options)
 * @param params.publicKey - the public identity of the signer (when providing a
 *    {@link Keypair} to `signer`, this can be omitted, as it just uses
 *    {@link Keypair.publicKey})
 *
 * @see authorizeEntry
 */
export interface AuthorizeInvocationParams {
  signer: Keypair | SigningCallback;
  validUntilLedgerSeq: number;
  invocation: xdr.SorobanAuthorizedInvocation;
  networkPassphrase: string;
  publicKey?: string;
}

export function authorizeInvocation(
  params: AuthorizeInvocationParams,
): Promise<xdr.SorobanAuthorizationEntry> {
  const {
    signer,
    validUntilLedgerSeq,
    invocation,
    networkPassphrase,
    publicKey = "",
  } = params;
  // We use keypairs as a source of randomness for the nonce to avoid mucking
  // with any crypto dependencies. Note that this just has to be random and
  // unique, not cryptographically secure, so it's fine.
  const kp = Keypair.random().rawPublicKey();
  const nonce = new xdr.Int64(bytesToInt64(kp));

  const pk =
    publicKey || (signer instanceof Keypair ? signer.publicKey() : null);
  if (!pk) {
    throw new Error(`authorizeInvocation requires publicKey parameter`);
  }

  const entry = new xdr.SorobanAuthorizationEntry({
    rootInvocation: invocation,
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: new Address(pk).toScAddress(),
        nonce,
        signatureExpirationLedger: 0, // replaced
        signature: xdr.ScVal.scvVec([]), // replaced
      }),
    ),
  });

  return authorizeEntry(entry, signer, validUntilLedgerSeq, networkPassphrase);
}

function bytesToInt64(bytes: Uint8Array): bigint {
  const buf = bytes.subarray(0, 8);
  if (buf.length < 8) {
    throw new Error(
      `need at least 8 bytes to convert to Int64, got ${bytes.length}`,
    );
  }
  const view = new DataView(buf.buffer, buf.byteOffset, 8);
  const value = view.getBigInt64(0, false);

  return value;
}
