import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../test-utils/stellar-sdk-import";

const { Horizon } = StellarSdk;

// Test data for different server URL configurations
const SERVER_URLS = [
  "https://acme.com:1337",
  "https://acme.com:1337/folder",
  "https://acme.com:1337/folder/subfolder",
];

  // Test each server URL configuration
  SERVER_URLS.forEach((serverUrl) => {
    describe(`with server URL: ${serverUrl}`, () => {
      let mockGet: any;
      let mockPost: any;
      let server: any;
      beforeEach(() => {
        server = new Horizon.Server(serverUrl);
        mockGet = vi.spyOn(server.httpClient, "get");
        mockPost = vi.spyOn(server.httpClient, "post");
        StellarSdk.Config.setDefault();
      });
    
      afterEach(() => {
        vi.restoreAllMocks();
      });

  // Helper function to create test result data
  function createTestResult(endpoint: string) {
    return {
      data: {
        url: serverUrl,
        random: Math.round(1000 * Math.random()),
        endpoint,
      },
    };
  }

  // Helper function to prepare axios mock
  function prepareAxiosMock(
    endpoint: string,
    method: "get" | "post" = "get",
    postData?: string,
  ) {
    const testResult = createTestResult(endpoint);

    if (method === "get") {
      mockGet.mockImplementation((url: string) => {
        if (url.includes(serverUrl + endpoint)) {
          return Promise.resolve(testResult);
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });
    } else {
      mockPost.mockImplementation((url: string, data: string) => {
        if (url.includes(`${serverUrl}/transactions`) && data === postData) {
          return Promise.resolve(testResult);
        }
        return Promise.reject(new Error(`Unexpected call: ${url}, ${data}`));
      });
    }

    return testResult;
  }



      it("server.accounts()", async () => {
        const testResult = prepareAxiosMock("/accounts");
        const result = await server.accounts().call();
        expect(result).toEqual(testResult.data);
      });

      it("server.accounts().accountId('fooAccountId')", async () => {
        const testResult = prepareAxiosMock(
          "/accounts/fooAccountId",
        );
        const result = await server.accounts().accountId("fooAccountId").call();
        expect(result).toEqual(testResult.data);
      });

      it("server.transactions()", async () => {
        const testResult = prepareAxiosMock("/transactions");
        const result = await server.transactions().call();
        expect(result).toEqual(testResult.data);
      });

      it("server.transactions().includeFailed(true)", async () => {
        const testResult = prepareAxiosMock(
          "/transactions?include_failed=true",
        );
        const result = await server.transactions().includeFailed(true).call();
        expect(result).toEqual(testResult.data);
      });

      it("server.operations().includeFailed(true)", async () => {
        const testResult = prepareAxiosMock(
          "/operations?include_failed=true",
        );
        const result = await server.operations().includeFailed(true).call();
        expect(result).toEqual(testResult.data);
      });

      it("server.payments().includeFailed(true)", async () => {
        const testResult = prepareAxiosMock(
          "/payments?include_failed=true",
        );
        const result = await server.payments().includeFailed(true).call();
        expect(result).toEqual(testResult.data);
      });

      it("server.transactions().transaction('fooTransactionId')", async () => {
        const testResult = prepareAxiosMock(
          "/transactions/fooTransactionId",
        );
        const result = await server
          .transactions()
          .transaction("fooTransactionId")
          .call();
        expect(result).toEqual(testResult.data);
      });

      it("server.transactions().forAccount('fooAccountId')", async () => {
        const testResult = prepareAxiosMock(
          "/accounts/fooAccountId/transactions",
        );
        const result = await server
          .transactions()
          .forAccount("fooAccountId")
          .call();
        expect(result).toEqual(testResult.data);
      });

      it("server.submitTransaction()", async () => {
        const keypair = StellarSdk.Keypair.random();
        const account = new StellarSdk.Account(
          keypair.publicKey(),
          "56199647068161",
        );

        const fakeTransaction = new StellarSdk.TransactionBuilder(account, {
          fee: "100",
          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
          .addOperation(
            StellarSdk.Operation.payment({
              destination: keypair.publicKey(),
              asset: StellarSdk.Asset.native(),
              amount: "100.50",
            }),
          )
          .setTimeout(StellarSdk.TimeoutInfinite)
          .build();
        fakeTransaction.sign(keypair);
        const tx = encodeURIComponent(
          fakeTransaction.toEnvelope().toXDR().toString("base64"),
        );

        const testResult = prepareAxiosMock(
          "post",
          "post",
          `tx=${tx}`,
        );
        const result = await server.submitTransaction(fakeTransaction, {
          skipMemoRequiredCheck: true,
        });
        expect(result).toEqual(testResult.data);
      });
    });
  });

