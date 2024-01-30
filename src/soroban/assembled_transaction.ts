import type { ContractClientOptions, XDR_BASE64 } from ".";
import {
  Account,
  BASE_FEE,
  Contract,
  Operation,
  SorobanRpc,
  StrKey,
  TransactionBuilder,
  authorizeEntry,
  hash,
  xdr,
} from "..";
import type { Memo, MemoType, Transaction } from "..";

type Tx = Transaction<Memo<MemoType>, Operation[]>;

type SendTx = SorobanRpc.Api.SendTransactionResponse;
type GetTx = SorobanRpc.Api.GetTransactionResponse;

/**
 * Error interface containing the error message
 */
interface ErrorMessage {
  message: string;
}

interface Result<T, E extends ErrorMessage> {
  unwrap(): T;
  unwrapErr(): E;
  isOk(): boolean;
  isErr(): boolean;
}

class Ok<T> implements Result<T, never> {
  constructor(readonly value: T) {}
  unwrapErr(): never { throw new Error("No error") }
  unwrap() { return this.value }
  isOk() { return true }
  isErr() { return false }
}

class Err<E extends ErrorMessage> implements Result<never, E> {
  constructor(readonly error: E) {}
  unwrapErr() { return this.error }
  unwrap(): never { throw new Error(this.error.message) }
  isOk() { return false }
  isErr() { return true }
}

export type MethodOptions = {
  /**
   * The fee to pay for the transaction. Default: BASE_FEE
   */
  fee?: number;
  /**
   * The maximum amount of time to wait for the transaction to complete. Default: {@link DEFAULT_TIMEOUT}
   */
  timeoutInSeconds?: number;
};

const DEFAULT_TIMEOUT = 10;

export type AssembledTransactionOptions<T = string> = MethodOptions &
  ContractClientOptions & {
    method: string;
    args?: any[];
    parseResultXdr: (xdr: xdr.ScVal) => T;
  };

export const NULL_ACCOUNT =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

export class AssembledTransaction<T> {
  public raw?: Tx;
  private simulation?: SorobanRpc.Api.SimulateTransactionResponse;
  private simulationResult?: SorobanRpc.Api.SimulateHostFunctionResult;
  private simulationTransactionData?: xdr.SorobanTransactionData;
  private server: SorobanRpc.Server;

  static ExpiredStateError = class ExpiredStateError extends Error {}
  static NeedsMoreSignaturesError = class NeedsMoreSignaturesError extends Error {}
  static WalletDisconnectedError = class WalletDisconnectedError extends Error {}
  static SendResultOnlyError = class SendResultOnlyError extends Error {}
  static SendFailedError = class SendFailedError extends Error {}
  static NoUnsignedNonInvokerAuthEntriesError = class NoUnsignedNonInvokerAuthEntriesError extends Error {}

  /**
   * A minimal implementation of Rust's `Result` type. Used for contract methods that return Results, to maintain their distinction from methods that simply either return a value or throw.
   */
  static Result = {
    /**
     * A minimal implementation of Rust's `Ok` Result type. Used for contract methods that return successful Results, to maintain their distinction from methods that simply either return a value or throw.
     */
    Ok,
    /**
     * A minimal implementation of Rust's `Err` Result type. Used for contract methods that return unsuccessful Results, to maintain their distinction from methods that simply either return a value or throw.
     */
    Err
  }

  toJSON() {
    return JSON.stringify({
      method: this.options.method,
      tx: this.raw?.toXDR(),
      simulationResult: {
        auth: this.simulationData.result.auth.map((a) => a.toXDR("base64")),
        retval: this.simulationData.result.retval.toXDR("base64"),
      },
      simulationTransactionData:
        this.simulationData.transactionData.toXDR("base64"),
    });
  }

