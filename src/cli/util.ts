import * as fs from "fs/promises";
import * as path from "path";
import {
  BindingGenerator,
  GeneratedBindings,
  GenerateOptions,
} from "../bindings/generator";
import { WasmFetchError } from "../bindings";
import { RpcServer } from "../rpc/server";

export type GenerateAndWriteOptions = GenerateOptions & {
  outputDir: string;
  overwrite?: boolean;
};

/**
 * Source information about where the contract was fetched from
 */
export type ContractSource =
  | { type: "file"; path: string }
  | { type: "wasm-hash"; hash: string; rpcUrl: string; network: string }
  | {
      type: "contract-id";
      contractId: string;
      rpcUrl: string;
      network: string;
    };

export type CreateGeneratorArgs = {
  wasm?: string;
  wasmHash?: string;
  contractId?: string;
  rpcUrl?: string;
  networkPassphrase?: string;
  serverOptions?: RpcServer.Options;
};

export type CreateGeneratorResult = {
  generator: BindingGenerator;
  source: ContractSource;
};

/**
 * Verify that the server is on the expected network
 */
async function verifyNetwork(
  server: RpcServer,
  expectedPassphrase: string,
): Promise<void> {
  const networkResponse = await server.getNetwork();
  if (networkResponse.passphrase !== expectedPassphrase) {
    throw new WasmFetchError(
      `Network mismatch: expected "${expectedPassphrase}", got "${networkResponse.passphrase}"`,
    );
  }
}

/**
 * Create a BindingGenerator from local file, network hash, or contract ID
 */
export async function createGenerator(
  args: CreateGeneratorArgs,
): Promise<CreateGeneratorResult> {
  // Validate exactly one source is provided
  const sources = [args.wasm, args.wasmHash, args.contractId].filter(Boolean);
  if (sources.length === 0) {
    throw new WasmFetchError(
      "Must provide one of: --wasm, --wasm-hash, or --contract-id",
    );
  }
  if (sources.length > 1) {
    throw new WasmFetchError(
      "Must provide only one of: --wasm, --wasm-hash, or --contract-id",
    );
  }

  // Local WASM file
  if (args.wasm) {
    const wasmBuffer = await fs.readFile(args.wasm);
    return {
      generator: BindingGenerator.fromWasm(wasmBuffer),
      source: { type: "file", path: args.wasm },
    };
  }

  // Network sources require RPC URL and network
  if (!args.rpcUrl) {
    throw new WasmFetchError(
      "--rpc-url is required when fetching from network",
    );
  }
  if (!args.networkPassphrase) {
    throw new WasmFetchError(
      "--network is required when fetching from network",
    );
  }

  const server = new RpcServer(args.rpcUrl, args.serverOptions);
  await verifyNetwork(server, args.networkPassphrase);

  // WASM hash
  if (args.wasmHash) {
    return {
      generator: await BindingGenerator.fromWasmHash(args.wasmHash, server),
      source: {
        type: "wasm-hash",
        hash: args.wasmHash,
        rpcUrl: args.rpcUrl,
        network: args.networkPassphrase,
      },
    };
  }

  if (args.contractId) {
    const generator = await BindingGenerator.fromContractId(
      args.contractId,
      server,
    );
    return {
      generator,
      source: {
        type: "contract-id",
        contractId: args.contractId,
        rpcUrl: args.rpcUrl,
        network: args.networkPassphrase,
      },
    };
  }

  throw new WasmFetchError("Invalid arguments");
}

/**
 * Write generated bindings to disk
 */
export async function writeBindings(
  outputDir: string,
  bindings: GeneratedBindings,
  overwrite: boolean,
): Promise<void> {
  // Check if output directory exists
  try {
    const stat = await fs.stat(outputDir);
    if (stat.isFile()) {
      throw new Error(`Output path is a file: ${outputDir}`);
    }
    if (!overwrite) {
      throw new Error(`Directory exists (use --overwrite): ${outputDir}`);
    }
    await fs.rm(outputDir, { recursive: true, force: true });
  } catch (error: any) {
    if (error.code !== "ENOENT") throw error;
  }

  await fs.mkdir(path.join(outputDir, "src"), { recursive: true });

  const writes = [
    fs.writeFile(path.join(outputDir, "src/index.ts"), bindings.index),
    fs.writeFile(path.join(outputDir, "src/client.ts"), bindings.client),
    fs.writeFile(path.join(outputDir, ".gitignore"), bindings.gitignore),
    fs.writeFile(path.join(outputDir, "README.md"), bindings.readme),
    fs.writeFile(path.join(outputDir, "package.json"), bindings.packageJson),
    fs.writeFile(path.join(outputDir, "tsconfig.json"), bindings.tsConfig),
  ];

  if (bindings.types.trim()) {
    writes.push(
      fs.writeFile(path.join(outputDir, "src/types.ts"), bindings.types),
    );
  }

  await Promise.all(writes);
}
/**
 * Generate and write bindings to disk
 */
export async function generateAndWrite(
  generator: BindingGenerator,
  options: GenerateAndWriteOptions,
): Promise<void> {
  const { outputDir, overwrite = false, ...genOptions } = options;
  const bindings = generator.generate(genOptions);
  await writeBindings(outputDir, bindings, overwrite);
}

/**
 * Log source information
 */
export function logSourceInfo(source: ContractSource): void {
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
      console.log(`  Network: ${source.network}`);
      break;
    case "contract-id":
      console.log(`  Type: Contract ID`);
      console.log(`  Address: ${source.contractId}`);
      console.log(`  RPC: ${source.rpcUrl}`);
      console.log(`  Network: ${source.network}`);
      break;
  }
}

/**
 * Derive contract name from source path
 */
export function deriveContractName(source: ContractSource): string | null {
  if (source.type !== "file") return null;

  return path
    .basename(source.path, path.extname(source.path))
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}
