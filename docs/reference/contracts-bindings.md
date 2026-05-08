---
title: Contracts / Bindings
category: Contracts / Bindings
---

# Contracts / Bindings

## BindingGenerator

Generates TypeScript bindings for Stellar smart contracts.

This class creates fully-typed TypeScript client code from a contract's specification,
allowing developers to interact with Stellar smart contracts with full IDE support
and compile-time type checking.

```ts
class BindingGenerator
```

**Example**

```ts
// Create from a local WASM file
const wasmBuffer = fs.readFileSync("./my_contract.wasm");
const generator = await BindingGenerator.fromWasm(wasmBuffer);
const bindings = generator.generate({ contractName: "my-contract" });
```

**Example**

```ts
// Create from a contract deployed on the network
const generator = await BindingGenerator.fromContractId(
  "CABC...XYZ",
  "https://soroban-testnet.stellar.org",
  Networks.TESTNET
);
const bindings = generator.generate({ contractName: "my-contract" });
```

**Example**

```ts
// Create from a Spec object directly
const spec = new Spec(specEntries);
const generator = BindingGenerator.fromSpec(spec);
const bindings = generator.generate({ contractName: "my-contract" });
```

**Source:** [src/bindings/generator.ts:78](https://github.com/stellar/js-stellar-sdk/blob/7212ade7e35b40f9833fd6d277c665e15c657d62/src/bindings/generator.ts#L78)
