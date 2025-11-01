import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import { StellarSdk } from "../../../test-utils/stellar-sdk-import";
import { serverUrl } from "../../../constants";

const { nativeToScVal, rpc } = StellarSdk;
const { Server } = StellarSdk.rpc;

// Helper functions
function filterEvents(events: any[], filter: string): any[] {
  const parts = filter.split("/");
  return events.filter(
    (e: any) =>
      e.topic.length === parts.length &&
      e.topic.every((s: any, j: number) => s === parts[j] || parts[j] === "*"),
  );
}

function filterEventsByLedger(events: any[], start: number): any[] {
  return events.filter((e: any) => parseInt(e.ledger) >= start);
}

function setupMock(mockPost: any, _params: any, result: any): void {
  const mockResponse = { data: { result } };
  mockPost.mockResolvedValue(mockResponse);
}

function parseEvents(result: any): any {
  return rpc.parseRawEvents(result);
}

// Test data
const contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
const topicVals = [
  nativeToScVal("transfer", { type: "symbol" }).toXDR("base64"),
  nativeToScVal(contractId, { type: "address" }).toXDR("base64"),
  nativeToScVal(1234).toXDR("base64"),
];
const eventVal = nativeToScVal("wassup").toXDR("base64");
const getEventsResponseFixture = [
  {
    type: "system",
    ledger: "1",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId: "",
    id: "0164090849041387521-0000000003",
    cursor: "164090849041387521-3",
    inSuccessfulContractCall: true,
    topic: topicVals.slice(0, 2),
    value: eventVal,
    txHash: "d7d09af2ca4f2929ee701cf86d05e4ca5f849a726d0db344785a8f9894e79e6c",
  },
  {
    type: "contract",
    ledger: "2",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId,
    id: "0164090849041387521-0000000003",
    cursor: "164090849041387521-3",
    inSuccessfulContractCall: true,
    topic: topicVals.slice(0, 2),
    value: eventVal,
    txHash: "d7d09af2ca4f2929ee701cf86d05e4ca5f849a726d0db344785a8f9894e79e6c",
  },
  {
    type: "diagnostic",
    ledger: "2",
    ledgerClosedAt: "2022-11-16T16:10:41Z",
    contractId,
    id: "0164090849041387521-0000000003",
    cursor: "164090849041387521-3",
    inSuccessfulContractCall: true,
    topic: [topicVals[0]],
    value: eventVal,
    txHash: "d7d09af2ca4f2929ee701cf86d05e4ca5f849a726d0db344785a8f9894e79e6c",
  },
  {
    type: "contract",
    ledger: "3",
    ledgerClosedAt: "2022-12-14T01:01:20Z",
    contractId,
    id: "0000000171798695936-0000000001",
    cursor: "0000000171798695936-0000000001",
    inSuccessfulContractCall: true,
    topic: topicVals,
    value: eventVal,
    txHash: "d7d09af2ca4f2929ee701cf86d05e4ca5f849a726d0db344785a8f9894e79e6c",
  },
];

describe("Server#getEvents", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requests the correct endpoint", async () => {
    const result = {
      cursor: "164090849041387521-3",
      latestLedger: 0,
      oldestLedger: 0,
      oldestLedgerCloseTime: "0",
      latestLedgerCloseTime: "0",
      events: [],
    };
    setupMock(
      mockPost,
      {
        filters: [],
        pagination: {},
        startLedger: 1,
      },
      result,
    );

    const response = await server.getEvents({ startLedger: 1 });
    expect(response).toEqual(result);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getEvents",
      params: {
        filters: [],
        pagination: {},
        startLedger: 1,
      },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("can build wildcard filters", async () => {
    const result = {
      latestLedger: 0,
      oldestLedger: 0,
      oldestLedgerCloseTime: "0",
      latestLedgerCloseTime: "0",
      cursor: "164090849041387521-3",
      events: filterEvents(getEventsResponseFixture, "*/*"),
    };
    expect(result.events).not.toHaveLength(0);

    setupMock(
      mockPost,
      {
        startLedger: 1,
        filters: [
          {
            topics: [["*", "*"]],
          },
        ],
        pagination: {},
      },
      result,
    );

    const response = await server.getEvents({
      startLedger: 1,
      filters: [
        {
          topics: [["*", "*"]],
        },
      ],
    });
    expect(response).toEqual(parseEvents(result));
    expect(response.events[0].contractId).toBeUndefined();
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getEvents",
      params: {
        startLedger: 1,
        filters: [
          {
            topics: [["*", "*"]],
          },
        ],
        pagination: {},
      },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("can build matching filters", async () => {
    const result = {
      latestLedger: 0,
      oldestLedger: 0,
      oldestLedgerCloseTime: "0",
      latestLedgerCloseTime: "0",
      cursor: "164090849041387521-3",
      events: filterEvents(
        getEventsResponseFixture,
        `${topicVals[0]}/${topicVals[1]}`,
      ),
    };
    expect(result.events).not.toHaveLength(0);

    setupMock(
      mockPost,
      {
        startLedger: 1,
        filters: [
          {
            topics: [[topicVals[0], topicVals[1]]],
          },
        ],
        pagination: {},
      },
      result,
    );

    const response = await server.getEvents({
      startLedger: 1,
      filters: [
        {
          topics: [[topicVals[0], topicVals[1]]],
        },
      ],
    });
    expect(response).toEqual(parseEvents(result));
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getEvents",
      params: {
        startLedger: 1,
        filters: [
          {
            topics: [[topicVals[0], topicVals[1]]],
          },
        ],
        pagination: {},
      },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("can build mixed filters", async () => {
    const result = {
      latestLedger: 3,
      oldestLedger: 3,
      oldestLedgerCloseTime: "0",
      latestLedgerCloseTime: "0",
      cursor: "164090849041387521-3",
      events: filterEventsByLedger(
        filterEvents(getEventsResponseFixture, `${topicVals[0]}/*`),
        2,
      ),
    };
    expect(result.events).not.toHaveLength(0);

    setupMock(
      mockPost,
      {
        startLedger: 2,
        filters: [
          {
            topics: [[topicVals[0], "*"]],
          },
        ],
        pagination: {},
      },
      result,
    );

    const response = await server.getEvents({
      startLedger: 2,
      filters: [
        {
          topics: [[topicVals[0], "*"]],
        },
      ],
    });
    expect(response).toEqual(parseEvents(result));
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getEvents",
      params: {
        startLedger: 2,
        filters: [
          {
            topics: [[topicVals[0], "*"]],
          },
        ],
        pagination: {},
      },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("can paginate", async () => {
    const result = {
      latestLedger: 3,
      oldestLedger: 3,
      oldestLedgerCloseTime: "0",
      latestLedgerCloseTime: "0",
      cursor: "164090849041387521-3",
      events: filterEventsByLedger(
        filterEvents(getEventsResponseFixture, "*/*"),
        2,
      ),
    };
    expect(result.events).not.toHaveLength(0);

    setupMock(
      mockPost,
      {
        filters: [
          {
            topics: [["*", "*"]],
          },
        ],
        pagination: {
          limit: 10,
          cursor: "0164090849041387521-0000000000",
        },
      },
      result,
    );

    const response = await server.getEvents({
      filters: [
        {
          topics: [["*", "*"]],
        },
      ],
      cursor: "0164090849041387521-0000000000",
      limit: 10,
    });
    expect(response).toEqual(parseEvents(result));
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getEvents",
      params: {
        filters: [
          {
            topics: [["*", "*"]],
          },
        ],
        pagination: {
          limit: 10,
          cursor: "0164090849041387521-0000000000",
        },
      },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
