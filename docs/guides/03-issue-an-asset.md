---
title: Issue an Asset
description:
  Create your own asset on testnet with the issuer/distributor pattern, set up a
  trustline with changeTrust, and put the asset into circulation.
---

# Issue an Asset

On Stellar a Stellar asset is just a code (like `ASTRO`) plus the public key of
the account that issues it. There is no contract to deploy: you "create" it by
sending it from its issuing account. This is one of two token types on Stellar:
the ledger-native **Stellar asset** covered here, versus **contract tokens** built
on Soroban smart contracts. See
[Stellar Assets and Contract Tokens](https://developers.stellar.org/docs/tokens)
for when to use which. This guide sets up the issuer/distributor pattern,
establishes a trustline, and issues the asset.

## Prerequisites

- Two funded accounts: an **issuer** and a **distributor**. If you need them, see
  [Connect and Fund an Account](/guides/01-connect-and-fund/).
- Everything runs on testnet, so it is free and safe to repeat.

## The issuer/distributor pattern

Use two accounts. The **issuer** defines the asset and creates supply; the
**distributor** holds the supply and hands it out to users. Keeping them separate
is the standard practice: once issued, you can lock the issuer (remove its
signing weight with
[`Operation.setOptions`](/reference/core-transactions/#operationsetoptions)) to
fix the supply permanently, while the distributor keeps operating.

<!-- snippet: issue-an-asset.ts#create-asset -->

The code is 1 to 12 characters and the issuer is the account whose keypair you
control. See [`Asset`](/reference/core-assets/#asset) in the reference.

## Trust the asset

An account can only hold an asset it has chosen to trust. The distributor adds a
**trustline** with [`Operation.changeTrust`](/reference/core-transactions/#operationchangetrust),
signed by the distributor:

<!-- snippet: issue-an-asset.ts#trust -->

Pass `limit` to cap how much the account will hold (`changeTrust({ asset: astro,
limit: "5000" })`); amounts and limits are strings, and omitting `limit` defaults
to the maximum. Setting `limit: "0"` removes the trustline. Each trustline also
reserves about 0.5 XLM of the account's balance, so the distributor needs a
little XLM beyond the reserve (friendbot-funded testnet accounts have plenty).

## Issue it

With the trustline in place, the issuer puts the asset into circulation by
sending it to the distributor. That is an ordinary payment (see
[Send a Payment](/guides/02-send-a-payment/)), signed by the issuer:

<!-- snippet: issue-an-asset.ts#issue -->

The distributor now holds 1000 ASTRO, and 1000 ASTRO exists on the network. If a
submission is rejected (for example the distributor never added the trustline),
[Handle Errors](/guides/05-handle-errors/) shows how to read the result codes.

## Put it together

The whole flow as one runnable script. It funds a throwaway issuer and
distributor so the example runs end to end; in your app, replace the
`Keypair.random()` calls with your real keypairs and drop the friendbot funding:

<!-- snippet: issue-an-asset.ts#full -->

You now have your own asset in circulation. From here you can distribute it to
users, who each add their own trustline first.
