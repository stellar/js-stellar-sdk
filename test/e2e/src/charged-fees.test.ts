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
    for (let attempt = 0; attempt < 5; attempt++) {
      const feeSource = await generateFundedKeypair();
      const bump = TransactionBuilder.buildFeeBumpTransaction(
        feeSource,
        "2000",
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
        result.status !== rpc.Api.GetTransactionStatus.SUCCESS ||
        merged.status !== rpc.Api.GetTransactionStatus.SUCCESS ||
        result.ledger !== merged.ledger
      ) {
        // They landed in different ledgers, or one didn't land. Try again.
        continue;
      }

      const fees = rpc.inspectChargedFees(result);
      const declared = BigInt(fees.declared.resource!);
      const consumed = BigInt(fees.charged.resource!.total);
      expect(metaFeeEvents(result)).toEqual([
        {
          stage: "transactionEventStageBeforeAllTxs",
          topicType: "scvSymbol",
          topic: "fee",
          dataType: "scvI128",
          amount: 200n + declared,
        },
      ]);
      expect(consumed).toBeLessThan(declared);
      expect(fees.refunded).toBe("0");
      expect(fees.charged.inclusion).toBe("200");
      expect(BigInt(fees.charged.total)).toBe(200n + declared);

      // Without the events the lost refund would count as inclusion fee.
      // That is above the bid here, so the derived path gives up.
      expect(200n + declared - consumed).toBeGreaterThan(
        BigInt(fees.declared.inclusion),
      );
      const derived = rpc.inspectChargedFees(withoutFeeEvents(result));
      expect(derived.charged.inclusion).toBeNull();
      expect(derived.refunded).toBeNull();
      return;
    }
    throw new Error("the fee bump and the merge never shared a ledger");
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
