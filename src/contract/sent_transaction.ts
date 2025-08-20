/* disable max-classes rule, because extending error shouldn't count! */
/* eslint max-classes-per-file: 0 */
import type { MethodOptions } from "./types";
import { Server } from "../rpc";
import { Api } from "../rpc/api";
import { withExponentialBackoff } from "./utils";
import { DEFAULT_TIMEOUT } from "./types";
import type { AssembledTransaction } from "./assembled_transaction";

/**
 * A transaction that has been sent to the Soroban network. This happens in two steps:
 *
 * 1. `sendTransaction`: initial submission of the transaction to the network.
 *    If this step runs into problems, the attempt to sign and send will be
 *    aborted. You can see the result of this call in the
 *    `sendTransactionResponse` getter.
 * 2. `getTransaction`: once the transaction has been submitted to the network
 *    successfully, you need to wait for it to finalize to get the result of the
 *    transaction. This will be retried with exponential backoff for
 *    {@link MethodOptions.timeoutInSeconds} seconds. See all attempts in
 *    `getTransactionResponseAll` and the most recent attempt in
 *    `getTransactionResponse`.
 *
 * @memberof module:contract
 * @class
 *
 * @param {Function} signTransaction More info in {@link MethodOptions}
 * @param {module:contract.AssembledTransaction<T>} assembled {@link AssembledTransaction} from which this SentTransaction was initialized
 */
export class SentTransaction<T> {
  public server: Server;

  /**
   * The result of calling `sendTransaction` to broadcast the transaction to the
   * network.
   */
  public sendTransactionResponse?: Api.SendTransactionResponse;

  /**
   * If `sendTransaction` completes successfully (which means it has `status: 'PENDING'`),
   * then `getTransaction` will be called in a loop for
   * {@link MethodOptions.timeoutInSeconds} seconds. This array contains all
   * the results of those calls.
   */
  public getTransactionResponseAll?: Api.GetTransactionResponse[];

  /**
   * The most recent result of calling `getTransaction`, from the
   * `getTransactionResponseAll` array.
   */
  public getTransactionResponse?: Api.GetTransactionResponse;

  static Errors = {
    SendFailed: class SendFailedError extends Error {},
    SendResultOnly: class SendResultOnlyError extends Error {},
    TransactionStillPending: class TransactionStillPendingError extends Error {},
  };

  constructor(public assembled: AssembledTransaction<T>) {
    this.server = new Server(this.assembled.options.rpcUrl, {
      allowHttp: this.assembled.options.allowHttp ?? false,
    });
  }

  /**
   * Initialize a `SentTransaction` from {@link AssembledTransaction}
   * `assembled`, passing an optional {@link Watcher} `watcher`. This will also
   * send the transaction to the network.
   */
  static init = async <U>(
    /** {@link AssembledTransaction} from which this SentTransaction was initialized */
    assembled: AssembledTransaction<U>,
    watcher?: Watcher,
  ): Promise<SentTransaction<U>> => {
    const tx = new SentTransaction(assembled);
    const sent = await tx.send(watcher);
    return sent;
  };

  private send = async (watcher?: Watcher): Promise<this> => {
    this.sendTransactionResponse = await this.server.sendTransaction(
      this.assembled.signed!,
    );

    if (this.sendTransactionResponse.status !== "PENDING") {
      throw new SentTransaction.Errors.SendFailed(
        `Sending the transaction to the network failed!\n${JSON.stringify(
          this.sendTransactionResponse,
          null,
          2,
        )}`,
      );
    }

    if (watcher?.onSubmitted) watcher.onSubmitted(this.sendTransactionResponse);

    const { hash } = this.sendTransactionResponse;

    const timeoutInSeconds =
      this.assembled.options.timeoutInSeconds ?? DEFAULT_TIMEOUT;
    this.getTransactionResponseAll = await withExponentialBackoff(
      async () => {
        const tx = await this.server.getTransaction(hash);
        if (watcher?.onProgress) watcher.onProgress(tx);
        return tx;
      },
      (resp) => resp.status === Api.GetTransactionStatus.NOT_FOUND,
      timeoutInSeconds,
    );

    this.getTransactionResponse =
      this.getTransactionResponseAll[this.getTransactionResponseAll.length - 1];
    if (
      this.getTransactionResponse.status === Api.GetTransactionStatus.NOT_FOUND
    ) {
      throw new SentTransaction.Errors.TransactionStillPending(
        `Waited ${timeoutInSeconds} seconds for transaction to complete, but it did not. ` +
          `Returning anyway. Check the transaction status manually. ` +
          `Sent transaction: ${JSON.stringify(
            this.sendTransactionResponse,
            null,
            2,
          )}\n` +
          `All attempts to get the result: ${JSON.stringify(
            this.getTransactionResponseAll,
            null,
            2,
          )}`,
      );
    }

    return this;
  };

  get result(): T {
    // 1. check if transaction was submitted and awaited with `getTransaction`
    if ("getTransactionResponse" in this && this.getTransactionResponse) {
      // getTransactionResponse has a `returnValue` field unless it failed
      if ("returnValue" in this.getTransactionResponse) {
        return this.assembled.options.parseResultXdr(
          this.getTransactionResponse.returnValue!,
        );
      }

      // if "returnValue" not present, the transaction failed; return without
      // parsing the result
      throw new Error("Transaction failed! Cannot parse result.");
    }

    // 2. otherwise, maybe it was merely sent with `sendTransaction`
    if (this.sendTransactionResponse) {
      const errorResult = this.sendTransactionResponse.errorResult?.result();
      if (errorResult) {
        throw new SentTransaction.Errors.SendFailed(
          `Transaction simulation looked correct, but attempting to send the transaction failed. Check \`simulation\` and \`sendTransactionResponseAll\` to troubleshoot. Decoded \`sendTransactionResponse.errorResultXdr\`: ${errorResult}`,
        );
      }
      throw new SentTransaction.Errors.SendResultOnly(
        `Transaction was sent to the network, but not yet awaited. No result to show. Await transaction completion with \`getTransaction(sendTransactionResponse.hash)\``,
      );
    }

    // 3. finally, if neither of those are present, throw an error
    throw new Error(
      `Sending transaction failed: ${JSON.stringify(this.assembled.signed)}`,
    );
  }
}

export abstract class Watcher {
  /**
   * Function to call after transaction has been submitted successfully to
   * the network for processing
   */
  abstract onSubmitted?(response?: Api.SendTransactionResponse): void;

  /**
   * Function to call every time the submitted transaction's status is
   * checked while awaiting its full inclusion in the ledger
   */
  abstract onProgress?(response?: Api.GetTransactionResponse): void;
}
