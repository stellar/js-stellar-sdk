---
title: Issue an Asset
description:
  Create your own asset on testnet with the issuer/distributor pattern, set up a
  trustline with changeTrust, and put the asset into circulation.
---

# Issue an Asset

On Stellar an asset is just a code (like `ASTRO`) plus the public key of the
account that issues it. There is no contract to deploy: you "create" an asset by
sending it from its issuing account. This guide sets up the issuer/distributor
pattern, establishes a trustline, and issues the asset.

## Prerequisites

- Two funded accounts: an **issuer** and a **distributor**. If you need them, see
  [Connect and Fund an Account](/guides/01-connect-and-fund/).
- Everything runs on testnet, so it is free and safe to repeat.

## The issuer/distributor pattern

Use two accounts. The **issuer** defines the asset and creates supply; the
**distributor** holds the supply and hands it out to users. Keeping them separate
is the standard practice: once issued, you can lock the issuer to fix the supply
while the distributor keeps operating.

```ts
import { Asset } from "@stellar/stellar-sdk";

// The asset is its code plus the issuer's public key.
const astro = new Asset("ASTRO", issuer.publicKey());
```

Asset codes are 1-12 characters. The issuer is the account whose keypair you
control.

## Trust the asset

An account can only hold an asset it has chosen to trust. The distributor adds a
**trustline** with [`Operation.changeTrust`](/reference/core-transactions/#operationchangetrust),
signed by the distributor:

```ts
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

const account = await horizon.loadAccount(distributor.publicKey());
const tx = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(Operation.changeTrust({ asset: astro }))
  .setTimeout(30)
  .build();

tx.sign(distributor);
await horizon.submitTransaction(tx);
```

Pass `limit` to cap how much the account will hold (`changeTrust({ asset: astro,
limit: "5000" })`); setting `limit: "0"` removes the trustline.

## Issue it

With the trustline in place, the issuer puts the asset into circulation by
sending it to the distributor. That is an ordinary payment (see
[Send a Payment](/guides/02-send-a-payment/)), signed by the issuer:

```ts
const issuerAccount = await horizon.loadAccount(issuer.publicKey());
const issueTx = new TransactionBuilder(issuerAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: distributor.publicKey(),
      asset: astro,
      amount: "1000",
    }),
  )
  .setTimeout(30)
  .build();

issueTx.sign(issuer);
await horizon.submitTransaction(issueTx);
```

The distributor now holds 1000 ASTRO, and 1000 ASTRO exists on the network.

## Put it together

The whole flow as one runnable script. It funds a throwaway issuer and
distributor so the example runs end to end:

```ts
import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
} from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

async function submit(source, build) {
  const account = await horizon.loadAccount(source.publicKey());
  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  });
  build(builder);
  const tx = builder.setTimeout(30).build();
  tx.sign(source);
  return horizon.submitTransaction(tx);
}

async function main() {
  const issuer = Keypair.random();
  const distributor = Keypair.random();
  await Promise.all([
    horizon.friendbot(issuer.publicKey()).call(),
    horizon.friendbot(distributor.publicKey()).call(),
  ]);

  const astro = new Asset("ASTRO", issuer.publicKey());

  // Distributor trusts the asset, then the issuer sends it.
  await submit(distributor, (b) =>
    b.addOperation(Operation.changeTrust({ asset: astro })),
  );
  await submit(issuer, (b) =>
    b.addOperation(
      Operation.payment({
        destination: distributor.publicKey(),
        asset: astro,
        amount: "1000",
      }),
    ),
  );

  const account = await horizon.loadAccount(distributor.publicKey());
  const line = account.balances.find(
    (b) => "asset_code" in b && b.asset_code === "ASTRO",
  );
  console.log("ASTRO balance:", line?.balance);
}

main().catch(console.error);
```

You now have your own asset in circulation. From here you can distribute it to
users, who each add their own trustline first.
