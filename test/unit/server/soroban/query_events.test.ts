import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import * as StellarSdk from "../../../../src/index.js";
import { serverUrl } from "../../../constants.js";

const { Contract, nativeToScVal, scValToNative, rpc } = StellarSdk;
const { Server } = rpc;

const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
const transferTopic = nativeToScVal("transfer", { type: "symbol" });
const transferTopicXdr = transferTopic.toXdr("base64");
const addressTopicXdr = nativeToScVal(contractId, { type: "address" }).toXdr(
  "base64",
);
const valueXdr = nativeToScVal(1234).toXdr("base64");

const rawEvent = {
  type: "contract",
  ledger: 12345,
  ledgerClosedAt: "2026-10-01T12:00:00Z",
  contractId,
  id: "0000053021003624448-0000000001",
  txHash: "d7d09af2ca4f2929ee701cf86d05e4ca5f849a726d0db344785a8f9894e79e6c",
  transactionIndex: 1,
  operationIndex: 0,
  topic: [transferTopicXdr, addressTopicXdr],
  value: valueXdr,
};

const rawResponse = {
  events: [rawEvent, { ...rawEvent, id: "0000053021003624448-0000000002" }],
  cursor: "0000053021003624448-0000000002",
  scanStatus: "HAS_MORE",
  scannedLedger: 12345,
  oldestLedger: 1000,
  latestLedger: 20000,
};

// The example result from the SDK author guide (values are illustrative).
const gistExampleResult = {
  events: [
    {
      type: "contract",
      ledger: 1189981,
      ledgerClosedAt: "2024-04-25T17:52:46Z",
      contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      id: "0005110929477865472-0000000000",
      transactionIndex: 1,
      operationIndex: 0,
      txHash:
        "5bd25a1a8fd1fe8ec99ab1fdd57af9a6f0e4c7c8a3c1b7d2e9f0a1b2c3d4e5f6",
      topic: [
        "AAAADwAAAAh0cmFuc2Zlcg==",
        "AAAAEgAAAAAAAAAAeo0X4ISuIjuArAyYXR0z8qyj0x0MHpv92CTtN4PONek=",
        "AAAAEgAAAAAAAAAAfn3koV5C+Z6q8U1LfPwlofeZ3jnWI6Iudfg5NOEmOtg=",
      ],
      value: "AAAACgAAAAAAAAAAAAAAAAX14QA=",
    },
    {
      type: "contract",
      ledger: 1189977,
      ledgerClosedAt: "2024-04-25T17:52:26Z",
      contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      id: "0005110912298004480-0000000000",
      transactionIndex: 3,
      operationIndex: 0,
      txHash:
        "e1f2a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f70",
      topic: [
        "AAAADwAAAAh0cmFuc2Zlcg==",
        "AAAAEgAAAAAAAAAAfn3koV5C+Z6q8U1LfPwlofeZ3jnWI6Iudfg5NOEmOtg=",
        "AAAAEgAAAAAAAAAAeo0X4ISuIjuArAyYXR0z8qyj0x0MHpv92CTtN4PONek=",
      ],
      value: "AAAACgAAAAAAAAAAAAAAAACYloA=",
    },
  ],
  cursor: "gec1_AQEAAAASJnIAAAASJm0AAAAB...",
  scanStatus: "HAS_MORE",
  scannedLedger: 1189978,
  oldestLedger: 2,
  latestLedger: 1190004,
};

