/**
 * The code blocks for docs/guides/02-send-a-payment.md. The guide contains
 * only `<!-- snippet: send-a-payment.ts#name -->` markers; the docs build
 * replaces each marker with the matching `#region` below (see
 * config/snippets.ts), and test/guides/snippets.test.ts auto-discovers and
 * executes this file top to bottom against testnet.
 *
 * The guide assumes a funded `source` keypair and an existing destination
 * account (both from the connect-and-fund guide), so the setup below creates
 * and funds them with friendbot. Everything outside a `#region` is
 * setup/assertion context that never appears in the docs.
 */
import { Keypair } from "@stellar/stellar-sdk";

const source = Keypair.random();
const destinationId = Keypair.random().publicKey();
const issuerId = Keypair.random().publicKey();

await Promise.all(
  [source.publicKey(), destinationId].map(async (addr) => {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(addr)}`,
    );
    if (!res.ok) {
      throw new Error(`friendbot could not fund ${addr}: ${res.status}`);
    }
  }),
);

// #region build
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
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
  .setTimeout(30)
  .build();
// #endregion build

// #region sign-and-submit
tx.sign(source);
const result = await horizon.submitTransaction(tx);

result.hash; // the transaction hash
result.successful; // true when it was applied
// #endregion sign-and-submit

if (!result.successful) {
  throw new Error(`guide payment was not applied (${result.hash})`);
}

// #region add-memo
import { Memo } from "@stellar/stellar-sdk";
// #endregion add-memo

const txWithMemo = new TransactionBuilder(account, {
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
  // #region add-memo
  // ...the same builder as above, with one more line in the chain:
  .addMemo(Memo.text("invoice-42"))
  // #endregion add-memo
  .setTimeout(30)
  .build();

if (!txWithMemo.memo.value) {
  throw new Error("guide memo was not set on the transaction");
}

// #region issued-asset
const usd = new Asset("USD", issuerId);

Operation.payment({ destination: destinationId, asset: usd, amount: "100" });
// #endregion issued-asset
