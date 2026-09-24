/**
 * The code blocks for docs/guides/04-query-and-stream.md. The guide contains
 * only `<!-- snippet: query-and-stream.ts#name -->` markers; the docs build
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
// #region query
import { Horizon } from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
// #endregion query

const account = Keypair.random();
await horizon.friendbot(account.publicKey()).call();
const accountId = account.publicKey();

// Read recent payments.
// #region query
const page = await horizon
  .payments()
  .forAccount(accountId)
  .order("desc")
  .call();

for (const payment of page.records) {
  console.log(payment.type, payment.id);
}
// #endregion query
// #endregion full

if (!page.records.some((p) => p.type === "create_account")) {
  throw new Error("guide account has no create_account payment record");
}

{
  // #region paging
  let page = await horizon
    .payments()
    .forAccount(accountId)
    .order("desc")
    .limit(20)
    .call();

  while (page.records.length > 0) {
    for (const payment of page.records) {
      console.log(payment.id);
    }
    // next() returns an empty page once history is exhausted, ending the loop.
    page = await page.next();
  }
  // #endregion paging
}

// #region full
// Watch for new payments; stop after 30 seconds.
// #region stream
const close = horizon
  .payments()
  .forAccount(accountId)
  .cursor("now")
  .stream({
    onmessage: (payment) => console.log("new payment:", payment.type),
    onerror: (e) => console.error("stream error:", e),
  });
// #endregion stream
const timer = setTimeout(close, 30000);
// #endregion full

// #region stream
// Later, stop listening:
close();
// #endregion stream

clearTimeout(timer);
