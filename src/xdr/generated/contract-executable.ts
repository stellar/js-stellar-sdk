/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union, void as voidType } from "@stellar/js-xdr";
import { XdrError, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ContractExecutableType } from "./contract-executable-type.js";
import { Hash, type HashWire } from "./hash.js";
import {
  ContractExecutableExternalRef,
  type ContractExecutableExternalRefWire,
} from "./contract-executable-external-ref.js";

export type ContractExecutableWire =
  | { type: 0; wasmHash: HashWire }
  | { type: 1 }
  | { type: 2; externalRef: ContractExecutableExternalRefWire };

export type ContractExecutableVariantName =
  | "contractExecutableWasm"
  | "contractExecutableStellarAsset"
  | "contractExecutableExternalRef";

/**
 * ```xdr
 * union ContractExecutable switch (ContractExecutableType type)
 * {
 * case CONTRACT_EXECUTABLE_WASM:
 *     Hash wasm_hash;
 * case CONTRACT_EXECUTABLE_STELLAR_ASSET:
 *     void;
 * case CONTRACT_EXECUTABLE_EXTERNAL_REF:
 *     ContractExecutableExternalRef external_ref;
 * };
 * ```
 */
abstract class ContractExecutableBase extends XdrValue {
  abstract readonly type: ContractExecutableVariantName;

  constructor() {
    super();
    // `new.target`, not an unconditional throw: every arm subclass reaches
    // this constructor through `super()`, void arms via an implicit one
    if (new.target === ContractExecutableBase) {
      throw new TypeError(
        "new xdr.ContractExecutable(...) is not supported: XDR unions are built from " +
          "per-variant factories. Call xdr.ContractExecutable.contractExecutableWasm(...) " +
          "(or another arm factory) instead.",
      );
    }
  }

  static readonly schema: XdrType<ContractExecutableWire> = union(
    "ContractExecutable",
    {
      switchOn: ContractExecutableType.schema,
      cases: [
        case_("contractExecutableWasm", 0, field("wasmHash", Hash.schema)),
        case_("contractExecutableStellarAsset", 1, voidType()),
        case_(
          "contractExecutableExternalRef",
          2,
          field("externalRef", ContractExecutableExternalRef.schema),
        ),
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

  static contractExecutableExternalRef(
    externalRef: ContractExecutableExternalRef,
  ): ContractExecutableExternalRefArm {
    return new ContractExecutableExternalRefArm(externalRef);
  }

  static fromXdrObject(wire: ContractExecutableWire): ContractExecutable {
    switch (wire.type) {
      case 0:
        return new ContractExecutableWasm(Hash.fromXdrObject(wire.wasmHash));
      case 1:
        return new ContractExecutableStellarAsset();
      case 2:
        return new ContractExecutableExternalRefArm(
          ContractExecutableExternalRef.fromXdrObject(wire.externalRef),
        );
    }
    // unreachable for a well-typed wire object; a hand-built one can still
    // carry an out-of-range discriminant
    throw new XdrError(
      `ContractExecutable: unknown type ${(wire as { type: unknown }).type}`,
    );
  }

  /**
   * Type guard narrowing an unknown value to a concrete ContractExecutable variant.
   * Use this instead of `instanceof ContractExecutable`: the exported `ContractExecutable` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ContractExecutable.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ContractExecutable {
    return value instanceof ContractExecutableBase;
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

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<ContractExecutableWire, { type: 1 }> {
    return { type: 1 };
  }
}

export class ContractExecutableExternalRefArm extends ContractExecutableBase {
  readonly type = "contractExecutableExternalRef" as const;
  readonly externalRef: ContractExecutableExternalRef;

  constructor(externalRef: ContractExecutableExternalRef) {
    super();
    this.externalRef = externalRef;
  }

  get value(): ContractExecutableExternalRef {
    return this.externalRef;
  }

  toXdrObject(): Extract<ContractExecutableWire, { type: 2 }> {
    return { type: 2, externalRef: this.externalRef.toXdrObject() };
  }
}

export type ContractExecutable =
  | ContractExecutableWasm
  | ContractExecutableStellarAsset
  | ContractExecutableExternalRefArm;
export const ContractExecutable = ContractExecutableBase;
