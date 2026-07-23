import {
  HashIdPreimage,
  HashIdPreimageSorobanAuthorization,
  HashIdPreimageSorobanAuthorizationWithAddress,
  Int64,
  ScVal,
  SorobanAddressCredentials,
  SorobanAddressCredentialsWithDelegates,
  SorobanAuthorizationEntry,
  SorobanAuthorizedInvocation,
  SorobanCredentials,
  SorobanDelegateSignature,
} from "../xdr/index.js";

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
 *    preimage bytes, so `hash(preimage.toXdr())`) either naked, implying it is
 *    signed by the key corresponding to the public key in the entry you pass to
 *    {@link authorizeEntry} (decipherable from its
 *    `credentials().address().address()`), or alongside an explicit `publicKey`.
 */
export type SigningCallback = (
  preimage: HashIdPreimage,
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
 *    return signer.sign(hash(payload.toXdr()));
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
  entry: SorobanAuthorizationEntry,
  signer: Keypair | SigningCallback,
  validUntilLedgerSeq: number,
  networkPassphrase: string,
  forAddress?: string,
): Promise<SorobanAuthorizationEntry> {
  // no-op if it's source account auth
  if (entry.credentials.type === "sorobanCredentialsSourceAccount") {
    return entry;
  }

  // XDR values are immutable, so the input entry can be read directly — the
  // result below is always a freshly-built entry, never a mutation of it.
  const credentials = entry.credentials;
  const addrAuth = getAddressCredentials(credentials);
  if (addrAuth === null) {
    // We should have already returned if the credentials were source account
    // credentials, so if we can't get address credentials out of this, it's an
    // unsupported credential type.
    throw new Error(`unsupported credential type ${credentials.type}`);
  }

  // The preimage commits to the (updated) expiration ledger, so build it with
  // `validUntilLedgerSeq` directly; the same value gets written back onto the
  // credentials below, keeping the signed hash and the stored expiration in
  // sync. Otherwise the network reconstructs the preimage from the updated
  // credentials and the signature no longer matches.
  const preimage = buildAuthorizationEntryPreimage(
    entry,
    validUntilLedgerSeq,
    networkPassphrase,
  );

  const payload = hash(preimage.toXdr());

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
      publicKey = Address.fromScAddress(addrAuth.address).toString();
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

  const signatureScVal = ScVal.scvVec([sigScVal]);

  // CAP-71-01: the signature payload is shared across the top-level address and
  // every (possibly nested) delegate, so this signer's signature is written to
  // whichever credential node(s) carry `forAddress`. When no `forAddress` is
  // given we fall back to the top-level credentials, which preserves the
  // behavior for ADDRESS / ADDRESS_V2 and for accounts whose signing key
  // differs from the credential address (e.g. multisig). Because the class-XDR
  // types are immutable, the updated expiration and signature are folded into a
  // freshly-built credential tree.
  const { credentials: signedCredentials, matched } =
    applyExpirationAndSignature(
      credentials,
      validUntilLedgerSeq,
      signatureScVal,
      forAddress,
    );

  if (matched === 0) {
    throw new Error(
      `the authorization entry has no credential node for address ${forAddress}`,
    );
  }

  return new SorobanAuthorizationEntry({
    credentials: signedCredentials,
    rootInvocation: entry.rootInvocation,
  });
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
 *   - `authV2`: build `SOROBAN_CREDENTIALS_ADDRESS_V2` (CAP-71) credentials
 *    rather than the legacy `SOROBAN_CREDENTIALS_ADDRESS`. Defaults to `false`;
 *    only enable it for networks that have activated CAP-71.
 *
 * @see authorizeEntry
 */
export interface AuthorizeInvocationParams {
  signer: Keypair | SigningCallback;
  validUntilLedgerSeq: number;
  invocation: SorobanAuthorizedInvocation;
  networkPassphrase: string;
  publicKey?: string;
  /**
   * Build `SOROBAN_CREDENTIALS_ADDRESS_V2` (CAP-71) credentials instead of the
   * legacy `SOROBAN_CREDENTIALS_ADDRESS`. V2 credentials bind the address into
   * the signed payload but are only valid on networks that have activated
   * CAP-71, so leave this off until the activation vote passes for your target
   * network. The default flips to `true` once V2 becomes mandatory.
   * @defaultValue false
   */
  authV2?: boolean;
}

export function authorizeInvocation(
  params: AuthorizeInvocationParams,
): Promise<SorobanAuthorizationEntry> {
  const {
    signer,
    validUntilLedgerSeq,
    invocation,
    networkPassphrase,
    publicKey = "",
    authV2 = false,
  } = params;
  // We use keypairs as a source of randomness for the nonce to avoid mucking
  // with any crypto dependencies. Note that this just has to be random and
  // unique, not cryptographically secure, so it's fine.
  const kp = Keypair.random().rawPublicKey();
  const nonce = Int64(bytesToInt64(kp));

  const pk =
    publicKey || (signer instanceof Keypair ? signer.publicKey() : null);
  if (!pk) {
    throw new Error(`authorizeInvocation requires publicKey parameter`);
  }

  // V1 and V2 carry the identical SorobanAddressCredentials payload; only the
  // credential union arm differs. authorizeEntry picks the matching signature
  // preimage (legacy vs. address-bound) off whichever arm we build here.
  const addressCredentials = new SorobanAddressCredentials({
    address: new Address(pk).toScAddress(),
    nonce,
    signatureExpirationLedger: 0, // replaced
    signature: ScVal.scvVec([]), // replaced
  });

  const entry = new SorobanAuthorizationEntry({
    rootInvocation: invocation,
    credentials: authV2
      ? SorobanCredentials.sorobanCredentialsAddressV2(addressCredentials)
      : SorobanCredentials.sorobanCredentialsAddress(addressCredentials),
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
 * To get the raw bytes to sign, hash the XDR: `hash(preimage.toXdr())`.
 *
 * @param entry - the authorization entry to build the payload for
 * @param validUntilLedgerSeq - the expiration ledger committed into the payload
 *    (must match the `signatureExpirationLedger` on the credentials you submit)
 * @param networkPassphrase - the network passphrase mixed into the payload
 * @throws `Error` if `entry` carries source-account or otherwise non-address
 *    credentials
 */
export function buildAuthorizationEntryPreimage(
  entry: SorobanAuthorizationEntry,
  validUntilLedgerSeq: number,
  networkPassphrase: string,
): HashIdPreimage {
  const credentials = entry.credentials;
  const addrAuth = getAddressCredentials(credentials);
  if (addrAuth === null) {
    throw new Error(
      `cannot build a signature payload for credential type ${credentials.type}`,
    );
  }

  const networkId = hash(Buffer.from(networkPassphrase));

  switch (credentials.type) {
    // legacy address credentials are not address-bound
    case "sorobanCredentialsAddress":
      return HashIdPreimage.envelopeTypeSorobanAuthorization(
        new HashIdPreimageSorobanAuthorization({
          networkId,
          nonce: addrAuth.nonce,
          invocation: entry.rootInvocation,
          signatureExpirationLedger: validUntilLedgerSeq,
        }),
      );

    // ADDRESS_V2 and ADDRESS_WITH_DELEGATES bind the address into the signed
    // payload via the WithAddress preimage (CAP-71)
    case "sorobanCredentialsAddressV2":
    case "sorobanCredentialsAddressWithDelegates":
      return HashIdPreimage.envelopeTypeSorobanAuthorizationWithAddress(
        new HashIdPreimageSorobanAuthorizationWithAddress({
          networkId,
          nonce: addrAuth.nonce,
          invocation: entry.rootInvocation,
          address: addrAuth.address,
          signatureExpirationLedger: validUntilLedgerSeq,
        }),
      );

    default:
      throw new Error(`unsupported credential type ${credentials.type}`);
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
  signature?: ScVal;
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
  entry: SorobanAuthorizationEntry;
  /** the expiration ledger sequence stored on the top-level credentials. */
  validUntilLedgerSeq: number;
  /** the delegate signers to attach. */
  delegates: DelegateSignature[];
  /**
   * the top-level account's signature. Defaults to `scvVoid`, which is valid
   * for accounts that authorize purely via delegated signers (CAP-71-01).
   */
  signature?: ScVal;
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
): SorobanAuthorizationEntry {
  const { entry, validUntilLedgerSeq, delegates, signature } = params;
  const credentials = entry.credentials;
  const addrAuth = getAddressCredentials(credentials);
  if (
    addrAuth === null ||
    credentials.type === "sorobanCredentialsAddressWithDelegates"
  ) {
    throw new Error(
      `buildWithDelegatesEntry expects ADDRESS or ADDRESS_V2 credentials, got ${credentials.type}`,
    );
  }

  return new SorobanAuthorizationEntry({
    rootInvocation: entry.rootInvocation,
    credentials: SorobanCredentials.sorobanCredentialsAddressWithDelegates(
      new SorobanAddressCredentialsWithDelegates({
        addressCredentials: new SorobanAddressCredentials({
          address: addrAuth.address,
          nonce: addrAuth.nonce,
          signatureExpirationLedger: validUntilLedgerSeq,
          signature: signature ?? ScVal.scvVoid(),
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
): SorobanDelegateSignature[] {
  const nodes = delegates.map(
    (delegate) =>
      new SorobanDelegateSignature({
        address: new Address(delegate.address).toScAddress(),
        signature: delegate.signature ?? ScVal.scvVoid(),
        nestedDelegates: buildDelegateNodes(delegate.nestedDelegates ?? []),
      }),
  );

  nodes.sort((a, b) => Buffer.compare(a.address.toXdr(), b.address.toXdr()));

  for (let i = 1; i < nodes.length; i++) {
    if (
      Buffer.compare(nodes[i - 1].address.toXdr(), nodes[i].address.toXdr()) ===
      0
    ) {
      throw new Error(
        `duplicate delegate address ${Address.fromScAddress(
          nodes[i].address,
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
  credentials: SorobanCredentials,
): SorobanAddressCredentials | null {
  switch (credentials.type) {
    case "sorobanCredentialsAddress":
      return credentials.address;
    case "sorobanCredentialsAddressV2":
      return credentials.addressV2;
    case "sorobanCredentialsAddressWithDelegates":
      return credentials.addressWithDelegates.addressCredentials;
    default:
      return null;
  }
}

/**
 * Internal helper. Rebuilds an address-based credential with the signature
 * expiration ledger set on its top-level address credentials and this signer's
 * signature written onto whichever node(s) match `forAddress`.
 *
 * Because the class-XDR types are immutable, this constructs a fresh credential
 * tree rather than mutating in place. Per CAP-71-01 every signature-bearing
 * node commits to the same payload (bound to the top-level address), so the
 * caller can fill any of them with a signature produced from that shared
 * payload. When `forAddress` is omitted, only the top-level address credentials
 * receive the signature.
 *
 * @returns the rebuilt credentials and the number of nodes that received the
 *    signature (`0` means `forAddress` matched no node).
 */
function applyExpirationAndSignature(
  credentials: SorobanCredentials,
  validUntilLedgerSeq: number,
  signature: ScVal,
  forAddress: string | undefined,
): { credentials: SorobanCredentials; matched: number } {
  const topAddr = getAddressCredentials(credentials);
  if (topAddr === null) {
    return { credentials, matched: 0 };
  }

  let matched = 0;
  const topIsTarget =
    forAddress === undefined ||
    Address.fromScAddress(topAddr.address).toString() === forAddress;
  if (topIsTarget) {
    matched++;
  }

  const newTopAddr = new SorobanAddressCredentials({
    address: topAddr.address,
    nonce: topAddr.nonce,
    signatureExpirationLedger: validUntilLedgerSeq,
    signature: topIsTarget ? signature : topAddr.signature,
  });

  switch (credentials.type) {
    case "sorobanCredentialsAddress":
      return {
        credentials: SorobanCredentials.sorobanCredentialsAddress(newTopAddr),
        matched,
      };
    case "sorobanCredentialsAddressV2":
      return {
        credentials: SorobanCredentials.sorobanCredentialsAddressV2(newTopAddr),
        matched,
      };
    case "sorobanCredentialsAddressWithDelegates": {
      const withDelegates = credentials.addressWithDelegates;
      const newDelegates =
        forAddress === undefined
          ? withDelegates.delegates
          : rebuildDelegatesWithSignature(
              withDelegates.delegates,
              forAddress,
              signature,
              () => {
                matched++;
              },
            );
      return {
        credentials: SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new SorobanAddressCredentialsWithDelegates({
            addressCredentials: newTopAddr,
            delegates: newDelegates,
          }),
        ),
        matched,
      };
    }
    default:
      return { credentials, matched };
  }
}

/**
 * Internal helper. Recursively rebuilds a delegate tree, writing `signature`
 * onto every (possibly nested) node whose address matches `forAddress` and
 * invoking `onMatch` for each one, leaving all other nodes untouched.
 */
function rebuildDelegatesWithSignature(
  delegates: SorobanDelegateSignature[],
  forAddress: string,
  signature: ScVal,
  onMatch: () => void,
): SorobanDelegateSignature[] {
  return delegates.map((delegate) => {
    const isMatch =
      Address.fromScAddress(delegate.address).toString() === forAddress;
    if (isMatch) {
      onMatch();
    }
    return new SorobanDelegateSignature({
      address: delegate.address,
      signature: isMatch ? signature : delegate.signature,
      nestedDelegates: rebuildDelegatesWithSignature(
        delegate.nestedDelegates,
        forAddress,
        signature,
        onMatch,
      ),
    });
  });
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
