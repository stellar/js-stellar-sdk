import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

import { serverUrl } from "../../../constants";

const { Server } = StellarSdk.rpc;

describe("Server#getFeeStats", () => {
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
    const innerFeeStat = {
      max: "100000000000000000000", // just > uint32
      min: "100",
      mode: "100",
      p10: "100",
      p20: "100",
      p30: "100",
      p40: "100",
      p50: "100",
      p60: "100",
      p70: "100",
      p80: "100",
      p90: "100",
      p95: "100",
      p99: "100",
      transactionCount: "200",
      ledgerCount: "300",
    };
    const result = {
      sorobanInclusionFee: innerFeeStat,
      inclusionFee: innerFeeStat,
      latestLedger: "12345678",
    };

    const mockResponse = { data: { result } };
    mockPost.mockResolvedValue(mockResponse);

    const response = await server.getFeeStats();
    expect(response).toEqual(result);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getFeeStats",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
