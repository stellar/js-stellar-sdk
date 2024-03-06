import type {
  ContractClientOptions,
  XDR_BASE64,
} from "./contract_client";
import {
  BASE_FEE,
  Contract,
  ContractSpec,
  Memo,
  MemoType,
  Operation,
  SorobanRpc,
  StrKey,
  Transaction,
  TransactionBuilder,
  authorizeEntry,
  hash,
  xdr,
} from ".";

type Tx = Transaction<Memo<MemoType>, Operation[]>;

type SendTx = SorobanRpc.Api.SendTransactionResponse;
type GetTx = SorobanRpc.Api.GetTransactionResponse;

export type MethodOptions = {
  /**
   * The fee to pay for the transaction. Default: BASE_FEE
   */
  fee?: number;
  /**
   * The maximum amount of time to wait for the transaction to complete. Default: {@link DEFAULT_TIMEOUT}
   */
  timeoutInSeconds?: number;

  /**
   * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
   */
  simulate?: boolean;
};

const DEFAULT_TIMEOUT = 10;

export type AssembledTransactionOptions<T = string> = MethodOptions &
  ContractClientOptions & {
    method: string;
    args?: any[];
    parseResultXdr: (xdr: xdr.ScVal) => T;
  };

export class AssembledTransaction<T> {
  /**
   * The TransactionBuilder as constructed in `{@link
   * AssembledTransaction}.build`. Feel free set `simulate: false` to modify
   * this object before calling `tx.simulate()` manually. Example:
   *
   * ```ts
   * const tx = await myContract.myMethod(
   *   { args: 'for', my: 'method', ... },
   *   { simulate: false }
   * );
   * tx.raw.addMemo(Memo.text('Nice memo, friend!'))
   * await tx.simulate();
   * ```
   */
  public raw?: TransactionBuilder;
  /**
   * The Transaction as it was built with `raw.build()` right before
   * simulation. Once this is set, modifying `raw` will have no effect unless
   * you call `tx.simulate()` again.
   */
  public built?: Tx;
  /**
   * The result of the transaction simulation. This is set after the first call
   * to `simulate`. It is difficult to serialize and deserialize, so it is not
   * included in the `toJSON` and `fromJSON` methods. See `simulationData`
   * cached, serializable access to the data needed by AssembledTransaction
   * logic.
   */
  public simulation?: SorobanRpc.Api.SimulateTransactionResponse;
  /**
   * Cached simulation result. This is set after the first call to
   * `simulationData`, and is used to facilitate serialization and
   * deserialization of the AssembledTransaction.
   */
  private simulationResult?: SorobanRpc.Api.SimulateHostFunctionResult;
  /**
   * Cached simulation transaction data. This is set after the first call to
   * `simulationData`, and is used to facilitate serialization and
   * deserialization of the AssembledTransaction.
   */
  private simulationTransactionData?: xdr.SorobanTransactionData;
  /**
   * The Soroban server to use for all RPC calls. This is constructed from the
   * `rpcUrl` in the options.
   */
  private server: SorobanRpc.Server;

  /**
   * A list of the most important errors that various AssembledTransaction
   * methods can throw. Feel free to catch specific errors in your application
   * logic.
   */
  static Errors = {
    ExpiredState: class ExpiredStateError extends Error {},
    NeedsMoreSignatures: class NeedsMoreSignaturesError extends Error {},
    NoSignatureNeeded: class NoSignatureNeededError extends Error {},
    NoUnsignedNonInvokerAuthEntries: class NoUnsignedNonInvokerAuthEntriesError extends Error {},
    NoSigner: class NoSignerError extends Error {},
    NotYetSimulated: class NotYetSimulatedError extends Error {},
    FakeAccount: class FakeAccountError extends Error {},
  }

