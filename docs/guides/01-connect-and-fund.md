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

```ts
import { Keypair } from "@stellar/stellar-sdk";

const keypair = Keypair.random();

keypair.publicKey(); // "G..." (share this)
keypair.secret(); // "S..." (keep this private)
```

A keypair holds no funds and does not exist on the network until an account is
funded for that public key (see [Fund a new account](#fund-a-new-account)).

Store the secret, not the keypair object. Rebuild the keypair when you need it:

```ts
const keypair = Keypair.fromSecret(secret);
```

## Choose a network

Every transaction is signed for exactly one
[network](https://developers.stellar.org/docs/networks), identified by its
passphrase. Use the passphrase that matches where you are submitting so a
signature from one network cannot be replayed on another.

```ts
import { Networks } from "@stellar/stellar-sdk";

Networks.TESTNET; // "Test SDF Network ; September 2015"
Networks.PUBLIC; // "Public Global Stellar Network ; September 2015"
```

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

```ts
import { Horizon, rpc } from "@stellar/stellar-sdk";

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");
const rpcServer = new rpc.Server("https://soroban-testnet.stellar.org");
```

This guide only needs Horizon. The RPC connection is shown so you know where
contract work begins. For the full client API, see
[`Horizon.Server`](/reference/network-horizon/#horizonserver) and
[`rpc.Server`](/reference/network-rpc/#rpcserver) in the reference.

## Fund a new account

On testnet, friendbot creates and funds a new account for free. There is no
friendbot on the public network, where accounts are funded by an existing
account.

```ts
await horizon.friendbot(keypair.publicKey()).call();
```

This call throws if the account already exists or friendbot is rate-limited.
Funding a brand-new `Keypair.random()` avoids the "already exists" case, so wrap
it in a `try/catch` to handle the rest.

Once funded, the account exists on the ledger. Load it to read its balances.
`loadAccount` throws `NotFoundError` if the account is not on the ledger yet,
which is how the SDK signals that funding has not gone through:

```ts
const account = await horizon.loadAccount(keypair.publicKey());
const xlm = account.balances.find((b) => b.asset_type === "native");

account.accountId(); // the funded public key
xlm?.balance; // its XLM balance, as a string
```

## Put it together

The snippets above build on each other. Here is the whole flow as one runnable
script. The blocks share the same `keypair` and `horizon`, and `console.log`
prints the results so you can see them when you run the file:

```ts
import { Keypair, Horizon } from "@stellar/stellar-sdk";

async function main() {
  const keypair = Keypair.random();
  const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

  console.log("Public key:", keypair.publicKey());

  // On testnet, friendbot creates and funds the account for free.
  try {
    await horizon.friendbot(keypair.publicKey()).call();
  } catch (e) {
    // Thrown if the account already exists or friendbot is rate-limited.
    console.error("Funding failed:", e);
    return;
  }

  // Throws NotFoundError if the account is not on the ledger yet.
  const account = await horizon.loadAccount(keypair.publicKey());
  const xlm = account.balances.find((b) => b.asset_type === "native");

  console.log("XLM balance:", xlm?.balance);
}

main().catch(console.error);
```

You now have a funded account and a connection to the network. From here you can
send your first payment.
