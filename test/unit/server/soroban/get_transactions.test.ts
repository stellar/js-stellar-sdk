import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

import { serverUrl } from "../../../constants";

const { xdr } = StellarSdk;
const { Server } = StellarSdk.rpc;

function makeTxResult(
  ledger: number,
  applicationOrder: number,
  status: string,
) {
  // Use a simple valid XDR string for testing
  const metaV3Xdr =
    "AAAAAgAAAAIAAAADAtL5awAAAAAAAAAAS0CFMhOtWUKJWerx66zxkxORaiH6/3RUq7L8zspD5RoAAAAAAcm9QAKVkpMAAHpMAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAwAAAAAC0vi5AAAAAGTB02oAAAAAAAAAAQLS+WsAAAAAAAAAAEtAhTITrVlCiVnq8eus8ZMTkWoh+v90VKuy/M7KQ+UaAAAAAAHJvUAClZKTAAB6TQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAtL5awAAAABkwdd1AAAAAAAAAAEAAAAGAAAAAwLS+VQAAAACAAAAAG4cwu71zHNXx3jHCzRGOIthcnfwRgfN2f/AoHFLLMclAAAAAEySDkgAAAAAAAAAAkJVU0lORVNTAAAAAAAAAAC3JfDeo9vreItKNPoe74EkFIqWybeUQNFvLvURhHtskAAAAAAeQtHTL5f6TAAAXH0AAAAAAAAAAAAAAAAAAAABAtL5awAAAAIAAAAAbhzC7vXMc1fHeMcLNEY4i2Fyd/BGB83Z/8CgcUssxyUAAAAATJIOSAAAAAAAAAACQlVTSU5FU1MAAAAAAAAAALcl8N6j2+t4i0o0+h7vgSQUipbJt5RA0W8u9RGEe2yQAAAAAB5C0dNHf4CAAACLCQAAAAAAAAAAAAAAAAAAAAMC0vlUAAAAAQAAAABuHMLu9cxzV8d4xws0RjiLYXJ38EYHzdn/wKBxSyzHJQAAAAJCVVNJTkVTUwAAAAAAAAAAtyXw3qPb63iLSjT6Hu+BJBSKlsm3lEDRby71EYR7bJAAAAAAAABAL3//////////AAAAAQAAAAEAE3H3TnhnuQAAAAAAAAAAAAAAAAAAAAAAAAABAtL5awAAAAEAAAAAbhzC7vXMc1fHeMcLNEY4i2Fyd/BGB83Z/8CgcUssxyUAAAACQlVTSU5FU1MAAAAAAAAAALcl8N6j2+t4i0o0+h7vgSQUipbJt5RA0W8u9RGEe2yQAAAAAAAAQC9//////////wAAAAEAAAABABNx9J6Z4RkAAAAAAAAAAAAAAAAAAAAAAAAAAwLS+WsAAAAAAAAAAG4cwu71zHNXx3jHCzRGOIthcnfwRgfN2f/AoHFLLMclAAAAH37+zXQCXdRTAAASZAAAApIAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAABbBXKIigAAABhZWyiOAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAtL0awAAAABkwbqrAAAAAAAAAAEC0vlrAAAAAAAAAABuHMLu9cxzV8d4xws0RjiLYXJ38EYHzdn/wKBxSyzHJQAAAB9+/s10Al3UUwAAEmQAAAKSAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAWwVyiIoAAAAYWVsojgAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAALS9GsAAAAAZMG6qwAAAAAAAAAA";

  return {
    status,
    ledger,
    txHash: "ae9f315c048d87a5f853bc15bf284a2c3c89eb0e1cb38c10409b77a877b830a8",
    createdAt: ledger * 25 + 100,
    applicationOrder,
    feeBump: false,
    envelopeXdr:
      "AAAAAgAAAAAT/LQZdYz0FcQ4Xwyg8IM17rkUx3pPCCWLu+SowQ/T+gBLB24poiQa9iwAngAAAAEAAAAAAAAAAAAAAABkwdeeAAAAAAAAAAEAAAABAAAAAC/9E8hDhnktyufVBS5tqA734Yz5XrLX2XNgBgH/YEkiAAAADQAAAAAAAAAAAAA1/gAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA1/gAAAAQAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AAAACUEFMTEFESVVNAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAAAAAAAACwQ/T+gAAAEA+ztVEKWlqHXNnqy6FXJeHr7TltHzZE6YZm5yZfzPIfLaqpp+5cyKotVkj3d89uZCQNsKsZI48uoyERLne+VwL/2BJIgAAAEA7323gPSaezVSa7Vi0J4PqsnklDH1oHLqNBLwi5EWo5W7ohLGObRVQZ0K0+ufnm4hcm9J4Cuj64gEtpjq5j5cM",
    resultXdr:
      "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAANAAAAAAAAAAUAAAACZ4W6fmN63uhVqYRcHET+D2NEtJvhCIYflFh9GqtY+AwAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAYW0toL2gAAAAAAAAAAAAANf4AAAACcgyAkXD5kObNTeRYciLh7R6ES/zzKp0n+cIK3Y6TjBkAAAABU0dYAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGlGnIJrXAAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGFtLaC9oAAAAApmc7UgUBInrDvij8HMSridx2n1w3I8TVEn4sLr1LSpmAAAAAlBBTExBRElVTQAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAIUz88EqYAAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABpRpyCa1wAAAAKYUsaaCZ233xB1p+lG7YksShJWfrjsmItbokiR3ifa0gAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAJQQUxMQURJVU0AAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AACFM/PBKmAAAAAJnhbp+Y3re6FWphFwcRP4PY0S0m+EIhh+UWH0aq1j4DAAAAAAAAAAAAAA9pAAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA9pAAAAAA=",
    resultMetaXdr: metaV3Xdr,
    events: {
      contractEventsXdr: [],
      transactionEventsXdr: [],
    },
  };
}

