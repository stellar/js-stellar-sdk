import { Address, Contract, StrKey, xdr } from "../base";
import { Server } from "../rpc";

import { RpcServer } from "../rpc/server";

/**
 * Types of contract data that can be fetched
 */
export type ContractData =
  | { type: "wasm"; wasmBytes: Buffer }
  | { type: "stellar-asset-contract" };

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
 * Fetch WASM bytes from a deployed contract
 */
async function fetchWasmFromContract(
  server: RpcServer,
  contractAddress: Address,
): Promise<ContractData> {
  try {
    const contract = new Contract(contractAddress.toString());

    const response = await server.getLedgerEntries(contract.getFootprint());
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
      return { type: "stellar-asset-contract" };
    }

    const wasmHash = instance.executable().wasmHash();
    let wasmBytes = await getRemoteWasmFromHash(server, wasmHash);
    return { type: "wasm", wasmBytes };
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
 * Fetch WASM from network using WASM hash
 */
export async function fetchFromWasmHash(
  wasmHash: string,
  rpcServer: Server,
): Promise<ContractData> {
  try {
    // Validate and decode the hash
    const hashBuffer = Buffer.from(wasmHash, "hex");
    if (hashBuffer.length !== 32) {
      throw new WasmFetchError(
        `Invalid WASM hash length: expected 32 bytes, got ${hashBuffer.length}`,
      );
    }

    // Get WASM from hash
    const wasmBytes = await getRemoteWasmFromHash(rpcServer, hashBuffer);

    return { type: "wasm", wasmBytes };
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
  rpcServer: Server,
): Promise<ContractData> {
  try {
    if (!StrKey.isValidContract(contractId)) {
      throw new WasmFetchError(`Invalid contract ID: ${contractId}`);
    }
    // Parse contract address
    const contractAddress = Address.fromString(contractId);

    // Try to get WASM from contract
    return await fetchWasmFromContract(rpcServer, contractAddress);
  } catch (error) {
    throw new WasmFetchError(
      `Failed to fetch WASM from contract ${contractId}`,
      error as Error,
    );
  }
}
