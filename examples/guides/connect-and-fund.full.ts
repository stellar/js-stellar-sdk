/**
 * The final "Put it together" block of docs/guides/01-connect-and-fund.md,
 * injected at docs build time (see config/snippets.ts) and executed by
 * test/guides/snippets.test.ts.
 */
// #region main
import { Keypair, Horizon } from "@stellar/stellar-sdk";

async function main() {
  const keypair = Keypair.random();
  const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

  console.log("Public key:", keypair.publicKey());

  // On testnet, friendbot creates and funds the account for free.
  try {
    await horizon.friendbot(keypair.publicKey()).call();
  } catch (e) {
    // Thrown if the account already exists or friendbot is rate-limited.
    console.error("Funding failed:", e);
    throw e;
  }

  // Throws NotFoundError if the account is not on the ledger yet.
  const account = await horizon.loadAccount(keypair.publicKey());
  const xlm = account.balances.find((b) => b.asset_type === "native");

  console.log("XLM balance:", xlm?.balance);
}

await main();
// #endregion main
