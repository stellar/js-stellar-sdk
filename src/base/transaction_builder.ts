import { Hyper } from "@stellar/js-xdr";
import BigNumber from "./util/bignumber.js";

import xdr from "./xdr.js";

import { Account } from "./account.js";
import { MuxedAccount } from "./muxed_account.js";
import {
  decodeAddressToMuxedAccount,
  extractBaseAddress,
} from "./util/decode_encode_muxed_account.js";

import { Transaction } from "./transaction.js";
import { FeeBumpTransaction } from "./fee_bump_transaction.js";
import { SorobanDataBuilder } from "./sorobandata_builder.js";

import { StrKey } from "./strkey.js";
import { SignerKey } from "./signerkey.js";
import { Memo } from "./memo.js";
import { Asset } from "./asset.js";
import { nativeToScVal } from "./scval.js";
import { Operation } from "./operation.js";
import { Address } from "./address.js";
import { Keypair } from "./keypair.js";

const HYPER_MAX_VALUE = Hyper.MAX_VALUE as unknown as bigint;
const UINT32_MAX = 4294967295; // 2^32 - 1

/**
 * Minimum base fee for transactions. If this fee is below the network
 * minimum, the transaction will fail. The more operations in the
 * transaction, the greater the required fee. Use {@link
 * Server#fetchBaseFee} to get an accurate value of minimum transaction
 * fee on the network.
 *
 * @see [Fees](https://developers.stellar.org/docs/glossary/fees/)
 */
export const BASE_FEE = "100"; // Stroops

/**
 * @see {@link TransactionBuilder#setTimeout}
 * @see [Timeout](https://developers.stellar.org/api/resources/transactions/post/)
 */
export const TimeoutInfinite = 0;

/**
 * Soroban fee parameters for resource-limited transactions.
 */
export interface SorobanFees {
  /** The number of instructions executed by the transaction. */
  instructions: number;
  /** The number of bytes read from the ledger by the transaction. */
  readBytes: number;
  /** The number of bytes written to the ledger by the transaction. */
  writeBytes: number;
  /** The fee to be paid for the transaction, in stroops. */
  resourceFee: bigint;
}

/**
 * Options for constructing a {@link TransactionBuilder}.
 */
export interface TransactionBuilderOptions {
  /** Max fee you're willing to pay per operation in this transaction (**in stroops**). */
  fee: string;
  /** Memo for the transaction. */
  memo?: Memo;
  /**
   * Passphrase of the target Stellar network (e.g. "Public Global Stellar
   * Network ; September 2015" for the pubnet).
   */
  networkPassphrase?: string;
  /** Timebounds for the validity of this transaction. */
  timebounds?: {
    /** 64-bit UNIX timestamp or Date object. */
    minTime?: Date | number | string;
    /** 64-bit UNIX timestamp or Date object. */
    maxTime?: Date | number | string;
  };
  /** Ledger bounds for the validity of this transaction. */
  ledgerbounds?: {
    /** Number of the minimum ledger sequence. */
    minLedger?: number;
    /** Number of the maximum ledger sequence. */
    maxLedger?: number;
  };
  /** Minimum source account sequence number this transaction is valid for. */
  minAccountSequence?: string;
  /** Minimum seconds between source account sequence time and ledger time. */
  minAccountSequenceAge?: bigint;
  /** Minimum ledgers between source account sequence and current ledger. */
  minAccountSequenceLedgerGap?: number;
  /** List of extra signers required for this transaction. */
  extraSigners?: string[];
  /**
   * An instance of {@link xdr.SorobanTransactionData} or a base64 string.
   * Provides resource estimations for Soroban transactions. Has no effect on
   * non-contract transactions.
   */
  sorobanData?: xdr.SorobanTransactionData | string;
}

/**
 * <p>Transaction builder helps constructs a new `{@link Transaction}` using the
 * given {@link Account} as the transaction's "source account". The transaction
 * will use the current sequence number of the given account as its sequence
 * number and increment the given account's sequence number by one. The given
 * source account must include a private key for signing the transaction or an
 * error will be thrown.</p>
 *
 * <p>Operations can be added to the transaction via their corresponding builder
 * methods, and each returns the TransactionBuilder object so they can be
 * chained together. After adding the desired operations, call the `build()`
 * method on the `TransactionBuilder` to return a fully constructed `{@link
 * Transaction}` that can be signed. The returned transaction will contain the
 * sequence number of the source account and include the signature from the
 * source account.</p>
 *
 * <p><strong>Be careful about unsubmitted transactions!</strong> When you build
 * a transaction, `stellar-sdk` automatically increments the source account's
 * sequence number. If you end up not submitting this transaction and submitting
 * another one instead, it'll fail due to the sequence number being wrong. So if
 * you decide not to use a built transaction, make sure to update the source
 * account's sequence number with
 * [Server.loadAccount](https://stellar.github.io/js-stellar-sdk/Server.html#loadAccount)
 * before creating another transaction.</p>
 *
 * <p>The following code example creates a new transaction with {@link
 * Operation.createAccount} and {@link Operation.payment} operations. The
 * Transaction's source account first funds `destinationA`, then sends a payment
 * to `destinationB`. The built transaction is then signed by
 * `sourceKeypair`.</p>
 *
 * ```
 * var transaction = new TransactionBuilder(source, { fee, networkPassphrase: Networks.TESTNET })
 * .addOperation(Operation.createAccount({
 *     destination: destinationA,
 *     startingBalance: "20"
 * })) // <- funds and creates destinationA
 * .addOperation(Operation.payment({
 *     destination: destinationB,
 *     amount: "100",
 *     asset: Asset.native()
 * })) // <- sends 100 XLM to destinationB
 * .setTimeout(30)
 * .build();
 *
 * transaction.sign(sourceKeypair);
 * ```
 *
 */
