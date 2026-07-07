/**
 * The final "Put it together" block of docs/guides/02-send-a-payment.md,
 * injected at docs build time (see config/snippets.ts) and executed against
 * testnet by test/guides/snippets.test.ts.
 */
// #region main
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

async function main() {
  const source = Keypair.random();
  const destination = Keypair.random();
  await Promise.all([
    horizon.friendbot(source.publicKey()).call(),
    horizon.friendbot(destination.publicKey()).call(),
  ]);

  const account = await horizon.loadAccount(source.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destination.publicKey(),
        asset: Asset.native(),
        amount: "100",
      }),
    )
    .addMemo(Memo.text("thanks!"))
    .setTimeout(30)
    .build();

  tx.sign(source);
  const result = await horizon.submitTransaction(tx);

  console.log("Submitted:", result.hash, "successful:", result.successful);
}

await main();
// #endregion main
