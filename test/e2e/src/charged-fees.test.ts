import { expect, describe, it, beforeAll } from "vitest";
import {
  Asset,
  Keypair,
  Operation,
  Transaction,
  FeeBumpTransaction,
  TransactionBuilder,
  rpc,
  scValToBigInt,
  xdr,
} from "../../../lib/esm/index.js";
import { generateFundedKeypair, networkPassphrase, server } from "./util.js";

// These tests pin what `inspectChargedFees` assumes about core and RPC, so a
// change on the server fails here. Two assumptions are not covered: a refund
// blocked by the fee source's liabilities, and the meta v3 fee breakdown from
// before protocol 23, which this network can't produce.

async function land(
  tx: Transaction | FeeBumpTransaction,
  status:
    | rpc.Api.GetTransactionStatus.SUCCESS
    | rpc.Api.GetTransactionStatus.FAILED = rpc.Api.GetTransactionStatus
    .SUCCESS,
) {
  const sent = await server.sendTransaction(tx);
  expect(sent.status).toBe("PENDING");
  const result = await server.pollTransaction(sent.hash, { attempts: 10 });
  if (result.status !== status) {
    throw new Error(`transaction landed as ${result.status}, not ${status}`);
  }
  return result;
}

async function preparedSorobanTx(
  source: Keypair,
  asset = new Asset("FEE", Keypair.random().publicKey()),
) {
  const account = await server.getAccount(source.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: "1000",
    networkPassphrase,
  })
    .addOperation(Operation.createStellarAssetContract({ asset }))
    .setTimeout(30)
    .build();
  const prepared = await server.prepareTransaction(tx);
  prepared.sign(source);
  return prepared;
}

async function balance(keypair: Keypair): Promise<bigint> {
  return BigInt((await server.getAccountEntry(keypair.publicKey())).balance);
}

type Landed =
  | rpc.Api.GetSuccessfulTransactionResponse
  | rpc.Api.GetFailedTransactionResponse;

function metaV4(result: Landed) {
  const meta = result.resultMetaXdr;
  if (meta.type !== "v4") {
    throw new Error(`expected meta v4, got ${meta.type}`);
  }
  return meta.v4;
}

// The meta's transaction events, which is where `inspectChargedFees` reads
// the fee events from, in the exact shape it expects. RPC returns the same
// list in `events.transactionEventsXdr`.
function metaFeeEvents(result: Landed) {
  const { events } = metaV4(result);
  expect(events.map((event) => event.toXdr("base64"))).toEqual(
    result.events.transactionEventsXdr.map((event) => event.toXdr("base64")),
  );
  return events.map(({ stage, event }) => {
    const { topics, data } = event.body.v0;
    return {
      stage: stage.name,
      topicType: topics[0]?.type,
      topic: topics[0]?.value,
      dataType: data.type,
      amount: data.type === "scvI128" ? scValToBigInt(data) : null,
    };
  });
}

// The same response as a network without fee events would return it, so the
// split is derived from the fee breakdown.
function withoutFeeEvents(result: Landed): rpc.ChargedFeesInput {
  return {
    ...result,
    resultMetaXdr: xdr.TransactionMeta.v4(
      new xdr.TransactionMetaV4({ ...metaV4(result), events: [] }),
    ),
  };
}

// Checks the reported fees against what the network did: the fee source's
// balance, the fee events in the meta, and the base fee per operation.
function expectChargedAsReported(
  result: Landed,
  paid: bigint,
  operations: number,
) {
  const fees = rpc.inspectChargedFees(result);
  const { charged } = fees;
  expect(charged.resource).not.toBeNull();
  const resource = charged.resource!;

  // The fee source's balance fell by the total.
  expect(BigInt(charged.total)).toBe(paid);

  // No surge pricing here, so each operation costs the base fee.
  expect(charged.inclusion).toBe((100 * operations).toString());

  // Core charged the inclusion fee plus the whole declared resource fee, then
  // paid back what the transaction didn't consume. These two fee events are
  // the only transaction events in the meta.
  const refund = BigInt(fees.declared.resource!) - BigInt(resource.total);
  expect(refund).toBeGreaterThan(0n);
  expect(metaFeeEvents(result)).toEqual([
    {
      stage: "transactionEventStageBeforeAllTxs",
      topicType: "scvSymbol",
      topic: "fee",
      dataType: "scvI128",
      amount: BigInt(charged.inclusion!) + BigInt(fees.declared.resource!),
    },
    {
      stage: "transactionEventStageAfterAllTxs",
      topicType: "scvSymbol",
      topic: "fee",
      dataType: "scvI128",
      amount: -refund,
    },
  ]);
  expect(fees.refunded).toBe(refund.toString());
  expect(BigInt(charged.inclusion!) + BigInt(resource.total)).toBe(paid);

  // The split derived from the fee breakdown alone agrees with the events.
  expect(rpc.inspectChargedFees(withoutFeeEvents(result))).toEqual(fees);
  return fees;
}