export class TransactionBuilder {
  source: Account | MuxedAccount;
  operations: xdr.Operation[];
  baseFee: string;
  timebounds: {
    minTime?: Date | number | string;
    maxTime?: Date | number | string;
  } | null;
  ledgerbounds: { minLedger?: number; maxLedger?: number } | null;
  minAccountSequence: string | null;
  minAccountSequenceAge: bigint | null;
  minAccountSequenceLedgerGap: number | null;
  extraSigners: string[] | null;
  memo: Memo;
  networkPassphrase: string | null;
  sorobanData: xdr.SorobanTransactionData | null;

  /**
   * @param sourceAccount - source account for this transaction
   * @param opts - options object (see {@link TransactionBuilderOptions})
   */
  constructor(
    sourceAccount: Account | MuxedAccount,
    opts: TransactionBuilderOptions = {} as TransactionBuilderOptions,
  ) {
    if (!sourceAccount) {
      throw new Error("must specify source account for the transaction");
    }

    if (opts.fee === undefined) {
      throw new Error("must specify fee for the transaction (in stroops)");
    }

    this.source = sourceAccount;
    this.operations = [];

    this.baseFee = opts.fee;
    if (opts.timebounds) {
      const minTime = toEpochSeconds(opts.timebounds.minTime);
      const maxTime = toEpochSeconds(opts.timebounds.maxTime);

      if (minTime !== undefined && minTime < 0) {
        throw new Error("min_time cannot be negative");
      }

      if (maxTime !== undefined && maxTime < 0) {
        throw new Error("max_time cannot be negative");
      }

      if (
        minTime !== undefined &&
        maxTime !== undefined &&
        maxTime > 0 &&
        minTime > maxTime
      ) {
        throw new Error("min_time cannot be greater than max_time");
      }

      this.timebounds = { ...opts.timebounds };
    } else {
      this.timebounds = null;
    }

    if (opts.ledgerbounds) {
      const minLedger = opts.ledgerbounds.minLedger;
      const maxLedger = opts.ledgerbounds.maxLedger;

      if (minLedger !== undefined && minLedger < 0) {
        throw new Error("min_ledger cannot be negative");
      }

      if (maxLedger !== undefined && maxLedger < 0) {
        throw new Error("max_ledger cannot be negative");
      }

      if (
        minLedger !== undefined &&
        maxLedger !== undefined &&
        maxLedger > 0 &&
        minLedger > maxLedger
      ) {
        throw new Error("min_ledger cannot be greater than max_ledger");
      }

      this.ledgerbounds = { ...opts.ledgerbounds };
    } else {
      this.ledgerbounds = null;
    }
    this.minAccountSequence = opts.minAccountSequence || null;
    this.minAccountSequenceAge =
      opts.minAccountSequenceAge !== undefined
        ? opts.minAccountSequenceAge
        : null;
    this.minAccountSequenceLedgerGap =
      opts.minAccountSequenceLedgerGap !== undefined
        ? opts.minAccountSequenceLedgerGap
        : null;
    this.extraSigners = opts.extraSigners ? [...opts.extraSigners] : null;
    this.memo = opts.memo || Memo.none();
    this.networkPassphrase = opts.networkPassphrase || null;

    this.sorobanData = opts.sorobanData
      ? new SorobanDataBuilder(opts.sorobanData).build()
      : null;
  }

