import { array, lazy, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  SorobanAuthorizedFunction,
  type SorobanAuthorizedFunctionWire,
} from "./soroban-authorized-function.js";

export interface SorobanAuthorizedInvocationWire {
  function: SorobanAuthorizedFunctionWire;
  subInvocations: SorobanAuthorizedInvocationWire[];
}

/**
 * ```xdr
 * struct SorobanAuthorizedInvocation
 * {
 *     SorobanAuthorizedFunction function;
 *     SorobanAuthorizedInvocation subInvocations<>;
 * };
 * ```
 */
export class SorobanAuthorizedInvocation extends XdrValue {
  readonly function: SorobanAuthorizedFunction;
  readonly subInvocations: SorobanAuthorizedInvocation[];

  static readonly schema: XdrType<SorobanAuthorizedInvocationWire> = struct(
    "SorobanAuthorizedInvocation",
    {
      function: SorobanAuthorizedFunction.schema,
      subInvocations: array(
        lazy(() => SorobanAuthorizedInvocation.schema),
        UNBOUNDED_MAX_LENGTH,
      ),
    },
  );

  constructor(input: {
    function: SorobanAuthorizedFunction;
    subInvocations: SorobanAuthorizedInvocation[];
  }) {
    super();
    this.function = input.function;
    this.subInvocations = input.subInvocations;
  }

  toXdrObject(): SorobanAuthorizedInvocationWire {
    return {
      function: this.function.toXdrObject(),
      subInvocations: this.subInvocations.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(
    wire: SorobanAuthorizedInvocationWire,
  ): SorobanAuthorizedInvocation {
    return new SorobanAuthorizedInvocation({
      function: SorobanAuthorizedFunction.fromXdrObject(wire.function),
      subInvocations: wire.subInvocations.map((w) =>
        SorobanAuthorizedInvocation.fromXdrObject(w),
      ),
    });
  }
}
