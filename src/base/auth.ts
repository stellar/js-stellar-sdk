import xdr from "./xdr.js";

import { Keypair } from "./keypair.js";
import { StrKey } from "./strkey.js";

import type { Networks } from "./network.js";
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
 * If using the `SigningCallback` variation, the signer is assumed to be
 * the entry's credential address unless you use the variant that returns
 * the object.
 *
 * @param forAddress - which credential node the signature should be written
 *    to. Only relevant for `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES`, where
 *    a single entry can be signed by the top-level account and/or any of its
 *    (possibly nested) delegates. Per CAP-71-01 every one of these signers
 *    signs the *same* payload (bound to the top-level address), so the
 *    signature produced here is written to whichever node(s) carry
 *    `forAddress`. When omitted, the signature is written to the top-level
 *    credentials, which preserves the behavior for `SOROBAN_CREDENTIALS_ADDRESS`
 *    / `SOROBAN_CREDENTIALS_ADDRESS_V2` and for accounts whose signing key
 *    differs from the credential address (e.g. multisig).
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
  forAddress?: string,
): Promise<xdr.SorobanAuthorizationEntry> {
  // no-op if it's source account auth
  if (
    entry.credentials().switch().value ===
    xdr.SorobanCredentialsType.sorobanCredentialsSourceAccount().value
  ) {
    return entry;
  }

  const clone = xdr.SorobanAuthorizationEntry.fromXDR(entry.toXDR());
  const credentials = clone.credentials();
  const addrAuth = getAddressCredentials(credentials);
  if (addrAuth === null) {
    // We should have already returned if the credentials were source account credentials,
    // so if we can't get address credentials out of this, it's an unsupported credential type.
    throw new Error(`unsupported credential type ${credentials.switch().name}`);
  }

  // Set the expiration before building the preimage, so the hash that gets
  // signed commits to the same expiration ledger stored in the credentials.
  // Otherwise the network reconstructs the preimage from the (updated)
  // credentials and the signature no longer matches.
  addrAuth.signatureExpirationLedger(validUntilLedgerSeq);

  const preimage = buildAuthorizationEntryPreimage(
    clone,
    validUntilLedgerSeq,
    networkPassphrase,
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

  const signatureScVal = xdr.ScVal.scvVec([sigScVal]);

  // CAP-71-01: the signature payload is shared across the top-level address
  // and every (possibly nested) delegate, so this signer's signature is
  // written to whichever credential node(s) carry `forAddress`. When no
  // `forAddress` is given we fall back to the top-level credentials, which
  // preserves the behavior for ADDRESS / ADDRESS_V2 and for accounts whose
  // signing key differs from the credential address (e.g. multisig).
  const targets: SignableCredential[] =
    forAddress === undefined
      ? [addrAuth]
      : collectSignatureNodes(credentials).filter(
          (node) =>
            Address.fromScAddress(node.address()).toString() === forAddress,
        );

  if (targets.length === 0) {
    throw new Error(
      `the authorization entry has no credential node for address ${forAddress}`,
    );
  }

  targets.forEach((node) => node.signature(signatureScVal));
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
 *   - `signer`: either a {@link Keypair} instance (or anything with a
 *    `.sign(buf): Buffer-like` method) or a function which takes a payload (a
 *    {@link xdr.HashIdPreimageSorobanAuthorization} instance) input and returns
 *    the signature of the hash of the raw payload bytes (where the signing key
 *    should correspond to the address in the `entry`)
 *   - `validUntilLedgerSeq`: the (exclusive) future ledger sequence
 *    number until which this authorization entry should be valid (if
 *    `currentLedgerSeq==validUntilLedgerSeq`, this is expired)
 *   - `invocation`: the invocation tree that we're authorizing
 *    (likely, this comes from transaction simulation)
 *   - `networkPassphrase`: the network passphrase is incorporated into
 *    the signature (see {@link Networks} for options)
 *   - `publicKey`: the public identity of the signer (when providing a
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
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddressV2(
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

/**
 * Builds the {@link xdr.HashIdPreimage} whose hash a signer must sign to
 * authorize `entry`. This is the low-level signature payload used by
 * {@link authorizeEntry}, exposed for callers that drive signing themselves —
 * most notably for `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES`, where the
 * client (not simulation) decides which delegates sign and how.
 *
 * For `SOROBAN_CREDENTIALS_ADDRESS` this is the legacy, non-address-bound
 * `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION` preimage. For `SOROBAN_CREDENTIALS_ADDRESS_V2`
 * and `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` it is the address-bound
 * `ENVELOPE_TYPE_SOROBAN_AUTHORIZATION_WITH_ADDRESS` preimage (CAP-71). For the
 * delegates variant this single payload — bound to the *top-level* address — is
 * what the top-level account and every (nested) delegate each sign.
 *
 * To get the raw bytes to sign, hash the XDR: `hash(preimage.toXDR())`.
 *
 * @param entry - the authorization entry to build the payload for
 * @param validUntilLedgerSeq - the expiration ledger committed into the payload
 *    (must match the `signatureExpirationLedger` on the credentials you submit)
 * @param networkPassphrase - the network passphrase mixed into the payload
 * @throws `Error` if `entry` carries source-account or otherwise non-address
 *    credentials
 */
export function buildAuthorizationEntryPreimage(
  entry: xdr.SorobanAuthorizationEntry,
  validUntilLedgerSeq: number,
  networkPassphrase: string,
): xdr.HashIdPreimage {
  const credentials = entry.credentials();
  const addrAuth = getAddressCredentials(credentials);
  if (addrAuth === null) {
    throw new Error(
      `cannot build a signature payload for credential type ${credentials.switch().name}`,
    );
  }

  const networkId = hash(Buffer.from(networkPassphrase));

  switch (credentials.switch().value) {
    // legacy address credentials are not address-bound
    case xdr.SorobanCredentialsType.sorobanCredentialsAddress().value:
      return xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
        new xdr.HashIdPreimageSorobanAuthorization({
          networkId,
          nonce: addrAuth.nonce(),
          invocation: entry.rootInvocation(),
          signatureExpirationLedger: validUntilLedgerSeq,
        }),
      );

    // ADDRESS_V2 and ADDRESS_WITH_DELEGATES bind the address into the signed
    // payload via the WithAddress preimage (CAP-71)
    case xdr.SorobanCredentialsType.sorobanCredentialsAddressV2().value:
    case xdr.SorobanCredentialsType.sorobanCredentialsAddressWithDelegates()
      .value:
      return xdr.HashIdPreimage.envelopeTypeSorobanAuthorizationWithAddress(
        new xdr.HashIdPreimageSorobanAuthorizationWithAddress({
          networkId,
          nonce: addrAuth.nonce(),
          invocation: entry.rootInvocation(),
          address: addrAuth.address(),
          signatureExpirationLedger: validUntilLedgerSeq,
        }),
      );

    default:
      throw new Error(
        `unsupported credential type ${credentials.switch().name}`,
      );
  }
}

/**
 * A delegate signer to attach to a
 * `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` entry via
 * {@link buildWithDelegatesEntry}.
 */
export interface DelegateSignature {
  /** the delegate's address (`G…` account or `C…` contract). */
  address: string;
  /**
   * the delegate's signature value. Defaults to a `scvVoid` placeholder, which
   * you can fill afterwards with {@link authorizeEntry} (passing this address
   * as `forAddress`) or by editing the entry directly.
   */
  signature?: xdr.ScVal;
  /** signers this delegate in turn delegates to (recursive). */
  nestedDelegates?: DelegateSignature[];
}

/** Parameters for {@link buildWithDelegatesEntry}. */
export interface BuildWithDelegatesParams {
  /**
   * an existing `SOROBAN_CREDENTIALS_ADDRESS` or
   * `SOROBAN_CREDENTIALS_ADDRESS_V2` entry — typically one returned by
   * simulation — whose address credentials should be wrapped.
   */
  entry: xdr.SorobanAuthorizationEntry;
  /** the expiration ledger sequence stored on the top-level credentials. */
  validUntilLedgerSeq: number;
  /** the delegate signers to attach. */
  delegates: DelegateSignature[];
  /**
   * the top-level account's signature. Defaults to `scvVoid`, which is valid
   * for accounts that authorize purely via delegated signers (CAP-71-01).
   */
  signature?: xdr.ScVal;
}

/**
 * Builds a `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` authorization entry by
 * wrapping the address credentials of an existing `ADDRESS`/`ADDRESS_V2` entry
 * (e.g. one returned by simulation) together with a caller-provided set of
 * delegate signers.
 *
 * Simulation never emits the delegates variant on its own — which accounts use
 * delegated authentication is account-specific policy known only to the client
 * (much like a multisig policy). This helper just assembles the wrapper XDR;
 * you supply the delegate tree (addresses and, optionally, signatures). To
 * produce the signatures, build the shared payload with
 * {@link buildAuthorizationEntryPreimage} on the returned entry and sign it,
 * or fill each node afterwards with {@link authorizeEntry} (passing the
 * signer's address as `forAddress`).
 *
 * Each delegates array (the top-level set and every `nestedDelegates`) is
 * sorted by address in ascending order, and duplicate addresses within an array
 * are rejected, as the protocol requires (CAP-71-01) — otherwise the host
 * rejects the entry.
 *
 * @param params - see {@link BuildWithDelegatesParams}
 * @throws `Error` if `entry` is not an `ADDRESS`/`ADDRESS_V2` entry, or if any
 *    delegates array contains a duplicate address.
 */
export function buildWithDelegatesEntry(
  params: BuildWithDelegatesParams,
): xdr.SorobanAuthorizationEntry {
  const { entry, validUntilLedgerSeq, delegates, signature } = params;
  const credentials = entry.credentials();
  const addrAuth = getAddressCredentials(credentials);
  if (
    addrAuth === null ||
    credentials.switch().value ===
      xdr.SorobanCredentialsType.sorobanCredentialsAddressWithDelegates().value
  ) {
    throw new Error(
      `buildWithDelegatesEntry expects ADDRESS or ADDRESS_V2 credentials, got ${
        credentials.switch().name
      }`,
    );
  }

  return new xdr.SorobanAuthorizationEntry({
    rootInvocation: entry.rootInvocation(),
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
      new xdr.SorobanAddressCredentialsWithDelegates({
        addressCredentials: new xdr.SorobanAddressCredentials({
          address: addrAuth.address(),
          nonce: addrAuth.nonce(),
          signatureExpirationLedger: validUntilLedgerSeq,
          signature: signature ?? xdr.ScVal.scvVoid(),
        }),
        delegates: buildDelegateNodes(delegates),
      }),
    ),
  });
}

/**
 * Recursively converts {@link DelegateSignature} descriptors into
 * {@link xdr.SorobanDelegateSignature} nodes, sorting each level by address and
 * rejecting duplicates (CAP-71-01).
 */
function buildDelegateNodes(
  delegates: DelegateSignature[],
): xdr.SorobanDelegateSignature[] {
  const nodes = delegates.map(
    (delegate) =>
      new xdr.SorobanDelegateSignature({
        address: new Address(delegate.address).toScAddress(),
        signature: delegate.signature ?? xdr.ScVal.scvVoid(),
        nestedDelegates: buildDelegateNodes(delegate.nestedDelegates ?? []),
      }),
  );

  nodes.sort((a, b) =>
    Buffer.compare(a.address().toXDR(), b.address().toXDR()),
  );

  for (let i = 1; i < nodes.length; i++) {
    if (
      Buffer.compare(
        nodes[i - 1].address().toXDR(),
        nodes[i].address().toXDR(),
      ) === 0
    ) {
      throw new Error(
        `duplicate delegate address ${Address.fromScAddress(
          nodes[i].address(),
        ).toString()}`,
      );
    }
  }

  return nodes;
}

/**
 * Internal helper — intentionally NOT re-exported from `base/index.js`, so it
 * is not part of the public SDK API. Shared with the contract package, which
 * imports it directly from this module. If a public need arises, add it to the
 * explicit auth re-exports in `base/index.ts`.
 *
 * Extracts the {@link xdr.SorobanAddressCredentials} from any address-based
 * Soroban credential, regardless of which credential type variant is used.
 *
 * This unifies access across `SOROBAN_CREDENTIALS_ADDRESS`,
 * `SOROBAN_CREDENTIALS_ADDRESS_V2` (which carries identical fields but binds
 * the address into the signature payload), and
 * `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES` (which wraps the same address
 * credentials alongside a set of delegate signatures).
 *
 * @param credentials - the credentials to inspect
 * @returns the inner address credentials, or `null` for source-account
 *    credentials (which carry no address payload)
 */
export function getAddressCredentials(
  credentials: xdr.SorobanCredentials,
): xdr.SorobanAddressCredentials | null {
  switch (credentials.switch().value) {
    case xdr.SorobanCredentialsType.sorobanCredentialsAddress().value:
      return credentials.address();
    case xdr.SorobanCredentialsType.sorobanCredentialsAddressV2().value:
      return credentials.addressV2();
    case xdr.SorobanCredentialsType.sorobanCredentialsAddressWithDelegates()
      .value:
      return credentials.addressWithDelegates().addressCredentials();
    default:
      return null;
  }
}

/**
 * The common shape of every node in an authorization entry that can carry a
 * signature: the top-level {@link xdr.SorobanAddressCredentials} and, for the
 * delegates variant, each {@link xdr.SorobanDelegateSignature}. Both expose an
 * `address()` and a `signature()` accessor.
 */
interface SignableCredential {
  address(value?: xdr.ScAddress): xdr.ScAddress;
  signature(value?: xdr.ScVal): xdr.ScVal;
}

/**
 * Internal helper. Returns every node in an address-based credential that can
 * carry a signature, in a stable order: the top-level address credentials
 * first, then (only for `SOROBAN_CREDENTIALS_ADDRESS_WITH_DELEGATES`) the
 * delegates and their nested delegates, depth-first. Returns an empty array
 * for source-account credentials, which carry no signature.
 *
 * Per CAP-71-01 all of these nodes commit to the same payload (the one bound to
 * the top-level address), so the caller can fill any of them with a signature
 * produced from that shared payload.
 */
function collectSignatureNodes(
  credentials: xdr.SorobanCredentials,
): SignableCredential[] {
  switch (credentials.switch().value) {
    case xdr.SorobanCredentialsType.sorobanCredentialsAddress().value:
      return [credentials.address()];
    case xdr.SorobanCredentialsType.sorobanCredentialsAddressV2().value:
      return [credentials.addressV2()];
    case xdr.SorobanCredentialsType.sorobanCredentialsAddressWithDelegates()
      .value: {
      const withDelegates = credentials.addressWithDelegates();
      const nodes: SignableCredential[] = [withDelegates.addressCredentials()];
      const walk = (delegates: xdr.SorobanDelegateSignature[]) => {
        delegates.forEach((delegate) => {
          nodes.push(delegate);
          walk(delegate.nestedDelegates());
        });
      };
      walk(withDelegates.delegates());
      return nodes;
    }
    default:
      return [];
  }
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
