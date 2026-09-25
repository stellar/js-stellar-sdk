import { TransactionResult } from "../xdr/index.js";
import type { OperationResult } from "../xdr/index.js";

/**
 * True for an `xdr.TransactionResult`, including one built by a *different*
 * copy of the SDK loaded in the same process (a dual ESM/CJS load, or two
 * installed versions), where `instanceof` fails on an otherwise perfectly good
 * result. The generated schema carries its XDR type name as a string literal,
 * so unlike `constructor.name` it survives both the module boundary and
 * minification.
 */
function isTransactionResult(value: unknown): boolean {
  if (value instanceof TransactionResult) return true;
  if (typeof value !== "object" || value === null) return false;
  const ctor = value.constructor as { schema?: { name?: string } } | undefined;
  return ctor?.schema?.name === TransactionResult.schema.name;
}

/**
 * Extract the operation results from a successful transaction result,
 * unwrapping a fee bump when there is one.
 *
 * @throws if the transaction (or a fee bump's inner transaction)
 *    did not succeed, since no operation was applied in that case
 */
function successfulOperationResults(
  result: TransactionResult,
): OperationResult[] {
  const txResult = result.result;

  switch (txResult.type) {
    case "txSuccess":
      return txResult.results;

    case "txFeeBumpInnerSuccess": {
      const innerResult = txResult.innerResultPair.result.result;
      if (innerResult.type !== "txSuccess") {
        throw new TypeError(
          `expected a successful inner transaction result, got ${innerResult.type}`,
        );
      }
      return innerResult.results;
    }

    default:
      throw new TypeError(
        `expected a successful transaction result, got ${txResult.type}`,
      );
  }
}

/**
 * Read the claimable balance ID out of a submitted transaction's result.
 *
 * Use this after submission. To derive the ID beforehand, use
 * {@link Transaction.getClaimableBalanceId} instead. Both return the balance
 * ID in its 72-character hex form.
 *
 * Horizon returns the result as base64 in `result_xdr`, so decode it first
 * with `xdr.TransactionResult.fromXdr(result_xdr, "base64")`. RPC's
 * `getTransaction` already returns a parsed `resultXdr`.
 *
 * @param result - the result of the transaction that ran the
 *    `CreateClaimableBalance` op
 * @param opIndex - the index of the `CreateClaimableBalance` op
 *
 * @throws `RangeError` for an `opIndex` that is not an index into the
 *    transaction's operation results
 * @throws `TypeError` if `result` is not a transaction result, if the
 *    transaction did not succeed, or if the operation at `opIndex` is not a
 *    successful `CreateClaimableBalance`
 *
 * @see https://developers.stellar.org/docs/learn/encyclopedia/transactions-specialized/claimable-balances
 */
export function getClaimableBalanceIdFromResult(
  result: TransactionResult,
  opIndex: number,
): string {
  if (!isTransactionResult(result)) {
    throw new TypeError(
      'expected an xdr.TransactionResult; decode a base64 `result_xdr` with xdr.TransactionResult.fromXdr(result_xdr, "base64") first',
    );
  }

  const opResults = successfulOperationResults(result);

  // A half-shaped object can carry a valid arm name but no results array.
  if (!Array.isArray(opResults)) {
    throw new TypeError(
      "expected an xdr.TransactionResult; its operation results are missing",
    );
  }

  if (
    !Number.isInteger(opIndex) ||
    opIndex < 0 ||
    opIndex >= opResults.length
  ) {
    throw new RangeError(
      `invalid operation index ${opIndex}; the transaction has ${opResults.length} operation result(s)`,
    );
  }

  const opResult = opResults[opIndex];

  if (opResult.type !== "opInner") {
    throw new TypeError(
      `expected opInner at index ${opIndex}, got ${opResult.type}`,
    );
  }

  const opTypeResult = opResult.tr;

  if (opTypeResult.type !== "createClaimableBalance") {
    throw new TypeError(
      `expected createClaimableBalance at index ${opIndex}, got ${opTypeResult.type}`,
    );
  }

  const balanceResult = opTypeResult.createClaimableBalanceResult;

  if (balanceResult.type !== "createClaimableBalanceSuccess") {
    throw new TypeError(
      `expected createClaimableBalanceSuccess at index ${opIndex}, got ${balanceResult.type}`,
    );
  }

  return balanceResult.balanceId.toXdr("hex");
}
