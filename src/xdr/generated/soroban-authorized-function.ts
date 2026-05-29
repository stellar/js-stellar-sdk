/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { SorobanAuthorizedFunctionType } from "./soroban-authorized-function-type.js";
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

export type SorobanAuthorizedFunctionWire =
  | { type: 0; contractFn: InvokeContractArgsWire }
  | { type: 1; createContractHostFn: CreateContractArgsWire }
  | { type: 2; createContractV2HostFn: CreateContractArgsV2Wire };

export type SorobanAuthorizedFunctionVariantName =
  | "sorobanAuthorizedFunctionTypeContractFn"
  | "sorobanAuthorizedFunctionTypeCreateContractHostFn"
  | "sorobanAuthorizedFunctionTypeCreateContractV2HostFn";

/**
 * ```xdr
 * union SorobanAuthorizedFunction switch (SorobanAuthorizedFunctionType type)
 * {
 * case SOROBAN_AUTHORIZED_FUNCTION_TYPE_CONTRACT_FN:
 *     InvokeContractArgs contractFn;
 * // This variant of auth payload for creating new contract instances
 * // doesn't allow specifying the constructor arguments, creating contracts
 * // with constructors that take arguments is only possible by authorizing
 * // `SOROBAN_AUTHORIZED_FUNCTION_TYPE_CREATE_CONTRACT_V2_HOST_FN`
 * // (protocol 22+).
 * case SOROBAN_AUTHORIZED_FUNCTION_TYPE_CREATE_CONTRACT_HOST_FN:
 *     CreateContractArgs createContractHostFn;
 * // This variant of auth payload for creating new contract instances
 * // is only accepted in and after protocol 22. It allows authorizing the
 * // contract constructor arguments.
 * case SOROBAN_AUTHORIZED_FUNCTION_TYPE_CREATE_CONTRACT_V2_HOST_FN:
 *     CreateContractArgsV2 createContractV2HostFn;
 * };
 * ```
 */
abstract class SorobanAuthorizedFunctionBase extends XdrValue {
  abstract readonly type: SorobanAuthorizedFunctionVariantName;

  static readonly schema: XdrType<SorobanAuthorizedFunctionWire> = union(
    "SorobanAuthorizedFunction",
    {
      switchOn: SorobanAuthorizedFunctionType.schema,
      cases: [
        case_(
          "sorobanAuthorizedFunctionTypeContractFn",
          0,
          field("contractFn", InvokeContractArgs.schema),
        ),
        case_(
          "sorobanAuthorizedFunctionTypeCreateContractHostFn",
          1,
          field("createContractHostFn", CreateContractArgs.schema),
        ),
        case_(
          "sorobanAuthorizedFunctionTypeCreateContractV2HostFn",
          2,
          field("createContractV2HostFn", CreateContractArgsV2.schema),
        ),
      ],
    },
  );

  static sorobanAuthorizedFunctionTypeContractFn(
    contractFn: InvokeContractArgs,
  ): SorobanAuthorizedFunctionContractFn {
    return new SorobanAuthorizedFunctionContractFn(contractFn);
  }

  static sorobanAuthorizedFunctionTypeCreateContractHostFn(
    createContractHostFn: CreateContractArgs,
  ): SorobanAuthorizedFunctionCreateContractHostFn {
    return new SorobanAuthorizedFunctionCreateContractHostFn(
      createContractHostFn,
    );
  }

  static sorobanAuthorizedFunctionTypeCreateContractV2HostFn(
    createContractV2HostFn: CreateContractArgsV2,
  ): SorobanAuthorizedFunctionCreateContractV2HostFn {
    return new SorobanAuthorizedFunctionCreateContractV2HostFn(
      createContractV2HostFn,
    );
  }

  static fromXdrObject(
    wire: SorobanAuthorizedFunctionWire,
  ): SorobanAuthorizedFunction {
    switch (wire.type) {
      case 0:
        return new SorobanAuthorizedFunctionContractFn(
          InvokeContractArgs.fromXdrObject(wire.contractFn),
        );
      case 1:
        return new SorobanAuthorizedFunctionCreateContractHostFn(
          CreateContractArgs.fromXdrObject(wire.createContractHostFn),
        );
      case 2:
        return new SorobanAuthorizedFunctionCreateContractV2HostFn(
          CreateContractArgsV2.fromXdrObject(wire.createContractV2HostFn),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete SorobanAuthorizedFunction variant.
   * Use this instead of `instanceof SorobanAuthorizedFunction`: the exported `SorobanAuthorizedFunction` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `SorobanAuthorizedFunction.is(x)` narrows to the union.
   */
  static is(value: unknown): value is SorobanAuthorizedFunction {
    return value instanceof SorobanAuthorizedFunctionBase;
  }

  abstract toXdrObject(): SorobanAuthorizedFunctionWire;
}

export class SorobanAuthorizedFunctionContractFn extends SorobanAuthorizedFunctionBase {
  readonly type = "sorobanAuthorizedFunctionTypeContractFn" as const;
  readonly contractFn: InvokeContractArgs;

  constructor(contractFn: InvokeContractArgs) {
    super();
    this.contractFn = contractFn;
  }

  get value(): InvokeContractArgs {
    return this.contractFn;
  }

  toXdrObject(): Extract<SorobanAuthorizedFunctionWire, { type: 0 }> {
    return { type: 0, contractFn: this.contractFn.toXdrObject() };
  }
}

export class SorobanAuthorizedFunctionCreateContractHostFn extends SorobanAuthorizedFunctionBase {
  readonly type = "sorobanAuthorizedFunctionTypeCreateContractHostFn" as const;
  readonly createContractHostFn: CreateContractArgs;

  constructor(createContractHostFn: CreateContractArgs) {
    super();
    this.createContractHostFn = createContractHostFn;
  }

  get value(): CreateContractArgs {
    return this.createContractHostFn;
  }

  toXdrObject(): Extract<SorobanAuthorizedFunctionWire, { type: 1 }> {
    return {
      type: 1,
      createContractHostFn: this.createContractHostFn.toXdrObject(),
    };
  }
}

export class SorobanAuthorizedFunctionCreateContractV2HostFn extends SorobanAuthorizedFunctionBase {
  readonly type =
    "sorobanAuthorizedFunctionTypeCreateContractV2HostFn" as const;
  readonly createContractV2HostFn: CreateContractArgsV2;

  constructor(createContractV2HostFn: CreateContractArgsV2) {
    super();
    this.createContractV2HostFn = createContractV2HostFn;
  }

  get value(): CreateContractArgsV2 {
    return this.createContractV2HostFn;
  }

  toXdrObject(): Extract<SorobanAuthorizedFunctionWire, { type: 2 }> {
    return {
      type: 2,
      createContractV2HostFn: this.createContractV2HostFn.toXdrObject(),
    };
  }
}

export type SorobanAuthorizedFunction =
  | SorobanAuthorizedFunctionContractFn
  | SorobanAuthorizedFunctionCreateContractHostFn
  | SorobanAuthorizedFunctionCreateContractV2HostFn;
export const SorobanAuthorizedFunction = SorobanAuthorizedFunctionBase;
