/**
 * The code blocks for docs/guides/07-contract-auth.md. The guide contains
 * only `<!-- snippet: contract-auth.ts#name -->` markers; the docs build
 * replaces each marker with the matching `#region` below (see
 * config/snippets.ts), and test/guides/snippets.test.ts executes this file
 * top to bottom.
 *
 * This is ONE program. The guide's "Put it together" block is the `full`
 * region spanning it, and the needs-signing and sign-entry blocks are
 * overlapping views of the same lines. The "after" blocks run after it, on
 * the auth entry of a second call. The guide's "before" block stays
 * `untested` in the guide on purpose. Hidden setup deploys the Auth contract.
 */
// #region full
import { contract, rpc, Keypair, Networks } from "@stellar/stellar-sdk";
// #endregion full
import {
  authorizeEntry,
  buildAuthorizationEntryPreimage,
  hash,
} from "@stellar/stellar-sdk";
import { deployWasm } from "./setup/deploy.js";

// #region full
const rpcUrl = "https://soroban-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;
let contractId = "C..."; // your deployed Auth contract (see Prerequisites)

interface AuthContract {
  increment: (
    args: { user: string; value: number },
    options?: contract.MethodOptions,
  ) => Promise<contract.AssembledTransaction<number>>;
}

const server = new rpc.Server(rpcUrl);

// The transaction source (signs the envelope) and a separate account whose
// authorization the call requires.
const source = Keypair.random();
const signer = Keypair.random();

await server.fundAddress(source.publicKey());
await server.fundAddress(signer.publicKey());

const { signTransaction } = contract.basicNodeSigner(source, networkPassphrase);
// #endregion full

contractId = await deployWasm(
  { rpcUrl, networkPassphrase, keypair: source },
  "auth.wasm",
);

// #region full
const client = await contract.Client.from<AuthContract>({
  contractId,
  rpcUrl,
  networkPassphrase,
  publicKey: source.publicKey(),
  signTransaction,
});

// A call that requires `signer` (not the source) to authorize it.
// #region needs-signing
const tx = await client.increment({ user: signer.publicKey(), value: 1 });
// #endregion needs-signing
console.log("needs signing by:", tx.needsNonInvokerSigningBy());
// #endregion full
// #region needs-signing
tx.needsNonInvokerSigningBy(); // [signer.publicKey()]
// #endregion needs-signing

const needs = tx.needsNonInvokerSigningBy();
if (needs.length !== 1 || needs[0] !== signer.publicKey()) {
  throw new Error(`needsNonInvokerSigningBy returned ${needs.join()}`);
}

// #region full
// Sign that entry as `signer`. basicNodeSigner signs the payload the SDK
// builds, so this is correct on whichever credential the network returns.
// #region sign-entry
const { signAuthEntry } = contract.basicNodeSigner(signer, networkPassphrase);

await tx.signAuthEntries({ address: signer.publicKey(), signAuthEntry });

const sent = await tx.signAndSend();
// #endregion sign-entry
console.log("applied:", sent.result);
// #endregion full

if (sent.result !== 1) {
  throw new Error(`increment applied ${sent.result}, expected 1`);
}

// The "after" blocks sign `signer`'s entry of a second call, as `keypair`.
const keypair = signer;
const validUntil = (await server.getLatestLedger()).sequence + 100;
const tx2 = await client.increment({ user: signer.publicKey(), value: 1 });
const op = tx2.built?.operations[0];
if (op?.type !== "invokeHostFunction") {
  throw new Error(`second call built a ${op?.type} operation`);
}
const [entry, ...extra] = op.auth ?? [];
if (entry === undefined || extra.length > 0) {
  throw new Error(
    `second call carries ${op.auth?.length ?? 0} auth entries, expected 1`,
  );
}

// #region after-preimage
// ✅ After: picks the right payload from the entry's own credential type.
const preimage = buildAuthorizationEntryPreimage(
  entry,
  validUntil,
  networkPassphrase,
);
const signature = keypair.sign(hash(preimage.toXdr()));
// #endregion after-preimage

// #region after-authorize
// ✅ Even simpler: authorizeEntry does the whole thing.
const signed = await authorizeEntry(
  entry,
  keypair,
  validUntil,
  networkPassphrase,
);
// #endregion after-authorize

// Submit the second call with `signed` as its auth entry, so the network proves the entry is valid.
await tx2.signAuthEntries({
  address: signer.publicKey(),
  authorizeEntry: () => Promise.resolve(signed),
});
const sent2 = await tx2.signAndSend();
if (sent2.result !== 2) {
  throw new Error(
    `increment with authorizeEntry applied ${sent2.result}, expected 2`,
  );
}

// Ed25519 signing is deterministic, so the hand-built signature must equal the one the network just accepted.
const creds = signed.credentials;
const accepted =
  creds.type === "sorobanCredentialsAddressV2"
    ? creds.addressV2
    : creds.type === "sorobanCredentialsAddress"
      ? creds.address
      : undefined;
if (
  accepted === undefined ||
  !Buffer.from(accepted.signature.toXdr()).includes(Buffer.from(signature))
) {
  throw new Error(
    `the hand-built signature does not match the accepted ${creds.type} entry`,
  );
}
