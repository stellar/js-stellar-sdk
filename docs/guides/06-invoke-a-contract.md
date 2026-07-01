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
  tutorial once (about 20 to 30 minutes), then paste the contract ID it prints
  into `contractId` below. You will not touch the CLI again in this guide.
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

```ts
import { contract, Keypair, Networks } from "@stellar/stellar-sdk";

const rpcUrl = "https://soroban-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;

// Describe just the methods you call. `Client.from<T>()` uses this to type the
// returned client, so the calls below are checked and autocompleted — no code
// generation needed.
interface IncrementContract {
  increment: (
    options?: contract.MethodOptions,
  ) => Promise<contract.AssembledTransaction<number>>;
}

const { signTransaction } = contract.basicNodeSigner(keypair, networkPassphrase);

const client = await contract.Client.from<IncrementContract>({
  contractId,
  rpcUrl,
  networkPassphrase,
  publicKey: keypair.publicKey(),
  signTransaction,
});
```

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
are inspecting a contract you did not write.
[`queryContract`](/reference/network-rpc/#serverquerycontractcontractid-method-args-networkpassphrase)
runs a **read-only**
call and returns the decoded result. It simulates the call the same way the preview
below does, so it needs no signing or fee, but it hands you the value directly. Here
both run against a token contract — discover its methods, then read one:

```ts
import { rpc } from "@stellar/stellar-sdk";

const server = new rpc.Server(rpcUrl);

// Discover what the contract exposes, from just its ID.
const methods = await server.getContractMethods(tokenId);
// [
//   { name: "decimals", inputs: [], outputs: ["U32"] },
//   { name: "balance", inputs: [{ name: "id", type: "Address" }], outputs: ["I128"] },
//   { name: "transfer", inputs: [...], outputs: [] },
// ]

// Read one of its read-only methods in a single line.
const decimals = await server.queryContract<number>(tokenId, "decimals");

const balance = await server.queryContract<bigint>(tokenId, "balance", {
  id: "G...", // named arguments, keyed by the method's parameter names
});
```

`queryContract` is for reads only. To **change** state you build a client and sign a
transaction, as shown next.

## Preview a call with simulation

Calling a contract method does not send anything yet: it builds a transaction and
**simulates** it. The RPC server runs the call against the current ledger state
and returns the result without committing anything, so a preview is free and needs
no signature. Read the predicted return value from
[`tx.result`](/reference/contracts-client/#contractassembledtransaction):

```ts
const tx = await client.increment();

tx.result; // the value the call would return; nothing has been sent
```

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

```ts
const sent = await tx.signAndSend();

sent.result; // the applied result; send again and the counter advances
```

If a method depends on contract state that has expired, pass `restore: true` in
the method options and simulation will restore it before the call; see
[State Archival](https://developers.stellar.org/docs/learn/encyclopedia/storage/state-archival).

## Put it together

The whole flow as one runnable script. Set `contractId` to your deployed
increment contract (see Prerequisites); the script funds a throwaway source
account with friendbot so it runs end to end. In your app, replace the
`Keypair.random()` call with your existing funded keypair.

```ts
import { contract, rpc, Keypair, Networks } from "@stellar/stellar-sdk";

const rpcUrl = "https://soroban-testnet.stellar.org";
const networkPassphrase = Networks.TESTNET;
const contractId = "C..."; // your deployed increment contract (see Prerequisites)

interface IncrementContract {
  increment: (
    options?: contract.MethodOptions,
  ) => Promise<contract.AssembledTransaction<number>>;
}

async function main() {
  const server = new rpc.Server(rpcUrl);
  const keypair = Keypair.random();
  const { signTransaction } = contract.basicNodeSigner(
    keypair,
    networkPassphrase,
  );

  try {
    // Fund a throwaway account to invoke from (the RPC-side friendbot).
    await server.fundAddress(keypair.publicKey());

    const client = await contract.Client.from<IncrementContract>({
      contractId,
      rpcUrl,
      networkPassphrase,
      publicKey: keypair.publicKey(),
      signTransaction,
    });

    // Preview the call for free with simulation.
    const tx = await client.increment();
    console.log("preview:", tx.result);

    // Sign and send to apply it on-chain.
    const sent = await tx.signAndSend();
    console.log("applied:", sent.result);
  } catch (e) {
    console.error("Invocation failed:", e);
  }
}

main().catch(console.error);
```

You can now read from and write to a deployed contract from JavaScript. Next,
learn to [authorize calls that more than one account must sign](/guides/07-contract-auth/).
