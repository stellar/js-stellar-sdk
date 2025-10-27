import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import { StellarSdk } from "../test-utils/stellar-sdk-import";

const { Horizon } = StellarSdk;

describe("server.js async transaction submission tests", () => {
  let server: any;
  let mockPost: any;
  let transaction: any;
  let blob: string;

  const keypair = StellarSdk.Keypair.random();
  const account = new StellarSdk.Account(keypair.publicKey(), "56199647068161");

  beforeEach(() => {
    server = new Horizon.Server("https://horizon-live.stellar.org:1337");
    mockPost = vi.spyOn(server.httpClient, "post");
    transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
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

    blob = encodeURIComponent(
      transaction.toEnvelope().toXDR().toString("base64"),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends an async transaction", async () => {
    mockPost.mockImplementation((url: string, data: string) => {
      if (
        url === "https://horizon-live.stellar.org:1337/transactions_async" &&
        data === `tx=${blob}`
      ) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error(`Unexpected call: ${url}, ${data}`));
    });

    await server.submitAsyncTransaction(transaction, {
      skipMemoRequiredCheck: true,
    });
  });
  it("sends an async transaction and gets a PENDING response", async () => {
    const response = {
      tx_status: "PENDING",
      hash: "db2c69a07be57eb5baefbfbb72b95c7c20d2c4d6f2a0e84e7c27dd0359055a2f",
    };

    mockPost.mockImplementation((url: string, data: string) => {
      if (
        url === "https://horizon-live.stellar.org:1337/transactions_async" &&
        data === `tx=${blob}`
      ) {
        return Promise.resolve({ data: response });
      }
      return Promise.reject(new Error(`Unexpected call: ${url}, ${data}`));
    });

    const res = await server.submitAsyncTransaction(transaction, {
      skipMemoRequiredCheck: true,
    });

    expect(res).toEqual(response);
  });
  it("sends an async transaction and gets a Problem response", async () => {
    const response = {
      type: "transaction_submission_exception",
      title: "Transaction Submission Exception",
      status: 500,
      detail:
        "Received exception from stellar-core." +
        "The `extras.error` field on this response contains further " +
        "details.  Descriptions of each code can be found at: " +
        "https://developers.stellar.org/api/errors/http-status-codes/horizon-specific/transaction-submission-async/transaction_submission_exception",
      extras: {
        envelope_xdr:
          "AAAAAIUAEW3jQt3+fbT6nCASA1/8RWdp9fJ2woxqPHZPQUH/AAAAZAEH/OgAAAAgAAAAAQAAAAAAAAAAAAAAAFyIDD0AAAAAAAAAAQAAAAAAAAADAAAAAAAAAAFCQVQAAAAAAEZK09vHmzOmEMoVWYtbbZcKv3ZOoo06ckzbhyDIFKfhAAAAAAExLQAAAAABAAAAAgAAAAAAAAAAAAAAAAAAAAFPQUH/AAAAQHk3Igj+JXqggsJBFl4mrzgACqxWpx87psxu5UHnSskbwRjHZz89NycCZmJL4gN5WN7twm+wK371K9XcRNDiBwQ=",
        error: "There was an exception when submitting this transaction.",
      },
    };

    mockPost.mockImplementation((url: string, data: string) => {
      if (
        url === "https://horizon-live.stellar.org:1337/transactions_async" &&
        data === `tx=${blob}`
      ) {
        return Promise.resolve({ data: response });
      }
      return Promise.reject(new Error(`Unexpected call: ${url}, ${data}`));
    });

    const res = await server.submitAsyncTransaction(transaction, {
      skipMemoRequiredCheck: true,
    });

    expect(res).toBe(response);
  });
  it("sends an async transaction and check the request headers", async () => {
    mockPost.mockImplementation((url: string, data: string, config: any) => {
      if (
        url === "https://horizon-live.stellar.org:1337/transactions_async" &&
        data === `tx=${blob}` &&
        config?.headers?.["Content-Type"] ===
          "application/x-www-form-urlencoded"
      ) {
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(
        new Error(
          `Unexpected call: ${url}, ${data}, ${JSON.stringify(config)}`,
        ),
      );
    });

    await server.submitAsyncTransaction(transaction, {
      skipMemoRequiredCheck: true,
    });
  });
});
