---
title: Contracts / Bindings
description: Generate strongly-typed TypeScript bindings from a Soroban contract's WASM or interface metadata.
---

# Contracts / Bindings

## BindingGenerator

Generates TypeScript bindings for Stellar smart contracts.

This class creates fully-typed TypeScript client code from a contract's specification,
allowing developers to interact with Stellar smart contracts with full IDE support
and compile-time type checking.

```ts
class BindingGenerator {
  static fromContractId(contractId: string, rpcServer: RpcServer): Promise<BindingGenerator>;
  static fromSpec(spec: Spec): BindingGenerator;
  static fromWasm(wasmBuffer: Buffer): BindingGenerator;
  static fromWasmHash(wasmHash: string, rpcServer: RpcServer): Promise<BindingGenerator>;
  generate(options: GenerateOptions): GeneratedBindings;
}
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

**Source:** [src/bindings/generator.ts:78](https://github.com/stellar/js-stellar-sdk/blob/master/src/bindings/generator.ts#L78)

### `BindingGenerator.fromContractId(contractId, rpcServer)`

Creates a BindingGenerator by fetching contract info from a deployed contract ID.

Retrieves the contract's WASM from the network using the contract ID,
then parses the specification. If the contract is a Stellar Asset Contract (SAC),
returns a generator with the standard SAC specification.

```ts
static fromContractId(contractId: string, rpcServer: RpcServer): Promise<BindingGenerator>;
```

**Parameters**

- **`contractId`** — `string` (required) — The contract ID (C... address) of the deployed contract
- **`rpcServer`** — `RpcServer` (required) — The Stellar RPC server instance

**Returns**

A Promise resolving to a new BindingGenerator instance

**Throws**

- If the contract cannot be found or fetched

**Example**

```ts
const generator = await BindingGenerator.fromContractId(
  "CABC123...XYZ",
  rpcServer
);
```

**Source:** [src/bindings/generator.ts:182](https://github.com/stellar/js-stellar-sdk/blob/master/src/bindings/generator.ts#L182)

### `BindingGenerator.fromSpec(spec)`

Creates a BindingGenerator from an existing Spec object.

Use this when you already have a parsed contract specification,
such as from manually constructed spec entries or from another source.

```ts
static fromSpec(spec: Spec): BindingGenerator;
```

**Parameters**

- **`spec`** — `Spec` (required) — The contract specification containing function and type definitions

**Returns**

A new BindingGenerator instance

**Example**

```ts
const spec = new Spec(specEntries);
const generator = BindingGenerator.fromSpec(spec);
```

**Source:** [src/bindings/generator.ts:105](https://github.com/stellar/js-stellar-sdk/blob/master/src/bindings/generator.ts#L105)

### `BindingGenerator.fromWasm(wasmBuffer)`

Creates a BindingGenerator from a WASM binary buffer.

Parses the contract specification directly from the WASM file's custom section.
This is the most common method when working with locally compiled contracts.

```ts
static fromWasm(wasmBuffer: Buffer): BindingGenerator;
```

**Parameters**

- **`wasmBuffer`** — `Buffer` (required) — The raw WASM binary as a Buffer

**Returns**

A Promise resolving to a new BindingGenerator instance

**Throws**

- If the WASM file doesn't contain a valid contract spec

**Example**

```ts
const wasmBuffer = fs.readFileSync("./target/wasm32-unknown-unknown/release/my_contract.wasm");
const generator = await BindingGenerator.fromWasm(wasmBuffer);
```

**Source:** [src/bindings/generator.ts:125](https://github.com/stellar/js-stellar-sdk/blob/master/src/bindings/generator.ts#L125)

### `BindingGenerator.fromWasmHash(wasmHash, rpcServer)`

Creates a BindingGenerator by fetching WASM from the network using its hash.

Retrieves the WASM bytecode from Stellar RPC using the WASM hash,
then parses the contract specification from it. Useful when you know
the hash of an installed WASM but don't have the binary locally.

```ts
static fromWasmHash(wasmHash: string, rpcServer: RpcServer): Promise<BindingGenerator>;
```

**Parameters**

- **`wasmHash`** — `string` (required) — The hex-encoded hash of the installed WASM blob
- **`rpcServer`** — `RpcServer` (required) — The Stellar RPC server instance

**Returns**

A Promise resolving to a new BindingGenerator instance

**Throws**

- If the WASM cannot be fetched or doesn't contain a valid spec

**Example**

```ts
const generator = await BindingGenerator.fromWasmHash(
  "a1b2c3...xyz",
  "https://soroban-testnet.stellar.org",
  Networks.TESTNET
);
```

**Source:** [src/bindings/generator.ts:151](https://github.com/stellar/js-stellar-sdk/blob/master/src/bindings/generator.ts#L151)

### `bindingGenerator.generate(options)`

Generates TypeScript bindings for the contract.

Produces all the files needed for a standalone npm package:
- `client.ts`: A typed Client class with methods for each contract function
- `types.ts`: TypeScript interfaces for all contract types (structs, enums, unions)
- `index.ts`: Barrel export file
- `package.json`, `tsconfig.json`, `README.md`, `.gitignore`: Package configuration

The generated code does not write to disk - use the returned strings
to write files as needed.

```ts
generate(options: GenerateOptions): GeneratedBindings;
```

**Parameters**

- **`options`** — `GenerateOptions` (required) — Configuration options for generation
    - `contractName`: Required. The name for the generated package (kebab-case recommended)

**Returns**

An object containing all generated file contents as strings

**Throws**

- If contractName is missing or empty

**Example**

```ts
const bindings = generator.generate({
  contractName: "my-token",
  contractAddress: "CABC...XYZ",
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: Networks.TESTNET
});

// Write files to disk
fs.writeFileSync("./src/client.ts", bindings.client);
fs.writeFileSync("./src/types.ts", bindings.types);
```

**Source:** [src/bindings/generator.ts:226](https://github.com/stellar/js-stellar-sdk/blob/master/src/bindings/generator.ts#L226)