  static fromJSON<T>(
    options: Omit<AssembledTransactionOptions<T>, "args">,
    {
      tx,
      simulationResult,
      simulationTransactionData,
    }: {
      tx: XDR_BASE64;
      simulationResult: {
        auth: XDR_BASE64[];
        retval: XDR_BASE64;
      };
      simulationTransactionData: XDR_BASE64;
    }
  ): AssembledTransaction<T> {
    const txn = new AssembledTransaction(options);
    txn.raw = TransactionBuilder.fromXDR(tx, options.networkPassphrase) as Tx;
    txn.simulationResult = {
      auth: simulationResult.auth.map((a) =>
        xdr.SorobanAuthorizationEntry.fromXDR(a, "base64")
      ),
      retval: xdr.ScVal.fromXDR(simulationResult.retval, "base64"),
    };
    txn.simulationTransactionData = xdr.SorobanTransactionData.fromXDR(
      simulationTransactionData,
      "base64"
    );
    return txn;
  }

  private constructor(public options: AssembledTransactionOptions<T>) {
    this.server = new SorobanRpc.Server(this.options.rpcUrl, {
      allowHttp: this.options.rpcUrl.startsWith("http://"),
    });
  }

  static async fromSimulation<T>(
    options: AssembledTransactionOptions<T>
  ): Promise<AssembledTransaction<T>> {
    const tx = new AssembledTransaction(options);
    const contract = new Contract(options.contractId);

    tx.raw = new TransactionBuilder(await tx.getAccount(), {
      fee: options.fee?.toString(10) ?? BASE_FEE,
      networkPassphrase: options.networkPassphrase,
    })
      .addOperation(contract.call(options.method, ...(options.args ?? [])))
      .setTimeout(options.timeoutInSeconds ?? DEFAULT_TIMEOUT)
      .build();

    return await tx.simulate();
  }

  simulate = async (): Promise<this> => {
    if (!this.raw) throw new Error("Transaction has not yet been assembled");
    this.simulation = await this.server.simulateTransaction(this.raw);

    if (SorobanRpc.Api.isSimulationSuccess(this.simulation)) {
      this.raw = SorobanRpc.assembleTransaction(
        this.raw,
        this.simulation
      ).build();
    }

    return this;
  };

  get simulationData(): {
    result: SorobanRpc.Api.SimulateHostFunctionResult;
    transactionData: xdr.SorobanTransactionData;
  } {
    if (this.simulationResult && this.simulationTransactionData) {
      return {
        result: this.simulationResult,
        transactionData: this.simulationTransactionData,
      };
    }
    // else, we know we just did the simulation on this machine
    const simulation = this.simulation!;
    if (SorobanRpc.Api.isSimulationError(simulation)) {
      throw new Error(`Transaction simulation failed: "${simulation.error}"`);
    }

    if (SorobanRpc.Api.isSimulationRestore(simulation)) {
      throw new AssembledTransaction.ExpiredStateError(
        `You need to restore some contract state before you can invoke this method. ${JSON.stringify(
          simulation,
          null,
          2
        )}`
      );
    }

    if (!simulation.result) {
      throw new Error(
        `Expected an invocation simulation, but got no 'result' field. Simulation: ${JSON.stringify(
          simulation,
          null,
          2
        )}`
      );
    }

    // add to object for serialization & deserialization
    this.simulationResult = simulation.result;
    this.simulationTransactionData = simulation.transactionData.build();

    return {
      result: this.simulationResult,
      transactionData: this.simulationTransactionData!,
    };
  }

  get result(): T {
    try {
      return this.options.parseResultXdr(this.simulationData.result.retval);
    } catch (e) {
      if (!implementsToString(e)) throw e;
      let err = this.parseError(e.toString());
      if (err) return err as T;
      throw e;
    }
  }

  parseError(errorMessage: string): Result<never, ErrorMessage> | undefined {
    if (!this.options.errorTypes) return undefined;
    const match = errorMessage.match(contractErrorPattern);
    if (!match) return undefined;
    let i = parseInt(match[1], 10);
    let err = this.options.errorTypes[i];
    if (!err) return undefined;
    return new AssembledTransaction.Result.Err(err);
  }

  getPublicKey = async (): Promise<string | undefined> => {
    const wallet = this.options.wallet;
    if (!(await wallet.isConnected()) || !(await wallet.isAllowed())) {
      return undefined;
    }
    return (await wallet.getUserInfo()).publicKey;
  };

