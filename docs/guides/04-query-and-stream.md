---
title: Query and Stream
description:
  Read account history with call builders, page through results, and stream live
  updates from Horizon.
---

# Query and Stream

This guide reads data from
[Horizon](https://developers.stellar.org/docs/data/apis/horizon): query an
account's payment history, page through large result sets, and stream new records
as they happen. It is all read-only, so no keypairs or signing are involved.

## Prerequisites

- An account ID (a `G...` public key) with some history to look at. Any existing
  account works; to make one, see
  [Connect and Fund an Account](/guides/01-connect-and-fund/).
- The examples use testnet.

## Run a query

Horizon data is reached through **call builders**. You start one from the server
(for example [`server.payments()`](/reference/network-horizon/#serverpayments)),
narrow it with filters, then call `.call()` to run the request. The result is a
page of records:

```ts
import { Horizon } from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

const page = await horizon.payments().forAccount(accountId).call();

for (const payment of page.records) {
  console.log(payment.type, payment.id);
}
```

The same pattern works for other endpoints on
[`Horizon.Server`](/reference/network-horizon/#horizonserver):
`horizon.operations()`, `horizon.effects()`, `horizon.transactions()`,
`horizon.trades()`, and more. Most expose `.forAccount(id)` and similar filters.

## Page through results

Horizon returns results in pages. Control them with `.limit()` (page size, up to
200), `.order()` (`"asc"` or `"desc"`), and `.cursor()` (start after a given
paging token). Each page carries `.next()` and `.prev()` to fetch the adjacent
page using the embedded cursor:

```ts
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
```

Each record's `paging_token` is the cursor you would pass to `.cursor()` to
resume later.

## Stream live updates

Instead of polling, open a
[stream](https://developers.stellar.org/docs/data/apis/horizon/api-reference/structure/streaming).
`.stream()` keeps a long-lived **Server-Sent Events (SSE)** connection open (the
server pushes records over it) and calls `onmessage` for each record. Existing
records are replayed first; pass `cursor("now")` to receive only new ones.
`.stream()` returns a function that closes the connection:

```ts
const close = horizon
  .payments()
  .forAccount(accountId)
  .cursor("now")
  .stream({
    onmessage: (payment) => console.log("new payment:", payment.type),
    onerror: (e) => console.error("stream error:", e),
  });

// Later, stop listening:
close();
```

## Put it together

A runnable script: fund a throwaway account (which gives it one payment record),
list its payments, then stream new ones for a while. Because the stream uses
`cursor("now")`, it prints only when a *new* payment arrives, so you may see no
stream output. To watch `onmessage` fire, send a payment to the account from
another terminal (see [Send a Payment](/guides/02-send-a-payment/)). Either way
the script exits after 30 seconds.

```ts
import { Keypair, Horizon } from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

async function main() {
  const account = Keypair.random();
  await horizon.friendbot(account.publicKey()).call();
  const accountId = account.publicKey();

  // Read recent payments.
  const page = await horizon
    .payments()
    .forAccount(accountId)
    .order("desc")
    .limit(10)
    .call();
  for (const payment of page.records) {
    console.log(payment.type, payment.id);
  }

  // Watch for new payments; stop after 30 seconds.
  const close = horizon.payments().forAccount(accountId).cursor("now").stream({
    onmessage: (payment) => console.log("new payment:", payment.type),
    onerror: (e) => console.error("stream error:", e),
  });
  setTimeout(close, 30000);
}

main().catch(console.error);
```

You can now read history and react to it live. The same call builders back most
of what an app needs to display from the network. Reads can still fail (a missing
account, a malformed request); [Handle Errors](/guides/05-handle-errors/) covers
catching those.
