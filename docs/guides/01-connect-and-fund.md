---
title: Connect and Fund an Account
description:
  Create a keypair, choose a network, connect to Horizon and RPC, and fund a new
  account on testnet with friendbot.
---

# Connect and Fund an Account

This guide takes you from nothing to a funded testnet account you can build on.
It is for anyone making their first call with `@stellar/stellar-sdk`. Everything
here runs against testnet, so it costs nothing and is safe to repeat.

## Create a keypair

A [keypair](/reference/core-keys/#keypair) is an account's identity. The public
key is the account's address (it starts with `G`) and the secret key signs
transactions (it starts with `S`). Never share or commit a secret key.

<!-- snippet: connect-and-fund.ts#create-keypair -->

A keypair holds no funds and does not exist on the network until an account is
funded for that public key (see [Fund a new account](#fund-a-new-account)).

Store the secret, not the keypair object. Rebuild the keypair when you need it:

<!-- snippet: connect-and-fund.ts#rebuild-keypair -->

## Sign and verify a message

A keypair can also sign an arbitrary message — not a transaction — to prove it
controls an address, entirely off-chain. This follows
[SEP-53](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0053.md),
so signatures interoperate with the other Stellar SDKs and the CLI, and it is the
basis for proof-of-ownership flows like "Sign in with Stellar".

<!-- snippet: connect-and-fund.ts#sign-message -->

Only the secret-key holder can produce a valid signature; verification needs just
the public key. See
[`signMessage`](/reference/core-keys/#keypairsignmessagemessage) and
[`verifyMessage`](/reference/core-keys/#keypairverifymessagemessage-signature) in
the reference.

## Choose a network

Every transaction is signed for exactly one
[network](https://developers.stellar.org/docs/networks), identified by its
passphrase. Use the passphrase that matches where you are submitting so a
signature from one network cannot be replayed on another.

<!-- snippet: connect-and-fund.ts#networks -->

Start on `TESTNET`. Switch to `PUBLIC` only when you are ready to use real funds.

## Connect to Horizon and RPC

The SDK talks to two services, and which one you need depends on the task.

- **[Horizon](https://developers.stellar.org/docs/data/apis/horizon)** serves
  account, balance, payment, and history data and accepts classic transactions
  (payments, trustlines, and other non-contract operations). Use it for
  accounts, balances, and payments.
- **[RPC](https://developers.stellar.org/docs/data/apis/rpc)** is the gateway for
  smart contracts (Soroban): simulate and send contract calls. Use it when you
  invoke contracts.

<!-- snippet: connect-and-fund.ts#connect -->

This guide only needs Horizon. The RPC connection is shown so you know where
contract work begins. For the full client API, see
[`Horizon.Server`](/reference/network-horizon/#horizonserver) and
[`rpc.Server`](/reference/network-rpc/#rpcserver) in the reference.

## Fund a new account

On testnet, friendbot creates and funds a new account for free, seeding it with
10,000 XLM. There is no
friendbot on the public network, where accounts are funded by an existing
account.

<!-- snippet: connect-and-fund.ts#fund -->

This call throws if the account already exists or friendbot is rate-limited.
Funding a brand-new `Keypair.random()` avoids the "already exists" case, so wrap
it in a `try/catch` to handle the rest.

Once funded, the account exists on the ledger. Load it to read its balances.
`loadAccount` throws `NotFoundError` if the account is not on the ledger yet,
which is how the SDK signals that funding has not gone through:

<!-- snippet: connect-and-fund.ts#load-account -->

## Put it together

The snippets above build on each other. Here is the whole flow as one runnable
script — the same code as the steps, assembled. The blocks share the same
`keypair` and `horizon`, and `console.log` prints the results so you can see
them when you run the file:

<!-- snippet: connect-and-fund.ts#full -->

You now have a funded account and a connection to the network. From here you can
send your first payment.
