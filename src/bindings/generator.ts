import { Spec } from "../contract";
import { ConfigGenerator } from "./config";
import { TypeGenerator } from "./types";
import { ClientGenerator } from "./client";
import { specFromWasm } from "../contract/wasm_spec_parser";

// import { format } from "prettier/standalone";
// import * as prettierPluginTypeScript from "prettier/plugins/typescript";
// import * as prettierPluginEstree from "prettier/plugins/estree";
import { fetchFromContractId, fetchFromWasmHash } from "./wasm_fetcher";
import { SAC_SPEC } from "./sac-spec";
// import { Options } from "prettier";

export type GenerateOptions = {
  contractName: string;
  contractAddress?: string;
  rpcUrl?: string;
  networkPassphrase?: string;
};

/**
 * BindingGenerator generates TypeScript bindings from a Spec or WASM
 *
 * @property index - export file content
 * @property types - contains the contract types and interfaces
 * @property client - contains the client code for interacting with the contract
 * @property packageJson - package.json content
 * @property tsConfig - tsconfig.json content
 * @property readme - README.md content
 * @property gitignore - .gitignore content
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
 * Generates TypeScript bindings for Stellar contracts
 */
export class BindingGenerator {
  private spec: Spec;

  /**
   * Generates TypeScript bindings for Stellar contracts
   *
   * @param spec - The contract specification
   */
  private constructor(spec: Spec) {
    this.spec = spec;
  }

  /**
   * Create a generator from a Spec object
   */
  static fromSpec(spec: Spec): BindingGenerator {
    return new BindingGenerator(spec);
  }

  /**
   * Create a generator from a WASM buffer
   */
  static async fromWasm(wasmBuffer: Buffer): Promise<BindingGenerator> {
    const spec = new Spec(await specFromWasm(wasmBuffer));
    return new BindingGenerator(spec);
  }

  /**
   * Create a generator by fetching WASM from a hash
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
   * Create a generator by fetching WASM from a contract ID
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
   * Generate TypeScript bindings (returns strings, does not write to disk)
   */
  async generate(options: GenerateOptions): Promise<GeneratedBindings> {
    this.validateOptions(options);

    // Generate type and client code using template strings (no ts-morph!)
    const typeGenerator = new TypeGenerator(this.spec);
    const clientGenerator = new ClientGenerator(this.spec);

    const types = typeGenerator.generate();
    const client = clientGenerator.generate();

    const index = `export { Client } from "./client.js";`;
    if (types !== "") {
      index.concat(`\nexport * from "./types.js";`);
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
   * Validate generation options
   */
  private validateOptions(options: GenerateOptions): void {
    if (!options.contractName || options.contractName.trim() === "") {
      throw new Error("contractName is required and cannot be empty");
    }
  }
}