  /**
   * Serialize the AssembledTransaction to a JSON string. This is useful for
   * saving the transaction to a database or sending it over the wire for
   * multi-auth workflows. `fromJSON` can be used to deserialize the
   * transaction. This only works with transactions that have been simulated.
   */
  toJSON() {
    return JSON.stringify({
      method: this.options.method,
      tx: this.built?.toXDR(),
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
    txn.built = TransactionBuilder.fromXDR(tx, options.networkPassphrase) as Tx
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
    this.options.simulate = this.options.simulate ?? true;
    this.server = new SorobanRpc.Server(this.options.rpcUrl, {
      allowHttp: this.options.allowHttp ?? false,
    });
  }

  static async build<T>(
    options: AssembledTransactionOptions<T>
  ): Promise<AssembledTransaction<T>> {
    const tx = new AssembledTransaction(options);
    const contract = new Contract(options.contractId);

    const account = await tx.server.getAccount(options.publicKey);

    tx.raw = new TransactionBuilder(account, {
      fee: options.fee?.toString(10) ?? BASE_FEE,
      networkPassphrase: options.networkPassphrase,
    })
      .addOperation(contract.call(options.method, ...(options.args ?? [])))
      .setTimeout(options.timeoutInSeconds ?? DEFAULT_TIMEOUT);

    if (options.simulate) await tx.simulate();

    return tx;
  }

  simulate = async (): Promise<this> => {
    if (!this.raw) {
      throw new Error(
        'Transaction has not yet been assembled; ' +
        'call `AssembledTransaction.build` first.'
      );
    }

    this.built = this.raw.build();
    this.simulation = await this.server.simulateTransaction(this.built);

    if (SorobanRpc.Api.isSimulationSuccess(this.simulation)) {
      this.built = SorobanRpc.assembleTransaction(
        this.built,
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
    const simulation = this.simulation!;
    if (!simulation) {
      throw new AssembledTransaction.Errors.NotYetSimulated("Transaction has not yet been simulated");
    }
    if (SorobanRpc.Api.isSimulationError(simulation)) {
      throw new Error(`Transaction simulation failed: "${simulation.error}"`);
    }

    if (SorobanRpc.Api.isSimulationRestore(simulation)) {
      throw new AssembledTransaction.Errors.ExpiredState(
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

  parseError(errorMessage: string) {
    if (!this.options.errorTypes) return undefined;
    const match = errorMessage.match(contractErrorPattern);
    if (!match) return undefined;
    let i = parseInt(match[1], 10);
    let err = this.options.errorTypes[i];
    if (!err) return undefined;
    const Err = ContractSpec.Result.Err;
    return new Err(err);
  }

  /**
   * Sign the transaction with the `wallet`, included previously. If you did
   * not previously include one, you need to include one now that at least
   * includes the `signTransaction` method. After signing, this method will
   * send the transaction to the network and return a `SentTransaction` that
   * keeps track of all the attempts to fetch the transaction.
   */
  signAndSend = async ({
    force = false,
    signTransaction = this.options.signTransaction,
  }: {
    /**
     * If `true`, sign and send the transaction even if it is a read call.
     */
    force?: boolean;
    /**
     * You must provide this here if you did not provide one before
     */
    signTransaction?: ContractClientOptions["signTransaction"];
  } = {}): Promise<SentTransaction<T>> => {
    if (!this.built) {
      throw new Error("Transaction has not yet been simulated");
    }

    if (!force && this.isReadCall) {
      throw new AssembledTransaction.Errors.NoSignatureNeeded(
        "This is a read call. It requires no signature or sending. " +
        "Use `force: true` to sign and send anyway."
      );
    }

    if (!signTransaction) {
      throw new AssembledTransaction.Errors.NoSigner(
        "You must provide a signTransaction function, either when calling " +
        "`signAndSend` or when initializing your ContractClient"
      );
    }

    if ((await this.needsNonInvokerSigningBy()).length) {
      throw new AssembledTransaction.Errors.NeedsMoreSignatures(
        "Transaction requires more signatures. " +
        "See `needsNonInvokerSigningBy` for details."
      );
    }

    const typeChecked: AssembledTransaction<T> = this
    return await SentTransaction.init(signTransaction, typeChecked);
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
    if (!this.built) {
      throw new Error("Transaction has not yet been simulated");
    }

    // We expect that any transaction constructed by these libraries has a
    // single operation, which is an InvokeHostFunction operation. The host
    // function being invoked is the contract method call.
    if (!("operations" in this.built)) {
      throw new Error(
        `Unexpected Transaction type; no operations: ${JSON.stringify(
          this.built
        )}`
      );
    }
    const rawInvokeHostFunctionOp = this.built
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
  signAuthEntries = async ({
    expiration = this.getStorageExpiration(),
    signAuthEntry = this.options.signAuthEntry,
    publicKey = this.options.publicKey,
  }: {
    /**
     * When to set each auth entry to expire. Could be any number of blocks in
     * the future. Can be supplied as a promise or a raw number. Default:
     * contract's current `persistent` storage expiration date/ledger
     * number/block.
     */
    expiration?: number | Promise<number> 
    /**
     * Sign all auth entries for this account. Default: the account that
     * constructed the transaction
     */
    publicKey?: string;
    /**
     * You must provide this here if you did not provide one before. Default:
     * the `signAuthEntry` function from the `ContractClient` options. Must
     * sign things as the given `publicKey`.
     */
    signAuthEntry?: ContractClientOptions["signAuthEntry"];
  } = {}): Promise<void> => {
    if (!this.built)
      throw new Error("Transaction has not yet been assembled or simulated");
    const needsNonInvokerSigningBy = await this.needsNonInvokerSigningBy();

    if (!needsNonInvokerSigningBy) {
      throw new AssembledTransaction.Errors.NoUnsignedNonInvokerAuthEntries(
        "No unsigned non-invoker auth entries; maybe you already signed?"
      );
    }
    if (needsNonInvokerSigningBy.indexOf(publicKey ?? '') === -1) {
      throw new AssembledTransaction.Errors.NoSignatureNeeded(
        `No auth entries for public key "${publicKey}"`
      );
    }
    if (!signAuthEntry) {
      throw new AssembledTransaction.Errors.NoSigner(
        'You must provide `signAuthEntry` when calling `signAuthEntries`, ' +
        'or when constructing the `ContractClient` or `AssembledTransaction`'
      );
    }

    const rawInvokeHostFunctionOp = this.built
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
            await signAuthEntry(preimage.toXDR("base64")),
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
  public getTransactionResponse?: GetTx;
  public getTransactionResponseAll?: GetTx[];

  static Errors = {
    SendFailed: class SendFailedError extends Error {},
    SendResultOnly: class SendResultOnlyError extends Error {},
  }

  constructor(
    public signTransaction: ContractClientOptions["signTransaction"],
    public assembled: AssembledTransaction<T>
  ) {
    if (!signTransaction) {
      throw new Error(
        "You must provide a `signTransaction` function to send a transaction"
      );
    }
    this.server = new SorobanRpc.Server(this.assembled.options.rpcUrl, {
      allowHttp: this.assembled.options.rpcUrl.startsWith("http://"),
    });
  }

  static init = async <T>(
    signTransaction: ContractClientOptions["signTransaction"],
    assembled: AssembledTransaction<T>,
  ): Promise<SentTransaction<T>> => {
    const tx = new SentTransaction(signTransaction, assembled);
    return await tx.send();
  };

  private send = async (): Promise<this> => {
    const timeoutInSeconds = this.assembled.options.timeoutInSeconds ?? DEFAULT_TIMEOUT

    const signature = await this.signTransaction!(
      // `signAndSend` checks for `this.built` before calling `SentTransaction.init`
      this.assembled.built!.toXDR(),
      {
        networkPassphrase: this.assembled.options.networkPassphrase,
      }
    );

    this.signed = TransactionBuilder.fromXDR(
      signature,
      this.assembled.options.networkPassphrase
    ) as Tx;

    this.sendTransactionResponse = await this.server.sendTransaction(this.signed);

    if (this.sendTransactionResponse.status !== "PENDING") {
      throw new SentTransaction.Errors.SendFailed(
        'Sending the transaction to the network failed!\n' +
          JSON.stringify(
            this.sendTransactionResponse,
            null,
            2
          )
      );
    }

    const { hash } = this.sendTransactionResponse;

    this.getTransactionResponseAll = await withExponentialBackoff(
      () => this.server.getTransaction(hash),
      (resp) => resp.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND,
      timeoutInSeconds
    );

    this.getTransactionResponse =
      this.getTransactionResponseAll[this.getTransactionResponseAll.length - 1];
    if (
      this.getTransactionResponse.status ===
      SorobanRpc.Api.GetTransactionStatus.NOT_FOUND
    ) {
      console.error(
        `Waited ${timeoutInSeconds} seconds for transaction to complete, but it did not. ` +
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
        return this.assembled.options.parseResultXdr(
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
        throw new SentTransaction.Errors.SendFailed(
          `Transaction simulation looked correct, but attempting to send the transaction failed. Check \`simulation\` and \`sendTransactionResponseAll\` to troubleshoot. Decoded \`sendTransactionResponse.errorResultXdr\`: ${errorResult}`
        );
      }
      throw new SentTransaction.Errors.SendResultOnly(
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
 * Keep calling a `fn` for `timeoutInSeconds` seconds, if `keepWaitingIf` is true.
 * Returns an array of all attempts to call the function.
 */
async function withExponentialBackoff<T>(
  fn: (previousFailure?: T) => Promise<T>,
  keepWaitingIf: (result: T) => boolean,
  timeoutInSeconds: number,
  exponentialFactor = 1.5,
  verbose = false
): Promise<T[]> {
  const attempts: T[] = [];

  let count = 0;
  attempts.push(await fn());
  if (!keepWaitingIf(attempts[attempts.length - 1])) return attempts;

  const waitUntil = new Date(Date.now() + timeoutInSeconds * 1000).valueOf();
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
          timeoutInSeconds * 1000
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
