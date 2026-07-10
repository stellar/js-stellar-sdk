/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union, varOpaque } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { HostFunctionType } from "./host-function-type.js";
import {
  InvokeContractArgs,
  type InvokeContractArgsWire,
} from "./invoke-contract-args.js";
import {
  CreateContractArgs,
  type CreateContractArgsWire,
} from "./create-contract-args.js";
import {
  CreateContractArgsV2,
  type CreateContractArgsV2Wire,
} from "./create-contract-args-v2.js";

export type HostFunctionWire =
  | { type: 0; invokeContract: InvokeContractArgsWire }
  | { type: 1; createContract: CreateContractArgsWire }
  | { type: 2; wasm: Uint8Array }
  | { type: 3; createContractV2: CreateContractArgsV2Wire };

export type HostFunctionVariantName =
  | "hostFunctionTypeInvokeContract"
  | "hostFunctionTypeCreateContract"
  | "hostFunctionTypeUploadContractWasm"
  | "hostFunctionTypeCreateContractV2";

/**
 * ```xdr
 * union HostFunction switch (HostFunctionType type)
 * {
 * case HOST_FUNCTION_TYPE_INVOKE_CONTRACT:
 *     InvokeContractArgs invokeContract;
 * case HOST_FUNCTION_TYPE_CREATE_CONTRACT:
 *     CreateContractArgs createContract;
 * case HOST_FUNCTION_TYPE_UPLOAD_CONTRACT_WASM:
 *     opaque wasm<>;
 * case HOST_FUNCTION_TYPE_CREATE_CONTRACT_V2:
 *     CreateContractArgsV2 createContractV2;
 * };
 * ```
 */
abstract class HostFunctionBase extends XdrValue {
  abstract readonly type: HostFunctionVariantName;

  static readonly schema: XdrType<HostFunctionWire> = union("HostFunction", {
    switchOn: HostFunctionType.schema,
    cases: [
      case_(
        "hostFunctionTypeInvokeContract",
        0,
        field("invokeContract", InvokeContractArgs.schema),
      ),
      case_(
        "hostFunctionTypeCreateContract",
        1,
        field("createContract", CreateContractArgs.schema),
      ),
      case_(
        "hostFunctionTypeUploadContractWasm",
        2,
        field("wasm", varOpaque(UNBOUNDED_MAX_LENGTH)),
      ),
      case_(
        "hostFunctionTypeCreateContractV2",
        3,
        field("createContractV2", CreateContractArgsV2.schema),
      ),
    ],
  });

  static hostFunctionTypeInvokeContract(
    invokeContract: InvokeContractArgs,
  ): HostFunctionInvokeContract {
    return new HostFunctionInvokeContract(invokeContract);
  }

  static hostFunctionTypeCreateContract(
    createContract: CreateContractArgs,
  ): HostFunctionCreateContract {
    return new HostFunctionCreateContract(createContract);
  }

  static hostFunctionTypeUploadContractWasm(
    wasm: Uint8Array,
  ): HostFunctionUploadContractWasm {
    return new HostFunctionUploadContractWasm(wasm);
  }

  static hostFunctionTypeCreateContractV2(
    createContractV2: CreateContractArgsV2,
  ): HostFunctionCreateContractV2 {
    return new HostFunctionCreateContractV2(createContractV2);
  }

  static fromXdrObject(wire: HostFunctionWire): HostFunction {
    switch (wire.type) {
      case 0:
        return new HostFunctionInvokeContract(
          InvokeContractArgs.fromXdrObject(wire.invokeContract),
        );
      case 1:
        return new HostFunctionCreateContract(
          CreateContractArgs.fromXdrObject(wire.createContract),
        );
      case 2:
        return new HostFunctionUploadContractWasm(wire.wasm);
      case 3:
        return new HostFunctionCreateContractV2(
          CreateContractArgsV2.fromXdrObject(wire.createContractV2),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete HostFunction variant.
   * Use this instead of `instanceof HostFunction`: the exported `HostFunction` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `HostFunction.is(x)` narrows to the union.
   */
  static is(value: unknown): value is HostFunction {
    return value instanceof HostFunctionBase;
  }

  abstract toXdrObject(): HostFunctionWire;
}

export class HostFunctionInvokeContract extends HostFunctionBase {
  readonly type = "hostFunctionTypeInvokeContract" as const;
  readonly invokeContract: InvokeContractArgs;

  constructor(invokeContract: InvokeContractArgs) {
    super();
    this.invokeContract = invokeContract;
  }

  get value(): InvokeContractArgs {
    return this.invokeContract;
  }

  toXdrObject(): Extract<HostFunctionWire, { type: 0 }> {
    return { type: 0, invokeContract: this.invokeContract.toXdrObject() };
  }
}

export class HostFunctionCreateContract extends HostFunctionBase {
  readonly type = "hostFunctionTypeCreateContract" as const;
  readonly createContract: CreateContractArgs;

  constructor(createContract: CreateContractArgs) {
    super();
    this.createContract = createContract;
  }

  get value(): CreateContractArgs {
    return this.createContract;
  }

  toXdrObject(): Extract<HostFunctionWire, { type: 1 }> {
    return { type: 1, createContract: this.createContract.toXdrObject() };
  }
}

export class HostFunctionUploadContractWasm extends HostFunctionBase {
  readonly type = "hostFunctionTypeUploadContractWasm" as const;
  readonly wasm: Uint8Array;

  constructor(wasm: Uint8Array) {
    super();
    this.wasm = wasm;
  }

  get value(): Uint8Array {
    return this.wasm;
  }

  toXdrObject(): Extract<HostFunctionWire, { type: 2 }> {
    return { type: 2, wasm: this.wasm };
  }
}

export class HostFunctionCreateContractV2 extends HostFunctionBase {
  readonly type = "hostFunctionTypeCreateContractV2" as const;
  readonly createContractV2: CreateContractArgsV2;

  constructor(createContractV2: CreateContractArgsV2) {
    super();
    this.createContractV2 = createContractV2;
  }

  get value(): CreateContractArgsV2 {
    return this.createContractV2;
  }

  toXdrObject(): Extract<HostFunctionWire, { type: 3 }> {
    return { type: 3, createContractV2: this.createContractV2.toXdrObject() };
  }
}

export type HostFunction =
  | HostFunctionInvokeContract
  | HostFunctionCreateContract
  | HostFunctionUploadContractWasm
  | HostFunctionCreateContractV2;
export const HostFunction = HostFunctionBase;
