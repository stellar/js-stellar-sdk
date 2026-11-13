import { Command, Option } from "commander";
import * as path from "path";

import { WasmFetchError } from "../bindings/wasm_fetcher.js";
import {
  createGenerator,
  generateAndWrite,
  logSourceInfo,
  deriveContractName,
  resolveHeaders,
  resolveNetwork,
} from "./util.js";
import { MAX_TIMEOUT_MS } from "../rpc/server.js";

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
    .option("--id, --contract-id <id>", "Contract ID on network")
    .option("--rpc-url <url>", "RPC server URL")
    .option(
      "--network <network>",
      "Network options to use: mainnet, testnet, futurenet, or localnet",
    )
    .option(
      "--network-passphrase <passphrase>",
      "Network passphrase, for a network --network does not name (use with --rpc-url)",
    )
    .option("--output-dir <dir>", "Output directory for generated bindings")
    .option(
      "--allow-http",
      "Allow insecure HTTP connections to RPC server",
      false,
    )
    .option("--timeout <ms>", "RPC request timeout in milliseconds")
    .addOption(
      // deprecated in favor of --rpc-header, so it is kept out of the help
      new Option(
        "--headers <json>",
        "Custom headers as JSON object",
      ).hideHelp(),
    )
    .option(
      "--rpc-header <header>",
      'Custom header as "Name: value"; repeat for more headers',
      (value: string, previous: string[] = []) => [...previous, value],
    )
    .option(
      "--contract-name <name>",
      "Name for the generated contract client class",
    )
    .option("--overwrite", "Overwrite existing files", false)
    .action(async (options) => {
      try {
        // Map network to passphrase and default RPC URL
        const { networkPassphrase, rpcUrl, allowHttp, defaultRpcUrlFor } =
          resolveNetwork({
            network: options.network,
            networkPassphrase: options.networkPassphrase,
            rpcUrl: options.rpcUrl,
            allowHttp: options.allowHttp,
            needsRpcUrl: Boolean(options.wasmHash || options.contractId),
          });
        if (defaultRpcUrlFor) {
          console.log(
            `Using default RPC URL for ${defaultRpcUrlFor}: ${rpcUrl}`,
          );
        }

        if (options.outputDir === undefined) {
          throw new Error("Output directory (--output-dir) is required");
        }

        if (options.headers !== undefined) {
          console.warn(
            '⚠ --headers is deprecated. Use --rpc-header "Name: value" instead.',
          );
        }

        // Merge --headers JSON with repeated --rpc-header values
        const headers = resolveHeaders(options.headers, options.rpcHeader);

        // Parse timeout if provided
        let timeout: number | undefined;
        if (options.timeout) {
          timeout = parseInt(options.timeout, 10);
          // require digits only, so values parseInt would otherwise silently
          // truncate ("10abc" -> 10, "10.9" -> 10) are rejected
          if (
            !/^\d+$/.test(options.timeout.trim()) ||
            timeout <= 0 ||
            timeout > MAX_TIMEOUT_MS
          ) {
            throw new Error(
              `Invalid timeout value: ${options.timeout}. Must be a positive integer up to ${MAX_TIMEOUT_MS}.`,
            );
          }
        }

        console.log("Fetching contract...");

        const { generator, source } = await createGenerator({
          wasm: options.wasm,
          wasmHash: options.wasmHash,
          contractId: options.contractId,
          rpcUrl,
          networkPassphrase,
          serverOptions: { allowHttp, timeout, headers },
        });

        logSourceInfo(source);

        // Derive contract name from source or use provided/default
        const contractName =
          options.contractName || deriveContractName(source) || "contract";
        console.log(
          `\n✓ Generating TypeScript bindings for "${contractName}"...`,
        );

        const bindings = await generateAndWrite(generator, {
          contractName,
          outputDir: path.resolve(options.outputDir),
          overwrite: options.overwrite,
          // the `networks` export is only meaningful for a deployed contract
          ...(source.type === "contract-id" && {
            contractId: source.contractId,
            networkPassphrase: source.network,
          }),
        });

        for (const d of bindings.diagnostics) {
          if (d.declarations > 1) {
            console.warn(
              `\n⚠ Event "${d.rawName}" is declared ${d.declarations} times; ` +
                `declaration ${d.occurrence + 1} generated as ` +
                `${d.interfaceName} with filter ${d.filterMethodName}(). ` +
                `Review the generated bindings to confirm which declaration ` +
                `you need.`,
            );
          } else {
            const renamed = [
              ...(d.interfaceRenamed ? [d.interfaceName] : []),
              ...(d.filterMethodRenamed ? [`${d.filterMethodName}()`] : []),
            ];
            console.warn(
              `\n⚠ Event "${d.rawName}": generated name` +
                `${renamed.length > 1 ? "s" : ""} ${renamed.join(" and ")} ` +
                `${renamed.length > 1 ? "were" : "was"} renamed to avoid a ` +
                `collision with another generated name.`,
            );
          }
        }

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
