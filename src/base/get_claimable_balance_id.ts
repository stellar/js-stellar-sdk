import type { OperationResult, TransactionResult } from "../xdr/index.js";

/**
 * Check that a value carries the arms this helper reads, without an
 * `instanceof`: the package ships CJS and ESM builds whose classes are
 * distinct objects, so a result built through another entry point is valid
 * but fails an identity check.
 */
function isTransactionResultLike(value: unknown): boolean {
  if (typeof value !== "object" || value === null || !("result" in value)) {
    return false;
  }

  const txResult: unknown = value.result;

  return (
    typeof txResult === "object" &&
    txResult !== null &&
    "type" in txResult &&
    typeof txResult.type === "string"
  );
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
  if (!isTransactionResultLike(result)) {
    throw new TypeError(
      'expected an xdr.TransactionResult; decode a base64 `result_xdr` with xdr.TransactionResult.fromXdr(result_xdr, "base64") first',
    );
  }

  if (!Number.isInteger(opIndex) || opIndex < 0) {
    throw new RangeError("invalid operation index");
  }

  const opResults = successfulOperationResults(result);

  // A half-shaped object can carry a valid arm name but no results array.
  if (!Array.isArray(opResults)) {
    throw new TypeError(
      "expected an xdr.TransactionResult; its operation results are missing",
    );
  }

  const opResult = opResults[opIndex];

  if (opResult === undefined) {
    throw new RangeError("invalid operation index");
  }

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