  /**
   * Get account details from the Soroban network for the publicKey currently
   * selected in user's wallet. If not connected to Freighter, use placeholder
   * null account.
   */
  getAccount = async (): Promise<Account> => {
    const publicKey = await this.getPublicKey();
    return publicKey
      ? await this.server.getAccount(publicKey)
      : new Account(NULL_ACCOUNT, "0");
  };

  /**
   * Sign the transaction with the `wallet` (default Freighter), then send to
   * the network and return a `SentTransaction` that keeps track of all the
   * attempts to send and fetch the transaction from the network.
   */
  signAndSend = async ({
    secondsToWait = 10,
    force = false,
  }: {
    /**
     * Wait `secondsToWait` seconds (default: 10) for both the transaction to SEND successfully (will keep trying if the server returns `TRY_AGAIN_LATER`), as well as for the transaction to COMPLETE (will keep checking if the server returns `PENDING`).
     */
    secondsToWait?: number;
    /**
     * If `true`, sign and send the transaction even if it is a read call.
     */
    force?: boolean;
  } = {}): Promise<SentTransaction<T>> => {
    if (!this.raw) {
      throw new Error("Transaction has not yet been simulated");
    }

    if (!force && this.isReadCall) {
      throw new Error(
        "This is a read call. It requires no signature or sending. Use `force: true` to sign and send anyway."
      );
    }

    if (!(await this.hasRealInvoker())) {
      throw new AssembledTransaction.WalletDisconnectedError("Wallet is not connected");
    }

    if (this.raw.source !== (await this.getAccount()).accountId()) {
      throw new Error(
        `You must submit the transaction with the account that originally created it. Please switch to the wallet with "${this.raw.source}" as its public key.`
      );
    }

    if ((await this.needsNonInvokerSigningBy()).length) {
      throw new AssembledTransaction.NeedsMoreSignaturesError(
        "Transaction requires more signatures. See `needsNonInvokerSigningBy` for details."
      );
    }

    return await SentTransaction.init(this.options, this, secondsToWait);
  };

  getStorageExpiration = async () => {
    const entryRes = await this.server.getLedgerEntries(
      new Contract(this.options.contractId).getFootprint()
    );
    if (
      !entryRes.entries ||
      !entryRes.entries.length ||
      !entryRes.entries[0].liveUntilLedgerSeq
    )
      throw new Error("failed to get ledger entry");
    return entryRes.entries[0].liveUntilLedgerSeq;
  };

  /**
   * Get a list of accounts, other than the invoker of the simulation, that
   * need to sign auth entries in this transaction.
   *
   * Soroban allows multiple people to sign a transaction. Someone needs to
   * sign the final transaction envelope; this person/account is called the
   * _invoker_, or _source_. Other accounts might need to sign individual auth
   * entries in the transaction, if they're not also the invoker.
   *
   * This function returns a list of accounts that need to sign auth entries,
   * assuming that the same invoker/source account will sign the final
   * transaction envelope as signed the initial simulation.
   *
   * One at a time, for each public key in this array, you will need to
   * serialize this transaction with `toJSON`, send to the owner of that key,
   * deserialize the transaction with `txFromJson`, and call
   * {@link signAuthEntries}. Then re-serialize and send to the next account
   * in this list.
   */
  needsNonInvokerSigningBy = async ({
    includeAlreadySigned = false,
  }: {
    /**
     * Whether or not to include auth entries that have already been signed. Default: false
     */
    includeAlreadySigned?: boolean;
  } = {}): Promise<string[]> => {
    if (!this.raw) {
      throw new Error("Transaction has not yet been simulated");
    }

    // We expect that any transaction constructed by these libraries has a
    // single operation, which is an InvokeHostFunction operation. The host
    // function being invoked is the contract method call.
    if (!("operations" in this.raw)) {
      throw new Error(
        `Unexpected Transaction type; no operations: ${JSON.stringify(
          this.raw
        )}`
      );
    }
    const rawInvokeHostFunctionOp = this.raw
      .operations[0] as Operation.InvokeHostFunction;

    return [
      ...new Set(
        (rawInvokeHostFunctionOp.auth ?? [])
          .filter(
            (entry) =>
              entry.credentials().switch() ===
                xdr.SorobanCredentialsType.sorobanCredentialsAddress() &&
              (includeAlreadySigned ||
                entry.credentials().address().signature().switch().name ===
                  "scvVoid")
          )
          .map((entry) =>
            StrKey.encodeEd25519PublicKey(
              entry.credentials().address().address().accountId().ed25519()
            )
          )
      ),
    ];
  };

