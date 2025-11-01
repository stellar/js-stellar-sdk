import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

import { serverUrl } from "../../../constants";

const { xdr } = StellarSdk;
const { Server } = StellarSdk.rpc;

describe("Server#sendTransaction", () => {
  let server: any;
  let mockPost: any;
  let transaction: any;
  let hash: string;
  let blob: string;

  const keypair = StellarSdk.Keypair.random();
  const account = new StellarSdk.Account(keypair.publicKey(), "56199647068161");

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
    transaction = new StellarSdk.TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination:
            "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
          asset: StellarSdk.Asset.native(),
          amount: "100.50",
        }),
      )
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    hash = transaction.hash().toString("hex");
    blob = transaction.toEnvelope().toXDR().toString("base64");
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
    expect(r.status).toEqual("PENDING");
    expect(r.errorResult).toBeUndefined();
    expect(r.errorResultXdr).toBeUndefined();
    expect(r.diagnosticEvents).toBeUndefined();
    expect(r.diagnosticEventsXdr).toBeUndefined();
    expect(mockPost).toHaveBeenCalledWith(serverUrl, {
      jsonrpc: "2.0",
      id: 1,
      method: "sendTransaction",
      params: { transaction: blob },
    });
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it("encodes the error result", async () => {
    const txResult = new xdr.TransactionResult({
      feeCharged: new xdr.Int64(1),
      result: xdr.TransactionResultResult.txSorobanInvalid(),
      ext: new (xdr.TransactionResultExt as any)(0),
    });

    const mockResponse = {
      data: {
        id: 1,
        result: {
          id: hash,
          status: "ERROR",
          errorResultXdr: txResult.toXDR("base64"),
          diagnosticEventsXdr: [
            "AAAAAQAAAAAAAAAAAAAAAgAAAAAAAAADAAAADwAAAAdmbl9jYWxsAAAAAA0AAAAgr/p6gt6h8MrmSw+WNJnu3+sCP9dHXx7jR8IH0sG6Cy0AAAAPAAAABWhlbGxvAAAAAAAADwAAAAVBbG9oYQAAAA==",
          ],
        },
      },
    };
    mockPost.mockResolvedValue(mockResponse);

    const r = await server.sendTransaction(transaction);
    expect(r.errorResult).toBeInstanceOf(xdr.TransactionResult);
    expect(r.errorResult).toEqual(txResult);
    expect(r.errorResultXdr).toBeUndefined();
    expect(r.diagnosticEventsXdr).toBeUndefined();
    expect(r.diagnosticEvents).toHaveLength(1);
    expect(r.diagnosticEvents[0]).toBeInstanceOf(xdr.DiagnosticEvent);
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
