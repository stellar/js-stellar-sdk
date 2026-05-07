import xdr from "../xdr.js";

import { Keypair } from "../keypair.js";
import { Address } from "../address.js";
import { Asset } from "../asset.js";
import {
  CreateCustomContractOpts,
  CreateStellarAssetContractOpts,
  InvokeContractFunctionOpts,
  InvokeHostFunctionOpts,
  InvokeHostFunctionResult,
  OperationAttributes,
  UploadContractWasmOpts,
} from "./types.js";
import { setSourceAccount } from "../util/operations.js";

/**
 * Invokes a single smart contract host function.
 *
 *
 * @param opts - options object
 * @param opts.func - host function to execute (with its wrapped parameters)
 * @param opts.auth - list outlining the tree of authorizations required for the call
 * @param opts.source - an optional source account
 *
 * @see https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function
 * @see Operation.invokeContractFunction
 * @see Operation.createCustomContract
 * @see Operation.createStellarAssetContract
 * @see Operation.uploadContractWasm
 * @see Contract.call
 */
export function invokeHostFunction(
  opts: InvokeHostFunctionOpts,
): xdr.Operation<InvokeHostFunctionResult> {
  if (!opts.func) {
    throw new TypeError(
      `host function invocation ('func') required (got ${JSON.stringify(opts)})`,
    );
  }

  if (
    opts.func.switch().value ===
    xdr.HostFunctionType.hostFunctionTypeInvokeContract().value
  ) {
    // Ensure that there are no claimable balance or liquidity pool IDs in the
    // invocation because those are not allowed.
    opts.func
      .invokeContract()
      .args()
      .forEach((arg) => {
        let scv: Address;
        try {
          scv = Address.fromScVal(arg);
        } catch {
          // swallow non-Address errors
          return;
        }

        switch (scv.type) {
          case "claimableBalance":
          case "liquidityPool":
            throw new TypeError(
              `claimable balances and liquidity pools cannot be arguments to invokeHostFunction`,
            );
          default:
        }
      });
  }

  const invokeHostFunctionOp = new xdr.InvokeHostFunctionOp({
    hostFunction: opts.func,
    auth: opts.auth || [],
  });

  const opAttributes: OperationAttributes = {
    sourceAccount: null,
    body: xdr.OperationBody.invokeHostFunction(invokeHostFunctionOp),
  };
  setSourceAccount(opAttributes, opts);

  return new xdr.Operation(opAttributes);
}

/**
 * Returns an operation that invokes a contract function.
 *
 *
 * @param opts - the set of parameters
 * @param opts.contract - a strkey-fied contract address (`C...`)
 * @param opts.function - the name of the contract fn to invoke
 * @param opts.args - parameters to pass to the function invocation
 * @param opts.auth - an optional list outlining the tree of authorizations required for the call
 * @param opts.source - an optional source account
 *
 * @see Operation.invokeHostFunction
 * @see Contract.call
 * @see Address
 */
export function invokeContractFunction(
  opts: InvokeContractFunctionOpts,
): xdr.Operation<InvokeHostFunctionResult> {
  const c = new Address(opts.contract);

  if (c.type !== "contract") {
    throw new TypeError(
      `expected contract strkey instance, got ${c.toString()}`,
    );
  }

  return invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeInvokeContract(
      new xdr.InvokeContractArgs({
        contractAddress: c.toScAddress(),
        functionName: opts.function,
        args: opts.args,
      }),
    ),
    ...(opts.source !== undefined && { source: opts.source }),
    ...(opts.auth !== undefined && { auth: opts.auth }),
  });
}

/**
 * Returns an operation that creates a custom WASM contract and atomically
 * invokes its constructor.
 *
 *
 * @param opts - the set of parameters
 * @param opts.address - the contract uploader address
 * @param opts.wasmHash - the SHA-256 hash of the contract WASM you're uploading
 * @param opts.constructorArgs - the optional parameters to pass to the constructor
 * @param opts.salt - an optional, 32-byte salt to distinguish deployment instances
 * @param opts.auth - an optional list outlining the tree of authorizations required for the call
 * @param opts.source - an optional source account
 *
 * @see https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function
 */
