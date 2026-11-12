import { scValToBigInt } from "../base/index.js";
import type {
  SorobanTransactionMetaExtV1,
  TransactionEnvelope,
  TransactionMeta,
  TransactionResult,
  TransactionExt,
} from "../xdr/index.js";

/**
 * The input to {@link inspectChargedFees}: a `getTransaction` response with
 * status `SUCCESS` or `FAILED`, or a `getTransactions` entry.
 */
export interface ChargedFeesInput {
  envelopeXdr: TransactionEnvelope;
  resultXdr: TransactionResult;
  resultMetaXdr: TransactionMeta;
}

/** The fees a transaction declared and was charged, in stroops, as decimal strings. */
export interface ChargedFees {
  /**
   * the declared fees. `inclusion` is `max - resource`, and is negative if
   * the envelope declares a resource fee above `max`. For a fee bump, `max`
   * is the outer fee and `resource` comes from the inner transaction.
   */
  declared: { max: string; resource: string | null; inclusion: string };
  /**
   * the charged fees. `total` is what the fee source paid, after any refund.
   * `resource` is what the transaction consumed, and is `null` when the meta
   * has no Soroban fee breakdown or one that doesn't fit the declared
   * resource fee. `inclusion` is `null` when it can't be worked out or falls
   * outside the declared one. For a classic transaction, `inclusion` is the
   * total. `rent` is part of `refundable`.
   */
  charged: {
    total: string;
    inclusion: string | null;
    resource: {
      total: string;
      nonRefundable: string;
      refundable: string;
      rent: string;
    } | null;
  };
  /**
   * the resource fee core paid back, or `null` when unknown or for a classic
   * transaction. Core skips the refund if the fee source was merged in the
   * same ledger or its liabilities block the credit. With fee events this is
   * then `"0"`, and `charged.total` is above `inclusion` plus `resource.total`
   * by the lost amount.
   */
  refunded: string | null;
}

/**
 * Reports what a landed transaction declared and was charged, with the Soroban
 * resource fee split out. It makes no network calls.
 *
 * The inclusion fee and refund are read from the fee events in meta v4. Without
 * them (before protocol 23) the inclusion fee is the fee charged less the
 * resource fee consumed. If core skipped the refund, that counts the kept
 * refund as inclusion fee, or gives `null` for both when it passes the
 * declared inclusion fee.
 *
 * @param tx - a `getTransaction` response with status `SUCCESS` or `FAILED`,
 * or a `getTransactions` entry
 * @throws if `tx` has no envelope, result or meta, as a `NOT_FOUND` response
 */
export function inspectChargedFees(tx: ChargedFeesInput): ChargedFees {
  // Guards untyped callers: a NOT_FOUND response has none of these fields.
  if (!tx.envelopeXdr || !tx.resultXdr || !tx.resultMetaXdr) {
    throw new Error(
      "inspectChargedFees needs a landed transaction: a getTransaction " +
        "response with status SUCCESS or FAILED",
    );
  }

  const declared = declaredFees(tx.envelopeXdr);
  const total = tx.resultXdr.feeCharged;
  const bid = declared.max - (declared.resource ?? 0n);

  let inclusion: bigint | null = null;
  let split: SorobanTransactionMetaExtV1 | null = null;
  let refunded: bigint | null = null;

  if (declared.resource === null) {
    inclusion = total;
  } else {
    split = resourceSplit(tx.resultMetaXdr, declared.resource);
    const events = feeEvents(tx.resultMetaXdr, total);
    if (events !== null) {
      // Core takes the inclusion fee and the whole declared resource fee up
      // front, then pays back the unused refundable part.
      inclusion = within(events.charged - declared.resource, bid);
      refunded = events.refunded;
    } else if (split !== null) {
      // If core skipped the refund, feeCharged still holds it and the
      // inclusion fee comes out too high by that amount. This only catches
      // it when that passes the bid.
      const consumed = consumedResourceFee(split);
      inclusion = within(total - consumed, bid);
      refunded = inclusion === null ? null : declared.resource - consumed;
    }
  }

  return {
    declared: {
      max: declared.max.toString(),
      resource:
        declared.resource === null ? null : declared.resource.toString(),
      inclusion: bid.toString(),
    },
    charged: {
      total: total.toString(),
      inclusion: inclusion === null ? null : inclusion.toString(),
      resource:
        split === null
          ? null
          : {
              total: consumedResourceFee(split).toString(),
              nonRefundable:
                split.totalNonRefundableResourceFeeCharged.toString(),
              refundable: split.totalRefundableResourceFeeCharged.toString(),
              rent: split.rentFeeCharged.toString(),
            },
    },
    refunded: refunded === null ? null : refunded.toString(),
  };
}

