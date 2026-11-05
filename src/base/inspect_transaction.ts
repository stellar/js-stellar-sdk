import { compareUint8Arrays, uint8ArrayToHex } from "uint8array-extras";
import {
  type HostFunction,
  type SorobanAuthorizationEntry,
  SorobanAuthorizedFunction,
  SorobanAuthorizedInvocation,
  Transaction as XdrTransaction,
  XdrString,
} from "../xdr/index.js";
import { type AuthEntryInfo, inspectAuthEntry } from "./auth.js";
import { FeeBumpTransaction } from "./fee_bump_transaction.js";
import { type InvocationTree, buildInvocationTree } from "./invocation.js";
import type { MemoType, MemoValue } from "./memo.js";
import type { OperationRecord, OperationType } from "./operations/types.js";
import { SignerKey } from "./signerkey.js";
import { Transaction } from "./transaction.js";

/** The result of {@link inspectTransaction}. Narrow it with `"inner" in summary`. */
export type InspectedTransaction = TransactionSummary | FeeBumpSummary;

/**
 * A plain view of a {@link Transaction}, returned by {@link inspectTransaction}.
 * The large numbers in its own fields are decimal strings, so they keep their
 * precision. The nested `details` and `info` values keep their SDK types,
 * which include XDR objects and `bigint`s.
 */
export interface TransactionSummary {
  /** the source account, as on the wire: a muxed `M…` address stays muxed. */
  source: string;
  sequence: string;
  /**
   * the memo. `value` is `null` for `none`, a decimal string for `id`, and
   * lowercase hex for `hash` and `return`. A `text` memo is decoded as UTF-8
   * when its bytes are valid UTF-8; otherwise `value` is the SEP-51 escaped
   * form that `toJson()` uses. The two forms can give the same string: the
   * byte `0xff` and the text `\xff` both give `\xff`.
   */
  memo: { type: MemoType; value: string | null };
  /**
   * the declared fees, in stroops. `max` is the fee field of the transaction.
   * `resource` is the Soroban resource fee, or `null` for a classic
   * transaction. `inclusion` is `max - resource` (or `max` for a classic
   * transaction); it can be negative for a fee-bump inner transaction. These
   * are upper bounds: the charged fee is known only after execution.
   */
  fees: { max: string; resource: string | null; inclusion: string };
  /** the preconditions, or `null` when the transaction has none. */
  preconditions: InspectedPreconditions | null;
  operations: OperationSummary[];
}

/**
 * The preconditions of a transaction. The three `minAccountSequence*` fields
 * are `null` unless the transaction carries v2 preconditions; in v2, the age
 * and the ledger gap are always present, so an unset value is zero.
 */
export interface InspectedPreconditions {
  /** unix timestamps in seconds, as decimal strings. */
  timeBounds: { minTime: string; maxTime: string } | null;
  ledgerBounds: { minLedger: number; maxLedger: number } | null;
  minAccountSequence: string | null;
  /** in seconds, as a decimal string. */
  minAccountSequenceAge: string | null;
  minAccountSequenceLedgerGap: number | null;
  /** extra signer keys, as strkeys. Empty when there are none. */
  extraSigners: string[];
}

/** One operation of a {@link TransactionSummary}. */
export interface OperationSummary {
  /** the position of the operation in the transaction. */
  index: number;
  type: OperationType;
  /** the account the operation runs as: its own source, else the transaction source. */
  source: string;
  /**
   * the Soroban authorization entries of an `invokeHostFunction` operation,
   * each decoded with {@link inspectAuthEntry}. Empty for other operations.
   * Each `info.invocation` stays raw XDR; pass it to
   * {@link buildInvocationTree} to read it.
   */
  authEntries: InspectedAuthEntry[];
  /**
   * the top-level contract call or deployment of an `invokeHostFunction`
   * operation, as an {@link InvocationTree} with no nested `invocations`.
   * Nested calls that need authorization appear only in `authEntries`. `null`
   * for other operations and for a wasm upload, which invokes no contract.
   */
  invocation: InvocationNode | null;
  /** the operation as {@link Operation.fromXdrObject} returns it. */
  details: OperationRecord;
}

/**
 * An {@link InvocationTree}, or `unreadable` when the SDK cannot decode the
 * invocation. The rest of the summary is still complete.
 */
export type InvocationNode =
  InvocationTree | { type: "unreadable"; reason: string };

/**
 * A decoded authorization entry, or `unreadable` when
 * {@link inspectAuthEntry} cannot decode it. The other entries are still
 * decoded.
 */
export type InspectedAuthEntry =
  | { type: "entry"; info: AuthEntryInfo }
  | { type: "unreadable"; reason: string };

/** A plain view of a {@link FeeBumpTransaction}, returned by {@link inspectTransaction}. */
export interface FeeBumpSummary {
  /** the account that pays the fee, as on the wire: a muxed `M…` address stays muxed. */
  feeSource: string;
  /** the outer fee, in stroops. */
  maxFee: string;
  /** the inner transaction, with the same shape as a standalone summary. */
  inner: TransactionSummary;
}

