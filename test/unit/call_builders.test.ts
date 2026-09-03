import { describe, it, afterEach, expect, vi } from "vitest";
import { CallBuilder } from "../../src/horizon/call_builder.js";
import { Horizon } from "../../src/index.js";
import { BadRequestError } from "../../src/errors/index.js";
import { httpClient } from "../../src/http-client/index.js";

describe("CallBuilder functions", () => {
  it("doesn't mutate the constructor passed url argument (it clones it instead)", () => {
    const arg = new URL("https://onedom.ain/");
    const builder = new CallBuilder(arg, httpClient);
    builder["checkFilter"]();

    builder["setPath"]("one_segment");

    expect(arg.toString()).toEqual("https://onedom.ain/");
    expect(builder["url"].toString()).toEqual("https://onedom.ain/one_segment");
  });

  it("doesn't add neighborRoot until a filter is added", () => {
    const builder = new CallBuilder(
      new URL("https://onedom.ain/base"),
      httpClient,
      "effects",
    );

    builder["checkFilter"]();

    expect(builder["url"].toString()).toEqual("https://onedom.ain/base");
  });

  it("expands templated Horizon links with encoded path and query values", async () => {
    const mockHttpClient = {
      defaults: {},
      get: vi.fn().mockResolvedValue({ data: { id: "loaded-account" } }),
    } as any;
    const builder = new CallBuilder(
      new URL("https://proxy.example.com"),
      mockHttpClient,
    );
    const response = builder["_parseResponse"]({
      _links: {
        account: {
          href: "https://horizon.stellar.org/accounts/{account_id}{?cursor,limit}",
          templated: true,
        },
      },
    });

    await response.account({
      account_id: "GA ABC",
      cursor: "123:456",
      limit: 10,
    });

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "https://proxy.example.com/accounts/GA%20ABC?cursor=123%3A456&limit=10",
    );
  });

  it("uses the configured Horizon authority for absolute page links", async () => {
    const mockHttpClient = {
      defaults: {},
      get: vi
        .fn()
        .mockResolvedValueOnce({
          data: {
            _embedded: { records: [] },
            _links: {
              next: {
                href: "https://horizon.stellar.org/accounts?cursor=next",
              },
              prev: {
                href: "https://horizon.stellar.org/accounts?cursor=prev",
              },
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            _embedded: { records: [] },
            _links: { next: { href: "/next" }, prev: { href: "/prev" } },
          },
        }),
    } as any;
    const builder = new CallBuilder(
      new URL("https://proxy.example.com/base"),
      mockHttpClient,
    );

    const page = await builder["_parseResponse"]({
      _embedded: { records: [] },
      _links: {
        next: {
          href: "https://horizon.stellar.org/accounts?cursor=next",
        },
        prev: {
          href: "https://horizon.stellar.org/accounts?cursor=prev",
        },
      },
    }).next();

    expect(page.records).toEqual([]);
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      "https://proxy.example.com/accounts?cursor=next",
    );
  });
});

