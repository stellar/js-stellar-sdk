/**
 * The code blocks for docs/guides/03-issue-an-asset.md. The guide contains
 * only `<!-- snippet: issue-an-asset.ts#name -->` markers; the docs build
 * replaces each marker with the matching `#region` below (see
 * config/snippets.ts), and test/guides/snippets.test.ts executes this file
 * top to bottom.
 *
 * This is ONE program. The guide's "Put it together" block is the `full`
 * region spanning it, and the step blocks are overlapping views of the same
 * lines, so nothing is written twice.
 */
// #region full
import { Keypair } from "@stellar/stellar-sdk";

// Fund a throwaway issuer and distributor so this runs end to end; in your
// app, these are your existing funded accounts (see Connect and Fund an
// Account).
const issuer = Keypair.random();
const distributor = Keypair.random();

// #region create-asset
import { Asset } from "@stellar/stellar-sdk";

// The asset is its code plus the issuer's public key.
const astro = new Asset("ASTRO", issuer.publicKey());
// #endregion create-asset

// #region trust
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
// #endregion trust

await Promise.all([
  horizon.friendbot(issuer.publicKey()).call(),
  horizon.friendbot(distributor.publicKey()).call(),
]);

// #region trust
const account = await horizon.loadAccount(distributor.publicKey());
const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(Operation.changeTrust({ asset: astro }))
  .setTimeout(30)
  .build();

tx.sign(distributor);
await horizon.submitTransaction(tx);
// #endregion trust

// #region issue
const issuerAccount = await horizon.loadAccount(issuer.publicKey());
const issueTx = new TransactionBuilder(issuerAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: distributor.publicKey(),
      asset: astro,
      amount: "1000",
    }),
  )
  .setTimeout(30)
  .build();

issueTx.sign(issuer);
await horizon.submitTransaction(issueTx);
// #endregion issue
// #endregion full

// #region full
const distributorAccount = await horizon.loadAccount(distributor.publicKey());
const trustline = distributorAccount.balances.find(
  (b) => "asset_code" in b && b.asset_code === "ASTRO",
);
console.log("ASTRO balance:", trustline?.balance);
// #endregion full

// Horizon reports balances at full precision ("1000.0000000"), so compare
// numerically rather than pinning the string form.
if (Number(trustline?.balance) !== 1000) {
  throw new Error(
    `guide distributor trustline balance was not 1000 (got ${trustline?.balance})`,
  );
}
