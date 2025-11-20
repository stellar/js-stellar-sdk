import { Address, StrKey, xdr } from "@stellar/stellar-base";

import { RpcServer } from "../rpc/server";

/**
 * Result of fetching contract WASM
 */
export interface FetchedContract {
  contract: ContractData;
  source: ContractSource;
}

/**
 * Types of contract data that can be fetched
 */
export type ContractData =
  | { type: "wasm"; wasmBytes: Buffer }
  | { type: "stellar-asset-contract" };

/**
 * Source information about where the contract was fetched from
 */
export type ContractSource =
  | { type: "file"; path: string }
  | {
      type: "wasm-hash";
      hash: string;
      rpcUrl: string;
      networkPassphrase: string;
    }
  | {
      type: "contract-id";
      resolvedAddress: string;
      rpcUrl: string;
      networkPassphrase: string;
    };

/**
 * Errors that can occur during WASM fetching
 */
export class WasmFetchError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "WasmFetchError";
  }
}

/**
 * Verify that the server is on the expected network
 */
async function verifyNetwork(
  server: RpcServer,
  expectedPassphrase: string,
): Promise<void> {
  try {
    const networkResponse = await server.getNetwork();
    if (networkResponse.passphrase !== expectedPassphrase) {
      throw new WasmFetchError(
        `Network mismatch: expected "${expectedPassphrase}", got "${networkResponse.passphrase}"`,
      );
    }
  } catch (error) {
    if (error instanceof WasmFetchError) {
      throw error;
    }
    throw new WasmFetchError("Failed to verify network", error as Error);
  }
}

/**
 * Get WASM bytes from a WASM hash on the network
 */
async function getRemoteWasmFromHash(
  server: RpcServer,
  hashBuffer: Buffer,
): Promise<Buffer> {
  try {
    // Create the ledger key for the contract code
    const contractCodeKey = xdr.LedgerKey.contractCode(
      new xdr.LedgerKeyContractCode({
        hash: xdr.Hash.fromXDR(hashBuffer, "raw"),
      }),
    );

    // Get the ledger entries
    const response = await server.getLedgerEntries(contractCodeKey);

    if (!response.entries || response.entries.length === 0) {
      throw new WasmFetchError("WASM not found for the given hash");
    }

    const entry = response.entries[0];
    if (entry.key.switch() !== xdr.LedgerEntryType.contractCode()) {
      throw new WasmFetchError("Invalid ledger entry type returned");
    }

    const contractCode = entry.val.contractCode();
    return Buffer.from(contractCode.code());
  } catch (error) {
    if (error instanceof WasmFetchError) {
      throw error;
    }
    throw new WasmFetchError("Failed to fetch WASM from hash", error as Error);
  }
}

/**
 * Fetch WASM bytes from a deployed contract
 */
async function fetchWasmFromContract(
  server: RpcServer,
  contractAddress: Address,
): Promise<FetchedContract> {
  try {
    // Get contract instance
    const contractInstanceKey = xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: contractAddress.toScAddress(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: xdr.ContractDataDurability.persistent(),
      }),
    );

    const response = await server.getLedgerEntries(contractInstanceKey);

    if (!response.entries || response.entries.length === 0) {
      throw new WasmFetchError("Contract instance not found");
    }

    const entry = response.entries[0];
    if (entry.key.switch() !== xdr.LedgerEntryType.contractData()) {
      throw new WasmFetchError("Invalid ledger entry type returned");
    }

    const contractData = entry.val.contractData();
    const instance = contractData.val().instance();

    if (isStellarAssetContract(instance)) {
      return {
        contract: { type: "stellar-asset-contract" },
        source: {
          type: "contract-id",
          resolvedAddress: contractAddress.toString(),
          rpcUrl: server.serverURL.toString(),
          networkPassphrase: "", // Unknown in this context
        },
      };
    }

    const wasmHash = instance.executable().wasmHash();
    let wasmBytes = await getRemoteWasmFromHash(server, wasmHash);
    return {
      contract: { type: "wasm", wasmBytes },
      source: {
        type: "contract-id",
        resolvedAddress: contractAddress.toString(),
        rpcUrl: server.serverURL.toString(),
        networkPassphrase: "", // Unknown in this context
      },
    };
  } catch (error) {
    if (error instanceof WasmFetchError) {
      throw error;
    }
    throw new WasmFetchError(
      "Failed to fetch WASM from contract",
      error as Error,
    );
  }
}

/**
 * Check if a contract is a Stellar Asset Contract
 */
function isStellarAssetContract(instance: xdr.ScContractInstance): boolean {
  // Check if it's a Stellar Asset Contract (has no WASM hash)
  return (
    instance.executable().switch() ===
    xdr.ContractExecutableType.contractExecutableStellarAsset()
  );
}

/**
 * Fetch WASM from network using WASM hash
 */
export async function fetchFromWasmHash(
  wasmHash: string,
  rpcUrl: string,
  networkPassphrase: string,
): Promise<FetchedContract> {
  try {
    // Validate and decode the hash
    const hashBuffer = Buffer.from(wasmHash, "hex");
    if (hashBuffer.length !== 32) {
      throw new WasmFetchError(
        `Invalid WASM hash length: expected 32 bytes, got ${hashBuffer.length}`,
      );
    }

    const server = new RpcServer(rpcUrl);

    // Verify network
    await verifyNetwork(server, networkPassphrase);

    // Get WASM from hash
    const wasmBytes = await getRemoteWasmFromHash(server, hashBuffer);

    return {
      contract: { type: "wasm", wasmBytes },
      source: {
        type: "wasm-hash",
        hash: wasmHash,
        rpcUrl,
        networkPassphrase,
      },
    };
  } catch (error) {
    throw new WasmFetchError(
      `Failed to fetch WASM from hash ${wasmHash}`,
      error as Error,
    );
  }
}

/**
 * Fetch WASM from network using contract ID
 */
export async function fetchFromContractId(
  contractId: string,
  rpcUrl: string,
  networkPassphrase: string,
): Promise<FetchedContract> {
  try {
    const server = new RpcServer(rpcUrl);

    // Verify network
    await verifyNetwork(server, networkPassphrase);

    if (!StrKey.isValidContract(contractId)) {
      throw new WasmFetchError(`Invalid contract ID: ${contractId}`);
    }
    // Parse contract address
    const contractAddress = Address.fromString(contractId);

    // Try to get WASM from contract
    try {
      return await fetchWasmFromContract(server, contractAddress);
    } catch (error) {
      throw error;
    }
  } catch (error) {
    throw new WasmFetchError(
      `Failed to fetch WASM from contract ${contractId}`,
      error as Error,
    );
  }
}
