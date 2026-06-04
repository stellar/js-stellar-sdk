---
title: Send a Payment
description:
  Build, sign, and submit a payment on testnet (native XLM and issued assets,
  with a memo) using TransactionBuilder.
---

# Send a Payment

This guide sends a payment from one account to another: build a transaction,
sign it, and submit it to the network. It is the core write flow every app
needs.

## Prerequisites

- A funded source account and its keypair. If you do not have one, see
  [Connect and Fund an Account](/guides/01-connect-and-fund/).
- The examples run on testnet, so they are free and safe to repeat.

## Build the transaction

A payment is one operation inside a transaction. Load the source account for its
current sequence number (the per-account counter Stellar uses to order
transactions), then build a transaction with a single
[`Operation.payment`](/reference/core-transactions/#operationpayment). Here
`source` is your funded keypair from the previous guide, and `destinationId` is
the recipient's public key (a `G...` string):

```ts
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
```

`fee` is the per-operation fee in stroops (`BASE_FEE` is 100; one XLM is ten
million stroops). `amount` is a string in whole units (`"100"` is 100 XLM). The
destination must already exist on the network; to create and fund a brand-new
account, use `Operation.createAccount` instead.

## Sign and submit

A built transaction is unsigned. Sign it with the source account's keypair, then
submit it to Horizon:

```ts
tx.sign(source);
const result = await horizon.submitTransaction(tx);

result.hash; // the transaction hash
result.successful; // true when it was applied
```

If submission fails, Horizon returns the error in the rejected promise, so wrap
the call in `try/catch` to inspect the failure.

## Add a memo

Many services (exchanges, custodians) require a memo to route a payment. Add a
[`Memo`](/reference/core-transactions/#memo) to the builder chain before
`.build()`:

```ts
import { Memo } from "@stellar/stellar-sdk";

// ...the same builder as above, with one more line in the chain:
  .addMemo(Memo.text("invoice-42"))
```

## Send an issued asset

To send an issued asset instead of XLM, pass an [`Asset`](/reference/core-assets/#asset)
built from its code and the issuer account's public key (`issuerId`). Everything
else is the same:

```ts
const usd = new Asset("USD", issuerId);

Operation.payment({ destination: destinationId, asset: usd, amount: "100" });
```

The destination must already trust this asset, otherwise the payment fails.
Setting up an issuer and trustlines is covered in the issue-an-asset guide.

## Put it together

The whole native-payment flow as one runnable script. It funds a throwaway
`source` and `destination` with friendbot so the example runs end to end; in
your app, `source` is your existing funded account and `destination` is any
account that already exists:

```ts
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

main().catch(console.error);
```

You can now move value on the network. Next, learn to issue your own asset and
set up trustlines.
