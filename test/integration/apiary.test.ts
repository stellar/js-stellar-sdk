// Tests CAP-38 endpoints against the mock API server:
// https://ammmock.docs.apiary.io/

// All endpoints from here are tested:
// https://docs.google.com/document/d/1pXL8kr1a2vfYSap9T67R-g72B_WWbaE1YsLMa04OgoU/edit
import { describe, it, expect } from "vitest";
import * as _ from "lodash";
import { StellarSdk } from "../test-utils/stellar-sdk-import";

const { Horizon } = StellarSdk;

const MOCK_SERVER = "https://private-d133c-ammmock.apiary-mock.com";

describe("tests the /liquidity_pools endpoint", () => {
  const lpId =
    "0569b19c75d7ecadce50501fffad6fe8ba4652455df9e1cc96dc408141124dd5";
  const server = new Horizon.Server(MOCK_SERVER, { allowHttp: true });

  it("GET /", async () => {
    const res = await fetch(`${MOCK_SERVER}/liquidity_pools`);
    const data = await res.json();

    expect(data).not.toBeNull();

    const resp = await server.liquidityPools().call();

    expect(resp.records).toEqual(data._embedded.records);
  });

  it("GET /<pool-id>", async () => {
    const res = await fetch(`${MOCK_SERVER}/liquidity_pools/${lpId}`);
    const data = await res.json();

    expect(data).not.toBeNull();

    const resp = await server.liquidityPools().liquidityPoolId(lpId).call();

    expect(resp).toEqual(data);
  });

  const testCases = {
    effects: server.effects(),
    operations: server.operations(),
    trades: server.trades(),
    transactions: server.transactions(),
  };

  Object.keys(testCases).forEach((suffix) => {
    it(`GET /<pool-id>/${suffix}`, async () => {
      const res = await fetch(
        `${MOCK_SERVER}/liquidity_pools/${lpId}/${suffix}`,
      );
      const data = await res.json();

      expect(data).not.toBeNull();

      const resp = await testCases[suffix as keyof typeof testCases]
        .forLiquidityPool(lpId)
        .call();

      resp.records.forEach((record, i) => {
        let expectedRecord = data._embedded.records[i];

        // TransactionRecord values don't map 1-to-1 to the JSON (see
        // e.g. the ledger vs. ledger_attr properties), so we do a "best
        // effort" validation by checking that at least the keys exist.
        if (suffix === "transactions") {
          record = Object.keys(record) as any;
          expectedRecord = Object.keys(expectedRecord);
        }

        expect(_.isMatch(record, expectedRecord)).toBe(true);
      });
    });
  });
});

describe("tests the /accounts endpoint", () => {
  const server = new Horizon.Server(MOCK_SERVER, { allowHttp: true });

  it("GET /", async () => {
    const res = await fetch(`${MOCK_SERVER}/accounts`);
    const data = await res.json();

    expect(data).not.toBeNull();

    const resp = await server.accounts().call();

    expect(resp.records).toEqual(data._embedded.records);
  });

  it("GET /?liquidity_pool=<pool-id>", async () => {
    const lpId =
      "0569b19c75d7ecadce50501fffad6fe8ba4652455df9e1cc96dc408141124dd5";

    const res = await fetch(`${MOCK_SERVER}/accounts?liquidity_pool=${lpId}`);
    const data = await res.json();

    expect(data).not.toBeNull();

    const resp = await server.accounts().forLiquidityPool(lpId).call();

    expect(resp.records).toEqual(data._embedded.records);
  });

  it("GET /<account-id>", async () => {
    const accountId =
      "GDQNY3PBOJOKYZSRMK2S7LHHGWZIUISD4QORETLMXEWXBI7KFZZMKTL3";

    const res = await fetch(`${MOCK_SERVER}/accounts/${accountId}`);
    const data = await res.json();

    expect(data).not.toBeNull();

    const resp = await server.accounts().accountId(accountId).call();

    // find the pool share balance(s)
    const poolShares = resp.balances.filter(
      (b) => b.asset_type === "liquidity_pool_shares",
    );

    expect(poolShares).toHaveLength(1);
    poolShares.forEach((poolShare) => {
      expect((poolShare as any).buying_liabilities).toBeUndefined();
      expect((poolShare as any).selling_liabilities).toBeUndefined();
      expect((poolShare as any).asset_code).toBeUndefined();
      expect((poolShare as any).asset_issuer).toBeUndefined();
    });

    expect(resp).toEqual(data);
  });
});