// Lands a fee bump whose fee source is merged away in the same ledger, so
// core has no account to refund. The two transactions race for a ledger, so
// this retries until they share one.
async function landFeeBumpWithMergedFeeSource(
  source: Keypair,
  baseFee: string,
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const feeSource = await generateFundedKeypair();
    const bump = TransactionBuilder.buildFeeBumpTransaction(
      feeSource,
      baseFee,
      await preparedSorobanTx(source),
      networkPassphrase,
    );
    bump.sign(feeSource);
    // Core queues one transaction per source account, so a third account
    // sends the merge with the fee source as the operation's source.
    const merger = await generateFundedKeypair();
    const merge = new TransactionBuilder(
      await server.getAccount(merger.publicKey()),
      { fee: "1000", networkPassphrase },
    )
      .addOperation(
        Operation.accountMerge({
          source: feeSource.publicKey(),
          destination: merger.publicKey(),
        }),
      )
      .setTimeout(30)
      .build();
    merge.sign(merger, feeSource);

    const [sentBump, sentMerge] = await Promise.all([
      server.sendTransaction(bump),
      server.sendTransaction(merge),
    ]);
    expect(sentBump.status).toBe("PENDING");
    expect(sentMerge.status).toBe("PENDING");
    const [result, merged] = await Promise.all([
      server.pollTransaction(sentBump.hash, { attempts: 10 }),
      server.pollTransaction(sentMerge.hash, { attempts: 10 }),
    ]);
    if (
      result.status === rpc.Api.GetTransactionStatus.SUCCESS &&
      merged.status === rpc.Api.GetTransactionStatus.SUCCESS &&
      result.ledger === merged.ledger
    ) {
      return result;
    }
    // They landed in different ledgers, or one didn't land. Try again.
  }
  throw new Error("the fee bump and the merge never shared a ledger");
}

// What a transaction added to the fee pool: the pool's rise over its ledger,
// from the ledger headers, less the fees of the ledger's other transactions.
async function feePoolShare(result: Landed): Promise<bigint> {
  const { ledgers } = await server.getLedgers({
    startLedger: result.ledger - 1,
    pagination: { limit: 2 },
  });
  expect(ledgers.map(({ sequence }) => sequence)).toEqual([
    result.ledger - 1,
    result.ledger,
  ]);
  const [previous, current] = ledgers.map(
    ({ headerXdr }) => headerXdr.header.feePool,
  );
  const { transactions } = await server.getTransactions({
    startLedger: result.ledger,
    pagination: { limit: 200 },
  });
  const others = transactions
    .filter(
      ({ ledger, txHash }) =>
        ledger === result.ledger && txHash !== result.txHash,
    )
    .reduce((sum, tx) => sum + tx.resultXdr.feeCharged, 0n);
  return current! - previous! - others;
}