function makeGetTransactionsResult(count = 2) {
  const transactions = [];
  for (let i = 0; i < count; i += 1) {
    transactions.push(makeTxResult(1234 + i, i + 1, "SUCCESS"));
  }
  return {
    transactions,
    latestLedger: 100,
    latestLedgerCloseTimestamp: 987654321,
    oldestLedger: 1,
    oldestLedgerCloseTimestamp: 123456789,
    cursor: "123456",
  };
}

describe("Server#getTransactions", () => {
  let server: any;
  let mockPost: any;
  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches transactions successfully", async () => {
    const rawResult = makeGetTransactionsResult();
    const mockResponse = { data: { id: 1, result: rawResult } };
    mockPost.mockResolvedValue(mockResponse);

    const resp = await server.getTransactions({ startLedger: 1234, limit: 10 });
    expect(resp.transactions).toHaveLength(2);
    expect(resp.transactions[0].status).toBe("SUCCESS");
    expect(resp.transactions[0].envelopeXdr).toBeInstanceOf(
      xdr.TransactionEnvelope,
    );
    expect(resp.transactions[0].resultXdr).toBeInstanceOf(
      xdr.TransactionResult,
    );
    expect(resp.transactions[0].resultMetaXdr).toBeInstanceOf(
      xdr.TransactionMeta,
    );
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getTransactions",
      params: {
        startLedger: 1234,
        limit: 10,
      },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("empty transaction list", async () => {
    const result = {
      transactions: [],
      latestLedger: 100,
      oldestLedger: 1,
      oldestLedgerCloseTimestamp: 123456789,
      latestLedgerCloseTimestamp: 987654321,
      cursor: "123456",
    };
    const mockResponse = { data: { id: 1, result } };
    mockPost.mockResolvedValue(mockResponse);

    const resp = await server.getTransactions({ startLedger: 1234, limit: 10 });
    expect(Array.isArray(resp.transactions)).toBeTruthy();
    expect(resp.transactions).toHaveLength(0);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getTransactions",
      params: {
        startLedger: 1234,
        limit: 10,
      },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("handles pagination", async () => {
    const result = makeGetTransactionsResult(5);
    const mockResponse = { data: { id: 1, result } };
    mockPost.mockResolvedValue(mockResponse);

    const resp = await server.getTransactions({
      startLedger: 1234,
      limit: 10,
      cursor: "abc123",
    });
    expect(resp.transactions).toHaveLength(5);
    expect(resp.cursor).toBe("123456");
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getTransactions",
      params: {
        startLedger: 1234,
        limit: 10,
        cursor: "abc123",
      },
    });
  });
});
