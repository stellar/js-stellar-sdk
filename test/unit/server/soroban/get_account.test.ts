import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../../src/index.js";

import { serverUrl } from "../../../constants.js";

const { Account, Keypair, xdr } = StellarSdk;

const { Server } = StellarSdk.rpc;

describe("Server#getAccount", () => {
  let server: rpc.Server;
  let mockPost: any;

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const address = "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
  const accountId = Keypair.fromPublicKey(address).xdrPublicKey();
  const key = xdr.LedgerKey.account({ accountId: accountId });
  const accountEntry =
    "AAAAAAAAAABzdv3ojkzWHMD7KUoXhrPx0GH18vHKV0ZfqpMiEblG1g3gtpoE608YAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAQAAAAAY9D8iA";

  it("requests the correct method", async () => {
    const mockResponse = {
      data: {
        result: {
          latestLedger: 0,
          entries: [
            {
              key: xdr.LedgerKey.toXDR(key, "base64"),
              xdr: accountEntry,
            },
          ],
        },
      },
    };

    mockPost.mockResolvedValue(mockResponse);

    const expected = new Account(address, "1");
    const response = await server.getAccount(address);

    expect(response).toEqual(expected);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [xdr.LedgerKey.toXDR(key, "base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("throws a useful error when the account is not found", async () => {
    const mockResponse = {
      data: {
        result: {
          latestLedger: 0,
          entries: null,
        },
      },
    };

    mockPost.mockResolvedValue(mockResponse);

    await expect(server.getAccount(address)).rejects.toThrow(
      `Account not found: ${address}`,
    );
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [xdr.LedgerKey.toXDR(key, "base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
