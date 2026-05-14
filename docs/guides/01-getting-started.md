---
title: Getting Started
description: Install the Stellar SDK and write your first script against testnet.
---

# Getting Started

This guide will walk through installing `@stellar/stellar-sdk`, picking
a network and build variant, generating or loading a keypair, and
running a first script that loads an account from Horizon and inspects
its balance.

Topics this guide will cover:

- **Installation.** `npm install @stellar/stellar-sdk` (or the
  equivalent `pnpm`/`yarn`/`bun` command). The default build is
  fetch-based; opt-in `/axios` builds and subpath imports
  (`/contract`, `/rpc`) are documented in the
  [Build variants & HTTP client](./13-build-variants-and-http-client.md)
  guide.
- **Picking a network.** Mainnet, testnet, and futurenet have
  different passphrases and Horizon endpoints; choosing the wrong one
  is the most common source of "transaction failed" reports during
  early development.
- **Generating or loading a keypair.** `Keypair.random()` for testnet
  experiments; `Keypair.fromSecret(...)` for keys you already hold.
  Funded testnet accounts can be created via Friendbot.
- **Connecting to Horizon and loading an account.**
  `new Horizon.Server(...)` plus `.loadAccount(publicKey)` returns a
  full account record including balances and signers.
- **Submitting a first transaction.** The full payment-transaction
  walkthrough is in the
  [Building & Signing Transactions](./04-building-and-signing-transactions.md)
  guide.

> Real content lands as part of the P21 substantive-content workstream
> before the v27 public release. This page is currently a placeholder
> for pipeline verification.
