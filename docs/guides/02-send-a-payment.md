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
`source` is your funded keypair from
[Connect and Fund an Account](/guides/01-connect-and-fund/), and `destinationId`
is the recipient's public key (a `G...` string):

<!-- snippet: send-a-payment.ts#build -->

`fee` is the *maximum* per-operation fee you're willing to pay, in stroops
(`BASE_FEE` is 100; one XLM is ten million stroops). It's a cap, not a fixed
charge — the network only deducts what it actually needs at submission time, so
a high `fee` (say, 5 XLM) makes the transaction more likely to be included when
the network is busy without meaning all 5 XLM gets spent. `amount` is a string
in whole units (`"100"` is 100 XLM). The
destination must already exist on the network; to create and fund a brand-new
account, use `Operation.createAccount` instead.

## Sign and submit

A built transaction is unsigned. Sign it with the source account's keypair, then
submit it to Horizon:

<!-- snippet: send-a-payment.ts#sign-and-submit -->

If submission fails, Horizon returns the error in the rejected promise, so wrap
the call in `try/catch` to inspect the failure. See
[Handle Errors](/guides/05-handle-errors/) for reading result codes and
Horizon's error responses.

## Add a memo

Many services (exchanges, custodians) require a memo to route a payment. Add a
[`Memo`](/reference/core-transactions/#memo) to the builder chain before
`.build()`:

<!-- snippet: send-a-payment.ts#add-memo -->

## Send an issued asset

To send an issued asset instead of XLM, pass an [`Asset`](/reference/core-assets/#asset)
built from its code and the issuer account's public key (`issuerId`). Everything
else is the same:

<!-- snippet: send-a-payment.ts#issued-asset -->

The destination must already trust this asset, otherwise the payment fails.
Setting up an issuer and trustlines is covered in [Issue an Asset](/guides/03-issue-an-asset/).

## Put it together

The whole native-payment flow as one runnable script. It funds a throwaway
`source` and `destination` with friendbot so the example runs end to end; in
your app, `source` is your existing funded account and `destination` is any
account that already exists:

<!-- snippet: send-a-payment.full.ts#main -->

You can now move value on the network. Next, learn to issue your own asset and
set up trustlines.
