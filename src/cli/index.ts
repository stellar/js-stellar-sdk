import { Command } from "commander";
import * as path from "path";

import { BindingGenerator } from "../bindings/generator";
import { WasmFetchError } from "../bindings/wasm_fetcher";
import { Spec } from "../contract/spec";
import {
  deriveContractName,
  fetchWasm,
  generateAndWrite,
  logSourceInfo,
} from "./util";
import { SAC_SPEC } from "../bindings";
import { Networks } from "@stellar/stellar-base";

// Default RPC URLs for each network
const NETWORK_CONFIG: Record<
  string,
  { passphrase: string; rpcUrl: string | null }
> = {
  testnet: {
    passphrase: Networks.TESTNET,
    rpcUrl: "https://soroban-testnet.stellar.org",
  },
  mainnet: {
    passphrase: Networks.PUBLIC,
    rpcUrl: null, // User must provide their own
  },
  futurenet: {
    passphrase: Networks.FUTURENET,
    rpcUrl: "https://rpc-futurenet.stellar.org",
  },
  localnet: {
    passphrase: Networks.STANDALONE,
    rpcUrl: "http://localhost:8000/rpc",
  },
};

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
      "Network options to use: mainnet, testnet, futurenet, or localnet",
    )
    .option("--output-dir <dir>", "Output directory for generated bindings")
    .option(
      "--allow-http",
      "Allow insecure HTTP connections to RPC server",
      false,
    )
    .option("--timeout <ms>", "RPC request timeout in milliseconds")
    .option(
      "--headers <json>",
      'Custom headers as JSON object (e.g., \'{"Authorization": "Bearer token"}\')',
    )
    .option(
      "--contract-name <name>",
      "Name for the generated contract client class",
    )
    .option("--overwrite", "Overwrite existing files", false)
    .action(async (options) => {
      try {
        // Map network to passphrase and default RPC URL
        let networkPassphrase: string | undefined;
        let rpcUrl: string | undefined = options.rpcUrl;
        let allowHttp: boolean = options.allowHttp;

        if (options.network) {
          const network = options.network.toLowerCase();
          const config = NETWORK_CONFIG[network];

          if (!config) {
            throw new Error(
              `\n✗ Invalid network: ${options.network}. Must be mainnet, testnet, futurenet, or localnet`,
            );
          }

          networkPassphrase = config.passphrase;

          // Use default RPC URL if not provided (only needed for network sources)
          const needsRpcUrl = options.wasmHash || options.contractId;
          if (!rpcUrl && needsRpcUrl) {
            if (config.rpcUrl) {
              rpcUrl = config.rpcUrl;
              console.log(`Using default RPC URL for ${network}: ${rpcUrl}`);

              // Auto-enable allowHttp for localnet when using default HTTP URL
              if (network === "localnet" && !options.allowHttp) {
                allowHttp = true;
              }
            } else if (network === "mainnet") {
              throw new Error(
                `\n✗ --rpc-url is required for mainnet. Find RPC providers at: https://developers.stellar.org/docs/data/rpc/rpc-providers`,
              );
            }
          }
        }

        if (options.outputDir === undefined) {
          throw new Error("Output directory (--output-dir) is required");
        }

        // Parse headers JSON if provided
        let headers: Record<string, string> | undefined;
        if (options.headers) {
          try {
            headers = JSON.parse(options.headers);
          } catch {
            throw new Error(`Invalid JSON for --headers: ${options.headers}`);
          }
        }

        // Parse timeout if provided
        let timeout: number | undefined;
        if (options.timeout) {
          timeout = parseInt(options.timeout, 10);
          if (Number.isNaN(timeout) || timeout <= 0) {
            throw new Error(
              `Invalid timeout value: ${options.timeout}. Must be a positive integer.`,
            );
          }
        }

        const { contract, source } = await fetchWasm({
          wasm: options.wasm,
          wasmHash: options.wasmHash,
          contractId: options.contractId,
          rpcUrl,
          networkPassphrase,
          serverOptions: {
            allowHttp,
            timeout,
            headers,
          },
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
          contractName = options.contractName || "stellar-asset-contract";
        } else {
          // Generate from WASM
          console.log("\n✓ Generating TypeScript bindings...");
          generator = await BindingGenerator.fromWasm(contract.wasmBytes);
          contractName =
            options.contractName || deriveContractName(source) || "contract";
        }

        // Generate and write bindings using helper
        await generateAndWrite(generator, {
          contractName,
          outputDir: path.resolve(options.outputDir),
          overwrite: options.overwrite,
          contractAddress: options.contractId,
          rpcUrl,
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
          if (error.cause) {
            console.error(`  Caused by: ${error.cause.message}`);
          }
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

export { runCli };