/**
 * Decodes a transaction into a plain, typed summary of what it does: its
 * source, sequence, memo, fees and preconditions, and for each operation the
 * account it runs as, its Soroban authorization entries and its contract
 * invocation. Use it to show a user what they are about to sign.
 *
 * The function is pure: it makes no network calls. Content that the SDK does
 * not recognize, such as a new authorization credential type, becomes an
 * `unreadable` node in place; it does not throw. The summary is not
 * JSON-safe: for a lossless rendering of the whole envelope that serializes,
 * use `tx.toEnvelope().toJson()` instead.
 *
 * @param tx - the transaction or fee-bump transaction to inspect
 * @returns a {@link TransactionSummary}, or a {@link FeeBumpSummary} for a
 *   fee-bump transaction
 * @throws `TypeError` if `tx` is not a `Transaction` or `FeeBumpTransaction`
 *
 * @example
 * ```ts
 * const summary = inspectTransaction(tx);
 * const body = "inner" in summary ? summary.inner : summary;
 * for (const op of body.operations) {
 *   console.log(`#${op.index} ${op.type} as ${op.source}`);
 *   for (const entry of op.authEntries) {
 *     if (
 *       entry.type === "entry" &&
 *       entry.info.address !== null &&
 *       !entry.info.signed
 *     ) {
 *       console.log(`  needs a signature from ${entry.info.address}`);
 *     }
 *   }
 * }
 * ```
 */
export function inspectTransaction(
  tx: Transaction | FeeBumpTransaction,
): InspectedTransaction {
  if (tx instanceof FeeBumpTransaction) {
    return {
      feeSource: tx.feeSource,
      maxFee: tx.fee,
      inner: summarizeTransaction(tx.innerTransaction),
    };
  }
  if (tx instanceof Transaction) {
    return summarizeTransaction(tx);
  }
  throw new TypeError(
    `expected a 'Transaction' or 'FeeBumpTransaction', got: ${String(tx)}`,
  );
}

function summarizeTransaction(tx: Transaction): TransactionSummary {
  const memo = tx.memo;
  return {
    source: tx.source,
    sequence: tx.sequence,
    memo: summarizeMemo(memo.type, memo.value),
    fees: summarizeFees(tx),
    preconditions: summarizePreconditions(tx),
    operations: tx.operations.map((details, index) =>
      summarizeOperation(details, index, tx.source),
    ),
  };
}

function summarizeMemo(
  type: MemoType,
  value: MemoValue,
): TransactionSummary["memo"] {
  if (value === null || typeof value === "string") {
    return { type, value };
  }
  return {
    type,
    value: type === "text" ? memoText(value) : uint8ArrayToHex(value),
  };
}

function memoText(bytes: Uint8Array): string {
  const text = new XdrString(bytes);
  const decoded = text.asStringOrBytes();
  // A strict, BOM-keeping decode is lossless; the check makes sure of it.
  if (
    typeof decoded === "string" &&
    compareUint8Arrays(new TextEncoder().encode(decoded), bytes) === 0
  ) {
    return decoded;
  }
  return text.toJson();
}

function summarizeFees(tx: Transaction): TransactionSummary["fees"] {
  // `tx.tx` returns a copy of the raw body; it is the cheapest public path to
  // the Soroban extension, which no getter exposes.
  const raw = tx.tx;
  const resource =
    raw instanceof XdrTransaction && raw.ext.type === "sorobanData"
      ? raw.ext.value.resourceFee
      : null;
  if (resource === null) {
    return { max: tx.fee, resource: null, inclusion: tx.fee };
  }
  return {
    max: tx.fee,
    resource: resource.toString(),
    inclusion: (BigInt(tx.fee) - resource).toString(),
  };
}

function summarizePreconditions(
  tx: Transaction,
): InspectedPreconditions | null {
  const { timeBounds, ledgerBounds, minAccountSequenceAge } = tx;
  // The age is set only from a v2 precondition, where it is always present.
  const hasV2 = minAccountSequenceAge !== undefined;
  if (timeBounds === undefined && !hasV2) {
    return null;
  }
  return {
    timeBounds: timeBounds
      ? { minTime: timeBounds.minTime, maxTime: timeBounds.maxTime }
      : null,
    ledgerBounds: ledgerBounds
      ? { minLedger: ledgerBounds.minLedger, maxLedger: ledgerBounds.maxLedger }
      : null,
    minAccountSequence: tx.minAccountSequence ?? null,
    minAccountSequenceAge: hasV2 ? minAccountSequenceAge.toString() : null,
    minAccountSequenceLedgerGap: hasV2
      ? (tx.minAccountSequenceLedgerGap ?? null)
      : null,
    extraSigners: (tx.extraSigners ?? []).map((signer) =>
      SignerKey.encodeSignerKey(signer),
    ),
  };
}

function summarizeOperation(
  details: OperationRecord,
  index: number,
  txSource: string,
): OperationSummary {
  const isInvoke = details.type === "invokeHostFunction";
  return {
    index,
    type: details.type,
    source: details.source ?? txSource,
    authEntries: isInvoke ? (details.auth ?? []).map(inspectEntry) : [],
    invocation: isInvoke ? hostFunctionInvocation(details.func) : null,
    details,
  };
}

function inspectEntry(entry: SorobanAuthorizationEntry): InspectedAuthEntry {
  try {
    return { type: "entry", info: inspectAuthEntry(entry) };
  } catch (error) {
    return { type: "unreadable", reason: errorMessage(error) };
  }
}

function hostFunctionInvocation(func: HostFunction): InvocationNode | null {
  let fn: SorobanAuthorizedFunction;
  switch (func.type) {
    case "hostFunctionTypeInvokeContract":
      fn = SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        func.value,
      );
      break;
    case "hostFunctionTypeCreateContract":
      fn =
        SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractHostFn(
          func.value,
        );
      break;
    case "hostFunctionTypeCreateContractV2":
      fn =
        SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeCreateContractV2HostFn(
          func.value,
        );
      break;
    case "hostFunctionTypeUploadContractWasm":
      return null;
    default:
      return { type: "unreadable", reason: "unsupported host function type" };
  }
  try {
    return buildInvocationTree(
      new SorobanAuthorizedInvocation({ function: fn, subInvocations: [] }),
    );
  } catch (error) {
    return { type: "unreadable", reason: errorMessage(error) };
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
