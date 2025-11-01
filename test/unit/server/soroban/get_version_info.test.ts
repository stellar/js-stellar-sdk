import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

import { serverUrl } from "../../../constants";

const { Server } = StellarSdk.rpc;

describe("Server#getVersionInfo", () => {
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
      version: "21.4.0-dbb390c6bb99024122fccb12c8219af67d50db04",
      commit_hash: "dbb390c6bb99024122fccb12c8219af67d50db04",
      build_time_stamp: "2024-07-10T14:50:09",
      captive_core_version:
        "stellar-core 21.1.1 (b3aeb14cc798f6d11deb2be913041be916f3b0cc)",
      protocol_version: 21,
    };

    const mockResponse = { data: { result } };
    mockPost.mockResolvedValue(mockResponse);

    const response = await server.getVersionInfo();
    expect(response).toEqual(result);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getVersionInfo",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
