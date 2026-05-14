---
title: Building & Signing Transactions
description: Construct, sign, and inspect Stellar transactions with TransactionBuilder.
---

# Building & Signing Transactions

This guide will cover assembling Stellar transactions with
`TransactionBuilder`, attaching one or more operations, signing with a
keypair, and inspecting the resulting envelope before submission to
Horizon (or to Soroban RPC, for contract invocations).

A canonical example — building, signing, and submitting a single
testnet payment transaction:

```ts
import {
  Asset,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const sourceKeypair = Keypair.fromSecret("S...");
const server = new Horizon.Server("https://horizon-testnet.stellar.org");

const account = await server.loadAccount(sourceKeypair.publicKey());
const fee = await server.fetchBaseFee();

const tx = new TransactionBuilder(account, {
  fee: fee.toString(),
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: "G...",
      asset: Asset.native(),
      amount: "10",
    }),
  )
  .setTimeout(30)
  .build();

tx.sign(sourceKeypair);

const result = await server.submitTransaction(tx);
console.log(result.hash);
```

Topics this guide will cover in full:

- Choosing fee strategy (base fee vs custom).
- Multi-operation transactions and ordering.
- Memo types and when each is appropriate.
- Time bounds and the `setTimeout` semantics.
- Multi-signature flows.
- Fee-bump transactions.
- Soroban-specific extensions (resource fees, footprints, auth
  entries) — covered in the [Soroban: invoking contracts](./08-soroban-invoking-contracts.md)
  guide.

> Real content lands as part of the P21 substantive-content workstream
> before the v27 public release. This page is currently a placeholder
> for pipeline verification.
