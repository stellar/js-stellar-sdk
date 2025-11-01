import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../test-utils/stellar-sdk-import";

const { Horizon } = StellarSdk;

const BASE_URL = "https://horizon-live.stellar.org:1337";
const LP_URL = `${BASE_URL}/liquidity_pools`;

// Helper function to deep-copy JSON responses.
function copyJson(js: any) {
  return JSON.parse(JSON.stringify(js));
}

describe("/liquidity_pools tests", () => {
  let server: any;
  let mockGet: any;

  beforeEach(() => {
    server = new Horizon.Server(BASE_URL);
    mockGet = vi.spyOn(server.httpClient, "get");
    StellarSdk.Config.setDefault();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("can create a LiquidityPoolCallBuilder", () => {
    expect(server.liquidityPools()).toBeDefined();
  });

  const rootResponse = {
    _links: {
      self: {
        href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=asc",
      },
      next: {
        href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=asc",
      },
      prev: {
        href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=desc",
      },
    },
    _embedded: {
      records: [
        {
          id: "1",
          paging_token: "113725249324879873",
          fee_bp: 30,
          type: "constant_product",
          total_trustlines: "300",
          total_shares: "5000",
          reserves: [
            {
              amount: "1000.0000005",
              asset:
                "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
            },
            {
              amount: "2000.0000000",
              asset:
                "PHP:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
            },
          ],
        },
        {
          id: "2",
          paging_token: "113725249324879874",
          fee_bp: 30,
          type: "constant_product",
          total_trustlines: "200",
          total_shares: "3500",
          reserves: [
            {
              amount: "1000.0000005",
              asset:
                "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
            },
            {
              amount: "1200.0000000",
              asset:
                "USDC:GC5W3BH2MQRQK2H4A6LP3SXDSAAY2W2W64OWKKVNQIAOVWSAHFDEUSDC",
            },
          ],
        },
      ],
    },
  };

  const emptyResponse = copyJson(rootResponse);
  emptyResponse._embedded.records = [];

  const phpResponse = copyJson(rootResponse);
  phpResponse._embedded.records.pop(); // last elem doesn't have PHP asset

  const EURT = new StellarSdk.Asset(
    "EURT",
    "GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
  );
  const PHP = new StellarSdk.Asset(
    "PHP",
    "GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
  );

  it("returns the right root response", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes(LP_URL)) {
        return Promise.resolve({ data: rootResponse });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const pools = await server.liquidityPools().call();

    expect(pools.records).toEqual(rootResponse._embedded.records);
  });

  describe("filters", () => {
    const testCases = [
      {
        assets: [StellarSdk.Asset.native()],
        response: emptyResponse,
      },
      {
        assets: [EURT],
        response: rootResponse,
      },
      {
        assets: [PHP],
        response: phpResponse,
      },
      {
        assets: [EURT, PHP],
        response: phpResponse,
      },
    ];

    testCases.forEach((testCase) => {
      const queryStr = testCase.assets
        .map((asset) => asset.toString())
        .join(",");
      const description = testCase.assets
        .map((asset) => asset.getCode())
        .join(" + ");

      it(`filters by asset(s) ${description}`, async () => {
        mockGet.mockImplementation((url: string) => {
          if (
            url.includes(`${LP_URL}?reserves=${encodeURIComponent(queryStr)}`)
          ) {
            return Promise.resolve({ data: testCase.response });
          }
          return Promise.reject(new Error(`Unexpected URL: ${url}`));
        });

        const pools = await server
          .liquidityPools()
          .forAssets(...testCase.assets)
          .call();

        expect(pools.records).toEqual(testCase.response._embedded.records);
      });
    });

    it("filters by account", async () => {
      const accountId =
        "GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S";
      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}?account=${accountId}`)) {
          return Promise.resolve({ data: rootResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const pools = await server.liquidityPools().forAccount(accountId).call();

      expect(pools.records).toEqual(rootResponse._embedded.records);
    });
  });

  describe("querying a specific pool", () => {
    const lpId =
      "ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a";

    it("checks for valid IDs", () => {
      expect(() =>
        server.liquidityPools().liquidityPoolId("nonsense"),
      ).toThrow();
      expect(() => server.liquidityPools().liquidityPoolId(lpId)).not.toThrow();
    });

    it("filters by specific ID", async () => {
      const poolResponse = {
        id: lpId,
        paging_token: "113725249324879873",
        fee_bp: 30,
        type: "constant_product",
        total_trustlines: "300",
        total_shares: "5000",
        reserves: [
          {
            amount: "1000.0000005",
            asset:
              "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
          },
          {
            amount: "2000.0000000",
            asset:
              "PHP:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
          },
        ],
      };

      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}/${lpId}`)) {
          return Promise.resolve({ data: poolResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const pool = await server.liquidityPools().liquidityPoolId(lpId).call();

      expect(pool).toEqual(poolResponse);
    });

    const poolOpsResponse = {
      _links: {
        self: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/operations?cursor=113725249324879873&limit=10&order=asc",
        },
        next: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/operations?cursor=113725249324879873&limit=10&order=asc",
        },
        prev: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/operations?cursor=113725249324879873&limit=10&order=desc",
        },
      },
      _embedded: {
        records: [
          {
            id: "3697472920621057",
            paging_token: "3697472920621057",
            transaction_successful: true,
            source_account:
              "GBB4JST32UWKOLGYYSCEYBHBCOFL2TGBHDVOMZP462ET4ZRD4ULA7S2L",
            type: "liquidity_pool_deposit",
            type_i: 22,
            created_at: "2021-11-18T03:47:47Z",
            transaction_hash:
              "43ed5ce19190822ec080b67c3ccbab36a56bc34102b1a21d3ee690ed3bc23378",
            liquidity_pool_id:
              "ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a",
            reserves_max: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "1000.0000005",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "3000.0000005",
              },
            ],
            min_price: "0.2680000",
            min_price_r: {
              n: 67,
              d: 250,
            },
            max_price: "0.3680000",
            max_price_r: {
              n: 73,
              d: 250,
            },
            reserves_deposited: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "983.0000005",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2378.0000005",
              },
            ],
            shares_received: "1000",
          },
          {
            id: "3697472920621057",
            paging_token: "3697472920621057",
            transaction_successful: true,
            source_account:
              "GBB4JST32UWKOLGYYSCEYBHBCOFL2TGBHDVOMZP462ET4ZRD4ULA7S2L",
            type: "liquidity_pool_withdraw",
            type_i: 23,
            created_at: "2021-11-18T03:47:47Z",
            transaction_hash:
              "43ed5ce19190822ec080b67c3ccbab36a56bc34102b1a21d3ee690ed3bc23378",
            liquidity_pool_id:
              "ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a",
            reserves_min: [
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                min: "1000.0000005",
              },
              {
                asset:
                  "PHP:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                min: "3000.0000005",
              },
            ],
            shares: "200",
            reserves_received: [
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "993.0000005",
              },
              {
                asset:
                  "PHP:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2478.0000005",
              },
            ],
          },
          {
            id: "157639717969326081",
            paging_token: "157639717969326081",
            transaction_successful: true,
            source_account:
              "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
            type: "change_trust",
            type_i: 6,
            created_at: "2021-08-04T20:01:24Z",
            transaction_hash:
              "941f2fa2101d1265696a3c7d35e7688cd210324114e96b64a386ab55f65e488f",
            asset_type: "liquidity_pool_shares",
            liquidity_pool_id:
              "ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a",
            limit: "1000",
            trustor: "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
          },
          {
            id: "157235845014249474-0",
            paging_token: "157235845014249474-0",
            ledger_close_time: "2021-07-29T21:10:53Z",
            trade_type: "liquidity_pool",
            base_liquidity_pool_id: "abcdef",
            liquidity_pool_fee_bp: 30,
            base_amount: "0.0002007",
            base_asset_type: "native",
            counter_account:
              "GDW634JZX3VMEF2RZTCJTT34RITIMNX46QOGTYHCJEJL3MM7BLOQ6HOW",
            counter_amount: "0.0022300",
            counter_asset_type: "credit_alphanum4",
            counter_asset_code: "VZT",
            counter_asset_issuer:
              "GBENYXZDFFR2J4F4DB3YPBBAM244TXYOTIOOUQI5DBT3OKUU4ZJ2M7NO",
            base_is_seller: false,
            price: {
              n: "10000000",
              d: "899997",
            },
          },
        ],
      },
    };

    it("retrieves its operations", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}/${lpId}/operations`)) {
          return Promise.resolve({ data: poolOpsResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const poolOps = await server.operations().forLiquidityPool(lpId).call();

      expect(poolOps.records).toEqual(poolOpsResponse._embedded.records);
    });

    const poolTxsResponse = {
      _links: {
        self: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/transactions?cursor=113725249324879873&limit=10&order=asc",
        },
        next: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/transactions?cursor=113725249324879873&limit=10&order=asc",
        },
        prev: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/transactions?cursor=113725249324879873&limit=10&order=desc",
        },
      },
      _embedded: {
        records: [
          {
            _links: {
              self: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions/2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908",
              },
              account: {
                href: "https://private-33c60-amm3.apiary-mock.com/accounts/GAHQN6YNYD6ZT7TLAVE4R36MSZWQJZ22XB3WD4RLSHURMXHW4VHJIDF7",
              },
              ledger: {
                href: "https://private-33c60-amm3.apiary-mock.com/ledgers/895788",
              },
              operations: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions/2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908/operations",
                templated: true,
              },
              effects: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions/2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908/effects",
                templated: true,
              },
              precedes: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions?order=asc&cursor=3847380164161536",
              },
              succeeds: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions?order=desc&cursor=3847380164161536",
              },
              transaction: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions/2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908",
              },
            },
            id: "2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908",
            paging_token: "3847380164161536",
            successful: true,
            hash: "2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908",
            ledger: 895788,
            created_at: "2021-08-09T20:53:11Z",
            source_account:
              "GAHQN6YNYD6ZT7TLAVE4R36MSZWQJZ22XB3WD4RLSHURMXHW4VHJIDF7",
            source_account_sequence: "3847371574214658",
            fee_account:
              "GAHQN6YNYD6ZT7TLAVE4R36MSZWQJZ22XB3WD4RLSHURMXHW4VHJIDF7",
            fee_charged: "10000",
            max_fee: "10001",
            operation_count: 1,
            envelope_xdr:
              "AAAAAgAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAJxEADasqAAAAAgAAAAAAAAAAAAAAAQAAAAEAAAAADwb7DcD9mf5rBUnI78yWbQTnWrh3YfIrkekWXPblTpQAAAAGAAAAAVNFQwAAAAAAm6XFaVsf8OSuS9C9gMplyTjagE9jAnnqwxSDJ6fin6IAsaK8LsUAAAAAAAAAAAAB9uVOlAAAAECXmRsoXmRiJjUrtbkDZYRnzac5s1CVV4g2RlIgBIuQty21npz3A1VhUcSmAx+GmsyGxVFvIrcdstTawJlmy9kF",
            result_xdr: "AAAAAAAAJxAAAAAAAAAAAQAAAAAAAAAGAAAAAAAAAAA=",
            result_meta_xdr:
              "AAAAAgAAAAIAAAADAA2rLAAAAAAAAAAADwb7DcD9mf5rBUnI78yWbQTnWrh3YfIrkekWXPblTpQAAAAAGtJNDAANqyoAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAA2rLAAAAAAAAAAADwb7DcD9mf5rBUnI78yWbQTnWrh3YfIrkekWXPblTpQAAAAAGtJNDAANqyoAAAACAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAMADassAAAAAAAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAAa0k0MAA2rKgAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEADassAAAAAAAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAAa0k0MAA2rKgAAAAIAAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAADassAAAAAQAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAFTRUMAAAAAAJulxWlbH/DkrkvQvYDKZck42oBPYwJ56sMUgyen4p+iAAAAAAAAAAAAsaK8LsUAAAAAAAEAAAAAAAAAAAAAAAA=",
            fee_meta_xdr:
              "AAAAAgAAAAMADasrAAAAAAAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAAa0nQcAA2rKgAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEADassAAAAAAAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAAa0k0MAA2rKgAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==",
            memo_type: "none",
            signatures: [
              "l5kbKF5kYiY1K7W5A2WEZ82nObNQlVeINkZSIASLkLcttZ6c9wNVYVHEpgMfhprMhsVRbyK3HbLU2sCZZsvZBQ==",
            ],
          },
        ],
      },
    };

    it("retrieves its transactions", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}/${lpId}/transactions`)) {
          return Promise.resolve({ data: poolTxsResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const poolTxs = await server.transactions().forLiquidityPool(lpId).call();

      expect(poolTxs.records).toEqual(poolTxsResponse._embedded.records);
    });

    const poolEffectsResponse = {
      _links: {
        self: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/effects?cursor=113725249324879873&limit=10&order=asc",
        },
        next: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/effects?cursor=113725249324879873&limit=10&order=asc",
        },
        prev: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a/effects?cursor=113725249324879873&limit=10&order=asc",
        },
      },
      _embedded: {
        records: [
          {
            _links: {
              operation: {
                href: "https://private-33c60-amm3.apiary-mock.com/operations/3849085266190337",
              },
              succeeds: {
                href: "https://private-33c60-amm3.apiary-mock.com/effects?order=desc&cursor=3849085266190337-1",
              },
              precedes: {
                href: "https://private-33c60-amm3.apiary-mock.com/effects?order=asc&cursor=3849085266190337-1",
              },
            },
            id: "0000000012884905986-0000000001",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_deposited",
            type_i: 81,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "300",
              total_shares: "5000",
              reserves: [
                {
                  amount: "1000.0000005",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "2000.0000000",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
            reserves_deposited: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "983.0000005",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2378.0000005",
              },
            ],
            shares_received: "1000",
          },
          {
            id: "0000000012884905986-0000000002",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_withdrew",
            type_i: 82,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "299",
              total_shares: "4000",
              reserves: [
                {
                  amount: "7.0000005",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "1.0000000",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
            reserves_received: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "993.0000005",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2478.0000005",
              },
            ],
            shares_redeemed: "1000",
          },
          {
            id: "0000000012884905986-0000000003",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_trade",
            type_i: 83,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "300",
              total_shares: "5000",
              reserves: [
                {
                  amount: "1000.0000005",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "2000.0000000",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
            sold: {
              asset:
                "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
              amount: "983.0000005",
            },
            bought: {
              asset:
                "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
              amount: "2378.0000005",
            },
          },
          {
            id: "0000000012884905986-0000000004",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_created",
            type_i: 84,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "1",
              total_shares: "0",
              reserves: [
                {
                  amount: "0",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "0",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
          },
          {
            id: "0000000012884905986-0000000005",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_removed",
            type_i: 85,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool_id: "abcdef",
          },
          {
            id: "0000000012884905986-0000000006",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_revoked",
            type_i: 86,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "299",
              total_shares: "4000",
              reserves: [
                {
                  amount: "7.0000005",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "1.0000000",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
            reserves_revoked: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "993.0000005",
                claimable_balance_id: "cbid1235",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2478.0000005",
                claimable_balance_id: "idcbd1234",
              },
            ],
            shares_revoked: "1000",
          },
          {
            id: "0000000012884905986-0000000007",
            paging_token: "157639717969326081-1",
            account: "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
            type: "trustline_created",
            type_i: 20,
            created_at: "2021-08-04T20:01:24Z",
            asset_type: "liquidity_pool_shares",
            liquidity_pool_id: "abcdef",
            limit: "1000",
          },
          {
            id: "0000000012884905986-0000000008",
            paging_token: "157639717969326081-1",
            account: "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
            type: "trustline_updated",
            type_i: 22,
            created_at: "2021-08-04T20:01:24Z",
            asset_type: "liquidity_pool_shares",
            liquidity_pool_id: "abcdef",
            limit: "2000",
          },
          {
            id: "0000000012884905986-0000000009",
            paging_token: "157639717969326081-1",
            account: "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
            type: "trustline_removed",
            type_i: 21,
            created_at: "2021-08-04T20:01:24Z",
            asset_type: "liquidity_pool_shares",
            liquidity_pool_id: "abcdef",
            limit: "0.0000000",
          },
        ],
      },
    };

    it("retrieves its effects", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}/${lpId}/effects`)) {
          return Promise.resolve({ data: poolEffectsResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const poolEffects = await server.effects().forLiquidityPool(lpId).call();

      expect(poolEffects.records).toEqual(
        poolEffectsResponse._embedded.records,
      );
    });

    const poolTradesResponse = {
      _links: {
        self: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/3b476aff8a406a6ec3b61d5c038009cef85f2ddfaf616822dc4fec92845149b4/trades?cursor=113725249324879873&limit=10&order=asc",
        },
        next: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/3b476aff8a406a6ec3b61d5c038009cef85f2ddfaf616822dc4fec92845149b4/trades?cursor=113725249324879873&limit=10&order=asc",
        },
        prev: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/3b476aff8a406a6ec3b61d5c038009cef85f2ddfaf616822dc4fec92845149b4/trades?cursor=113725249324879873&limit=10&order=asc",
        },
      },
      _embedded: {
        records: [
          {
            _links: {
              self: {
                href: "",
              },
              base: {
                href: "https://private-33c60-amm3.apiary-mock.com/accounts/GAVH5JM5OKXGMQDS7YPRJ4MQCPXJUGH26LYQPQJ4SOMOJ4SXY472ZM7G",
              },
              counter: {
                href: "https://private-33c60-amm3.apiary-mock.com/accounts/GBB4JST32UWKOLGYYSCEYBHBCOFL2TGBHDVOMZP462ET4ZRD4ULA7S2L",
              },
              operation: {
                href: "https://private-33c60-amm3.apiary-mock.com/operations/3697472920621057",
              },
            },
            id: "3697472920621057-0",
            paging_token: "3697472920621057-0",
            ledger_close_time: "2015-11-18T03:47:47Z",
            offer_id: "9",
            base_offer_id: "9",
            base_account:
              "GAVH5JM5OKXGMQDS7YPRJ4MQCPXJUGH26LYQPQJ4SOMOJ4SXY472ZM7G",
            base_amount: "10.0000000",
            base_asset_type: "native",
            counter_liquidity_pool:
              "3b476aff8a406a6ec3b61d5c038009cef85f2ddfaf616822dc4fec92845149b4",
            liquidity_pool_fee_bp: "30",
            counter_amount: "2.6700000",
            counter_asset_type: "credit_alphanum4",
            counter_asset_code: "JPY",
            counter_asset_issuer:
              "GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
            base_is_seller: true,
            price: {
              n: "267",
              d: "1000",
            },
            trade_type: "liquidity_pool",
          },
        ],
      },
    };

    it("retrieves its trades", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}/${lpId}/trades`)) {
          return Promise.resolve({ data: poolTradesResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const poolTrades = await server.trades().forLiquidityPool(lpId).call();

      expect(poolTrades.records).toEqual(poolTradesResponse._embedded.records);
    });
  });

  describe("querying a specific pool", () => {
    const lpId =
      "ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a";

    const poolOpsResponse = {
      _links: {
        self: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/1/operations?cursor=113725249324879873&limit=10&order=asc",
        },
        next: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/1/operations?cursor=113725249324879873&limit=10&order=asc",
        },
        prev: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/1/operations?cursor=113725249324879873&limit=10&order=desc",
        },
      },
      _embedded: {
        records: [
          {
            id: "3697472920621057",
            paging_token: "3697472920621057",
            transaction_successful: true,
            source_account:
              "GBB4JST32UWKOLGYYSCEYBHBCOFL2TGBHDVOMZP462ET4ZRD4ULA7S2L",
            type: "liquidity_pool_deposit",
            type_i: 22,
            created_at: "2021-11-18T03:47:47Z",
            transaction_hash:
              "43ed5ce19190822ec080b67c3ccbab36a56bc34102b1a21d3ee690ed3bc23378",
            liquidity_pool_id:
              "ae44a51f6191ce24414fbd1326e93ccb0ae656f07fc1e37602b11d0802f74b9a",
            reserves_max: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "1000.0000005",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "3000.0000005",
              },
            ],
            min_price: "0.2680000",
            min_price_r: {
              n: 67,
              d: 250,
            },
            max_price: "0.3680000",
            max_price_r: {
              n: 73,
              d: 250,
            },
            reserves_deposited: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "983.0000005",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2378.0000005",
              },
            ],
            shares_received: "1000",
          },
          {
            id: "3697472920621057",
            paging_token: "3697472920621057",
            transaction_successful: true,
            source_account:
              "GBB4JST32UWKOLGYYSCEYBHBCOFL2TGBHDVOMZP462ET4ZRD4ULA7S2L",
            type: "liquidity_pool_withdraw",
            type_i: 23,
            created_at: "2021-11-18T03:47:47Z",
            transaction_hash:
              "43ed5ce19190822ec080b67c3ccbab36a56bc34102b1a21d3ee690ed3bc23378",
            liquidity_pool_id: "1",
            reserves_min: [
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                min: "1000.0000005",
              },
              {
                asset:
                  "PHP:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                min: "3000.0000005",
              },
            ],
            shares: "200",
            reserves_received: [
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "993.0000005",
              },
              {
                asset:
                  "PHP:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2478.0000005",
              },
            ],
          },
          {
            id: "157639717969326081",
            paging_token: "157639717969326081",
            transaction_successful: true,
            source_account:
              "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
            type: "change_trust",
            type_i: 6,
            created_at: "2021-08-04T20:01:24Z",
            transaction_hash:
              "941f2fa2101d1265696a3c7d35e7688cd210324114e96b64a386ab55f65e488f",
            asset_type: "liquidity_pool_shares",
            liquidity_pool_id: "1",
            limit: "1000",
            trustor: "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
          },
          {
            id: "157235845014249474-0",
            paging_token: "157235845014249474-0",
            ledger_close_time: "2021-07-29T21:10:53Z",
            trade_type: "liquidity_pool",
            base_liquidity_pool_id: "abcdef",
            liquidity_pool_fee_bp: 30,
            base_amount: "0.0002007",
            base_asset_type: "native",
            counter_account:
              "GDW634JZX3VMEF2RZTCJTT34RITIMNX46QOGTYHCJEJL3MM7BLOQ6HOW",
            counter_amount: "0.0022300",
            counter_asset_type: "credit_alphanum4",
            counter_asset_code: "VZT",
            counter_asset_issuer:
              "GBENYXZDFFR2J4F4DB3YPBBAM244TXYOTIOOUQI5DBT3OKUU4ZJ2M7NO",
            base_is_seller: false,
            price: {
              n: "10000000",
              d: "899997",
            },
          },
        ],
      },
    };

    it("retrieves its operations", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}/${lpId}/operations`)) {
          return Promise.resolve({ data: poolOpsResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const poolOps = await server.operations().forLiquidityPool(lpId).call();

      expect(poolOps.records).toEqual(poolOpsResponse._embedded.records);
    });

    const poolTxsResponse = {
      _links: {
        self: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/1/transactions?cursor=113725249324879873&limit=10&order=asc",
        },
        next: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/1/transactions?cursor=113725249324879873&limit=10&order=asc",
        },
        prev: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools/1/transactions?cursor=113725249324879873&limit=10&order=desc",
        },
      },
      _embedded: {
        records: [
          {
            _links: {
              self: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions/2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908",
              },
              account: {
                href: "https://private-33c60-amm3.apiary-mock.com/accounts/GAHQN6YNYD6ZT7TLAVE4R36MSZWQJZ22XB3WD4RLSHURMXHW4VHJIDF7",
              },
              ledger: {
                href: "https://private-33c60-amm3.apiary-mock.com/ledgers/895788",
              },
              operations: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions/2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908/operations",
                templated: true,
              },
              effects: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions/2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908/effects",
                templated: true,
              },
              precedes: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions?order=asc&cursor=3847380164161536",
              },
              succeeds: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions?order=desc&cursor=3847380164161536",
              },
              transaction: {
                href: "https://private-33c60-amm3.apiary-mock.com/transactions/2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908",
              },
            },
            id: "2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908",
            paging_token: "3847380164161536",
            successful: true,
            hash: "2ff47e1bafe68639276b2a8df0a73597ee0c062fbcc72d121af314fe7851c908",
            ledger: 895788,
            created_at: "2021-08-09T20:53:11Z",
            source_account:
              "GAHQN6YNYD6ZT7TLAVE4R36MSZWQJZ22XB3WD4RLSHURMXHW4VHJIDF7",
            source_account_sequence: "3847371574214658",
            fee_account:
              "GAHQN6YNYD6ZT7TLAVE4R36MSZWQJZ22XB3WD4RLSHURMXHW4VHJIDF7",
            fee_charged: "10000",
            max_fee: "10001",
            operation_count: 1,
            envelope_xdr:
              "AAAAAgAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAJxEADasqAAAAAgAAAAAAAAAAAAAAAQAAAAEAAAAADwb7DcD9mf5rBUnI78yWbQTnWrh3YfIrkekWXPblTpQAAAAGAAAAAVNFQwAAAAAAm6XFaVsf8OSuS9C9gMplyTjagE9jAnnqwxSDJ6fin6IAsaK8LsUAAAAAAAAAAAAB9uVOlAAAAECXmRsoXmRiJjUrtbkDZYRnzac5s1CVV4g2RlIgBIuQty21npz3A1VhUcSmAx+GmsyGxVFvIrcdstTawJlmy9kF",
            result_xdr: "AAAAAAAAJxAAAAAAAAAAAQAAAAAAAAAGAAAAAAAAAAA=",
            result_meta_xdr:
              "AAAAAgAAAAIAAAADAA2rLAAAAAAAAAAADwb7DcD9mf5rBUnI78yWbQTnWrh3YfIrkekWXPblTpQAAAAAGtJNDAANqyoAAAABAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAA2rLAAAAAAAAAAADwb7DcD9mf5rBUnI78yWbQTnWrh3YfIrkekWXPblTpQAAAAAGtJNDAANqyoAAAACAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAABAAAAAwAAAAMADassAAAAAAAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAAa0k0MAA2rKgAAAAIAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEADassAAAAAAAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAAa0k0MAA2rKgAAAAIAAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAADassAAAAAQAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAFTRUMAAAAAAJulxWlbH/DkrkvQvYDKZck42oBPYwJ56sMUgyen4p+iAAAAAAAAAAAAsaK8LsUAAAAAAAEAAAAAAAAAAAAAAAA=",
            fee_meta_xdr:
              "AAAAAgAAAAMADasrAAAAAAAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAAa0nQcAA2rKgAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAEADassAAAAAAAAAAAPBvsNwP2Z/msFScjvzJZtBOdauHdh8iuR6RZc9uVOlAAAAAAa0k0MAA2rKgAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAA==",
            memo_type: "none",
            signatures: [
              "l5kbKF5kYiY1K7W5A2WEZ82nObNQlVeINkZSIASLkLcttZ6c9wNVYVHEpgMfhprMhsVRbyK3HbLU2sCZZsvZBQ==",
            ],
          },
        ],
      },
    };

    it("retrieves its transactions", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}/${lpId}/transactions`)) {
          return Promise.resolve({ data: poolTxsResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const poolTxs = await server.transactions().forLiquidityPool(lpId).call();

      expect(poolTxs.records).toEqual(poolTxsResponse._embedded.records);
    });

    const poolFxsResponse = {
      _links: {
        self: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=asc",
        },
        next: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=asc",
        },
        prev: {
          href: "https://private-33c60-amm3.apiary-mock.com/liquidity_pools?cursor=113725249324879873&limit=10&order=asc",
        },
      },
      _embedded: {
        records: [
          {
            _links: {
              operation: {
                href: "https://private-33c60-amm3.apiary-mock.com/operations/3849085266190337",
              },
              succeeds: {
                href: "https://private-33c60-amm3.apiary-mock.com/effects?order=desc&cursor=3849085266190337-1",
              },
              precedes: {
                href: "https://private-33c60-amm3.apiary-mock.com/effects?order=asc&cursor=3849085266190337-1",
              },
            },
            id: "0000000012884905986-0000000001",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_deposited",
            type_i: 81,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "300",
              total_shares: "5000",
              reserves: [
                {
                  amount: "1000.0000005",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "2000.0000000",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
            reserves_deposited: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "983.0000005",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2378.0000005",
              },
            ],
            shares_received: "1000",
          },
          {
            id: "0000000012884905986-0000000002",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_withdrew",
            type_i: 82,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "299",
              total_shares: "4000",
              reserves: [
                {
                  amount: "7.0000005",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "1.0000000",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
            reserves_received: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "993.0000005",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2478.0000005",
              },
            ],
            shares_redeemed: "1000",
          },
          {
            id: "0000000012884905986-0000000003",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_trade",
            type_i: 83,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "300",
              total_shares: "5000",
              reserves: [
                {
                  amount: "1000.0000005",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "2000.0000000",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
            sold: {
              asset:
                "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
              amount: "983.0000005",
            },
            bought: {
              asset:
                "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
              amount: "2378.0000005",
            },
          },
          {
            id: "0000000012884905986-0000000004",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_created",
            type_i: 84,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "1",
              total_shares: "0",
              reserves: [
                {
                  amount: "0",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "0",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
          },
          {
            id: "0000000012884905986-0000000005",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_removed",
            type_i: 85,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool_id: "abcdef",
          },
          {
            id: "0000000012884905986-0000000006",
            paging_token: "12884905986-2",
            account: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7",
            type: "liquidity_pool_revoked",
            type_i: 86,
            created_at: "2021-11-18T03:15:54Z",
            liquidity_pool: {
              id: "abcdef",
              fee_bp: 30,
              type: "constant_product",
              total_trustlines: "299",
              total_shares: "4000",
              reserves: [
                {
                  amount: "7.0000005",
                  asset:
                    "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                },
                {
                  amount: "1.0000000",
                  asset:
                    "PHP:GBUQWP3BOUZX34TOND2QV7QQ7K7VJTG6VSE7WMLBTMDJLLAW7YKGU6EP",
                },
              ],
            },
            reserves_revoked: [
              {
                asset:
                  "JPY:GBVAOIACNSB7OVUXJYC5UE2D4YK2F7A24T7EE5YOMN4CE6GCHUTOUQXM",
                amount: "993.0000005",
                claimable_balance_id: "cbid1235",
              },
              {
                asset:
                  "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
                amount: "2478.0000005",
                claimable_balance_id: "idcbd1234",
              },
            ],
            shares_revoked: "1000",
          },
          {
            id: "0000000012884905986-0000000007",
            paging_token: "157639717969326081-1",
            account: "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
            type: "trustline_created",
            type_i: 20,
            created_at: "2021-08-04T20:01:24Z",
            asset_type: "liquidity_pool_shares",
            liquidity_pool_id: "abcdef",
            limit: "1000",
          },
          {
            id: "0000000012884905986-0000000008",
            paging_token: "157639717969326081-1",
            account: "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
            type: "trustline_updated",
            type_i: 22,
            created_at: "2021-08-04T20:01:24Z",
            asset_type: "liquidity_pool_shares",
            liquidity_pool_id: "abcdef",
            limit: "2000",
          },
          {
            id: "0000000012884905986-0000000009",
            paging_token: "157639717969326081-1",
            account: "GBBWI7TEVQBPEUXKYNGI3GBAH7EHFEREONKK3UK56ZSLJIDIYHQJCVSG",
            type: "trustline_removed",
            type_i: 21,
            created_at: "2021-08-04T20:01:24Z",
            asset_type: "liquidity_pool_shares",
            liquidity_pool_id: "abcdef",
            limit: "0.0000000",
          },
        ],
      },
    };

    it("retrieves its effects", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes(`${LP_URL}/${lpId}/effects`)) {
          return Promise.resolve({ data: poolFxsResponse });
        }
        return Promise.reject(new Error(`Unexpected URL: ${url}`));
      });

      const poolFxs = await server.effects().forLiquidityPool(lpId).call();

      expect(poolFxs.records).toEqual(poolFxsResponse._embedded.records);
    });
  });
});
