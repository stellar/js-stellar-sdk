import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  rpc,
  TimeoutInfinite,
  Transaction,
  TransactionBuilder,
  xdr,
} from "../../../../src/index.js";

import { serverUrl } from "../../../constants.js";

describe("Server#sendTransaction", () => {
  let server: rpc.Server;
  let mockPost: any;
  let transaction: Transaction;
  let hash: string;
  let blob: string;

  const keypair = Keypair.random();
  const account = new Account(keypair.publicKey(), "56199647068161");

  beforeEach(() => {
    server = new rpc.Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
    transaction = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination:
            "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
          asset: Asset.native(),
          amount: "100.50",
        }),
      )
      .setTimeout(TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    hash = transaction.hash().toString("hex");
    blob = xdr.TransactionEnvelope.toXDR(transaction.toEnvelope(), "base64");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("sends a transaction", async () => {
    const mockResponse = {
      data: { id: 1, result: { id: hash, status: "PENDING" } },
    };
    mockPost.mockResolvedValue(mockResponse);

    const r = await server.sendTransaction(transaction);
    if (r.status !== "PENDING") {
      expect.fail(`Expected transaction status to be PENDING, got ${r.status}`);
    }
    expect(r.status).toEqual("PENDING");
    expect(r.errorResult).toBeUndefined();
    expect((r as any).errorResultXdr).toBeUndefined();
    expect(r.diagnosticEvents).toBeUndefined();
    expect((r as any).diagnosticEventsXdr).toBeUndefined();
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "sendTransaction",
      params: { transaction: blob },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("encodes the error result", async () => {
    const txResult: xdr.TransactionResult = {
      feeCharged: BigInt(1),
      result: xdr.TransactionResultResult.txSorobanInvalid(),
      ext: { type: "case0" },
    };

    const mockResponse = {
      data: {
        id: 1,
        result: {
          id: hash,
          status: "ERROR",
          errorResultXdr: xdr.TransactionResult.toXDR(txResult, "base64"),
          diagnosticEventsXdr: [
            "AAAAAQAAAAAAAAAAAAAAAgAAAAAAAAADAAAADwAAAAdmbl9jYWxsAAAAAA0AAAAgr/p6gt6h8MrmSw+WNJnu3+sCP9dHXx7jR8IH0sG6Cy0AAAAPAAAABWhlbGxvAAAAAAAADwAAAAVBbG9oYQAAAA==",
          ],
        },
      },
    };

    mockPost.mockResolvedValue(mockResponse);

    const r = await server.sendTransaction(transaction);

    if (r.status !== "ERROR") {
      expect.fail(`Expected transaction status to be ERROR, got ${r.status}`);
    }
    expect(r.errorResult).toBeDefined();

    expect(r.errorResult).toEqual(txResult);

    expect(r.errorResult).toEqual(txResult);
    expect((r as any).errorResultXdr).toBeUndefined();
    expect((r as any).diagnosticEventsXdr).toBeUndefined();
    expect(r.diagnosticEvents).toHaveLength(1);
    if (!r.diagnosticEvents || !r.diagnosticEvents[0]) {
      expect.fail("Expected diagnostic event to be present");
    }

    // This is copy-pasted from the mock response above, but we want to be sure the correct decoding is happening
    expect(r.diagnosticEvents[0]).toEqual(
      xdr.DiagnosticEvent.fromXDR(
        "AAAAAQAAAAAAAAAAAAAAAgAAAAAAAAADAAAADwAAAAdmbl9jYWxsAAAAAA0AAAAgr/p6gt6h8MrmSw+WNJnu3+sCP9dHXx7jR8IH0sG6Cy0AAAAPAAAABWhlbGxvAAAAAAAADwAAAAVBbG9oYQAAAA==",
        "base64",
      ),
    );
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "sendTransaction",
      params: { transaction: blob },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("adds metadata - tx was too small and was immediately deleted");
  it("adds metadata, order immediately fills");
  it("adds metadata, order is open");
  it("adds metadata, partial fill");
  it("doesnt add metadata to non-offers");
  it("adds metadata about offers, even if some ops are not");
  it("submits fee bump transactions");
});
