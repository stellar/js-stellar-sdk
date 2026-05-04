import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../../src/index.js";

import { serverUrl } from "../../../constants";

const { Keypair, Networks, xdr } = StellarSdk;
const { Server } = StellarSdk.rpc;

// ripped out of ./get_transaction_test.js

describe("Server#requestAirdrop", () => {
  let server: any;
  let mockPost: any;

  function accountLedgerEntryData() {
    // Create a valid account ledger entry
    const accountId = Keypair.fromPublicKey(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
    ).xdrPublicKey();
    const accountEntry = new xdr.AccountEntry({
      accountId,
      balance: xdr.Int64.fromString("1000000000"),
      seqNum: xdr.Int64.fromString("1234"),
      numSubEntries: 0,
      inflationDest: null,
      flags: 0,
      homeDomain: "",
      thresholds: Buffer.from("AQAAAA==", "base64"),
      signers: [],
      ext: new (xdr.AccountEntryExt as any)(0),
    });
    return xdr.LedgerEntryData.account(accountEntry);
  }

  // Create a mock transaction meta for the account we're going to request an airdrop for
  function transactionMetaFor() {
    // Create a proper TransactionMetaV2 that includes account creation
    // We need to create a meta with a ledgerEntryCreated change for an account
    const accountId = Keypair.fromPublicKey(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
    ).xdrPublicKey();
    const accountEntry = new xdr.AccountEntry({
      accountId,
      balance: xdr.Int64.fromString("1000000000"),
      seqNum: xdr.Int64.fromString("1234"),
      numSubEntries: 0,
      inflationDest: null,
      flags: 0,
      homeDomain: "",
      thresholds: Buffer.from("AQAAAA==", "base64"),
      signers: [],
      ext: new (xdr.AccountEntryExt as any)(0),
    });

    // Create a ledger entry change that represents account creation
    const ledgerEntryData = xdr.LedgerEntryData.account(accountEntry);
    const ledgerEntry = new xdr.LedgerEntry({
      lastModifiedLedgerSeq: 1234,
      data: ledgerEntryData,
      ext: new (xdr.LedgerEntryExt as any)(0),
    });

    const ledgerEntryChange =
      xdr.LedgerEntryChange.ledgerEntryCreated(ledgerEntry);
    const operationMeta = new xdr.OperationMeta({
      changes: [ledgerEntryChange],
    });

    const transactionMetaV2 = new xdr.TransactionMetaV2({
      txChangesBefore: [],
      operations: [operationMeta],
      txChangesAfter: [],
    });

    return new (xdr.TransactionMeta as any)(2, transactionMetaV2);
  }

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns true when the account is created", async () => {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const networkResult = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    const resultMetaXdr = transactionMetaFor().toXDR("base64");

    // Mock the friendbot call with result_meta_xdr
    const friendbotResponse = {
      status: 200,
      data: {
        result_meta_xdr: resultMetaXdr,
      },
    };

    // Mock the sequence of calls
    mockPost
      .mockResolvedValueOnce(networkResponse) // getNetwork call
      .mockResolvedValueOnce(friendbotResponse); // friendbot call

    const result = await server.requestAirdrop(accountId);
    expect(result).toBeInstanceOf(StellarSdk.Account);
    expect(result.accountId()).toBe(accountId);
    expect(result.sequence.toNumber()).toEqual(1234);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getNetwork",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledWith(`${friendbotUrl}?addr=${accountId}`);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("returns false if the account already exists", async () => {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const networkResult = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    // Mock the friendbot call to return 400 error for existing account
    const friendbotError = {
      response: {
        status: 400,
        data: { detail: "createAccountAlreadyExist" },
      },
    };

    // Mock getLedgerEntry call for existing account
    const accountEntry = accountLedgerEntryData();
    const accountKeypair = Keypair.fromPublicKey(accountId);
    const ledgerKey = xdr.LedgerKey.account(
      new xdr.LedgerKeyAccount({
        accountId: accountKeypair.xdrPublicKey(),
      }),
    );
    const ledgerEntryResponse = {
      data: {
        result: {
          latestLedger: 0,
          entries: [
            {
              key: ledgerKey.toXDR("base64"),
              xdr: accountEntry.toXDR("base64"),
            },
          ],
        },
      },
    };

    // Mock the sequence of calls
    mockPost
      .mockResolvedValueOnce(networkResponse) // getNetwork call
      .mockRejectedValueOnce(friendbotError) // friendbot call fails with 400
      .mockResolvedValueOnce(ledgerEntryResponse); // getLedgerEntry call

    const result = await server.requestAirdrop(accountId);
    expect(result).toBeInstanceOf(StellarSdk.Account);
    expect(result.accountId()).toBe(accountId);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getNetwork",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledWith(`${friendbotUrl}?addr=${accountId}`);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getLedgerEntries",
      params: { keys: [ledgerKey.toXDR("base64")] },
    });
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it("throws an error if friendbot is not available", async () => {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const networkResult = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    // Mock the sequence of calls
    mockPost
      .mockResolvedValueOnce(networkResponse) // getNetwork call
      .mockRejectedValueOnce(new Error("Network error")); // friendbot call fails

    await expect(server.requestAirdrop(accountId)).rejects.toThrow(
      "Network error",
    );
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getNetwork",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledWith(`${friendbotUrl}?addr=${accountId}`);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("throws an error if no friendbot URL is configured", async () => {
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const networkResult = {
      friendbotUrl: undefined,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };
    mockPost.mockResolvedValue(networkResponse);

    await expect(server.requestAirdrop(accountId)).rejects.toThrow(
      "No friendbot URL configured",
    );
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getNetwork",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("uses passed in friendbot url if provided", async () => {
    const customFriendbotUrl = "https://custom-friendbot.example.com";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const resultMetaXdr = transactionMetaFor().toXDR("base64");

    // Mock the friendbot call with result_meta_xdr
    const friendbotResponse = {
      status: 200,
      data: {
        result_meta_xdr: resultMetaXdr,
      },
    };

    mockPost.mockResolvedValueOnce(friendbotResponse);

    const result = await server.requestAirdrop(accountId, customFriendbotUrl);
    expect(result).toBeInstanceOf(StellarSdk.Account);
    expect(result.accountId()).toBe(accountId);
    expect(result.sequence.toNumber()).toEqual(1234);
    // Should not call getNetwork
    expect(mockPost).not.toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getNetwork",
      params: null,
    });
    // Should call custom friendbot URL
    expect(mockPost).toHaveBeenCalledWith(
      `${customFriendbotUrl}?addr=${accountId}`,
    );
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid addresses", async () => {
    const invalidAddress = "INVALID_ADDRESS";

    await expect(server.requestAirdrop(invalidAddress)).rejects.toThrow();
  });

  it("falls back to RPC if no meta is present", async () => {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    const hash =
      "ae9f315c048d87a5f853bc15bf284a2c3c89eb0e1cb38c10409b77a877b830a8";

    const networkResult = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    // Mock the friendbot call WITHOUT result_meta_xdr
    const friendbotResponse = {
      status: 200,
      data: {
        hash,
        // No result_meta_xdr field
      },
    };

    // Mock the getTransaction call - use meta with account creation info
    const resultMetaXdr = transactionMetaFor().toXDR("base64");

    const successInfo = {
      ledger: 12345,
      createdAt: 123456789010,
      applicationOrder: 2,
      feeBump: false,
      envelopeXdr:
        "AAAAAgAAAAAT/LQZdYz0FcQ4Xwyg8IM17rkUx3pPCCWLu+SowQ/T+gBLB24poiQa9iwAngAAAAEAAAAAAAAAAAAAAABkwdeeAAAAAAAAAAEAAAABAAAAAC/9E8hDhnktyufVBS5tqA734Yz5XrLX2XNgBgH/YEkiAAAADQAAAAAAAAAAAAA1/gAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA1/gAAAAQAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AAAACUEFMTEFESVVNAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAAAAAAAACwQ/T+gAAAEA+ztVEKWlqHXNnqy6FXJeHr7TltHzZE6YZm5yZfzPIfLaqpp+5cyKotVkj3d89uZCQNsKsZI48uoyERLne+VwL/2BJIgAAAEA7323gPSaezVSa7Vi0J4PqsnklDH1oHLqNBLwi5EWo5W7ohLGObRVQZ0K0+ufnm4hcm9J4Cuj64gEtpjq5j5cM",
      resultXdr:
        "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAANAAAAAAAAAAUAAAACZ4W6fmN63uhVqYRcHET+D2NEtJvhCIYflFh9GqtY+AwAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAYW0toL2gAAAAAAAAAAAAANf4AAAACcgyAkXD5kObNTeRYciLh7R6ES/zzKp0n+cIK3Y6TjBkAAAABU0dYAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGlGnIJrXAAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGFtLaC9oAAAAApmc7UgUBInrDvij8HMSridx2n1w3I8TVEn4sLr1LSpmAAAAAlBBTExBRElVTQAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAIUz88EqYAAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABpRpyCa1wAAAAKYUsaaCZ233xB1p+lG7YksShJWfrjsmItbokiR3ifa0gAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAJQQUxMQURJVU0AAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AACFM/PBKmAAAAAJnhbp+Y3re6FWphFwcRP4PY0S0m+EIhh+UWH0aq1j4DAAAAAAAAAAAAAA9pAAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA9pAAAAAA=",
      resultMetaXdr,
      events: {
        contractEventsXdr: [],
        transactionEventsXdr: [],
      },
    };

    const getTransactionResponse = {
      data: {
        id: 1,
        result: {
          status: "SUCCESS",
          txHash: hash,
          latestLedger: 100,
          latestLedgerCloseTime: 12345,
          oldestLedger: 50,
          oldestLedgerCloseTime: 500,
          ...successInfo,
        },
      },
    };

    // Mock the sequence of calls
    mockPost
      .mockResolvedValueOnce(networkResponse) // getNetwork call
      .mockResolvedValueOnce(friendbotResponse) // friendbot call without meta
      .mockResolvedValueOnce(getTransactionResponse); // getTransaction call

    const result = await server.requestAirdrop(accountId);
    expect(result).toBeInstanceOf(StellarSdk.Account);
    expect(result.accountId()).toBe(accountId);
    expect(result.sequence.toNumber()).toEqual(1234);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getNetwork",
      params: null,
    });
    expect(mockPost).toHaveBeenCalledWith(`${friendbotUrl}?addr=${accountId}`);
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: { hash },
    });
    expect(mockPost).toHaveBeenCalledTimes(3);
  });
});

