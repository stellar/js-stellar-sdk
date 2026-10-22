import { expect, describe, it } from "vitest";
import { nativeToScVal, rpc, StrKey } from "../../../lib/esm/index.js";

// Built here rather than imported from util.ts, whose import uploads the test
// contracts. This suite only reads, so it can run against any archival node.
const rpcUrl =
  process.env.SOROBAN_RPC_URL ?? "http://localhost:8000/soroban/rpc";
const server = new rpc.Server(rpcUrl, {
  allowHttp: rpcUrl.startsWith("http://"),
});

// Only the archival RPC node serves `queryEvents`. Probe once and skip the
// suite when the node answers "method not found".
async function supportsQueryEvents(): Promise<boolean> {
  try {
    await server._queryEvents({ order: "desc", limit: 1 });
    return true;
  } catch (err: any) {
    if (err?.code === -32601) {
      return false;
    }
    throw err;
  }
}

const supported = await supportsQueryEvents();

async function rejection(promise: Promise<unknown>): Promise<any> {
  return promise.then(
    () => {
      throw new Error("expected the request to reject");
    },
    (err) => err,
  );
}

function expectReason(err: unknown, reason: string) {
  expect(rpc.Api.isQueryEventsError(err)).toBe(true);
  expect((err as any).code).toBe(-32602);
  expect((err as any).data.reason).toBe(reason);
}

describe.skipIf(!supported)("Server#queryEvents", () => {
  it("accepts a range query once null, 0 and empty fields are omitted", async () => {
    const { sequence } = await server.getLatestLedger();
    const res = await server.queryEvents({
      minLedger: sequence - 10,
      maxLedger: 0,
      order: "" as any,
      limit: null as any,
      filters: [
        {
          type: "" as any,
          contractId: "",
          topic0: nativeToScVal("transfer", { type: "symbol" }),
          topic1: null as any,
        },
      ],
    });
    expect(Array.isArray(res.events)).toBe(true);
    expect(Object.values(rpc.Api.QueryEventsScanStatus)).toContain(
      res.scanStatus,
    );
  });

  it("returns COMPLETE with no cursor for a closed range", async () => {
    // A random contract has no events, so the scan reaches maxLedger instead
    // of filling a page, which a busy network would do in a few ledgers.
    const unusedContract = StrKey.encodeContract(
      crypto.getRandomValues(new Uint8Array(32)),
    );
    const { sequence } = await server.getLatestLedger();
    const res = await server.queryEvents({
      minLedger: sequence - 10,
      maxLedger: sequence - 1,
      filters: [{ contractId: unusedContract }],
    });
    expect(res.events).toEqual([]);
    expect(res.scanStatus).toBe(rpc.Api.QueryEventsScanStatus.COMPLETE);
    expect("cursor" in res).toBe(false);
  });

  it("accepts desc with no bounds", async () => {
    const res = await server.queryEvents({ order: "desc", limit: 5 });
    expect(res.latestLedger).toBeGreaterThan(0);
    expect(res.oldestLedger).toBeGreaterThan(0);
  });

  it("rejects limit 0 with invalid_params", async () => {
    const err = await rejection(
      server.queryEvents({ order: "desc", limit: 0 }),
    );
    expectReason(err, "invalid_params");
  });

  it("rejects an empty filters array with invalid_params", async () => {
    const err = await rejection(
      server.queryEvents({ order: "desc", filters: [] }),
    );
    expectReason(err, "invalid_params");
  });

  it("rejects a negative minLedger with invalid_params", async () => {
    const err = await rejection(server._queryEvents({ minLedger: -1 }));
    expectReason(err, "invalid_params");
  });

  it("rejects a fractional limit with invalid_params", async () => {
    const err = await rejection(
      server._queryEvents({ order: "desc", limit: 1.5 }),
    );
    expectReason(err, "invalid_params");
  });

  it("rejects a minLedger above the latest ledger with ledger_out_of_range", async () => {
    const { sequence } = await server.getLatestLedger();
    const err = await rejection(
      server.queryEvents({ order: "desc", minLedger: sequence + 1000 }),
    );
    expectReason(err, "ledger_out_of_range");
    expect(typeof err.data.missingLedger).toBe("number");
    expect(typeof err.data.oldestLedger).toBe("number");
    expect(typeof err.data.latestLedger).toBe("number");
  });

  it("rejects a malformed cursor with cursor_malformed", async () => {
    const err = await rejection(server.queryEvents({ cursor: "not-a-cursor" }));
    expectReason(err, "cursor_malformed");
    expect(typeof err.data.oldestLedger).toBe("number");
    expect(typeof err.data.latestLedger).toBe("number");
  });
});
