/**
 * The code blocks for docs/guides/02-send-a-payment.md. The guide contains
 * only `<!-- snippet: send-a-payment.ts#name -->` markers; the docs build
 * replaces each marker with the matching `#region` below (see
 * config/snippets.ts), and test/guides/snippets.test.ts executes this file
 * top to bottom.
 *
 * This is ONE program. The guide's "Put it together" block is the `full`
 * region spanning it, and the step blocks are overlapping views of the same
 * lines, so nothing is written twice.
 */
// #region full
// #region build
import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
// #endregion build

// Fund a throwaway source and destination so this runs end to end; in your
// app, `source` is your existing funded account and `destinationId` is any
// account that already exists.
const source = Keypair.random();
const destinationId = Keypair.random().publicKey();
await Promise.all([
  horizon.friendbot(source.publicKey()).call(),
  horizon.friendbot(destinationId).call(),
]);

// #region build
const account = await horizon.loadAccount(source.publicKey());

const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: destinationId,
      asset: Asset.native(),
      amount: "100",
    }),
  )
  // #endregion build
  // #region add-memo
  // Many services require a memo to route an incoming payment:
  .addMemo(Memo.text("invoice-42"))
  // #endregion add-memo
  // #region build
  .setTimeout(30)
  .build();
// #endregion build

// #region sign-and-submit
tx.sign(source);
const result = await horizon.submitTransaction(tx);
// #endregion full

result.hash; // the transaction hash
result.successful; // true when it was applied
// #endregion sign-and-submit

// #region full
console.log("Submitted:", result.hash, "successful:", result.successful);
// #endregion full

if (!result.successful) {
  throw new Error(`guide payment was not applied (${result.hash})`);
}
if (tx.memo.value?.toString() !== "invoice-42") {
  throw new Error("guide memo was not set on the transaction");
}

const issuerId = Keypair.random().publicKey();

// #region issued-asset
const usd = new Asset("USD", issuerId);

Operation.payment({ destination: destinationId, asset: usd, amount: "100" });
// #endregion issued-asset