export function createCustomContract(
  opts: CreateCustomContractOpts,
): xdr.Operation<InvokeHostFunctionResult> {
  const salt = Buffer.from(opts.salt || getSalty());

  if (!opts.wasmHash || opts.wasmHash.length !== 32) {
    throw new TypeError(
      `expected hash(contract WASM) in 'opts.wasmHash', got ${String(opts.wasmHash)}`,
    );
  }

  if (salt.length !== 32) {
    throw new TypeError(
      `expected 32-byte salt in 'opts.salt', got ${String(opts.salt)}`,
    );
  }

  return invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeCreateContractV2(
      new xdr.CreateContractArgsV2({
        executable: xdr.ContractExecutable.contractExecutableWasm(
          Buffer.from(opts.wasmHash),
        ),
        contractIdPreimage:
          xdr.ContractIdPreimage.contractIdPreimageFromAddress(
            new xdr.ContractIdPreimageFromAddress({
              address: opts.address.toScAddress(),
              salt,
            }),
          ),
        constructorArgs: opts.constructorArgs ?? [],
      }),
    ),
    ...(opts.source !== undefined && { source: opts.source }),
    ...(opts.auth !== undefined && { auth: opts.auth }),
  });
}

/**
 * Returns an operation that wraps a Stellar asset into a token contract.
 *
 *
 * @param opts - the set of parameters
 * @param opts.asset - the Stellar asset to wrap, either as an {@link Asset} object or in canonical form (SEP-11, `code:issuer`)
 * @param opts.auth - an optional list outlining the tree of authorizations required for the upload
 * @param opts.source - an optional source account
 *
 * @see https://stellar.org/protocol/sep-11#alphanum4-alphanum12
 * @see https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions
 * @see https://soroban.stellar.org/docs/advanced-tutorials/stellar-asset-contract
 * @see Operation.invokeHostFunction
 */
export function createStellarAssetContract(
  opts: CreateStellarAssetContractOpts,
): xdr.Operation<InvokeHostFunctionResult> {
  let asset = opts.asset;

  if (typeof asset === "string") {
    const parts = asset.split(":");
    const code = parts[0];
    if (code === undefined) {
      throw new TypeError(
        `expected Asset in 'opts.asset', got ${String(opts.asset)}`,
      );
    }
    asset = new Asset(code, parts[1]); // handles 'xlm' by default
  }

  if (!(asset instanceof Asset)) {
    throw new TypeError(
      `expected Asset in 'opts.asset', got ${String(opts.asset)}`,
    );
  }

  return invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeCreateContract(
      new xdr.CreateContractArgs({
        executable: xdr.ContractExecutable.contractExecutableStellarAsset(),
        contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAsset(
          asset.toXDRObject(),
        ),
      }),
    ),
    auth: opts.auth || [],
    ...(opts.source !== undefined && { source: opts.source }),
  });
}

/**
 * Returns an operation that uploads WASM for a contract.
 *
 *
 * @param opts - the set of parameters
 * @param opts.wasm - a WASM blob to upload to the ledger
 * @param opts.auth - an optional list outlining the tree of authorizations required for the upload
 * @param opts.source - an optional source account
 *
 * @see https://soroban.stellar.org/docs/fundamentals-and-concepts/invoking-contracts-with-transactions#function
 */
export function uploadContractWasm(
  opts: UploadContractWasmOpts,
): xdr.Operation<InvokeHostFunctionResult> {
  return invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeUploadContractWasm(
      Buffer.from(opts.wasm), // coalesce so we can drop `Buffer` someday
    ),
    auth: opts.auth || [],
    ...(opts.source !== undefined && { source: opts.source }),
  });
}

/* Returns a random 256-bit "salt" value. */
function getSalty(): Buffer {
  return Keypair.random().xdrPublicKey().value(); // ed25519 is 256 bits, too
}
