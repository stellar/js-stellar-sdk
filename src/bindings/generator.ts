import { Spec } from "../contract";
import { ConfigGenerator } from "./config";
import { TypeGenerator } from "./types";
import { ClientGenerator } from "./client";
import { specFromWasm } from "../contract/wasm_spec_parser";
import { fetchFromContractId, fetchFromWasmHash } from "./wasm_fetcher";
import { SAC_SPEC } from "./sac-spec";

/**
 * Options for generating TypeScript bindings.
 *
 * @property contractName - The name used for the generated package and client class.
 *   Should be in kebab-case (e.g., "my-contract").
 * @property contractAddress - Optional contract address to embed in the generated client.
 * @property rpcUrl - Optional RPC URL to embed in the generated client for network calls.
 * @property networkPassphrase - Optional network passphrase to embed in the generated client.
 */
export type GenerateOptions = {
  contractName: string;
  contractAddress?: string;
  rpcUrl?: string;
  networkPassphrase?: string;
};

/**
 * The output of the binding generation process.
 *
 * Contains all generated TypeScript source files and configuration files
 * needed to create a standalone npm package for interacting with a Stellar contract.
 *
 * @property index - The index.ts barrel export file that re-exports Client and types
 * @property types - The types.ts file containing TypeScript interfaces for contract structs, enums, and unions
 * @property client - The client.ts file containing the generated Client class with typed methods
 * @property packageJson - The package.json for the generated npm package
 * @property tsConfig - The tsconfig.json for TypeScript compilation
 * @property readme - The README.md with usage documentation
 * @property gitignore - The .gitignore file for the generated package
 */
export type GeneratedBindings = {
  index: string;
  types: string;
  client: string;
  packageJson: string;
  tsConfig: string;
  readme: string;
  gitignore: string;
};

/**
 * Generates TypeScript bindings for Stellar smart contracts.
 *
 * This class creates fully-typed TypeScript client code from a contract's specification,
 * allowing developers to interact with Stellar smart contracts with full IDE support
 * and compile-time type checking.
 *
 * @example
 * // Create from a local WASM file
 * const wasmBuffer = fs.readFileSync("./my_contract.wasm");
 * const generator = await BindingGenerator.fromWasm(wasmBuffer);
 * const bindings = generator.generate({ contractName: "my-contract" });
 *
 * @example
 * // Create from a contract deployed on the network
 * const generator = await BindingGenerator.fromContractId(
 *   "CABC...XYZ",
 *   "https://soroban-testnet.stellar.org",
 *   Networks.TESTNET
 * );
 * const bindings = generator.generate({ contractName: "my-contract" });
 *
 * @example
 * // Create from a Spec object directly
 * const spec = new Spec(specEntries);
 * const generator = BindingGenerator.fromSpec(spec);
 * const bindings = generator.generate({ contractName: "my-contract" });
 */
export class BindingGenerator {
  private spec: Spec;

  /**
   * Private constructor - use static factory methods instead.
   *
   * @param spec - The parsed contract specification
   */
  private constructor(spec: Spec) {
    this.spec = spec;
  }

  /**
   * Creates a BindingGenerator from an existing Spec object.
   *
   * Use this when you already have a parsed contract specification,
   * such as from manually constructed spec entries or from another source.
   *
   * @param spec - The contract specification containing function and type definitions
   * @returns A new BindingGenerator instance
   *
   * @example
   * const spec = new Spec(specEntries);
   * const generator = BindingGenerator.fromSpec(spec);
   */
  static fromSpec(spec: Spec): BindingGenerator {
    return new BindingGenerator(spec);
  }

  /**
   * Creates a BindingGenerator from a WASM binary buffer.
   *
   * Parses the contract specification directly from the WASM file's custom section.
   * This is the most common method when working with locally compiled contracts.
   *
   * @param wasmBuffer - The raw WASM binary as a Buffer
   * @returns A Promise resolving to a new BindingGenerator instance
   * @throws {Error} If the WASM file doesn't contain a valid contract spec
   *
   * @example
   * const wasmBuffer = fs.readFileSync("./target/wasm32-unknown-unknown/release/my_contract.wasm");
   * const generator = await BindingGenerator.fromWasm(wasmBuffer);
   */
  static async fromWasm(wasmBuffer: Buffer): Promise<BindingGenerator> {
    const spec = new Spec(await specFromWasm(wasmBuffer));
    return new BindingGenerator(spec);
  }

