import * as fs from "fs/promises";
import * as path from "path";
import {
  BindingGenerator,
  GeneratedBindings,
  GenerateOptions,
} from "../bindings/generator";
import {
  FetchedContract,
  WasmFetchError,
  fetchFromWasmHash,
  fetchFromContractId,
} from "../bindings";

export type GenerateAndWriteOptions = GenerateOptions & {
  outputDir: string;
  overwrite?: boolean;
};

type WasmFetchArgs = {
  wasm?: string;
  wasmHash?: string;
  contractId?: string;
  rpcUrl?: string;
  networkPassphrase?: string;
};
/**
 * Create a generator from a WASM file (Node.js only)
 */
export async function fromWasmFile(wasmPath: string): Promise<Buffer> {
  // Read WASM file
  const wasmBuffer = await fs.readFile(wasmPath);

  return wasmBuffer;
}

/**
 * Write generated bindings to disk (Node.js only)
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
      throw new Error(`Output directory path is a file: ${outputDir}`);
    }
    if (stat.isDirectory() && !overwrite) {
      throw new Error(
        `Output directory already exists and overwrite is false: ${outputDir}`,
      );
    }
    if (overwrite) {
      await fs.rm(outputDir, { recursive: true, force: true });
    }
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  // Create output directory
  await fs.mkdir(path.join(outputDir, "src"), { recursive: true });

  // Write all files
  const writePromises = [
    fs.writeFile(path.join(outputDir, "src/index.ts"), bindings.index),
    fs.writeFile(path.join(outputDir, "src/client.ts"), bindings.client),
    fs.writeFile(path.join(outputDir, ".gitignore"), bindings.gitignore),
    fs.writeFile(path.join(outputDir, "README.md"), bindings.readme),
    fs.writeFile(path.join(outputDir, "package.json"), bindings.packageJson),
    fs.writeFile(path.join(outputDir, "tsconfig.json"), bindings.tsConfig),
  ];

  // Only write types file if it's not empty
  if (bindings.types.trim() !== "") {
    writePromises.push(
      fs.writeFile(path.join(outputDir, "src/types.ts"), bindings.types),
    );
  }

  await Promise.all(writePromises);
}
/**
 * Generate TypeScript bindings and write to disk (Node.js only)
 */
export async function generateAndWrite(
  generator: BindingGenerator,
  options: GenerateAndWriteOptions,
): Promise<void> {
  const { outputDir, overwrite = false, ...genOptions } = options;

  // Generate bindings
  const bindings = generator.generate(genOptions);

  // Write to disk
  await writeBindings(outputDir, bindings, overwrite);
}

/**
 * Fetches contract WASM from local file, network hash, or contract ID
 */
export async function fetchWasm(args: WasmFetchArgs): Promise<FetchedContract> {
  // Validate that exactly one source is provided
  const sources = [args.wasm, args.wasmHash, args.contractId].filter(Boolean);
  if (sources.length === 0) {
    throw new WasmFetchError(
      "Must provide one of the following: --wasm, --wasm-hash, or --contract-id",
    );
  }
  if (sources.length > 1) {
    throw new WasmFetchError(
      "Must provide only one of the following: --wasm, --wasm-hash, or --contract-id",
    );
  }

  // Handle local WASM file
  if (args.wasm) {
    const buffer = await fromWasmFile(args.wasm);
    return {
      contract: { type: "wasm", wasmBytes: buffer },
      source: { type: "file", path: args.wasm },
    };
  }

  // For network sources, validate required network parameters
  if (!args.rpcUrl) {
    throw new WasmFetchError(
      "--rpc-url is required when fetching from network",
    );
  }
  if (!args.networkPassphrase) {
    throw new WasmFetchError(
      "--network-passphrase is required when fetching from network",
    );
  }

  // Handle WASM hash from network
  if (args.wasmHash) {
    return fetchFromWasmHash(
      args.wasmHash,
      args.rpcUrl,
      args.networkPassphrase,
    );
  }

  // Handle contract ID from network
  if (args.contractId) {
    return fetchFromContractId(
      args.contractId,
      args.rpcUrl,
      args.networkPassphrase,
    );
  }

  throw new WasmFetchError("Invalid arguments provided");
}

/**
 * Log information about the contract source
 */
export function logSourceInfo(source: any): void {
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
export function deriveContractName(source: any): string | null {
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