describe("rpc.inspectChargedFees", () => {
  let source: Keypair;

  beforeAll(async () => {
    source = await generateFundedKeypair();
  });

  it("splits a landed Soroban transaction's fee", async () => {
    const before = await balance(source);
    const prepared = await preparedSorobanTx(source);
    const result = await land(prepared);
    const fees = expectChargedAsReported(
      result,
      before - (await balance(source)),
      1,
    );

    expect(fees.declared.max).toBe(prepared.fee);

    // Creating the contract pays rent, which core counts in the refundable fee.
    const rent = BigInt(fees.charged.resource!.rent);
    expect(rent).toBeGreaterThan(0n);
    expect(rent).toBeLessThanOrEqual(BigInt(fees.charged.resource!.refundable));

    // A getTransactions entry carries the same envelope, result and meta.
    const { transactions } = await server.getTransactions({
      startLedger: result.ledger,
      pagination: { limit: 200 },
    });
    const entry = transactions.find(({ txHash }) => txHash === result.txHash);
    expect(entry).toBeDefined();
    expect(rpc.inspectChargedFees(entry!)).toEqual(fees);
  });

  // Core resets the consumed refundable fee on failure, but still reports the
  // split in meta v4.
  it("splits a failed Soroban transaction's fee", async () => {
    const asset = new Asset("FEE", Keypair.random().publicKey());
    const other = await generateFundedKeypair();
    const before = await balance(other);
    // Both are simulated before either lands, so the second one fails at
    // apply because the asset contract already exists.
    const first = await preparedSorobanTx(source, asset);
    const second = await preparedSorobanTx(other, asset);
    await land(first);
    const result = await land(second, rpc.Api.GetTransactionStatus.FAILED);
    const fees = expectChargedAsReported(
      result,
      before - (await balance(other)),
      1,
    );

    expect(fees.charged.resource!.refundable).toBe("0");
  });

  // The fee source pays for the inner operation plus the bump itself.
  it("splits a landed fee bump's fee", async () => {
    const feeSource = await generateFundedKeypair();
    const before = await balance(feeSource);
    const sourceBefore = await balance(source);
    const bump = TransactionBuilder.buildFeeBumpTransaction(
      feeSource,
      "2000",
      await preparedSorobanTx(source),
      networkPassphrase,
    );
    bump.sign(feeSource);
    const result = await land(bump);
    const fees = expectChargedAsReported(
      result,
      before - (await balance(feeSource)),
      2,
    );

    expect(fees.declared.max).toBe(bump.fee);
    expect(await balance(source)).toBe(sourceBefore);
  });

  // Core takes every fee before any transaction applies, so a fee source can
  // pay for a fee bump and be merged away in the same ledger. The refund then
  // has no account to go to and core keeps it.
  it("reports no refund when the fee source was merged in the same ledger", async () => {
    const result = await landFeeBumpWithMergedFeeSource(source, "2000");
    const fees = rpc.inspectChargedFees(result);
    const declared = BigInt(fees.declared.resource!);
    const consumed = BigInt(fees.charged.resource!.total);
    const keptRefund = declared - consumed;
    expect(keptRefund).toBeGreaterThan(0n);
    expect(metaFeeEvents(result)).toEqual([
      {
        stage: "transactionEventStageBeforeAllTxs",
        topicType: "scvSymbol",
        topic: "fee",
        dataType: "scvI128",
        amount: 200n + declared,
      },
    ]);
    expect(fees.refunded).toBe("0");
    expect(fees.charged.inclusion).toBe("200");
    expect(BigInt(fees.charged.total)).toBe(200n + declared);

    // The fee pool in the ledger header kept the refund: this transaction's
    // share of the pool's rise is the inclusion fee plus the whole declared
    // resource fee, not just the part it consumed.
    expect(await feePoolShare(result)).toBe(200n + consumed + keptRefund);

    // Without the events the kept refund would count as inclusion fee.
    // That is above the bid here, so the derived path gives up.
    expect(200n + keptRefund).toBeGreaterThan(BigInt(fees.declared.inclusion));
    const derived = rpc.inspectChargedFees(withoutFeeEvents(result));
    expect(derived.charged.inclusion).toBeNull();
    expect(derived.refunded).toBeNull();
  });

  // This pins a known wrong answer, and the server behavior that causes it.
  //
  // Without fee events, the only rule the protocol gives for the inclusion
  // fee is the one documented on SorobanTransactionMetaExtV1 in
  // Stellar-ledger.x: `feeCharged = resourceFeeCharged + inclusionFeeCharged`.
  // Core breaks that rule when it keeps the refund. `feeCharged` holds the
  // whole declared resource fee, but the breakdown still shows only what the
  // transaction consumed, and nothing in it says the refund was skipped.
  //
  // So the derived path counts the kept refund as inclusion fee and reports a
  // refund that was never paid. With a low bid the result is above the bid
  // and it returns null (the test above). With a high bid, as here, it can't
  // tell this from a transaction that paid a high inclusion fee and got its
  // refund.
  //
  // RPC always turns fee events on, so this only affects input without them,
  // such as meta from before protocol 23. If this test fails, core has
  // changed what it records for a skipped refund and the derived path, its
  // docs and this test need another look.
  it("counts a kept refund as inclusion fee without fee events, under a high bid", async () => {
    const result = await landFeeBumpWithMergedFeeSource(source, "10000000");
    const fees = rpc.inspectChargedFees(result);
    const keptRefund =
      BigInt(fees.declared.resource!) - BigInt(fees.charged.resource!.total);
    expect(keptRefund).toBeGreaterThan(0n);

    // The truth, from the fee events.
    expect(fees.charged.inclusion).toBe("200");
    expect(fees.refunded).toBe("0");

    // The bid is high enough to hide the kept refund.
    expect(200n + keptRefund).toBeLessThanOrEqual(
      BigInt(fees.declared.inclusion),
    );
    const derived = rpc.inspectChargedFees(withoutFeeEvents(result));
    expect(derived.charged.inclusion).toBe((200n + keptRefund).toString());
    expect(derived.refunded).toBe(keptRefund.toString());
    expect(derived.charged.resource).toEqual(fees.charged.resource);
    expect(derived.charged.total).toBe(fees.charged.total);
  });

  it("reports a landed classic transaction's whole fee as inclusion", async () => {
    const before = await balance(source);
    const account = await server.getAccount(source.publicKey());
    const tx = new TransactionBuilder(account, {
      fee: "1000",
      networkPassphrase,
    })
      .addOperation(Operation.bumpSequence({ bumpTo: "0" }))
      .setTimeout(30)
      .build();
    tx.sign(source);
    const fees = rpc.inspectChargedFees(await land(tx));

    expect(fees.declared.resource).toBeNull();
    expect(fees.charged.total).toBe("100");
    expect(BigInt(fees.charged.total)).toBe(before - (await balance(source)));
    expect(fees.charged.inclusion).toBe(fees.charged.total);
    expect(fees.charged.resource).toBeNull();
    expect(fees.refunded).toBeNull();
  });
});