  /**
   * Creates a builder instance using an existing {@link Transaction} as a
   * template, ignoring any existing envelope signatures.
   *
   * Note that the sequence number WILL be cloned, so EITHER this transaction or
   * the one it was cloned from will be valid. This is useful in situations
   * where you are constructing a transaction in pieces and need to make
   * adjustments as you go (for example, when filling out Soroban resource
   * information).
   *
   * @param tx - a "template" transaction to clone exactly
   * @param opts - additional options to override the clone, e.g.
   *    {fee: '1000'} will override the existing base fee derived from `tx` (see
   *    the {@link TransactionBuilder} constructor for detailed options)
   *
   * @warning This does not clone the transaction's
   *    {@link xdr.SorobanTransactionData} (if applicable), use
   *    {@link SorobanDataBuilder} and {@link TransactionBuilder.setSorobanData}
   *    as needed, instead..
   *
   * @todo This cannot clone {@link FeeBumpTransaction}s, yet.
   */
  static cloneFrom(
    tx: Transaction,
    opts: Partial<TransactionBuilderOptions> = {},
  ): TransactionBuilder {
    if (!(tx instanceof Transaction)) {
      throw new TypeError(`expected a 'Transaction', got: ${String(tx)}`);
    }

    const sequenceNum = (BigInt(tx.sequence) - 1n).toString();

    let source;

    // rebuild the source account based on the strkey
    if (StrKey.isValidMed25519PublicKey(tx.source)) {
      source = MuxedAccount.fromAddress(tx.source, sequenceNum);
    } else if (StrKey.isValidEd25519PublicKey(tx.source)) {
      source = new Account(tx.source, sequenceNum);
    } else {
      throw new TypeError(`unsupported tx source account: ${tx.source}`);
    }

    if (tx.operations.length === 0) {
      throw new Error(
        "cannot clone a transaction with no operations: " +
          "per-operation base fee cannot be determined",
      );
    }

    // the initial fee passed to the builder gets scaled up based on the number
    // of operations at the end, so we have to down-scale first
    const unscaledFee = Math.floor(parseInt(tx.fee, 10) / tx.operations.length);

    const builderOpts: TransactionBuilderOptions = {
      fee: (unscaledFee || BASE_FEE).toString(),
      memo: tx.memo,
      networkPassphrase: tx.networkPassphrase,
    };

    if (tx.timeBounds) {
      builderOpts.timebounds = tx.timeBounds;
    }
    if (tx.ledgerBounds) {
      builderOpts.ledgerbounds = tx.ledgerBounds;
    }
    if (tx.minAccountSequence) {
      builderOpts.minAccountSequence = tx.minAccountSequence;
    }
    if (tx.minAccountSequenceAge !== undefined) {
      builderOpts.minAccountSequenceAge = tx.minAccountSequenceAge;
    }
    if (tx.minAccountSequenceLedgerGap !== undefined) {
      builderOpts.minAccountSequenceLedgerGap = tx.minAccountSequenceLedgerGap;
    }
    if (tx.extraSigners) {
      builderOpts.extraSigners = tx.extraSigners.map((s) =>
        SignerKey.encodeSignerKey(s),
      );
    }

    // User-provided opts override transaction defaults
    Object.assign(builderOpts, opts);

    const builder = new TransactionBuilder(source, builderOpts);

    tx.tx.operations().forEach((op) => builder.addOperation(op));

    return builder;
  }

  /**
   * Adds an operation to the transaction.
   *
   * @param operation - The xdr operation object, use {@link
   *     Operation} static methods.
   */
  addOperation(operation: xdr.Operation): TransactionBuilder {
    this.operations.push(operation);
    return this;
  }

  /**
   * Adds an operation to the transaction at a specific index.
   *
   * @param operation - The xdr operation object to add, use {@link Operation} static methods.
   * @param index - The index at which to insert the operation.
   */
  addOperationAt(operation: xdr.Operation, index: number): TransactionBuilder {
    this.operations.splice(index, 0, operation);
    return this;
  }

  /**
   * Removes the operations from the builder (useful when cloning).
   */
  clearOperations(): TransactionBuilder {
    this.operations = [];
    return this;
  }

  /**
   * Removes the operation at the specified index from the transaction.
   *
   * @param index - The index of the operation to remove.
   */
  clearOperationAt(index: number): TransactionBuilder {
    this.operations.splice(index, 1);
    return this;
  }

  /**
   * Adds a memo to the transaction.
   * @param memo - {@link Memo} object
   */
  addMemo(memo: Memo): TransactionBuilder {
    this.memo = memo;
    return this;
  }

  /**
   * Sets a timeout precondition on the transaction.
   *
   *  Because of the distributed nature of the Stellar network it is possible
   *  that the status of your transaction will be determined after a long time
   *  if the network is highly congested. If you want to be sure to receive the
   *  status of the transaction within a given period you should set the {@link
   *  TimeBounds} with `maxTime` on the transaction (this is what `setTimeout`
   *  does internally; if there's `minTime` set but no `maxTime` it will be
   *  added).
   *
   *  A call to `TransactionBuilder.setTimeout` is **required** if Transaction
   *  does not have `max_time` set. If you don't want to set timeout, use
   *  `{@link TimeoutInfinite}`. In general you should set `{@link
   *  TimeoutInfinite}` only in smart contracts.
   *
   *  Please note that Horizon may still return <code>504 Gateway Timeout</code>
   *  error, even for short timeouts. In such case you need to resubmit the same
   *  transaction again without making any changes to receive a status. This
   *  method is using the machine system time (UTC), make sure it is set
   *  correctly.
   *
   * @param timeoutSeconds - Number of seconds the transaction is good.
   *     Can't be negative. If the value is {@link TimeoutInfinite}, the
   *     transaction is good indefinitely.
   *
   * @see {@link TimeoutInfinite}
   * @see https://developers.stellar.org/docs/tutorials/handling-errors/
   */
  setTimeout(timeoutSeconds: number): TransactionBuilder {
    if (this.timebounds !== null && Number(this.timebounds.maxTime) > 0) {
      throw new Error(
        "TimeBounds.max_time has been already set - setting timeout would overwrite it.",
      );
    }

    if (timeoutSeconds < 0) {
      throw new Error("timeout cannot be negative");
    }

    if (timeoutSeconds > 0) {
      const timeoutTimestamp = Math.floor(Date.now() / 1000) + timeoutSeconds;

      if (this.timebounds === null) {
        this.timebounds = { minTime: 0, maxTime: timeoutTimestamp };
      } else {
        this.timebounds = {
          minTime: this.timebounds.minTime ?? 0,
          maxTime: timeoutTimestamp,
        };
      }
    } else {
      this.timebounds = {
        minTime: 0,
        maxTime: 0,
      };
    }

    return this;
  }

