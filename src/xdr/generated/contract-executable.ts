/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ContractExecutableType } from "./contract-executable-type.js";
import { Hash, type HashWire } from "./hash.js";

export type ContractExecutableWire =
  | { type: 0; wasmHash: HashWire }
  | { type: 1 };

export type ContractExecutableVariantName =
  | "contractExecutableWasm"
  | "contractExecutableStellarAsset";

/**
 * ```xdr
 * union ContractExecutable switch (ContractExecutableType type)
 * {
 * case CONTRACT_EXECUTABLE_WASM:
 *     Hash wasm_hash;
 * case CONTRACT_EXECUTABLE_STELLAR_ASSET:
 *     void;
 * };
 * ```
 */
abstract class ContractExecutableBase extends XdrValue {
  abstract readonly type: ContractExecutableVariantName;

  static readonly schema: XdrType<ContractExecutableWire> = union(
    "ContractExecutable",
    {
      switchOn: ContractExecutableType.schema,
      cases: [
        case_("contractExecutableWasm", 0, field("wasmHash", Hash.schema)),
        case_("contractExecutableStellarAsset", 1, voidType()),
      ],
    },
  );

  static contractExecutableWasm(
    wasmHash: Hash | Uint8Array | string,
  ): ContractExecutableWasm {
    return new ContractExecutableWasm(wasmHash);
  }

  static contractExecutableStellarAsset(): ContractExecutableStellarAsset {
    return new ContractExecutableStellarAsset();
  }

  static fromXdrObject(wire: ContractExecutableWire): ContractExecutable {
    switch (wire.type) {
      case 0:
        return new ContractExecutableWasm(Hash.fromXdrObject(wire.wasmHash));
      case 1:
        return new ContractExecutableStellarAsset();
    }
  }

  abstract toXdrObject(): ContractExecutableWire;
}

export class ContractExecutableWasm extends ContractExecutableBase {
  readonly type = "contractExecutableWasm" as const;
  readonly wasmHash: Hash;

  constructor(wasmHash: Hash | Uint8Array | string) {
    super();
    this.wasmHash = wasmHash instanceof Hash ? wasmHash : new Hash(wasmHash);
  }

  get value(): Hash {
    return this.wasmHash;
  }

  toXdrObject(): Extract<ContractExecutableWire, { type: 0 }> {
    return { type: 0, wasmHash: this.wasmHash.toXdrObject() };
  }
}

export class ContractExecutableStellarAsset extends ContractExecutableBase {
  readonly type = "contractExecutableStellarAsset" as const;

  toXdrObject(): Extract<ContractExecutableWire, { type: 1 }> {
    return { type: 1 };
  }
}

export type ContractExecutable =
  | ContractExecutableWasm
  | ContractExecutableStellarAsset;
export const ContractExecutable = ContractExecutableBase;
