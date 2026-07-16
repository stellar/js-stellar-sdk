import { xdr } from "../base/index.js";
import { HorizonApi } from "../horizon/horizon_api.js";
import { BadResponseError } from "./bad_response.js";

/**
 * TransactionFailedError is raised when a transaction submitted to Horizon
 * is rejected with a `transaction_failed` error response (HTTP 400). It
 * provides convenient accessors for the result codes and the decoded
 * {@link xdr.TransactionResult}, which are otherwise nested deep inside the
 * raw Horizon response.
 *
 * @example
 * ```js
 * try {
 *   await server.submitTransaction(tx);
 * } catch (err) {
 *   if (err instanceof TransactionFailedError) {
 *     const { transaction, operations } = err.getResultCodes();
 *     console.log(transaction);  // e.g. "tx_failed"
 *     console.log(operations);   // e.g. ["op_underfunded"]
 *     console.log(err.getTransactionResult()?.result().switch().name);
 *   }
 * }
 * ```
 *
 * @param message - Human-readable error message.
 * @param response - Response details, received from the Horizon server, whose
 *   `data` field contains a `transaction_failed` error response with `extras`.
 */
export class TransactionFailedError extends BadResponseError {
  /**
   * Returns the transaction- and operation-level result codes reported by
   * Horizon, e.g. `{ transaction: "tx_failed", operations: ["op_underfunded"] }`.
   *
   * Horizon omits `operations` when the transaction failed a
   * transaction-level check (e.g. `tx_bad_seq`) and no operations were
   * evaluated; this accessor normalizes that to an empty array.
   *
   * @returns The `result_codes` object from the response's `extras`.
   */
  public getResultCodes(): {
    transaction: HorizonApi.TransactionFailedResultCodes;
    operations: string[];
  } {
    const { transaction, operations = [] } = this.extras().result_codes;
    return { transaction, operations };
  }

  /**
   * Decodes and returns the {@link xdr.TransactionResult} from the response's
   * `extras.result_xdr`, providing structured access to per-operation results.
   *
   * @returns The decoded transaction result, or `null` if the response did not
   *   include a `result_xdr`.
   * @throws If the server returned a `result_xdr` that is not valid base64-encoded
   *   {@link xdr.TransactionResult} XDR.
   */
  public getTransactionResult(): xdr.TransactionResult | null {
    const resultXdr = this.extras().result_xdr;
    if (!resultXdr) {
      return null;
    }
    return xdr.TransactionResult.fromXDR(resultXdr, "base64");
  }

  private extras(): HorizonApi.TransactionFailedExtras {
    return (
      this.response.data as HorizonApi.ErrorResponseData.TransactionFailed
    ).extras;
  }
}