  /**
   * If you want to prepare a transaction which will become valid at some point
   * in the future, or be invalid after some time, you can set a timebounds
   * precondition. Internally this will set the `minTime`, and `maxTime`
   * preconditions. Conflicts with `setTimeout`, so use one or the other.
   *
   * @param minEpochOrDate - Either a JS Date object, or a number
   *     of UNIX epoch seconds. The transaction is valid after this timestamp.
   *     Can't be negative. If the value is `0`, the transaction is valid
   *     immediately.
   * @param maxEpochOrDate - Either a JS Date object, or a number
   *     of UNIX epoch seconds. The transaction is valid until this timestamp.
   *     Can't be negative. If the value is `0`, the transaction is valid
   *     indefinitely.
   */
  setTimebounds(
    minEpochOrDate: Date | number,
    maxEpochOrDate: Date | number,
  ): TransactionBuilder {
    // Force it to a date type
    if (typeof minEpochOrDate === "number") {
      minEpochOrDate = new Date(minEpochOrDate * 1000);
    }
    if (typeof maxEpochOrDate === "number") {
      maxEpochOrDate = new Date(maxEpochOrDate * 1000);
    }

    if (this.timebounds !== null) {
      throw new Error(
        "TimeBounds has been already set - setting timebounds would overwrite it.",
      );
    }

    // Convert that date to the epoch seconds
    const minTime = Math.floor(minEpochOrDate.valueOf() / 1000);
    const maxTime = Math.floor(maxEpochOrDate.valueOf() / 1000);
    if (minTime < 0) {
      throw new Error("min_time cannot be negative");
    }
    if (maxTime < 0) {
      throw new Error("max_time cannot be negative");
    }
    if (maxTime > 0 && minTime > maxTime) {
      throw new Error("min_time cannot be greater than max_time");
    }

    this.timebounds = { minTime, maxTime };

    return this;
  }

  /**
   * If you want to prepare a transaction which will only be valid within some
   * range of ledgers, you can set a ledgerbounds precondition.
   * Internally this will set the `minLedger` and `maxLedger` preconditions.
   *
   * @param minLedger - The minimum ledger this transaction is valid at
   *     or after. Cannot be negative. If the value is `0` (the default), the
   *     transaction is valid immediately.
   *
   * @param maxLedger - The maximum ledger this transaction is valid
   *     before. Cannot be negative. If the value is `0`, the transaction is
   *     valid indefinitely.
   */
  setLedgerbounds(minLedger: number, maxLedger: number): TransactionBuilder {
    if (this.ledgerbounds !== null) {
      throw new Error(
        "LedgerBounds has been already set - setting ledgerbounds would overwrite it.",
      );
    }

    if (minLedger < 0) {
      throw new Error("min_ledger cannot be negative");
    }
    if (maxLedger < 0) {
      throw new Error("max_ledger cannot be negative");
    }
    if (maxLedger > 0 && minLedger > maxLedger) {
      throw new Error("min_ledger cannot be greater than max_ledger");
    }

    this.ledgerbounds = { minLedger, maxLedger };

    return this;
  }

  /**
   * If you want to prepare a transaction which will be valid only while the
   * account sequence number is
   *
   *     minAccountSequence <= sourceAccountSequence < tx.seqNum
   *
   * Note that after execution the account's sequence number is always raised to
   * `tx.seqNum`. Internally this will set the `minAccountSequence`
   * precondition.
   *
   * @param minAccountSequence - The minimum source account sequence
   *     number this transaction is valid for. If the value is `0` (the
   *     default), the transaction is valid when `sourceAccount's sequence
   *     number == tx.seqNum- 1`.
   */
  setMinAccountSequence(minAccountSequence: string): TransactionBuilder {
    if (this.minAccountSequence !== null) {
      throw new Error(
        "min_account_sequence has been already set - setting min_account_sequence would overwrite it.",
      );
    }

    this.minAccountSequence = minAccountSequence;

    return this;
  }

  /**
   * For the transaction to be valid, the current ledger time must be at least
   * `minAccountSequenceAge` greater than sourceAccount's `sequenceTime`.
   * Internally this will set the `minAccountSequenceAge` precondition.
   *
   * @param durationInSeconds - The minimum amount of time between
   *     source account sequence time and the ledger time when this transaction
   *     will become valid. If the value is `0`, the transaction is unrestricted
   *     by the account sequence age. Cannot be negative.
   */
  setMinAccountSequenceAge(durationInSeconds: bigint): TransactionBuilder {
    if (typeof durationInSeconds !== "bigint") {
      throw new Error("min_account_sequence_age must be a bigint");
    }
    if (this.minAccountSequenceAge !== null) {
      throw new Error(
        "min_account_sequence_age has been already set - setting min_account_sequence_age would overwrite it.",
      );
    }

    if (durationInSeconds < 0) {
      throw new Error("min_account_sequence_age cannot be negative");
    }

    this.minAccountSequenceAge = durationInSeconds;

    return this;
  }