function within(value: bigint, max: bigint): bigint | null {
  return value >= 0n && value <= max ? value : null;
}

function consumedResourceFee(split: SorobanTransactionMetaExtV1): bigint {
  return (
    split.totalNonRefundableResourceFeeCharged +
    split.totalRefundableResourceFeeCharged
  );
}

interface DeclaredFees {
  max: bigint;
  resource: bigint | null;
}

function declaredFees(envelope: TransactionEnvelope): DeclaredFees {
  switch (envelope.type) {
    case "envelopeTypeTxV0":
      return { max: BigInt(envelope.v0.tx.fee), resource: null };
    case "envelopeTypeTx":
      return {
        max: BigInt(envelope.v1.tx.fee),
        resource: resourceFee(envelope.v1.tx.ext),
      };
    case "envelopeTypeTxFeeBump":
      return {
        max: envelope.feeBump.tx.fee,
        resource: resourceFee(envelope.feeBump.tx.innerTx.v1.tx.ext),
      };
  }
}

function resourceFee(ext: TransactionExt): bigint | null {
  return ext.type === "sorobanData" ? ext.sorobanData.resourceFee : null;
}

/** The meta's Soroban fee breakdown, or `null` if it has none or a broken one. */
function resourceSplit(
  meta: TransactionMeta,
  declaredResource: bigint,
): SorobanTransactionMetaExtV1 | null {
  let sorobanMeta;
  if (meta.type === "v3") {
    sorobanMeta = meta.v3.sorobanMeta;
  } else if (meta.type === "v4") {
    sorobanMeta = meta.v4.sorobanMeta;
  }
  if (sorobanMeta?.ext.type !== "v1") {
    return null;
  }
  const split = sorobanMeta.ext.v1;
  const fits =
    split.totalNonRefundableResourceFeeCharged >= 0n &&
    split.rentFeeCharged >= 0n &&
    split.rentFeeCharged <= split.totalRefundableResourceFeeCharged &&
    consumedResourceFee(split) <= declaredResource;
  return fits ? split : null;
}

/**
 * Sums the fee events core writes to meta v4: the charge taken before the
 * transaction ran and the refund paid after. Only core writes to this list.
 * Returns `null` if there are none or they don't add up to `feeCharged`.
 */
function feeEvents(
  meta: TransactionMeta,
  feeCharged: bigint,
): { charged: bigint; refunded: bigint } | null {
  if (meta.type !== "v4" || meta.v4.events.length === 0) {
    return null;
  }
  let charged = 0n;
  let refunded = 0n;
  for (const { stage, event } of meta.v4.events) {
    const { topics, data } = event.body.v0;
    const [name] = topics;
    if (
      name?.type !== "scvSymbol" ||
      name.value !== "fee" ||
      data.type !== "scvI128"
    ) {
      return null;
    }
    const amount = scValToBigInt(data);
    if (stage.name === "transactionEventStageBeforeAllTxs") {
      charged += amount;
    } else {
      // a refund is a negative fee
      refunded -= amount;
    }
  }
  return charged - refunded === feeCharged && refunded >= 0n
    ? { charged, refunded }
    : null;
}