  preImageFor(
    entry: xdr.SorobanAuthorizationEntry,
    signatureExpirationLedger: number
  ): xdr.HashIdPreimage {
    const addrAuth = entry.credentials().address();
    return xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
      new xdr.HashIdPreimageSorobanAuthorization({
        networkId: hash(Buffer.from(this.options.networkPassphrase)),
        nonce: addrAuth.nonce(),
        invocation: entry.rootInvocation(),
        signatureExpirationLedger,
      })
    );
  }

  /**
   * If {@link needsNonInvokerSigningBy} returns a non-empty list, you can serialize
   * the transaction with `toJSON`, send it to the owner of one of the public keys
   * in the map, deserialize with `txFromJSON`, and call this method on their
   * machine. Internally, this will use `signAuthEntry` function from connected
   * `wallet` for each.
   *
   * Then, re-serialize the transaction and either send to the next
   * `needsNonInvokerSigningBy` owner, or send it back to the original account
   * who simulated the transaction so they can {@link sign} the transaction
   * envelope and {@link send} it to the network.
   *
   * Sending to all `needsNonInvokerSigningBy` owners in parallel is not currently
   * supported!
   */
  signAuthEntries = async (
    /**
     * When to set each auth entry to expire. Could be any number of blocks in
     * the future. Can be supplied as a promise or a raw number. Default:
     * contract's current `persistent` storage expiration date/ledger
     * number/block.
     */
    expiration: number | Promise<number> = this.getStorageExpiration()
  ): Promise<void> => {
    if (!this.raw)
      throw new Error("Transaction has not yet been assembled or simulated");
    const needsNonInvokerSigningBy = await this.needsNonInvokerSigningBy();

    if (!needsNonInvokerSigningBy)
      throw new AssembledTransaction.NoUnsignedNonInvokerAuthEntriesError(
        "No unsigned non-invoker auth entries; maybe you already signed?"
      );
    const publicKey = await this.getPublicKey();
    if (!publicKey)
      throw new Error(
        "Could not get public key from wallet; maybe not signed in?"
      );
    if (needsNonInvokerSigningBy.indexOf(publicKey) === -1)
      throw new Error(`No auth entries for public key "${publicKey}"`);
    const wallet = this.options.wallet;

    const rawInvokeHostFunctionOp = this.raw
      .operations[0] as Operation.InvokeHostFunction;

    const authEntries = rawInvokeHostFunctionOp.auth ?? [];

    for (const [i, entry] of authEntries.entries()) {
      if (
        entry.credentials().switch() !==
        xdr.SorobanCredentialsType.sorobanCredentialsAddress()
      ) {
        // if the invoker/source account, then the entry doesn't need explicit
        // signature, since the tx envelope is already signed by the source
        // account, so only check for sorobanCredentialsAddress
        continue;
      }
      const pk = StrKey.encodeEd25519PublicKey(
        entry.credentials().address().address().accountId().ed25519()
      );

      // this auth entry needs to be signed by a different account
      // (or maybe already was!)
      if (pk !== publicKey) continue;

      authEntries[i] = await authorizeEntry(
        entry,
        async (preimage) =>
          Buffer.from(
            await wallet.signAuthEntry(preimage.toXDR("base64")),
            "base64"
          ),
        await expiration,
        this.options.networkPassphrase
      );
    }
  };

  get isReadCall(): boolean {
    const authsCount = this.simulationData.result.auth.length;
    const writeLength = this.simulationData.transactionData
      .resources()
      .footprint()
      .readWrite().length;
    return authsCount === 0 && writeLength === 0;
  }

  hasRealInvoker = async (): Promise<boolean> => {
    const account = await this.getAccount();
    return account.accountId() !== NULL_ACCOUNT;
  };
}

