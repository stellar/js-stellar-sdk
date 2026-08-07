import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import {
  Account,
  AccountRequiresMemoError,
  Asset,
  Horizon,
  Keypair,
  LiquidityPoolAsset,
  Memo,
  NetworkError,
  Networks,
  Operation,
  TimeoutInfinite,
  TransactionBuilder,
} from "../../src/index.js";

function buildTransaction(
  destination: string,
  operations: any[] = [],
  builderOpts: any = {},
) {
  const txBuilderOpts = {
    fee: "100",
    networkPassphrase: Networks.TESTNET,
    v1: true,
  };
  Object.assign(txBuilderOpts, builderOpts);
  const keypair = Keypair.random();
  const account = new Account(keypair.publicKey(), "56199647068161");
  let transactionBuilder = new TransactionBuilder(
    account,
    txBuilderOpts,
  ).addOperation(
    Operation.payment({
      destination,
      asset: Asset.native(),
      amount: "100.50",
    }),
  );

  operations.forEach((op) => {
    transactionBuilder = transactionBuilder.addOperation(op);
  });

  const transaction = transactionBuilder.setTimeout(TimeoutInfinite).build();
  transaction.sign(keypair);

  if (builderOpts.feeBump) {
    return TransactionBuilder.buildFeeBumpTransaction(
      keypair,
      "200",
      transaction,
      txBuilderOpts.networkPassphrase,
    );
  }
  return transaction;
}

function buildAccount(id: any, data = {}) {
  return {
    _links: {
      data: {
        href: `https://horizon-testnet.stellar.org/accounts/${id}/data/{key}`,
        templated: true,
      },
    },
    id,
    account_id: id,
    sequence: "3298702387052545",
    subentry_count: 1,
    last_modified_ledger: 768061,
    thresholds: {
      low_threshold: 0,
      med_threshold: 0,
      high_threshold: 0,
    },
    flags: {
      auth_required: false,
      auth_revocable: false,
      auth_immutable: false,
    },
    balances: [
      {
        balance: "9999.9999900",
        buying_liabilities: "0.0000000",
        selling_liabilities: "0.0000000",
        asset_type: "native",
      },
    ],
    signers: [
      {
        weight: 1,
        key: id,
        type: "ed25519_public_key",
      },
    ],
    data,
  };
}

const mockResponses = new Map();

function mockAccountRequest(
  mockGet: any,
  id: string,
  status: number,
  data = {},
) {
  let response;

  switch (status) {
    case 404: {
      const notFoundError = new Error("Not Found");
      (notFoundError as any).response = {
        status: 404,
        statusText: "Not Found",
        data: {},
      };
      response = Promise.reject(notFoundError);
      break;
    }
    case 400: {
      const badRequestError = new Error("Bad Request");
      (badRequestError as any).response = {
        status: 400,
        statusText: "Bad Request",
        data: {},
      };
      response = Promise.reject(badRequestError);
      break;
    }
    default:
      response = Promise.resolve({ data: buildAccount(id, data) });
      break;
  }

  mockResponses.set(id, response);

  mockGet.mockImplementation((url: string) => {
    const accountId = url.replace(
      "https://horizon-testnet.stellar.org/accounts/",
      "",
    );
    if (mockResponses.has(accountId)) {
      return mockResponses.get(accountId);
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

describe("server.js check-memo-required", () => {
  let server: Horizon.Server;
  let mockGet: any;

  beforeEach(() => {
    server = new Horizon.Server("https://horizon-testnet.stellar.org");
    mockGet = vi.spyOn(server.httpClient, "get");
    mockResponses.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fails if memo is required", async () => {
    const accountId =
      "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(mockGet, accountId, 200, {
      "config.memo_required": "MQ==",
    });
    const transaction = buildTransaction(accountId);

    await expect(server.checkMemoRequired(transaction)).rejects.toThrow(
      new AccountRequiresMemoError("account requires memo", accountId, 0),
    );
  });

  it("fee bump - fails if memo is required", async () => {
    const accountId =
      "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(mockGet, accountId, 200, {
      "config.memo_required": "MQ==",
    });
    const transaction = buildTransaction(accountId, [], { feeBump: true });

    await expect(server.checkMemoRequired(transaction)).rejects.toThrow(
      AccountRequiresMemoError,
    );
  });

  it("returns false if account doesn't exist", async () => {
    const accountId =
      "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(mockGet, accountId, 404, {});
    const transaction = buildTransaction(accountId);

    const result = await server.checkMemoRequired(transaction);
    expect(result).toBeFalsy();
  });

  it("returns false if data field is not present", async () => {
    const accountId =
      "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(mockGet, accountId, 200, {});
    const transaction = buildTransaction(accountId);

    const result = await server.checkMemoRequired(transaction);
    expect(result).toBeFalsy();
  });

  it("returns err with client errors", async () => {
    const accountId =
      "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(mockGet, accountId, 400, {});
    const transaction = buildTransaction(accountId);

    await expect(server.checkMemoRequired(transaction)).rejects.toThrow(
      NetworkError,
    );
  });

  it("doesn't repeat account check if the destination is more than once", async () => {
    const accountId =
      "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(mockGet, accountId, 200, {});

    const operations = [
      Operation.payment({
        destination: accountId,
        asset: Asset.native(),
        amount: "100.50",
      }),
    ];

    const transaction = buildTransaction(accountId, operations);

    const result = await server.checkMemoRequired(transaction);
    expect(result).toBeFalsy();
  });

  it("other operations", async () => {
    const accountId =
      "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    mockAccountRequest(mockGet, accountId, 200, {});

    const destinations = [
      "GASGNGGXDNJE5C2O7LDCATIVYSSTZKB24SHYS6F4RQT4M4IGNYXB4TIV",
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
      "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    ];

    const usd = new Asset(
      "USD",
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
    );
    const eur = new Asset(
      "EUR",
      "GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL",
    );
    const liquidityPoolAsset = new LiquidityPoolAsset(eur, usd, 30);

    const operations = [
      Operation.accountMerge({
        destination: destinations[0]!,
      }),
      Operation.pathPaymentStrictReceive({
        sendAsset: Asset.native(),
        sendMax: "5.0000000",
        destination: destinations[1]!,
        destAsset: Asset.native(),
        destAmount: "5.50",
        path: [usd, eur],
      }),
      Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount: "5.0000000",
        destination: destinations[2]!,
        destAsset: Asset.native(),
        destMin: "5.50",
        path: [usd, eur],
      }),
      Operation.changeTrust({
        asset: usd,
      }),
      Operation.changeTrust({
        asset: liquidityPoolAsset,
      }),
    ];

    destinations.forEach((d) => mockAccountRequest(mockGet, d, 200, {}));

    const transaction = buildTransaction(accountId, operations);

    const result = await server.checkMemoRequired(transaction);
    expect(result).toBeFalsy();
  });
  it("checks for memo required by default", async () => {
    const accountId =
      "GAYHAAKPAQLMGIJYMIWPDWCGUCQ5LAWY4Q7Q3IKSP57O7GUPD3NEOSEA";
    const memo = Memo.text("42");
    const transaction = buildTransaction(accountId, [], { memo });
    const result = await server.checkMemoRequired(transaction);
    expect(result).toBeFalsy();
  });
});
