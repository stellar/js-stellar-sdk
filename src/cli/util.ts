import * as fs from "fs/promises";
import * as path from "path";
import {
  BindingGenerator,
  type GeneratedBindings,
  type GenerateOptions,
} from "../bindings/generator.js";
import { WasmFetchError } from "../bindings/index.js";
import { RpcServer } from "../rpc/server.js";
import { Networks } from "../base/index.js";

/** Passphrase and default RPC URL of each network name `--network` accepts. */
export const NETWORK_CONFIG: Record<
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

export type ResolveNetworkArgs = {
  network?: string;
  networkPassphrase?: string;
  rpcUrl?: string;
  allowHttp?: boolean;
  /** True when the source is fetched over RPC (`--wasm-hash` or `--contract-id`). */
  needsRpcUrl?: boolean;
};

export type ResolvedNetwork = {
  networkPassphrase?: string;
  rpcUrl?: string;
  allowHttp: boolean;
  /** The network name whose default RPC URL was used, if any. */
  defaultRpcUrlFor?: string;
};

/**
 * Resolve `--network`, `--network-passphrase`, `--rpc-url` and `--allow-http`
 * into the passphrase and RPC settings to use.
 */
export function resolveNetwork(args: ResolveNetworkArgs): ResolvedNetwork {
  const resolved: ResolvedNetwork = {
    networkPassphrase: args.networkPassphrase,
    rpcUrl: args.rpcUrl,
    allowHttp: args.allowHttp ?? false,
  };

  if (args.networkPassphrase === "") {
    throw new Error("--network-passphrase cannot be empty");
  }

  if (!args.network) {
    return resolved;
  }

  const network = args.network.toLowerCase();
  const config = NETWORK_CONFIG[network];

  if (!config) {
    throw new Error(
      `\n✗ Invalid network: ${args.network}. Must be mainnet, testnet, futurenet, or localnet`,
    );
  }

  if (
    args.networkPassphrase !== undefined &&
    args.networkPassphrase !== config.passphrase
  ) {
    throw new Error(
      `--network-passphrase "${args.networkPassphrase}" does not match the ${network} passphrase "${config.passphrase}". Pass only one of --network or --network-passphrase.`,
    );
  }

  resolved.networkPassphrase = config.passphrase;

  // Use default RPC URL if not provided (only needed for network sources)
  if (!resolved.rpcUrl && args.needsRpcUrl) {
    if (config.rpcUrl) {
      resolved.rpcUrl = config.rpcUrl;
      resolved.defaultRpcUrlFor = network;

      // Auto-enable allowHttp for localnet when using default HTTP URL
      if (network === "localnet") {
        resolved.allowHttp = true;
      }
    } else if (network === "mainnet") {
      throw new Error(
        `\n✗ --rpc-url is required for mainnet. Find RPC providers at: https://developers.stellar.org/docs/data/rpc/rpc-providers`,
      );
    }
  }

  return resolved;
}

/**
 * Merge `--contract-id` and its `--id` alias into one value, rejecting two
 * different values.
 */
export function resolveContractId(
  contractId?: string,
  id?: string,
): string | undefined {
  if (contractId !== undefined && id !== undefined && contractId !== id) {
    throw new Error(
      `--contract-id (${contractId}) and --id (${id}) are aliases and must not differ. Pass only one.`,
    );
  }
  return contractId ?? id;
}

/** Parse one `--rpc-header "Name: value"` into its name and value. */
export function parseRpcHeader(header: string): [string, string] {
  const separator = header.indexOf(":");
  const name = separator === -1 ? "" : header.slice(0, separator).trim();
  if (name === "") {
    // the header is not echoed back, since its value may be a secret
    throw new Error(
      'Invalid --rpc-header: expected "Name: value" with a non-empty name',
    );
  }
  return [name, header.slice(separator + 1).trim()];
}

/**
 * Merge the `--headers` JSON object with repeated `--rpc-header` values. On a
 * name used by both (compared without case), the `--rpc-header` value wins.
 */
export function resolveHeaders(
  headersJson?: string,
  rpcHeaders: string[] = [],
): Record<string, string> | undefined {
  let headers: Record<string, string> | undefined;
  if (headersJson) {
    try {
      headers = JSON.parse(headersJson);
    } catch {
      throw new Error(`Invalid JSON for --headers: ${headersJson}`);
    }
  }
  if (rpcHeaders.length === 0) {
    return headers;
  }

  if (
    headers !== undefined &&
    (headers === null || typeof headers !== "object" || Array.isArray(headers))
  ) {
    throw new Error(
      "--headers must be a JSON object when combined with --rpc-header",
    );
  }

  const merged = new Map<string, [string, string]>();
  Object.entries(headers ?? {}).forEach(([name, value]) => {
    merged.set(name.toLowerCase(), [name, value]);
  });
  rpcHeaders.map(parseRpcHeader).forEach(([name, value]) => {
    merged.set(name.toLowerCase(), [name, value]);
  });
  return Object.fromEntries(merged.values());
}

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
    const wasmBytes = await fs.readFile(args.wasm);
    return {
      generator: BindingGenerator.fromWasm(wasmBytes),
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
      "--network or --network-passphrase is required when fetching from network",
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
): Promise<GeneratedBindings> {
  const { outputDir, overwrite = false, ...genOptions } = options;
  const bindings = generator.generate(genOptions);
  await writeBindings(outputDir, bindings, overwrite);
  return bindings;
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
