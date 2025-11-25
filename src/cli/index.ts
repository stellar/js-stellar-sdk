import { Command } from "commander";
import * as path from "path";

import { BindingGenerator } from "../bindings/generator";
import { WasmFetchError } from "../bindings/wasm_fetcher";
import { Spec } from "../contract/spec";
import { fetchWasm, generateAndWrite } from "./util";
import { SAC_SPEC } from "../bindings";
import { Networks } from "@stellar/stellar-base";

function runCli() {
  const program = new Command();

  program
    .name("stellar-cli")
    .description("CLI for generating TypeScript bindings for Stellar contracts")
    .version("1.0.0");

  program
    .command("generate")
    .description("Generate TypeScript bindings for a Stellar contract")
    .helpOption("-h, --help", "Display help for command")
    .option("--wasm <path>", "Path to local WASM file")
    .option("--wasm-hash <hash>", "Hash of WASM blob on network")
    .option("--contract-id <id>", "Contract ID on network")
    .option("--rpc-url <url>", "RPC server URL")
    .option(
      "--network <network>",
      "Network options to use: testnet, mainnet, or futurenet",
    )
    .option("--output-dir <dir>", "Output directory for generated bindings")
    .option(
      "--contract-name <name>",
      "Name for the generated contract client class",
    )
    .option("--overwrite", "Overwrite existing files", false)
    .action(async (options) => {
      try {
        // Map network to passphrase
        let networkPassphrase: string | undefined;
        if (options.network) {
          const network = options.network.toLowerCase();
          switch (network) {
            case "testnet":
              networkPassphrase = Networks.TESTNET;
              break;
            case "mainnet":
              networkPassphrase = Networks.PUBLIC;
              break;
            case "futurenet":
              networkPassphrase = Networks.FUTURENET;
              break;
            default:
              throw new Error(
                `\n✗ Invalid network: ${options.network}. Must be testnet, mainnet, or futurenet`,
              );
          }
        }
        if (options.outputDir === undefined) {
          throw new Error("Output directory (--output-dir) is required");
        }
        const { contract, source } = await fetchWasm({
          wasm: options.wasm,
          wasmHash: options.wasmHash,
          contractId: options.contractId,
          rpcUrl: options.rpcUrl,
          networkPassphrase,
        });
        console.log("Fetching contract WASM...");

        logSourceInfo(source);

        let generator: BindingGenerator;
        let contractName: string;

        // Handle Stellar Asset Contract
        if (contract.type === "stellar-asset-contract") {
          console.log(
            "\n✓ Detected Stellar Asset Contract, generating SAC bindings...",
          );
          const spec = new Spec(SAC_SPEC);
          generator = BindingGenerator.fromSpec(spec);
          contractName = options.contractName || "StellarAssetContract";
        } else {
          // Generate from WASM
          console.log("\n✓ Generating TypeScript bindings...");
          generator = await BindingGenerator.fromWasm(contract.wasmBytes);
          contractName =
            options.contractName || deriveContractName(source) || "Contract";
        }

        // Generate and write bindings using helper
        await generateAndWrite(generator, {
          contractName,
          outputDir: path.resolve(options.outputDir),
          overwrite: options.overwrite,
          contractAddress: options.contractId,
          rpcUrl: options.rpcUrl,
          networkPassphrase,
        });

        console.log(
          `\n✓ Successfully generated bindings in ${options.outputDir}`,
        );
        console.log(`\nUsage:`);
        console.log(
          `  import { Client } from './${path.basename(options.outputDir)}';`,
        );
      } catch (error) {
        if (error instanceof WasmFetchError) {
          console.error(`\n✗ Error: ${error.message}`);
        } else if (error instanceof Error) {
          console.error(`\n✗ Error: ${error.message}`);
        } else {
          console.error(`\n✗ Unexpected error:`, error);
        }
        process.exit(1);
      }
    });
  program.parse();
}

/**
 * Log information about the contract source
 */
function logSourceInfo(source: any): void {
  console.log("\nSource:");
  switch (source.type) {
    case "file":
      console.log(`  Type: Local file`);
      console.log(`  Path: ${source.path}`);
      break;
    case "wasm-hash":
      console.log(`  Type: WASM hash`);
      console.log(`  Hash: ${source.hash}`);
      console.log(`  RPC: ${source.rpcUrl}`);
      console.log(`  Network: ${source.networkPassphrase}`);
      break;
    case "contract-id":
      console.log(`  Type: Contract ID`);
      console.log(`  Address: ${source.resolvedAddress}`);
      console.log(`  RPC: ${source.rpcUrl}`);
      console.log(`  Network: ${source.networkPassphrase}`);
      break;
  }
}

/**
 * Derive a contract name from the source
 */
function deriveContractName(source: any): string | null {
  if (source.type === "file") {
    const basename = path.basename(source.path, path.extname(source.path));
    // Convert kebab-case or snake_case to PascalCase
    return basename
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
  }

  return null;
}

export { runCli };
