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

<!-- snippet: handle-errors.ts#reject -->

## Read a transaction's result codes

When a submission fails, Horizon explains why with **result codes**: one for the
transaction and one per operation. A failed submission rejects with a
[`TransactionFailedError`](/reference/errors/#transactionfailederror), and its
[`getResultCodes()`](/reference/errors/#transactionfailederrorgetresultcodes)
returns both:

<!-- snippet: handle-errors.ts#result-codes -->

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

For debugging, log the whole error body. When Horizon answers with an error
status, the SDK rejects with a
[`NetworkError`](/reference/errors/#networkerror), which carries Horizon's
[problem-details](https://developers.stellar.org/docs/data/apis/horizon/api-reference/errors)
object at `response.data` with `type`, `title`, `status`, `detail`, and `extras`:

<!-- snippet: handle-errors.ts#inspect -->

## Catch a missing account

Reads throw typed SDK errors. Loading an account that does not exist rejects with
[`NotFoundError`](/reference/errors/#notfounderror), so you can branch on it:

<!-- snippet: handle-errors.ts#not-found -->

`NotFoundError` is one of the SDK's network errors; `BadRequestError` (malformed
request) and `BadResponseError` are others, all extending `NetworkError`, and
`TransactionFailedError` extends `BadResponseError`.

## Put it together

A runnable script that triggers both failures and handles them:

<!-- snippet: handle-errors.ts#full -->

With result codes and typed errors, you can tell the difference between a bad
request, a missing resource, and a transaction the network rejected, and respond
to each.