describe("Server#queryEvents", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function respond(result: unknown = rawResponse) {
    mockPost.mockResolvedValue({ data: { result } });
  }

  function postedParams(): Record<string, unknown> {
    expect(mockPost).toHaveBeenCalledTimes(1);
    const body = mockPost.mock.calls[0][1];
    expect(body.method).toBe("queryEvents");
    return body.params;
  }

  it("sends a range query with exactly the set fields", async () => {
    respond();
    await server.queryEvents({
      minLedger: 100,
      maxLedger: undefined,
      order: "asc",
      limit: null as any,
      filters: [
        { type: "contract", contractId, topic0: undefined, topic1: null },
      ],
    });
    const params = postedParams();
    expect(Object.keys(params).sort()).toEqual(
      ["filters", "minLedger", "order"].sort(),
    );
    expect(params).toEqual({
      minLedger: 100,
      order: "asc",
      filters: [{ type: "contract", contractId }],
    });
    expect(Object.keys((params.filters as any[])[0]).sort()).toEqual([
      "contractId",
      "type",
    ]);
  });

  it("sends no minLedger for a desc query without one", async () => {
    respond();
    await server.queryEvents({ order: "desc" });
    expect(postedParams()).toEqual({ order: "desc" });
  });

  it("encodes ScVal topics and passes string topics", async () => {
    respond();
    await server.queryEvents({
      minLedger: 1,
      filters: [
        {
          topic0: transferTopic,
          topic1: addressTopicXdr,
          topic2: null as any,
        },
      ],
    });
    const filter = (postedParams().filters as any[])[0];
    expect(Object.keys(filter).sort()).toEqual(["topic0", "topic1"]);
    expect(filter.topic0).toBe(transferTopicXdr);
    expect(filter.topic1).toBe(addressTopicXdr);
  });

  it("sends only cursor and limit for a continuation", async () => {
    respond();
    await server.queryEvents({ cursor: "abc", limit: 10 });
    const params = postedParams();
    expect(Object.keys(params).sort()).toEqual(["cursor", "limit"]);
    expect(params).toEqual({ cursor: "abc", limit: 10 });
  });

  it("never sends xdrFormat or unknown filter keys", async () => {
    respond();
    await server.queryEvents({
      minLedger: 1,
      xdrFormat: "json",
      filters: [{ contractId, extra: 1 }],
    } as any);
    const params = postedParams();
    expect(Object.keys(params).sort()).toEqual(["filters", "minLedger"]);
    expect(Object.keys((params.filters as any[])[0])).toEqual(["contractId"]);
  });

  it("does not mutate the caller's request", async () => {
    respond();
    const filter = { contractId, topic0: transferTopic };
    const req = { minLedger: 1, limit: undefined, filters: [filter] };
    const snapshot = { ...req, filters: [{ ...filter }] };
    await server.queryEvents(req);
    expect(req).toEqual(snapshot);
    expect(Object.keys(req).sort()).toEqual(["filters", "limit", "minLedger"]);
    expect(req.filters[0]).toBe(filter);
    expect(req.filters[0].topic0).toBe(transferTopic);
  });

  it("drops zero ledgers and empty strings but sends limit 0 and empty topics", async () => {
    respond();
    await server.queryEvents({
      minLedger: 0,
      maxLedger: 0,
      order: "" as any,
      limit: 0,
      filters: [{ contractId: "", type: "" as any, topic0: "" }],
    });
    const params = postedParams();
    expect(Object.keys(params).sort()).toEqual(["filters", "limit"]);
    expect(params.limit).toBe(0);
    expect(params.filters).toEqual([{ topic0: "" }]);
  });

  it.each([
    ["undefined", { cursor: undefined }],
    ["empty", { cursor: "" }],
    ["null", { cursor: null }],
    ["a number", { cursor: 123 }],
  ])("rejects a %s cursor without a range", async (_name, req) => {
    respond();
    await expect(server.queryEvents(req as any)).rejects.toThrow(TypeError);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("treats an undefined cursor next to a range as a range query", async () => {
    respond();
    await server.queryEvents({ minLedger: 5, cursor: undefined });
    const params = postedParams();
    expect(Object.keys(params)).toEqual(["minLedger"]);
    expect(params).toEqual({ minLedger: 5 });
  });

  describe.each(["minLedger", "maxLedger", "limit"])("%s", (key) => {
    it.each([NaN, Infinity, -Infinity, "5"])("rejects %s", async (value) => {
      respond();
      const req = { order: "desc", [key]: value };
      await expect(server.queryEvents(req as any)).rejects.toThrow(TypeError);
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  it.each([null, 5, "x", true])("rejects a %j filter entry", async (entry) => {
    respond();
    await expect(
      server.queryEvents({ minLedger: 1, filters: [entry] as any }),
    ).rejects.toThrow(new TypeError("queryEvents filter must be an object"));
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("sends an empty filters array", async () => {
    respond();
    await server.queryEvents({ minLedger: 1, filters: [] });
    expect(postedParams()).toEqual({ minLedger: 1, filters: [] });
  });

  it("encodes a foreign object topic through its toXdr", async () => {
    respond();
    const foreign = {
      toXdr: vi.fn((format: string) => `encoded-${format}`),
    };
    await server.queryEvents({
      minLedger: 1,
      filters: [{ topic0: foreign as any }],
    });
    expect(foreign.toXdr).toHaveBeenCalledWith("base64");
    expect((postedParams().filters as any[])[0]).toEqual({
      topic0: "encoded-base64",
    });
  });

  it.each([
    ["a number", 5],
    ["a Uint8Array", new Uint8Array([1, 2])],
  ])("rejects %s topic", async (_name, topic) => {
    respond();
    await expect(
      server.queryEvents({ minLedger: 1, filters: [{ topic0: topic as any }] }),
    ).rejects.toThrow(TypeError);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("parses the author guide's example result", async () => {
    respond(gistExampleResult);
    const res = await server.queryEvents({ minLedger: 1189977 });
    expect(res.events).toHaveLength(2);
    for (const [i, evt] of res.events.entries()) {
      const raw = gistExampleResult.events[i];
      expect(evt.contractId).toBeInstanceOf(Contract);
      expect(evt.contractId.contractId()).toBe(raw.contractId);
      expect(evt.topic.map((t: any) => t.toXdr("base64"))).toEqual(raw.topic);
      expect(evt.value.toXdr("base64")).toBe(raw.value);
      expect(evt.ledger).toBe(raw.ledger);
      expect(evt.transactionIndex).toBe(raw.transactionIndex);
    }
    expect(scValToNative(res.events[0].topic[0])).toBe("transfer");
    expect(scValToNative(res.events[0].value)).toBe(100000000n);
    expect(res.cursor).toBe(gistExampleResult.cursor);
    expect(res.scanStatus).toBe(rpc.Api.QueryEventsScanStatus.HAS_MORE);
    expect(res.scannedLedger).toBe(1189978);
    expect(res.oldestLedger).toBe(2);
    expect(res.latestLedger).toBe(1190004);
  });

  it("parses a page of events", async () => {
    respond();
    const res = await server.queryEvents({ minLedger: 1000 });
    expect(res.events).toHaveLength(2);
    const [evt] = res.events;
    expect(evt.contractId).toBeInstanceOf(Contract);
    expect(evt.contractId.contractId()).toBe(contractId);
    expect(evt.topic.map((t: any) => t.toXdr("base64"))).toEqual([
      transferTopicXdr,
      addressTopicXdr,
    ]);
    expect(evt.value.toXdr("base64")).toBe(valueXdr);
    expect(evt.id).toBe(rawEvent.id);
    expect(evt.txHash).toBe(rawEvent.txHash);
    expect(res.cursor).toBe(rawResponse.cursor);
    expect(res.scanStatus).toBe(rpc.Api.QueryEventsScanStatus.HAS_MORE);
    expect(res.scannedLedger).toBe(12345);
    expect(res.oldestLedger).toBe(1000);
    expect(res.latestLedger).toBe(20000);
  });

  it("drops an empty contractId", async () => {
    respond({ ...rawResponse, events: [{ ...rawEvent, contractId: "" }] });
    const res = await server.queryEvents({ minLedger: 1 });
    expect("contractId" in res.events[0]).toBe(false);
  });

  it.each([null, []])("parses events %j as []", async (events) => {
    respond({ ...rawResponse, events });
    const res = await server.queryEvents({ minLedger: 1 });
    expect(res.events).toEqual([]);
  });

  it("parses a COMPLETE page with no cursor key", async () => {
    const { cursor: _cursor, ...rest } = rawResponse;
    respond({ ...rest, scanStatus: "COMPLETE" });
    const res = await server.queryEvents({ minLedger: 1, maxLedger: 2 });
    expect(res.scanStatus).toBe(rpc.Api.QueryEventsScanStatus.COMPLETE);
    expect("cursor" in res).toBe(false);
  });

  it("_queryEvents passes JSON events through, which the parser rejects", async () => {
    const { topic: _topic, value: _value, ...base } = rawEvent;
    const jsonEvent = {
      ...base,
      topicJson: [{ symbol: "transfer" }],
      valueJson: { i128: "1234" },
    };
    const raw = { ...rawResponse, events: [jsonEvent] };
    respond(raw);
    const res = await server._queryEvents({ minLedger: 1, xdrFormat: "json" });
    expect(postedParams()).toEqual({ minLedger: 1, xdrFormat: "json" });
    expect(res.events[0].topicJson).toEqual(jsonEvent.topicJson);
    expect(res.events[0].valueJson).toEqual(jsonEvent.valueJson);
    expect(() => rpc.parseRawQueryEvents(res)).toThrow(
      'queryEvents event has no base64 value; was xdrFormat "json"?',
    );
  });

  it("keeps unknown event fields when parsing", () => {
    const evt = { ...rawEvent, futureField: "x" };
    const parsedQuery = rpc.parseRawQueryEvents({
      ...rawResponse,
      events: [evt],
    } as any);
    expect((parsedQuery.events[0] as any).futureField).toBe("x");
    const parsedGet = rpc.parseRawEvents({
      latestLedger: 1,
      oldestLedger: 1,
      latestLedgerCloseTime: "0",
      oldestLedgerCloseTime: "0",
      cursor: "",
      events: [evt],
    } as any);
    expect((parsedGet.events[0] as any).futureField).toBe("x");
  });

  it.each([
    { reason: "invalid_params", termsUsed: 300, termBudget: 256 },
    {
      reason: "ledger_out_of_range",
      missingLedger: 5,
      oldestLedger: 10,
      latestLedger: 20,
    },
    { reason: "cursor_malformed", oldestLedger: 10, latestLedger: 20 },
  ])("rejects with the raw $reason error", async (data) => {
    const error = { code: -32602, message: "bad", data };
    mockPost.mockResolvedValue({ data: { error } });
    const err = await server.queryEvents({ minLedger: 1 }).catch((e: any) => e);
    expect(err).toBe(error);
    expect(rpc.Api.isQueryEventsError(err)).toBe(true);
    expect(err.data).toEqual(data);
  });

  it.each([
    ["null", null],
    ["a string", "error"],
    ["method not found", { code: -32601, message: "method not found" }],
    ["-32602 with no data", { code: -32602, message: "bad" }],
    ["an unknown reason", { code: -32602, data: { reason: "other" } }],
    ["reason toString", { code: -32602, data: { reason: "toString" } }],
    ["reason __proto__", { code: -32602, data: { reason: "__proto__" } }],
    ["an internal error", { code: -32603, data: { reason: "invalid_params" } }],
  ])("isQueryEventsError is false for %s", (_name, err) => {
    expect(rpc.Api.isQueryEventsError(err)).toBe(false);
  });
});