  /**
   * Creates a BindingGenerator by fetching WASM from the network using its hash.
   *
   * Retrieves the WASM bytecode from Soroban RPC using the WASM hash,
   * then parses the contract specification from it. Useful when you know
   * the hash of an installed WASM but don't have the binary locally.
   *
   * @param wasmHash - The hex-encoded hash of the installed WASM blob
   * @param rpcUrl - The Soroban RPC server URL (e.g., "https://soroban-testnet.stellar.org")
   * @param networkPassphrase - The network passphrase (e.g., Networks.TESTNET)
   * @returns A Promise resolving to a new BindingGenerator instance
   * @throws {Error} If the WASM cannot be fetched or doesn't contain a valid spec
   *
   * @example
   * const generator = await BindingGenerator.fromWasmHash(
   *   "a1b2c3...xyz",
   *   "https://soroban-testnet.stellar.org",
   *   Networks.TESTNET
   * );
   */
  static async fromWasmHash(
    wasmHash: string,
    rpcUrl: string,
    networkPassphrase: string,
  ): Promise<BindingGenerator> {
    const wasm = await fetchFromWasmHash(wasmHash, rpcUrl, networkPassphrase);
    if (wasm.contract.type !== "wasm") {
      throw new Error("Fetched contract is not of type 'wasm'");
    }
    return BindingGenerator.fromWasm(wasm.contract.wasmBytes);
  }

  /**
   * Creates a BindingGenerator by fetching contract info from a deployed contract ID.
   *
   * Retrieves the contract's WASM from the network using the contract ID,
   * then parses the specification. If the contract is a Stellar Asset Contract (SAC),
   * returns a generator with the standard SAC specification.
   *
   * @param contractId - The contract ID (C... address) of the deployed contract
   * @param rpcUrl - The Soroban RPC server URL (e.g., "https://soroban-testnet.stellar.org")
   * @param networkPassphrase - The network passphrase (e.g., Networks.TESTNET)
   * @returns A Promise resolving to a new BindingGenerator instance
   * @throws {Error} If the contract cannot be found or fetched
   *
   * @example
   * const generator = await BindingGenerator.fromContractId(
   *   "CABC123...XYZ",
   *   "https://soroban-testnet.stellar.org",
   *   Networks.TESTNET
   * );
   */
  static async fromContractId(
    contractId: string,
    rpcUrl: string,
    networkPassphrase: string,
  ): Promise<BindingGenerator> {
    const wasm = await fetchFromContractId(
      contractId,
      rpcUrl,
      networkPassphrase,
    );
    if (wasm.contract.type === "wasm") {
      return BindingGenerator.fromWasm(wasm.contract.wasmBytes);
    }
    // If it's not a wasm contract, assume it's SAC
    const spec = new Spec(SAC_SPEC);
    return BindingGenerator.fromSpec(spec);
  }

  /**
   * Generates TypeScript bindings for the contract.
   *
   * Produces all the files needed for a standalone npm package:
   * - `client.ts`: A typed Client class with methods for each contract function
   * - `types.ts`: TypeScript interfaces for all contract types (structs, enums, unions)
   * - `index.ts`: Barrel export file
   * - `package.json`, `tsconfig.json`, `README.md`, `.gitignore`: Package configuration
   *
   * The generated code does not write to disk - use the returned strings
   * to write files as needed.
   *
   * @param options - Configuration options for generation
   * @param options.contractName - Required. The name for the generated package (kebab-case recommended)
   * @param options.contractAddress - Optional. Embeds the contract address in the generated client
   * @param options.rpcUrl - Optional. Embeds the RPC URL in the generated client
   * @param options.networkPassphrase - Optional. Embeds the network passphrase in the generated client
   * @returns An object containing all generated file contents as strings
   * @throws {Error} If contractName is missing or empty
   *
   * @example
   * const bindings = generator.generate({
   *   contractName: "my-token",
   *   contractAddress: "CABC...XYZ",
   *   rpcUrl: "https://soroban-testnet.stellar.org",
   *   networkPassphrase: Networks.TESTNET
   * });
   *
   * // Write files to disk
   * fs.writeFileSync("./src/client.ts", bindings.client);
   * fs.writeFileSync("./src/types.ts", bindings.types);
   */
  generate(options: GenerateOptions): GeneratedBindings {
    this.validateOptions(options);

    const typeGenerator = new TypeGenerator(this.spec);
    const clientGenerator = new ClientGenerator(this.spec);

    const types = typeGenerator.generate();
    const client = clientGenerator.generate();

    let index = `export { Client } from "./client.js";`;
    if (types.trim() !== "") {
      index = index.concat(`\nexport * from "./types.js";`);
    }

    // Generate config files
    const configGenerator = new ConfigGenerator();
    const configs = configGenerator.generate(options);

    return {
      index: index,
      types: types,
      client: client,
      packageJson: configs.packageJson,
      tsConfig: configs.tsConfig,
      readme: configs.readme,
      gitignore: configs.gitignore,
    };
  }

  /**
   * Validates that required generation options are provided.
   *
   * @param options - The options to validate
   * @throws {Error} If contractName is missing or empty
   */
  private validateOptions(options: GenerateOptions): void {
    if (!options.contractName || options.contractName.trim() === "") {
      throw new Error("contractName is required and cannot be empty");
    }
  }
}