describe("CallBuilder path segments", () => {
  function mockServer(serverUrl = "https://horizon.example.com") {
    const server = new Horizon.Server(serverUrl);
    const get = vi
      .spyOn(server.httpClient, "get")
      .mockResolvedValue({ data: {} } as any);
    return { server, get };
  }

  const EVIL = "../../transactions/DEADBEEF";
  const ENCODED_EVIL = "..%2F..%2Ftransactions%2FDEADBEEF";

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps an account id in the /accounts segment", async () => {
    const { server, get } = mockServer();
    await server.accounts().accountId(EVIL).call();
    expect(get).toHaveBeenCalledWith(
      `https://horizon.example.com/accounts/${ENCODED_EVIL}`,
    );
  });

  it("keeps a transaction hash in the /transactions segment", async () => {
    const { server, get } = mockServer();
    await server.transactions().transaction("../ledgers/1").call();
    expect(get).toHaveBeenCalledWith(
      "https://horizon.example.com/transactions/..%2Fledgers%2F1",
    );
  });

  it("keeps an offer id in the /offers segment", async () => {
    const { server, get } = mockServer();
    await server.offers().offer("../accounts/GBRPY").call();
    expect(get).toHaveBeenCalledWith(
      "https://horizon.example.com/offers/..%2Faccounts%2FGBRPY",
    );
  });

  it("keeps a claimable balance id in the /claimable_balances segment", async () => {
    const { server, get } = mockServer();
    await server.claimableBalances().claimableBalance("../accounts/X").call();
    expect(get).toHaveBeenCalledWith(
      "https://horizon.example.com/claimable_balances/..%2Faccounts%2FX",
    );
  });

  it("keeps an operation id in the /operations segment", async () => {
    const { server, get } = mockServer();
    await server.operations().operation("../ledgers/2").call();
    expect(get).toHaveBeenCalledWith(
      "https://horizon.example.com/operations/..%2Fledgers%2F2",
    );
  });

  it("keeps a neighbor filter id in its own segment", async () => {
    const { server, get } = mockServer();
    await server.transactions().forAccount(EVIL).call();
    expect(get).toHaveBeenCalledWith(
      `https://horizon.example.com/accounts/${ENCODED_EVIL}/transactions`,
    );
  });

  it("keeps a string ledger sequence in its own segment", async () => {
    const { server, get } = mockServer();
    await server.transactions().forLedger("../accounts/GBRPY").call();
    expect(get).toHaveBeenCalledWith(
      "https://horizon.example.com/ledgers/..%2Faccounts%2FGBRPY/transactions",
    );
  });

  it("appends to a base URL that already has path segments", async () => {
    const { server, get } = mockServer("https://horizon.example.com/folder");
    await server.accounts().accountId(EVIL).call();
    expect(get).toHaveBeenCalledWith(
      `https://horizon.example.com/folder/accounts/${ENCODED_EVIL}`,
    );
  });

  // `call()` is not async, so checkFilter() throws synchronously — same as the
  // sibling "Too many filters" error.
  it("rejects a dot segment, which encoding alone does not escape", () => {
    const { server, get } = mockServer();
    expect(() => server.accounts().accountId("..").call()).toThrow(
      BadRequestError,
    );
    expect(() => server.accounts().accountId(".").call()).toThrow(
      /Invalid path segment/,
    );
    expect(() => server.transactions().forAccount("..").stream()).toThrow(
      /Invalid path segment/,
    );
    expect(get).not.toHaveBeenCalled();
  });

  it("rejects an empty identifier instead of hitting the collection", () => {
    const { server, get } = mockServer();
    expect(() => server.accounts().accountId("").call()).toThrow(
      BadRequestError,
    );
    expect(() => server.transactions().forAccount("").call()).toThrow(
      /Invalid path segment/,
    );
    expect(get).not.toHaveBeenCalled();
  });

  // Untyped callers reach this despite the `string` parameter, and `join()` used
  // to coerce nullish to "", silently returning the whole collection.
  it("rejects a nullish identifier from an untyped caller", () => {
    const { server, get } = mockServer();
    const untyped = (v: unknown) => v as string;
    expect(() =>
      server.accounts().accountId(untyped(undefined)).call(),
    ).toThrow(/Invalid path segment/);
    expect(() => server.accounts().accountId(untyped(null)).call()).toThrow(
      /Invalid path segment/,
    );
    expect(get).not.toHaveBeenCalled();
  });

  // The empty-ish check must be explicit, not `!segment`: `offer()` and friends
  // push the raw value, so an untyped caller's numeric 0 reaches encodeSegment.
  it("accepts a falsy-but-valid numeric id", async () => {
    const { server, get } = mockServer();
    const untyped = (v: unknown) => v as string;
    await server.offers().offer(untyped(0)).call();
    expect(get).toHaveBeenCalledWith("https://horizon.example.com/offers/0");

    get.mockClear();
    await server.ledgers().ledger(0).call();
    expect(get).toHaveBeenCalledWith("https://horizon.example.com/ledgers/0");

    get.mockClear();
    await server.transactions().forLedger(0).call();
    expect(get).toHaveBeenCalledWith(
      "https://horizon.example.com/ledgers/0/transactions",
    );
  });

  it("passes a valid identifier through unchanged", async () => {
    const { server, get } = mockServer();
    const id = "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H";
    await server.accounts().accountId(id).call();
    expect(get).toHaveBeenCalledWith(
      `https://horizon.example.com/accounts/${id}`,
    );
  });
});
