import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

import { serverUrl } from "../../../constants";

const { Server } = StellarSdk.rpc;

describe("Server#getLatestLedger", () => {
  let server: any;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requests the correct method", async () => {
    const result = {
      id: "hashed_id",
      sequence: 123,
      protocolVersion: 20,
    };
    const mockResponse = { data: { result } };
    mockPost.mockResolvedValue(mockResponse);

    const response = await server.getLatestLedger();
    expect(response).toEqual(result);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLatestLedger",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
