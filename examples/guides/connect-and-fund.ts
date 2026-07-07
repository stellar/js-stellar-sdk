/**
 * The code blocks for docs/guides/01-connect-and-fund.md. The guide contains
 * only `<!-- snippet: connect-and-fund.ts#name -->` markers; the docs build
 * replaces each marker with the matching `#region` below (see
 * config/snippets.ts), and test/guides/snippets.test.ts auto-discovers and
 * executes this file top to bottom.
 */
// #region create-keypair
import { Keypair } from "@stellar/stellar-sdk";

const keypair = Keypair.random();

keypair.publicKey(); // "G..." (share this)
keypair.secret(); // "S..." (keep this private)
// #endregion create-keypair

// The rebuild block redeclares `keypair` the way a reader's fresh program
// would, so it lives in its own scope (the region renders dedented). The
// guide assumes a stored `secret`.
const secret = keypair.secret();
const originalPublicKey = keypair.publicKey();
{
  // #region rebuild-keypair
  const keypair = Keypair.fromSecret(secret);
  // #endregion rebuild-keypair

  if (keypair.publicKey() !== originalPublicKey) {
    throw new Error("guide rebuilt keypair does not match the original");
  }
}

// #region sign-message
// Sign a string (or raw bytes); returns a 64-byte signature.
const signature = keypair.signMessage("Hello, World!");

// Anyone holding the public key can verify it — no secret key needed.
const verifier = Keypair.fromPublicKey(keypair.publicKey());
verifier.verifyMessage("Hello, World!", signature); // true
// #endregion sign-message

if (!verifier.verifyMessage("Hello, World!", signature)) {
  throw new Error("guide message signature did not verify");
}
if (verifier.verifyMessage("Goodbye, World!", signature)) {
  throw new Error("guide signature verified the wrong message");
}

// No value assertions here: the local-network test harness remaps
// Networks.TESTNET (see config/guides-local-setup.ts).
// #region networks
import { Networks } from "@stellar/stellar-sdk";

Networks.TESTNET; // "Test SDF Network ; September 2015"
Networks.PUBLIC; // "Public Global Stellar Network ; September 2015"
// #endregion networks

// #region connect
import { Horizon, rpc } from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");
// #endregion connect

// The guide only exercises Horizon; touch the RPC client so it is not an
// unused declaration.
rpcServer.serverURL.toString();

// #region fund
await horizon.friendbot(keypair.publicKey()).call();
// #endregion fund

// #region load-account
const account = await horizon.loadAccount(keypair.publicKey());
const xlm = account.balances.find((b) => b.asset_type === "native");

account.accountId(); // the funded public key
xlm?.balance; // its XLM balance, as a string
// #endregion load-account

if (account.accountId() !== keypair.publicKey()) {
  throw new Error("guide loaded the wrong account");
}
if (!xlm || Number(xlm.balance) <= 0) {
  throw new Error("guide account was not funded");
}
