import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import {
  StellarSdk
} from "../../../test-utils/stellar-sdk-import";

const { Horizon } = StellarSdk;

describe("ClaimableBalanceCallBuilder", () => {
  let server: any;
  let mockGet: any;

  beforeEach(() => {
    server = new Horizon.Server("https://horizon-live.stellar.org:1337");
    mockGet = vi.spyOn(server.httpClient, "get");
    StellarSdk.Config.setDefault();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requests the correct endpoint", async () => {
    const singleBalanceResponse = {
      _links: {
        self: {
          href: "horizon-live.stellar.org:1337/claimable_balances/00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072",
        },
      },
      id: "00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072",
      asset: "native",
      amount: "200.0000000",
      sponsor: "GBVFLWXYCIGPO3455XVFIKHS66FCT5AI64ZARKS7QJN4NF7K5FOXTJNL",
      last_modified_ledger: 38888,
      claimants: [
        {
          destination:
            "GBVFLWXYCIGPO3455XVFIKHS66FCT5AI64ZARKS7QJN4NF7K5FOXTJNL",
          predicate: {
            unconditional: true,
          },
        },
      ],
      paging_token:
        "38888-00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072",
    };

    mockGet.mockImplementation((url: string) => {
      if (
        url === "https://horizon-live.stellar.org:1337/claimable_balances/00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072" 
      ) {
        return Promise.resolve({ data: singleBalanceResponse });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const response = await server
      .claimableBalances()
      .claimableBalance(
        "00000000929b20b72e5890ab51c24f1cc46fa01c4f318d8d33367d24dd614cfdf5491072",
      )
      .call();
    expect(response).toEqual(singleBalanceResponse);
  });

  it('adds a "sponsor" query to the endpoint', async () => {
    const data = {
      _links: {
        self: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?sponsor=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc",
        },
        next: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?sponsor=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc",
        },
        prev: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?sponsor=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=desc",
        },
      },
      _embedded: {
        records: [],
      },
    };

    mockGet.mockImplementation((url: string) => {
      if (
        url.includes(
          "https://horizon-live.stellar.org:1337/claimable_balances?sponsor=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD",
        )
      ) {
        return Promise.resolve({ data });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const response = await server
      .claimableBalances()
      .sponsor("GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD")
      .call();
    expect(response.next).toBeTypeOf("function");
    expect(response.prev).toBeTypeOf("function");
  });

  it('adds a "claimant" query to the endpoint', async () => {
    const data = {
      _links: {
        self: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?claimant=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc",
        },
        next: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?claimant=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc",
        },
        prev: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?claimant=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=desc",
        },
      },
      _embedded: {
        records: [],
      },
    };

    mockGet.mockImplementation((url: string) => {
      if (
        url.includes(
          "https://horizon-live.stellar.org:1337/claimable_balances?claimant=GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD",
        )
      ) {
        return Promise.resolve({ data });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const response = await server
      .claimableBalances()
      .claimant("GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD")
      .call();
    expect(response.next).toBeTypeOf("function");
    expect(response.prev).toBeTypeOf("function");
  });

  it('adds an "asset" query to the endpoint', async () => {
    const data = {
      _links: {
        self: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc",
        },
        next: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=asc",
        },
        prev: {
          href: "https://horizon-live.stellar.org:1337/claimable_balances?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD&cursor=&limit=10&order=desc",
        },
      },
      _embedded: {
        records: [],
      },
    };

    mockGet.mockImplementation((url: string) => {
      if (
        url.includes(
          "https://horizon-live.stellar.org:1337/claimable_balances?asset=USD%3AGDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD",
        )
      ) {
        return Promise.resolve({ data });
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });

    const response = await server
      .claimableBalances()
      .asset(
        new StellarSdk.Asset(
          "USD",
          "GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD",
        ),
      )
      .call();
    expect(response.next).toBeTypeOf("function");
    expect(response.prev).toBeTypeOf("function");
  });
});
