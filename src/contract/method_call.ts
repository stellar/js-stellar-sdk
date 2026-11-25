import { AssembledTransaction } from "./assembled_transaction.js";
import type { Spec } from "./spec.js";
import type { ClientOptions, MethodOptions } from "./types.js";
import type { ScVal } from "../xdr/index.js";

/**
 * Build the call to a contract function by its on-chain name, as a
 * `contract.Client` method does. Not exported from the package.
 */
export function buildMethodCall(
  spec: Spec,
  options: ClientOptions,
  method: string,
  args?: Record<string, unknown>,
  methodOptions?: MethodOptions,
) {
  return AssembledTransaction.build({
    method,
    args: args && spec.funcArgsToScVals(method, args),
    ...options,
    ...methodOptions,
    errorTypes: Object.fromEntries(
      spec.errorCases().map((c) => [c.value, { message: c.doc.toString() }]),
    ),
    parseResultXdr: (result: ScVal) => spec.funcResToNative(method, result),
  });
}
