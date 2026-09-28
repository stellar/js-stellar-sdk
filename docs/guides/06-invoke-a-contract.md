---
title: Invoke a Contract
description:
  Connect over Soroban RPC, load a deployed contract with contract.Client,
  preview a call by simulation, then sign and send a state-changing call on
  testnet.
---

# Invoke a Contract

This guide calls a method on a deployed Soroban contract from JavaScript. You
will connect over RPC, **preview** a call for free with simulation, then **sign
and send** it to change on-chain state. Everything runs on testnet, so it is
free and safe to repeat.

## Prerequisites

- A funded testnet account and its keypair. If you need one, see
  [Connect and Fund an Account](/guides/01-connect-and-fund/).
- A deployed contract and its contract ID (a `C...` string). This guide uses the
  **increment** contract. Deploying is a one-time setup with a different toolchain
  (the Stellar CLI and Rust): follow Stellar's
  [Deploy the Increment Contract](https://developers.stellar.org/docs/build/smart-contracts/getting-started/deploy-increment-contract)
  tutorial once (about 20 to 30 minutes), then use the contract ID it prints as
  `contractId`. You will not touch the CLI again in this guide.
  This guide types the client with a small hand-written interface; generating one
  from a contract's spec is covered later in the series.
- The examples use testnet RPC at `https://soroban-testnet.stellar.org`.

## Connect and load the contract

Contracts are reached over
[Soroban RPC](https://developers.stellar.org/docs/data/apis/rpc), not Horizon, so
this guide connects over RPC instead of using the `Horizon.Server` from earlier
guides. Build a [`contract.Client`](/reference/contracts-client/#contractclient)
from your deployed contract ID. The client reads the contract's interface from
the network, which is what lets you call its methods by name:

<!-- snippet: invoke-a-contract.ts#connect -->

Here `keypair` is your funded account from
[Connect and Fund an Account](/guides/01-connect-and-fund/) and `contractId` is
your deployed contract's `C...` ID. The client is built from the live contract at
runtime, so TypeScript cannot infer its methods on its own. Passing an interface
to [`Client.from<T>()`](/reference/contracts-client/#contractclient) types them:
`client.increment()` below is fully typed and autocompleted, with no code
generation. For a contract with many methods, generate that interface from its
spec (covered later in the series) rather than writing it by hand.

## Query contract state

Sometimes you only want to **inspect** a contract or **read** a value from it, not
change anything. For that, `rpc.Server` has two one-line shortcuts that build the
contract's interface for you — including the built-in spec for Stellar Asset
Contracts (SACs) — so they work from just a contract ID, with no client setup.

[`getContractMethods`](/reference/network-rpc/#servergetcontractmethodscontractid-networkpassphrase)
lists a contract's callable methods and their signatures, which is handy when you
are inspecting a contract you did not write. The spec it reports carries no
read/write flag, so to learn whether a *specific* call would change state, invoke
it with `queryContract` and read its `isReadCall` (see below).
[`queryContract`](/reference/network-rpc/#serverquerycontractcontractid-method-args-networkpassphrase)
runs a **read-only**
call and returns the decoded result. It simulates the call the same way the preview
below does, so it needs no signing or fee, but it hands you the value directly. Here
both run against a token contract (`tokenId`, its `C...` ID) — discover its
methods, then read its decimals and your account's balance:

<!-- snippet: invoke-a-contract.ts#query -->

Alongside the decoded `result`, `queryContract` returns `isReadCall`: whether
*this* call — for the exact arguments given — wrote no state and needed no
signature. It is per-call, not a fixed property of the method. Since
`queryContract` never signs or sends, `isReadCall: false` means the `result` is
only a simulation preview of a call that would change state; to apply such a
change you build a client and sign a transaction, as shown next.

## Preview a call with simulation

Calling a contract method does not send anything yet: it builds a transaction and
**simulates** it. The RPC server runs the call against the current ledger state
and returns the result without committing anything, so a preview is free and needs
no signature. Read the predicted return value from
[`tx.result`](/reference/contracts-client/#contractassembledtransaction):

<!-- snippet: invoke-a-contract.ts#preview -->

Nothing changed on-chain: simulate again and you get the same answer. A read-only
method (one that does not change state) stops here. `tx.isReadCall` is `true`, and
`tx.result` is your final answer with no signing or fee, because a read touches no
state and needs no authorization. `increment` does change state, so `tx.isReadCall`
is `false` and this is only a preview. To apply it, you sign and send.

## Sign and send to apply it

To apply the state change, sign and send the transaction. The signer is
the [`basicNodeSigner`](/reference/contracts-client/#contractbasicnodesigner) you
passed to the client (a simple Node signer for scripts and tests; a browser app
swaps in a wallet such as Freighter). `signAndSend` submits the transaction and
waits for the network, returning a
[`SentTransaction`](/reference/contracts-client/#contractsenttransaction) whose
`result` is the value the contract returned on-chain:

<!-- snippet: invoke-a-contract.ts#send -->

If a method depends on contract state that has expired, pass `restore: true` in
the method options and simulation will restore it before the call; see
[State Archival](https://developers.stellar.org/docs/learn/encyclopedia/storage/state-archival).

## Put it together

The whole flow as one script. Declare `contractId` as your deployed increment
contract's ID (see Prerequisites) before you run it. The script funds a
throwaway source account with friendbot so it runs end to end. In your app,
replace the `Keypair.random()` and `fundAddress` lines with your existing funded
keypair.

<!-- snippet: invoke-a-contract.ts#full -->

You can now read from and write to a deployed contract from JavaScript. Next,
learn to [authorize calls that more than one account must sign](/guides/07-contract-auth/).