/**
 * A transaction that has been sent to the Soroban network. This happens in two steps:
 *
 * 1. `sendTransaction`: initial submission of the transaction to the network.
 *    This step can run into problems, and will be retried with exponential
 *    backoff if it does. See all attempts in `sendTransactionResponseAll` and the
 *    most recent attempt in `sendTransactionResponse`.
 * 2. `getTransaction`: once the transaction has been submitted to the network
 *    successfully, you need to wait for it to finalize to get the results of the
 *    transaction. This step can also run into problems, and will be retried with
 *    exponential backoff if it does. See all attempts in
 *    `getTransactionResponseAll` and the most recent attempt in
 *    `getTransactionResponse`.
 */
class SentTransaction<T> {
  public server: SorobanRpc.Server;
  public signed?: Tx;
  public sendTransactionResponse?: SendTx;
  public sendTransactionResponseAll?: SendTx[];
  public getTransactionResponse?: GetTx;
  public getTransactionResponseAll?: GetTx[];

  constructor(
    public options: AssembledTransactionOptions<T>,
    public assembled: AssembledTransaction<T>
  ) {
    this.server = new SorobanRpc.Server(this.options.rpcUrl, {
      allowHttp: this.options.rpcUrl.startsWith("http://"),
    });
    this.assembled = assembled;
  }

  static init = async <T>(
    options: AssembledTransactionOptions<T>,
    assembled: AssembledTransaction<T>,
    secondsToWait: number = 10
  ): Promise<SentTransaction<T>> => {
    const tx = new SentTransaction(options, assembled);
    return await tx.send(secondsToWait);
  };

  private send = async (secondsToWait: number = 10): Promise<this> => {
    const wallet = this.assembled.options.wallet;

    this.sendTransactionResponseAll = await withExponentialBackoff(
      async (previousFailure) => {
        if (previousFailure) {
          // Increment transaction sequence number and resimulate before trying again

          // Soroban transaction can only have 1 operation
          const op = this.assembled.raw!
            .operations[0] as Operation.InvokeHostFunction;

          this.assembled.raw = new TransactionBuilder(
            await this.assembled.getAccount(),
            {
              fee: this.assembled.raw!.fee,
              networkPassphrase: this.options.networkPassphrase,
            }
          )
            .setTimeout(this.assembled.options.timeoutInSeconds ?? DEFAULT_TIMEOUT)
            .addOperation(
              Operation.invokeHostFunction({ ...op, auth: op.auth ?? [] })
            )
            .build();

          await this.assembled.simulate();
        }

        const signature = await wallet.signTransaction(
          this.assembled.raw!.toXDR(),
          {
            networkPassphrase: this.options.networkPassphrase,
          }
        );

        this.signed = TransactionBuilder.fromXDR(
          signature,
          this.options.networkPassphrase
        ) as Tx;

        return this.server.sendTransaction(this.signed);
      },
      (resp) => resp.status !== "PENDING",
      secondsToWait
    );

    this.sendTransactionResponse =
      this.sendTransactionResponseAll[
        this.sendTransactionResponseAll.length - 1
      ];

    if (this.sendTransactionResponse.status !== "PENDING") {
      throw new Error(
        `Tried to resubmit transaction for ${secondsToWait} seconds, but it's still failing. ` +
          `All attempts: ${JSON.stringify(
            this.sendTransactionResponseAll,
            null,
            2
          )}`
      );
    }

    const { hash } = this.sendTransactionResponse;

    this.getTransactionResponseAll = await withExponentialBackoff(
      () => this.server.getTransaction(hash),
      (resp) => resp.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND,
      secondsToWait
    );

    this.getTransactionResponse =
      this.getTransactionResponseAll[this.getTransactionResponseAll.length - 1];
    if (
      this.getTransactionResponse.status ===
      SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
    ) {
      console.error(
        `Waited ${secondsToWait} seconds for transaction to complete, but it did not. ` +
          `Returning anyway. Check the transaction status manually. ` +
          `Sent transaction: ${JSON.stringify(
            this.sendTransactionResponse,
            null,
            2
          )}\n` +
          `All attempts to get the result: ${JSON.stringify(
            this.getTransactionResponseAll,
            null,
            2
          )}`
      );
    }

    return this;
  };