  /**
   * For the transaction to be valid, the current ledger number must be at least
   * `minAccountSequenceLedgerGap` greater than sourceAccount's ledger sequence.
   * Internally this will set the `minAccountSequenceLedgerGap` precondition.
   *
   * @param gap - The minimum number of ledgers between source account
   *     sequence and the ledger number when this transaction will become valid.
   *     If the value is `0`, the transaction is unrestricted by the account
   *     sequence ledger. Cannot be negative.
   */
  setMinAccountSequenceLedgerGap(gap: number): TransactionBuilder {
    if (this.minAccountSequenceLedgerGap !== null) {
      throw new Error(
        "min_account_sequence_ledger_gap has been already set - setting min_account_sequence_ledger_gap would overwrite it.",
      );
    }

    if (gap < 0) {
      throw new Error("min_account_sequence_ledger_gap cannot be negative");
    }

    this.minAccountSequenceLedgerGap = gap;

    return this;
  }

  /**
   * For the transaction to be valid, there must be a signature corresponding to
   * every Signer in this array, even if the signature is not otherwise required
   * by the sourceAccount or operations. Internally this will set the
   * `extraSigners` precondition.
   *
   * @param extraSigners - required extra signers (as {@link StrKey}s)
   */
  setExtraSigners(extraSigners: string[]): TransactionBuilder {
    if (!Array.isArray(extraSigners)) {
      throw new Error("extra_signers must be an array of strings.");
    }

    if (this.extraSigners !== null) {
      throw new Error(
        "extra_signers has been already set - setting extra_signers would overwrite it.",
      );
    }

    if (extraSigners.length > 2) {
      throw new Error("extra_signers cannot be longer than 2 elements.");
    }

    this.extraSigners = [...extraSigners];

    return this;
  }

  /**
   * Set network passphrase for the Transaction that will be built.
   *
   * @param networkPassphrase - passphrase of the target Stellar
   *     network (e.g. "Public Global Stellar Network ; September 2015").
   */
  setNetworkPassphrase(networkPassphrase: string): TransactionBuilder {
    this.networkPassphrase = networkPassphrase;
    return this;
  }

  /**
   * Sets the transaction's internal Soroban transaction data (resources,
   * footprint, etc.).
   *
   * For non-contract(non-Soroban) transactions, this setting has no effect. In
   * the case of Soroban transactions, this is either an instance of
   * {@link xdr.SorobanTransactionData} or a base64-encoded string of said
   * structure. This is usually obtained from the simulation response based on a
   * transaction with a Soroban operation (e.g.
   * {@link Operation.invokeHostFunction}, providing necessary resource
   * and storage footprint estimations for contract invocation.
   *
   * @param sorobanData - the {@link xdr.SorobanTransactionData} as a raw xdr
   *    object or a base64 string to be decoded
   *
   * @see {SorobanDataBuilder}
   */
  setSorobanData(
    sorobanData: xdr.SorobanTransactionData | string,
  ): TransactionBuilder {
    this.sorobanData = new SorobanDataBuilder(sorobanData).build();
    return this;
  }

  /**
   * Creates and adds an invoke host function operation for transferring SAC tokens.
   * This method removes the need for simulation by handling the creation of the
   * appropriate authorization entries and ledger footprint for the transfer operation.
   *
   * @param destination - the address of the recipient of the SAC transfer (should be a valid Stellar address or contract ID)
   * @param asset - the SAC asset to be transferred
   * @param amount - the amount of tokens to be transferred in 7 decimals. IE 1 token with 7 decimals of precision would be represented as "1_0000000"
   * @param sorobanFees - optional Soroban fees for the transaction to override the default fees used
   */
  addSacTransferOperation(
    destination: string,
    asset: Asset,
    amount: bigint | string,
    sorobanFees?: SorobanFees,
  ): TransactionBuilder {
    if (BigInt(amount) <= 0n) {
      throw new Error("Amount must be a positive integer");
    } else if (BigInt(amount) > HYPER_MAX_VALUE) {
      // The largest supported value for SAC is i64 however the contract interface uses i128 which is why we convert it to i128
      throw new Error("Amount exceeds maximum value for i64");
    }

    if (sorobanFees) {
      const { instructions, readBytes, writeBytes, resourceFee } = sorobanFees;
      const U32_MAX = 4294967295;

      if (instructions <= 0 || instructions > U32_MAX) {
        throw new Error(
          `instructions must be greater than 0 and at most ${U32_MAX}`,
        );
      }
      if (readBytes <= 0 || readBytes > U32_MAX) {
        throw new Error(
          `readBytes must be greater than 0 and at most ${U32_MAX}`,
        );
      }
      if (writeBytes <= 0 || writeBytes > U32_MAX) {
        throw new Error(
          `writeBytes must be greater than 0 and at most ${U32_MAX}`,
        );
      }
      if (resourceFee <= 0n || resourceFee > HYPER_MAX_VALUE) {
        throw new Error(
          "resourceFee must be greater than 0 and at most i64 max",
        );
      }
    }

    const isDestinationContract = StrKey.isValidContract(destination);
    if (!isDestinationContract) {
      if (
        !StrKey.isValidEd25519PublicKey(destination) &&
        !StrKey.isValidMed25519PublicKey(destination)
      ) {
        throw new Error(
          "Invalid destination address. Must be a valid Stellar address or contract ID.",
        );
      }
    }

    // Resolve M... muxed addresses to their underlying G... address for
    // ledger key construction (Keypair.fromPublicKey only accepts G... keys).
    const destinationBaseAddress = isDestinationContract
      ? destination
      : extractBaseAddress(destination);

    if (
      destinationBaseAddress === extractBaseAddress(this.source.accountId())
    ) {
      throw new Error("Destination cannot be the same as the source account.");
    }

    if (this.networkPassphrase === null) {
      throw new Error(
        "networkPassphrase must be set to add a SAC transfer operation",
      );
    }

    const contractId = asset.contractId(this.networkPassphrase);
    const functionName = "transfer";
    const source = this.source.accountId();
    const sourceBaseAddress = extractBaseAddress(source);
    const args = [
      nativeToScVal(source, { type: "address" }),
      nativeToScVal(destination, { type: "address" }),
      nativeToScVal(amount, { type: "i128" }),
    ];
    const isAssetNative = asset.isNative();

    const auths = new xdr.SorobanAuthorizationEntry({
      credentials: xdr.SorobanCredentials.sorobanCredentialsSourceAccount(),
      rootInvocation: new xdr.SorobanAuthorizedInvocation({
        function:
          xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
            new xdr.InvokeContractArgs({
              contractAddress: Address.fromString(contractId).toScAddress(),
              functionName,
              args,
            }),
          ),
        subInvocations: [],
      }),
    });

