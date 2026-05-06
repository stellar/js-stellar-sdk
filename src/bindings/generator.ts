import { Spec } from "../contract/index.js";
import { ConfigGenerator } from "./config.js";
import { TypeGenerator } from "./types.js";
import { ClientGenerator } from "./client.js";
import { specFromWasm } from "../contract/wasm_spec_parser.js";
import { fetchFromContractId, fetchFromWasmHash } from "./wasm_fetcher.js";
import { SAC_SPEC } from "./sac-spec.js";
import { Server } from "../rpc/index.js";

/**
 * Options for generating TypeScript bindings.
 * @category Contracts / Bindings
 */
export type GenerateOptions = {
  /**
   * The name used for the generated package and client class.
   * Should be in kebab-case (e.g., "my-contract").
   */
  contractName: string;
};

/**
 * The output of the binding generation process.
 *
 * Contains all generated TypeScript source files and configuration files
 * needed to create a standalone npm package for interacting with a Stellar contract.
 * @category Contracts / Bindings
 */
export type GeneratedBindings = {
  /** The index.ts barrel export file that re-exports Client and types */
  index: string;
  /** The types.ts file containing TypeScript interfaces for contract structs, enums, and unions */
  types: string;
  /** The client.ts file containing the generated Client class with typed methods */
  client: string;
  /** The package.json for the generated npm package */
  packageJson: string;
  /** The tsconfig.json for TypeScript compilation */
  tsConfig: string;
  /** The README.md with usage documentation */
  readme: string;
  /** The .gitignore file for the generated package */
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
 * @category Contracts / Bindings
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
   * @throws If the WASM file doesn't contain a valid contract spec
   *
   * @example
   * const wasmBuffer = fs.readFileSync("./target/wasm32-unknown-unknown/release/my_contract.wasm");
   * const generator = await BindingGenerator.fromWasm(wasmBuffer);
   */
  static fromWasm(wasmBuffer: Buffer): BindingGenerator {
    const spec = new Spec(specFromWasm(wasmBuffer));
    return new BindingGenerator(spec);
  }

  /**
   * Creates a BindingGenerator by fetching WASM from the network using its hash.
   *
   * Retrieves the WASM bytecode from Stellar RPC using the WASM hash,
   * then parses the contract specification from it. Useful when you know
   * the hash of an installed WASM but don't have the binary locally.
   *
   * @param wasmHash - The hex-encoded hash of the installed WASM blob
   * @param rpcServer - The Stellar RPC server instance
   * @returns A Promise resolving to a new BindingGenerator instance
   * @throws If the WASM cannot be fetched or doesn't contain a valid spec
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
    rpcServer: Server,
  ): Promise<BindingGenerator> {
    const wasm = await fetchFromWasmHash(wasmHash, rpcServer);
    if (wasm.type !== "wasm") {
      throw new Error("Fetched contract is not of type 'wasm'");
    }
    return BindingGenerator.fromWasm(wasm.wasmBytes);
  }

  /**
   * Creates a BindingGenerator by fetching contract info from a deployed contract ID.
   *
   * Retrieves the contract's WASM from the network using the contract ID,
   * then parses the specification. If the contract is a Stellar Asset Contract (SAC),
   * returns a generator with the standard SAC specification.
   *
   * @param contractId - The contract ID (C... address) of the deployed contract
   * @param rpcServer - The Stellar RPC server instance
   * @returns A Promise resolving to a new BindingGenerator instance
   * @throws If the contract cannot be found or fetched
   *
   * @example
   * const generator = await BindingGenerator.fromContractId(
   *   "CABC123...XYZ",
   *   rpcServer
   * );
   */
  static async fromContractId(
    contractId: string,
    rpcServer: Server,
  ): Promise<BindingGenerator> {
    const result = await fetchFromContractId(contractId, rpcServer);
    if (result.type === "wasm") {
      return BindingGenerator.fromWasm(result.wasmBytes);
    }
    // Stellar Asset Contract
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
   * @returns An object containing all generated file contents as strings
   * @throws If contractName is missing or empty
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
    const { packageJson, tsConfig, readme, gitignore } =
      configGenerator.generate(options);

    return {
      index,
      types,
      client,
      packageJson,
      tsConfig,
      readme,
      gitignore,
    };
  }

  /**
   * Validates that required generation options are provided.
   *
   * @param options - The options to validate
   * @throws If contractName is missing or empty
   */
  private validateOptions(options: GenerateOptions): void {
    if (!options.contractName || options.contractName.trim() === "") {
      throw new Error("contractName is required and cannot be empty");
    }
  }
}