  get result(): T {
    // 1. check if transaction was submitted and awaited with `getTransaction`
    if ("getTransactionResponse" in this && this.getTransactionResponse) {
      // getTransactionResponse has a `returnValue` field unless it failed
      if ("returnValue" in this.getTransactionResponse) {
        return this.options.parseResultXdr(
          this.getTransactionResponse.returnValue!
        );
      }

      // if "returnValue" not present, the transaction failed; return without parsing the result
      throw new Error("Transaction failed! Cannot parse result.");
    }

    // 2. otherwise, maybe it was merely sent with `sendTransaction`
    if (this.sendTransactionResponse) {
      const errorResult = this.sendTransactionResponse.errorResult?.result();
      if (errorResult) {
        throw new AssembledTransaction.SendFailedError(
          `Transaction simulation looked correct, but attempting to send the transaction failed. Check \`simulation\` and \`sendTransactionResponseAll\` to troubleshoot. Decoded \`sendTransactionResponse.errorResultXdr\`: ${errorResult}`
        );
      }
      throw new AssembledTransaction.SendResultOnlyError(
        `Transaction was sent to the network, but not yet awaited. No result to show. Await transaction completion with \`getTransaction(sendTransactionResponse.hash)\``
      );
    }

    // 3. finally, if neither of those are present, throw an error
    throw new Error(
      `Sending transaction failed: ${JSON.stringify(this.assembled)}`
    );
  }
}

/**
 * Keep calling a `fn` for `secondsToWait` seconds, if `keepWaitingIf` is true.
 * Returns an array of all attempts to call the function.
 */
async function withExponentialBackoff<T>(
  fn: (previousFailure?: T) => Promise<T>,
  keepWaitingIf: (result: T) => boolean,
  secondsToWait: number,
  exponentialFactor = 1.5,
  verbose = false
): Promise<T[]> {
  const attempts: T[] = [];

  let count = 0;
  attempts.push(await fn());
  if (!keepWaitingIf(attempts[attempts.length - 1])) return attempts;

  const waitUntil = new Date(Date.now() + secondsToWait * 1000).valueOf();
  let waitTime = 1000;
  let totalWaitTime = waitTime;

  while (
    Date.now() < waitUntil &&
    keepWaitingIf(attempts[attempts.length - 1])
  ) {
    count++;
    // Wait a beat
    if (verbose) {
      console.info(
        `Waiting ${waitTime}ms before trying again (bringing the total wait time to ${totalWaitTime}ms so far, of total ${
          secondsToWait * 1000
        }ms)`
      );
    }
    await new Promise((res) => setTimeout(res, waitTime));
    // Exponential backoff
    waitTime = waitTime * exponentialFactor;
    if (new Date(Date.now() + waitTime).valueOf() > waitUntil) {
      waitTime = waitUntil - Date.now();
      if (verbose) {
        console.info(`was gonna wait too long; new waitTime: ${waitTime}ms`);
      }
    }
    totalWaitTime = waitTime + totalWaitTime;
    // Try again
    attempts.push(await fn(attempts[attempts.length - 1]));
    if (verbose && keepWaitingIf(attempts[attempts.length - 1])) {
      console.info(
        `${count}. Called ${fn}; ${
          attempts.length
        } prev attempts. Most recent: ${JSON.stringify(
          attempts[attempts.length - 1],
          null,
          2
        )}`
      );
    }
  }

  return attempts;
}

const contractErrorPattern = /Error\(Contract, #(\d+)\)/;

function implementsToString(obj: unknown): obj is { toString(): string } {
  return typeof obj === "object" && obj !== null && "toString" in obj;
}