    const footprint = new xdr.LedgerFootprint({
      readOnly: [
        xdr.LedgerKey.contractData(
          new xdr.LedgerKeyContractData({
            contract: Address.fromString(contractId).toScAddress(),
            key: xdr.ScVal.scvLedgerKeyContractInstance(),
            durability: xdr.ContractDataDurability.persistent(),
          }),
        ),
      ],
      readWrite: [],
    });

    // Ledger entries for the destination account
    if (isDestinationContract) {
      footprint.readWrite().push(
        xdr.LedgerKey.contractData(
          new xdr.LedgerKeyContractData({
            contract: Address.fromString(contractId).toScAddress(),
            key: xdr.ScVal.scvVec([
              nativeToScVal("Balance", { type: "symbol" }),
              nativeToScVal(destination, { type: "address" }),
            ]),
            durability: xdr.ContractDataDurability.persistent(),
          }),
        ),
      );

      if (!isAssetNative) {
        const assetIssuer = asset.getIssuer();

        if (!assetIssuer) {
          throw new Error("Asset issuer must be set for non-native assets.");
        }

        footprint.readOnly().push(
          xdr.LedgerKey.account(
            new xdr.LedgerKeyAccount({
              accountId: Keypair.fromPublicKey(assetIssuer).xdrPublicKey(),
            }),
          ),
        );
      }
    } else if (isAssetNative) {
      footprint.readWrite().push(
        xdr.LedgerKey.account(
          new xdr.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(
              destinationBaseAddress,
            ).xdrPublicKey(),
          }),
        ),
      );
    } else if (asset.getIssuer() !== destinationBaseAddress) {
      footprint.readWrite().push(
        xdr.LedgerKey.trustline(
          new xdr.LedgerKeyTrustLine({
            accountId: Keypair.fromPublicKey(
              destinationBaseAddress,
            ).xdrPublicKey(),
            asset: asset.toTrustLineXDRObject(),
          }),
        ),
      );
    }

    // Ledger entries for the source account
    if (asset.isNative()) {
      footprint.readWrite().push(
        xdr.LedgerKey.account(
          new xdr.LedgerKeyAccount({
            accountId: Keypair.fromPublicKey(sourceBaseAddress).xdrPublicKey(),
          }),
        ),
      );
    } else if (asset.getIssuer() !== sourceBaseAddress) {
      footprint.readWrite().push(
        xdr.LedgerKey.trustline(
          new xdr.LedgerKeyTrustLine({
            accountId: Keypair.fromPublicKey(sourceBaseAddress).xdrPublicKey(),
            asset: asset.toTrustLineXDRObject(),
          }),
        ),
      );
    }

    const defaultPaymentFees = {
      instructions: 400_000,
      readBytes: 1_000,
      writeBytes: 1_000,
      resourceFee: BigInt(5_000_000),
    };

    const sorobanData = new xdr.SorobanTransactionData({
      resources: new xdr.SorobanResources({
        footprint,
        instructions: sorobanFees
          ? sorobanFees.instructions
          : defaultPaymentFees.instructions,
        diskReadBytes: sorobanFees
          ? sorobanFees.readBytes
          : defaultPaymentFees.readBytes,
        writeBytes: sorobanFees
          ? sorobanFees.writeBytes
          : defaultPaymentFees.writeBytes,
      }),
      ext: new xdr.SorobanTransactionDataExt(0),
      resourceFee: new xdr.Int64(
        sorobanFees ? sorobanFees.resourceFee : defaultPaymentFees.resourceFee,
      ),
    });
    const operation = Operation.invokeContractFunction({
      contract: contractId,
      function: functionName,
      args,
      auth: [auths],
    });
    this.setSorobanData(sorobanData);
    return this.addOperation(operation);
  }

  /**
   * Builds the transaction and increments the source account's sequence
   * number by 1.
   */
  build(): Transaction {
    const sequenceNumber = new BigNumber(this.source.sequenceNumber()).plus(1);
    const fee = new BigNumber(this.baseFee)
      .times(this.operations.length)
      .toNumber();

    if (fee > UINT32_MAX) {
      throw new Error(
        `Total fee (baseFee * operations) exceeds the maximum uint32 value (${UINT32_MAX}). ` +
          `Got ${fee} from baseFee=${this.baseFee} and ${this.operations.length} operation(s).`,
      );
    }

    const attrs: {
      fee: number;
      seqNum: xdr.SequenceNumber;
      memo: xdr.Memo | null;
      cond?: xdr.Preconditions;
      sourceAccount?: xdr.MuxedAccount;
      ext?: xdr.TransactionExt;
    } = {
      fee,
      seqNum: xdr.Int64.fromString(sequenceNumber.toString()),
      memo: this.memo ? this.memo.toXDRObject() : null,
    };

    if (
      this.timebounds === null ||
      typeof this.timebounds.minTime === "undefined" ||
      typeof this.timebounds.maxTime === "undefined"
    ) {
      throw new Error(
        "TimeBounds has to be set or you must call setTimeout(TimeoutInfinite).",
      );
    }

    if (isValidDate(this.timebounds.minTime)) {
      this.timebounds.minTime = Math.floor(
        this.timebounds.minTime.getTime() / 1000,
      );
    }

    if (isValidDate(this.timebounds.maxTime)) {
      this.timebounds.maxTime = Math.floor(
        this.timebounds.maxTime.getTime() / 1000,
      );
    }

    const minTime = xdr.Uint64.fromString(this.timebounds.minTime.toString());
    const maxTime = xdr.Uint64.fromString(this.timebounds.maxTime.toString());

    const timeBounds = new xdr.TimeBounds({ minTime, maxTime });

    if (this.hasV2Preconditions()) {
      let ledgerBounds = null;

      if (this.ledgerbounds !== null) {
        ledgerBounds = new xdr.LedgerBounds({
          minLedger: this.ledgerbounds.minLedger ?? 0,
          maxLedger: this.ledgerbounds.maxLedger ?? 0,
        });
      }

      const minSeqNum = this.minAccountSequence
        ? xdr.Int64.fromString(this.minAccountSequence)
        : null;

      const minSeqAge = xdr.Uint64.fromString(
        this.minAccountSequenceAge !== null
          ? this.minAccountSequenceAge.toString()
          : "0",
      );

      const minSeqLedgerGap = this.minAccountSequenceLedgerGap || 0;

      const extraSigners =
        this.extraSigners !== null
          ? this.extraSigners.map((s) => SignerKey.decodeAddress(s))
          : [];

      attrs.cond = xdr.Preconditions.precondV2(
        new xdr.PreconditionsV2({
          timeBounds,
          ledgerBounds,
          minSeqNum,
          minSeqAge,
          minSeqLedgerGap,
          extraSigners,
        }),
      );
    } else {
      attrs.cond = xdr.Preconditions.precondTime(timeBounds);
    }

    attrs.sourceAccount = decodeAddressToMuxedAccount(this.source.accountId());

    // Previously used @ts-ignore and passed xdr.Void as second arg to TransactionExt(0)
    // due to broken TransactionExt types in dts-xdr.
    // Fixed upstream: https://github.com/stellar/dts-xdr/issues/5
    if (this.sorobanData) {
      attrs.ext = new xdr.TransactionExt(1, this.sorobanData);
      // Soroban transactions pay the resource fee in addition to the regular fee, so we need to add it here.
      attrs.fee = new BigNumber(attrs.fee)
        .plus(this.sorobanData.resourceFee().toString())
        .toNumber();

      if (attrs.fee > UINT32_MAX) {
        throw new Error(
          `Total fee (baseFee * operations + resourceFee) exceeds the maximum uint32 value (${UINT32_MAX}). ` +
            `Got ${attrs.fee}.`,
        );
      }
    } else {
      attrs.ext = new xdr.TransactionExt(0);
    }

    const xtx = new xdr.Transaction(
      attrs as ConstructorParameters<typeof xdr.Transaction>[0],
    );
    xtx.operations(this.operations);

    const txEnvelope = xdr.TransactionEnvelope.envelopeTypeTx(
      new xdr.TransactionV1Envelope({ tx: xtx, signatures: [] }),
    );

    if (this.networkPassphrase === null) {
      throw new Error("networkPassphrase must be set to build a transaction");
    }

    const tx = new Transaction(txEnvelope, this.networkPassphrase);

    this.source.incrementSequenceNumber();

    return tx;
  }

  /**
   * Checks whether any v2 preconditions have been set on this builder.
   */
  hasV2Preconditions() {
    return (
      this.ledgerbounds !== null ||
      this.minAccountSequence !== null ||
      this.minAccountSequenceAge !== null ||
      this.minAccountSequenceLedgerGap !== null ||
      (this.extraSigners !== null && this.extraSigners.length > 0)
    );
  }

  /**
   * Builds a {@link FeeBumpTransaction}, enabling you to resubmit an existing
   * transaction with a higher fee.
   *
   * @param feeSource - account paying for the transaction,
   *     in the form of either a Keypair (only the public key is used) or
   *     an account ID (in G... or M... form, but refer to `withMuxing`)
   * @param baseFee - max fee willing to pay per operation
   *     in inner transaction (**in stroops**)
   * @param innerTx - {@link Transaction} to be bumped by
   *     the fee bump transaction
   * @param networkPassphrase - passphrase of the target
   *     Stellar network (e.g. "Public Global Stellar Network ; September 2015",
   *     see {@link Networks})
   *
   * @todo Alongside the next major version bump, this type signature can be
   *       changed to be less awkward: accept a MuxedAccount as the `feeSource`
   *       rather than a keypair or string.
   *
   * @note Your fee-bump amount should be >= 10x the original fee.
   * @see  https://developers.stellar.org/docs/glossary/fee-bumps/#replace-by-fee
   */
  static buildFeeBumpTransaction(
    feeSource: Keypair | string,
    baseFee: string,
    innerTx: Transaction,
    networkPassphrase: string,
  ): FeeBumpTransaction {
    const innerOps = innerTx.operations.length;

    const minBaseFee = new BigNumber(BASE_FEE);
    let resourceFee = new BigNumber(0);

    // Do we need to do special Soroban fee handling? We only want the fee-bump
    // requirement to match the inclusion fee, not the inclusion+resource fee.
    const env = innerTx.toEnvelope();
    switch (env.switch().value) {
      case xdr.EnvelopeType.envelopeTypeTx().value: {
        const sorobanData = env.v1().tx().ext().value();
        resourceFee = new BigNumber(sorobanData?.resourceFee().toString() ?? 0);

        break;
      }
      default:
        break;
    }
    const innerInclusionFee = new BigNumber(innerTx.fee)
      .minus(resourceFee)
      .div(innerOps);
    const base = new BigNumber(baseFee);

    // The fee rate for fee bump is at least the fee rate of the inner transaction
    if (base.lt(innerInclusionFee)) {
      throw new Error(
        `Invalid baseFee, it should be at least ${innerInclusionFee.toString()} stroops.`,
      );
    }

    // The fee rate is at least the minimum fee
    if (base.lt(minBaseFee)) {
      throw new Error(
        `Invalid baseFee, it should be at least ${minBaseFee.toString()} stroops.`,
      );
    }

    let innerTxEnvelope = innerTx.toEnvelope();
    if (innerTxEnvelope.switch() === xdr.EnvelopeType.envelopeTypeTxV0()) {
      const v0Tx = innerTxEnvelope.v0().tx();
      const v0TimeBounds = v0Tx.timeBounds();

      if (v0TimeBounds === null) {
        throw new Error("Inner transaction must have time bounds");
      }

      const v1Tx = new xdr.Transaction({
        sourceAccount: xdr.MuxedAccount.keyTypeEd25519(
          v0Tx.sourceAccountEd25519(),
        ),
        fee: v0Tx.fee(),
        seqNum: v0Tx.seqNum(),
        cond: xdr.Preconditions.precondTime(v0TimeBounds),
        memo: v0Tx.memo(),
        operations: v0Tx.operations(),
        ext: new xdr.TransactionExt(0),
      });
      innerTxEnvelope = xdr.TransactionEnvelope.envelopeTypeTx(
        new xdr.TransactionV1Envelope({
          tx: v1Tx,
          signatures: innerTxEnvelope.v0().signatures(),
        }),
      );
    }

    let feeSourceAccount;
    if (typeof feeSource === "string") {
      feeSourceAccount = decodeAddressToMuxedAccount(feeSource);
    } else {
      feeSourceAccount = feeSource.xdrMuxedAccount();
    }

    const tx = new xdr.FeeBumpTransaction({
      feeSource: feeSourceAccount,
      fee: xdr.Int64.fromString(
        base
          .times(innerOps + 1)
          .plus(resourceFee)
          .toString(),
      ),
      innerTx: xdr.FeeBumpTransactionInnerTx.envelopeTypeTx(
        innerTxEnvelope.v1(),
      ),
      ext: new xdr.FeeBumpTransactionExt(0),
    });
    const feeBumpTxEnvelope = new xdr.FeeBumpTransactionEnvelope({
      tx,
      signatures: [],
    });
    const envelope =
      xdr.TransactionEnvelope.envelopeTypeTxFeeBump(feeBumpTxEnvelope);

    return new FeeBumpTransaction(envelope, networkPassphrase);
  }

  /**
   * Build a {@link Transaction} or {@link FeeBumpTransaction} from an
   * xdr.TransactionEnvelope.
   *
   * @param envelope - The transaction envelope
   *     object or base64 encoded string.
   * @param networkPassphrase - The network passphrase of the target
   *     Stellar network (e.g. "Public Global Stellar Network ; September
   *     2015"), see {@link Networks}.
   */
  static fromXDR(
    envelope: xdr.TransactionEnvelope | string,
    networkPassphrase: string,
  ): FeeBumpTransaction | Transaction {
    if (typeof envelope === "string") {
      envelope = xdr.TransactionEnvelope.fromXDR(envelope, "base64");
    }

    if (envelope.switch() === xdr.EnvelopeType.envelopeTypeTxFeeBump()) {
      return new FeeBumpTransaction(envelope, networkPassphrase);
    }

    return new Transaction(envelope, networkPassphrase);
  }
}

/**
 * Checks whether a provided object is a valid Date.
 * @param d - date object
 */
export function isValidDate(d: Date | number | string): d is Date {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

/**
 * Converts a Date, number, or string time value to epoch seconds for
 * validation. Returns undefined if the value is undefined.
 */
function toEpochSeconds(
  value: Date | number | string | undefined,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const num =
    value instanceof Date ? Math.floor(value.getTime() / 1000) : Number(value);

  if (!Number.isFinite(num) || num % 1 !== 0) {
    throw new Error("timebounds value must be a finite integer or Date");
  }

  return num;
}