describe("Server#fundAddress", () => {
  let server: any;
  let mockPost: any;

  // Valid XDR for transaction meta (from get_transaction.test.ts)
  const metaV4Xdr =
    "AAAAAgAAAAIAAAADAtL5awAAAAAAAAAAS0CFMhOtWUKJWerx66zxkxORaiH6/3RUq7L8zspD5RoAAAAAAcm9QAKVkpMAAHpMAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAwAAAAAC0vi5AAAAAGTB02oAAAAAAAAAAQLS+WsAAAAAAAAAAEtAhTITrVlCiVnq8eus8ZMTkWoh+v90VKuy/M7KQ+UaAAAAAAHJvUAClZKTAAB6TQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAtL5awAAAABkwdd1AAAAAAAAAAEAAAAGAAAAAwLS+VQAAAACAAAAAG4cwu71zHNXx3jHCzRGOIthcnfwRgfN2f/AoHFLLMclAAAAAEySDkgAAAAAAAAAAkJVU0lORVNTAAAAAAAAAAC3JfDeo9vreItKNPoe74EkFIqWybeUQNFvLvURhHtskAAAAAAeQtHTL5f6TAAAXH0AAAAAAAAAAAAAAAAAAAABAtL5awAAAAIAAAAAbhzC7vXMc1fHeMcLNEY4i2Fyd/BGB83Z/8CgcUssxyUAAAAATJIOSAAAAAAAAAACQlVTSU5FU1MAAAAAAAAAALcl8N6j2+t4i0o0+h7vgSQUipbJt5RA0W8u9RGEe2yQAAAAAB5C0dNHf4CAAACLCQAAAAAAAAAAAAAAAAAAAAMC0vlUAAAAAQAAAABuHMLu9cxzV8d4xws0RjiLYXJ38EYHzdn/wKBxSyzHJQAAAAJCVVNJTkVTUwAAAAAAAAAAtyXw3qPb63iLSjT6Hu+BJBSKlsm3lEDRby71EYR7bJAAAAAAAABAL3//////////AAAAAQAAAAEAE3H3TnhnuQAAAAAAAAAAAAAAAAAAAAAAAAABAtL5awAAAAEAAAAAbhzC7vXMc1fHeMcLNEY4i2Fyd/BGB83Z/8CgcUssxyUAAAACQlVTSU5FU1MAAAAAAAAAALcl8N6j2+t4i0o0+h7vgSQUipbJt5RA0W8u9RGEe2yQAAAAAAAAQC9//////////wAAAAEAAAABABNx9J6Z4RkAAAAAAAAAAAAAAAAAAAAAAAAAAwLS+WsAAAAAAAAAAG4cwu71zHNXx3jHCzRGOIthcnfwRgfN2f/AoHFLLMclAAAAH37+zXQCXdRTAAASZAAAApIAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAABbBXKIigAAABhZWyiOAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAtL0awAAAABkwbqrAAAAAAAAAAEC0vlrAAAAAAAAAABuHMLu9cxzV8d4xws0RjiLYXJ38EYHzdn/wKBxSyzHJQAAAB9+/s10Al3UUwAAEmQAAAKSAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAWwVyiIoAAAAYWVsojgAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAALS9GsAAAAAZMG6qwAAAAAAAAAA";

  const successTxResponse = (hash: string) => ({
    data: {
      id: 1,
      result: {
        status: "SUCCESS",
        txHash: hash,
        latestLedger: 100,
        latestLedgerCloseTime: 12345,
        oldestLedger: 50,
        oldestLedgerCloseTime: 500,
        ledger: 12345,
        createdAt: 123456789010,
        applicationOrder: 2,
        feeBump: false,
        envelopeXdr:
          "AAAAAgAAAAAT/LQZdYz0FcQ4Xwyg8IM17rkUx3pPCCWLu+SowQ/T+gBLB24poiQa9iwAngAAAAEAAAAAAAAAAAAAAABkwdeeAAAAAAAAAAEAAAABAAAAAC/9E8hDhnktyufVBS5tqA734Yz5XrLX2XNgBgH/YEkiAAAADQAAAAAAAAAAAAA1/gAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA1/gAAAAQAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AAAACUEFMTEFESVVNAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAAAAAAAACwQ/T+gAAAEA+ztVEKWlqHXNnqy6FXJeHr7TltHzZE6YZm5yZfzPIfLaqpp+5cyKotVkj3d89uZCQNsKsZI48uoyERLne+VwL/2BJIgAAAEA7323gPSaezVSa7Vi0J4PqsnklDH1oHLqNBLwi5EWo5W7ohLGObRVQZ0K0+ufnm4hcm9J4Cuj64gEtpjq5j5cM",
        resultXdr:
          "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAANAAAAAAAAAAUAAAACZ4W6fmN63uhVqYRcHET+D2NEtJvhCIYflFh9GqtY+AwAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAYW0toL2gAAAAAAAAAAAAANf4AAAACcgyAkXD5kObNTeRYciLh7R6ES/zzKp0n+cIK3Y6TjBkAAAABU0dYAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGlGnIJrXAAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGFtLaC9oAAAAApmc7UgUBInrDvij8HMSridx2n1w3I8TVEn4sLr1LSpmAAAAAlBBTExBRElVTQAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAIUz88EqYAAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABpRpyCa1wAAAAKYUsaaCZ233xB1p+lG7YksShJWfrjsmItbokiR3ifa0gAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAJQQUxMQURJVU0AAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AACFM/PBKmAAAAAJnhbp+Y3re6FWphFwcRP4PY0S0m+EIhh+UWH0aq1j4DAAAAAAAAAAAAAA9pAAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA9pAAAAAA=",
        resultMetaXdr: metaV4Xdr,
        events: {
          contractEventsXdr: [],
          transactionEventsXdr: [],
        },
      },
    },
  });

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("funds an account address (G...) and returns transaction response", async () => {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    const hash =
      "ae9f315c048d87a5f853bc15bf284a2c3c89eb0e1cb38c10409b77a877b830a8";

    const networkResult = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    const friendbotResponse = {
      status: 200,
      data: { hash },
    };

    mockPost
      .mockResolvedValueOnce(networkResponse) // getNetwork call
      .mockResolvedValueOnce(friendbotResponse) // friendbot call
      .mockResolvedValueOnce(successTxResponse(hash)); // getTransaction call

    const result = await server.fundAddress(accountId);

    expect(result.status).toBe("SUCCESS");
    expect(result.txHash).toBe(hash);
    expect(mockPost).toHaveBeenCalledWith(`${friendbotUrl}?addr=${accountId}`);
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it("funds a contract address (C...) and returns transaction response", async () => {
    const friendbotUrl = "https://friendbot.stellar.org";
    const contractId = StellarSdk.StrKey.encodeContract(
      Buffer.from("0".repeat(64), "hex"),
    );
    const hash =
      "ae9f315c048d87a5f853bc15bf284a2c3c89eb0e1cb38c10409b77a877b830a8";

    const networkResult = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    const friendbotResponse = {
      status: 200,
      data: { hash },
    };

    mockPost
      .mockResolvedValueOnce(networkResponse) // getNetwork call
      .mockResolvedValueOnce(friendbotResponse) // friendbot call
      .mockResolvedValueOnce(successTxResponse(hash)); // getTransaction call

    const result = await server.fundAddress(contractId);

    expect(result.status).toBe("SUCCESS");
    expect(result.txHash).toBe(hash);
    expect(mockPost).toHaveBeenCalledWith(`${friendbotUrl}?addr=${contractId}`);
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it("uses custom friendbot URL when provided", async () => {
    const customFriendbotUrl = "https://custom-friendbot.example.com";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    const hash = "somehash123";

    const friendbotResponse = {
      status: 200,
      data: { hash },
    };

    mockPost
      .mockResolvedValueOnce(friendbotResponse) // friendbot call
      .mockResolvedValueOnce(successTxResponse(hash)); // getTransaction call

    const result = await server.fundAddress(accountId, customFriendbotUrl);

    expect(result.status).toBe("SUCCESS");
    // Should not call getNetwork when custom URL provided
    expect(mockPost).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ method: "getNetwork" }),
    );
    expect(mockPost).toHaveBeenCalledWith(
      `${customFriendbotUrl}?addr=${accountId}`,
    );
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it("throws error when no friendbot URL is configured", async () => {
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const networkResult = {
      friendbotUrl: undefined,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    mockPost.mockResolvedValueOnce(networkResponse);

    await expect(server.fundAddress(accountId)).rejects.toThrow(
      "No friendbot URL configured for current network",
    );
  });

  it("throws error when funding fails", async () => {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";
    const hash = "somehash123";

    const networkResult = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    const friendbotResponse = {
      status: 200,
      data: { hash },
    };

    const failedTxResponse = {
      data: {
        id: 1,
        result: {
          status: "FAILED",
          txHash: hash,
          latestLedger: 100,
          latestLedgerCloseTime: 12345,
          oldestLedger: 50,
          oldestLedgerCloseTime: 500,
          ledger: 12345,
          createdAt: 123456789010,
          applicationOrder: 2,
          feeBump: false,
          envelopeXdr:
            "AAAAAgAAAAAT/LQZdYz0FcQ4Xwyg8IM17rkUx3pPCCWLu+SowQ/T+gBLB24poiQa9iwAngAAAAEAAAAAAAAAAAAAAABkwdeeAAAAAAAAAAEAAAABAAAAAC/9E8hDhnktyufVBS5tqA734Yz5XrLX2XNgBgH/YEkiAAAADQAAAAAAAAAAAAA1/gAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA1/gAAAAQAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AAAACUEFMTEFESVVNAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAAAAAAAACwQ/T+gAAAEA+ztVEKWlqHXNnqy6FXJeHr7TltHzZE6YZm5yZfzPIfLaqpp+5cyKotVkj3d89uZCQNsKsZI48uoyERLne+VwL/2BJIgAAAEA7323gPSaezVSa7Vi0J4PqsnklDH1oHLqNBLwi5EWo5W7ohLGObRVQZ0K0+ufnm4hcm9J4Cuj64gEtpjq5j5cM",
          resultXdr:
            "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAANAAAAAAAAAAUAAAACZ4W6fmN63uhVqYRcHET+D2NEtJvhCIYflFh9GqtY+AwAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAYW0toL2gAAAAAAAAAAAAANf4AAAACcgyAkXD5kObNTeRYciLh7R6ES/zzKp0n+cIK3Y6TjBkAAAABU0dYAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGlGnIJrXAAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGFtLaC9oAAAAApmc7UgUBInrDvij8HMSridx2n1w3I8TVEn4sLr1LSpmAAAAAlBBTExBRElVTQAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAIUz88EqYAAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABpRpyCa1wAAAAKYUsaaCZ233xB1p+lG7YksShJWfrjsmItbokiR3ifa0gAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAJQQUxMQURJVU0AAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AACFM/PBKmAAAAAJnhbp+Y3re6FWphFwcRP4PY0S0m+EIhh+UWH0aq1j4DAAAAAAAAAAAAAA9pAAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA9pAAAAAA=",
          resultMetaXdr: metaV4Xdr,
        },
      },
    };

    mockPost
      .mockResolvedValueOnce(networkResponse)
      .mockResolvedValueOnce(friendbotResponse)
      .mockResolvedValueOnce(failedTxResponse);

    await expect(server.fundAddress(accountId)).rejects.toThrow(
      `Funding address ${accountId} failed: transaction status FAILED`,
    );
  });

  it("throws error when HTTP request fails", async () => {
    const friendbotUrl = "https://friendbot.stellar.org";
    const accountId =
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI";

    const networkResult = {
      friendbotUrl,
      passphrase: Networks.FUTURENET,
      protocolVersion: 20,
    };
    const networkResponse = { data: { result: networkResult } };

    mockPost
      .mockResolvedValueOnce(networkResponse)
      .mockRejectedValueOnce(new Error("Network error"));

    await expect(server.fundAddress(accountId)).rejects.toThrow(
      "Network error",
    );
  });

  it("rejects invalid addresses", async () => {
    const invalidAddress = "INVALID_ADDRESS";

    await expect(server.fundAddress(invalidAddress)).rejects.toThrow(
      "Invalid address: INVALID_ADDRESS. Expected a Stellar account (G...) or contract (C...) address.",
    );
  });
});
