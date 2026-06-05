---
title: Handle Errors
description:
  Read transaction result codes, inspect Horizon's error responses, and catch
  common failures like a missing account.
---

# Handle Errors

Network calls fail: a transaction is rejected, an account does not exist, a
request is malformed. This guide shows how to read those errors so you can react
to them. It builds on [Send a Payment](/guides/02-send-a-payment/).

## Prerequisites

- A funded account to submit from. If you need one, see
  [Connect and Fund an Account](/guides/01-connect-and-fund/).
- The examples run on testnet, so they are free and safe to repeat.

## Errors are rejected promises

Every SDK call that hits the network returns a promise that rejects on failure,
so wrap calls in `try/catch` (or use `.catch`):

```ts
try {
  const result = await horizon.submitTransaction(tx);
} catch (error) {
  // inspect the error (below)
}
```

## Read a transaction's result codes

When a submission fails, Horizon explains why with **result codes**: one for the
transaction and one per operation. A failed submission rejects with the
underlying HTTP error, and the codes are under `response.data.extras`:

```ts
try {
  await horizon.submitTransaction(tx);
} catch (error: any) {
  const codes = error.response?.data?.extras?.result_codes;
  console.error("transaction:", codes?.transaction); // e.g. "tx_failed"
  console.error("operations:", codes?.operations); // e.g. ["op_underfunded"]
}
```

Common codes you will see (full list in
[Result Codes](https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors/result-codes)):

- **Transaction-level:** `tx_failed` (an operation failed), `tx_bad_seq` (wrong
  sequence number, often a stale loaded account), `tx_insufficient_fee`,
  `tx_too_late` (the time bound passed).
- **Operation-level:** `op_underfunded` (not enough balance), `op_no_destination`
  (the destination account does not exist), `op_no_trust` (the destination has no
  trustline for the asset), `op_low_reserve` (would drop below the minimum
  balance).

## Inspect the full error

For debugging, log the whole error body. Horizon returns a
[problem-details](https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors)
object at `response.data` with `type`, `title`, `status`, `detail`, and `extras`:

```ts
try {
  await horizon.submitTransaction(tx);
} catch (error: any) {
  console.error(error.response?.data ?? error);
}
```

## Catch a missing account

Reads throw typed SDK errors. Loading an account that does not exist rejects with
[`NotFoundError`](/reference/errors/#notfounderror), so you can branch on it:

```ts
import { NotFoundError } from "@stellar/stellar-sdk";

try {
  const account = await horizon.loadAccount(accountId);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error("That account does not exist yet (fund it first).");
  } else {
    throw error;
  }
}
```

`NotFoundError` is one of the SDK's network errors; `BadRequestError` (malformed
request) and `BadResponseError` are others, all extending `NetworkError`.

## Put it together

A runnable script that triggers both failures and handles them:

```ts
import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
  NotFoundError,
} from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

async function main() {
  const sender = Keypair.random();
  await horizon.friendbot(sender.publicKey()).call();
  const account = await horizon.loadAccount(sender.publicKey());

  // Pay an account that does not exist -> the transaction fails.
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: Keypair.random().publicKey(),
        asset: Asset.native(),
        amount: "1",
      }),
    )
    .setTimeout(30)
    .build();
  tx.sign(sender);

  try {
    await horizon.submitTransaction(tx);
  } catch (error: any) {
    const codes = error.response?.data?.extras?.result_codes;
    console.error("failed:", codes?.transaction, codes?.operations);
  }

  // Loading a non-existent account throws NotFoundError.
  try {
    await horizon.loadAccount(Keypair.random().publicKey());
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.error("account not found");
    }
  }
}

main().catch(console.error);
```

With result codes and typed errors, you can tell the difference between a bad
request, a missing resource, and a transaction the network rejected, and respond
to each.
