import { describe, expect, it } from "vitest";
import { expandUriTemplate } from "../../../src/utils/url.js";

describe("StellarUrl", () => {
  it("sets path segments without mutating a cloned native URL", () => {
    const original = new URL("https://example.com/root");
    const cloned = new URL(original);
    cloned.pathname = ["accounts", "GA"].join("/");

    expect(original.toString()).toBe("https://example.com/root");
    expect(cloned.toString()).toBe("https://example.com/accounts/GA");
  });

  it("sets and reads path segments natively", () => {
    const url = new URL("https://example.com/root");
    const paths = ["paths", "strict-send"];
    url.pathname = paths.join("/");

    expect(url.pathname.split("/").filter(Boolean)).toEqual([
      "paths",
      "strict-send",
    ]);
    expect(url.pathname).toBe("/paths/strict-send");
    expect(url.toString()).toBe("https://example.com/paths/strict-send");
  });

  it("sets query strings using Horizon array encoding", () => {
    const url = new URL("https://example.com/liquidity_pools");

    url.searchParams.set(
      "reserves",
      [
        "EURT:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
        "PHP:GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
      ].join(","),
    );

    expect(url.toString()).toBe(
      "https://example.com/liquidity_pools?reserves=EURT%3AGAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S%2CPHP%3AGAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S",
    );
  });

  it("uses native URL for protocol, host, and port", () => {
    const url = new URL("https://horizon.stellar.org/accounts?limit=10");

    url.protocol = "http:";
    url.host = "proxy.example.com:8443";

    expect(url.toString()).toBe(
      "http://proxy.example.com:8443/accounts?limit=10",
    );
    expect(url.protocol).toBe("http:");
    expect(url.host).toBe("proxy.example.com:8443");
    expect(url.hostname).toBe("proxy.example.com");
    expect(url.port).toBe("8443");
  });

  it("uses native URL default port normalization", () => {
    const url = new URL("https://soroban-testnet.stellar.org:443");

    expect(url.port).toBe("");
    expect(url.host).toBe("soroban-testnet.stellar.org");
    expect(url.toString()).toBe("https://soroban-testnet.stellar.org/");
  });
});

const DATA_TEMPLATE = "https://horizon.stellar.org/accounts/GA/data/{key}";

describe("expandUriTemplate", () => {
  it("sets query params from a Horizon query template", () => {
    const expanded = expandUriTemplate(
      "https://horizon.stellar.org/transactions/c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1/operations{?cursor,limit,order}",
      { limit: 1 },
    );

    expect(expanded).toBe(
      "https://horizon.stellar.org/transactions/c585b8764b28be678c482f8b6e87e76e4b5f28043c53f4dcb7b724b4b2efebc1/operations?limit=1",
    );
  });

  it("expands relative query templates that do not have a base URL", () => {
    const expanded = expandUriTemplate(
      "/ledgers/1/effects{?cursor,limit,order}",
      { limit: 1 },
      "https://horizon.stellar.org",
    );

    expect(expanded).toBe(
      "https://horizon.stellar.org/ledgers/1/effects?limit=1",
    );
  });

  it("expands Horizon path and query templates", () => {
    const expanded = expandUriTemplate(
      "https://horizon.stellar.org/accounts/{account_id}/transactions{?cursor,limit,order}",
      {
        account_id: "GA ABC",
        cursor: "123:456",
        limit: 10,
      },
    );

    expect(expanded).toBe(
      "https://horizon.stellar.org/accounts/GA%20ABC/transactions?cursor=123%3A456&limit=10",
    );
  });

  it("appends template query variables to existing query strings", () => {
    const expanded = expandUriTemplate(
      "https://horizon.stellar.org/trades?base_asset_type={base_asset_type}{?limit}",
      {
        base_asset_type: "native",
        limit: 10,
      },
    );

    expect(expanded).toBe(
      "https://horizon.stellar.org/trades?base_asset_type=native&limit=10",
    );
  });

  it("omits undefined template variables", () => {
    const expanded = expandUriTemplate(
      "https://horizon.stellar.org/accounts/{account_id}{?cursor,limit}",
      {
        account_id: "GA",
      },
    );

    expect(expanded).toBe("https://horizon.stellar.org/accounts/GA");
  });

  it("expands a number path variable", () => {
    const expanded = expandUriTemplate(
      "https://horizon.stellar.org/ledgers/{sequence}",
      { sequence: 1 },
    );

    expect(expanded).toBe("https://horizon.stellar.org/ledgers/1");
  });

  it("escapes a path variable that would open a new segment", () => {
    expect(expandUriTemplate(DATA_TEMPLATE, { key: "a/b" })).toBe(
      "https://horizon.stellar.org/accounts/GA/data/a%2Fb",
    );
  });

  // The template is split before the values go in, so a "?" or "#" in a value
  // cannot move the path/query boundary.
  it("escapes a path variable that would open a query or fragment", () => {
    expect(expandUriTemplate(DATA_TEMPLATE, { key: "a?b" })).toBe(
      "https://horizon.stellar.org/accounts/GA/data/a%3Fb",
    );
    expect(expandUriTemplate(DATA_TEMPLATE, { key: "a#b" })).toBe(
      "https://horizon.stellar.org/accounts/GA/data/a%23b",
    );
  });

  // `%2e%2e` is a WHATWG double-dot path segment, so the "%" must stay escaped.
  it("escapes a percent-encoded dot segment", () => {
    expect(expandUriTemplate(DATA_TEMPLATE, { key: "%2e%2e" })).toBe(
      "https://horizon.stellar.org/accounts/GA/data/%252e%252e",
    );
  });

  // The path half decides which endpoint the request addresses, so a path
  // variable takes the same guard as a call builder id. See checkFilter().
  it("rejects a dot-segment path variable", () => {
    expect(() => expandUriTemplate(DATA_TEMPLATE, { key: ".." })).toThrow(
      'expected a single non-empty path segment, not ".."',
    );
    expect(() => expandUriTemplate(DATA_TEMPLATE, { key: "." })).toThrow(
      'expected a single non-empty path segment, not "."',
    );
  });

  it("rejects an empty path variable, which addresses the collection", () => {
    expect(() => expandUriTemplate(DATA_TEMPLATE, { key: "" })).toThrow(
      'expected a single non-empty path segment, not ""',
    );
  });

  it("rejects a path variable that is not a string, number or bigint", () => {
    const untyped = (v: unknown) => v as string;
    for (const value of [{}, ["a", "b"], null, true]) {
      expect(() =>
        expandUriTemplate(DATA_TEMPLATE, { key: untyped(value) }),
      ).toThrow(/^expected a string, number or bigint path segment, not /);
    }
  });

  // encodeURIComponent throws a URIError on a lone surrogate. The guard reports
  // it as a TypeError naming the value, like every other rejected segment.
  it("rejects a path variable that is not well-formed UTF-16", () => {
    expect(() => expandUriTemplate(DATA_TEMPLATE, { key: "\uD800" })).toThrow(
      TypeError,
    );
    expect(() => expandUriTemplate(DATA_TEMPLATE, { key: "\uD800" })).toThrow(
      "expected a well-formed path segment",
    );
  });

  // An empty or dotted query value is legitimate, so the guard must stop at the
  // first "?". Both placeholder forms have to stay permissive.
  it("keeps an inline query variable permissive", () => {
    const expanded = expandUriTemplate(
      "https://horizon.stellar.org/trades?base_asset_type={base_asset_type}{?limit}",
      { base_asset_type: "", limit: 10 },
    );

    expect(expanded).toBe(
      "https://horizon.stellar.org/trades?base_asset_type=&limit=10",
    );
  });

  it("keeps a grouped query variable permissive", () => {
    const expanded = expandUriTemplate(
      "https://horizon.stellar.org/accounts{?cursor,limit}",
      { cursor: "" },
    );

    expect(expanded).toBe("https://horizon.stellar.org/accounts?cursor=");
  });

  // The query half keeps `stringifyTemplateValue`, so the array join and the
  // boolean coercion must survive the path/query split.
  it("joins an array query variable", () => {
    expect(
      expandUriTemplate(
        "https://horizon.stellar.org/trades?base_asset_type={base_asset_type}",
        { base_asset_type: ["a", "b"] },
      ),
    ).toBe("https://horizon.stellar.org/trades?base_asset_type=a%2Cb");

    expect(
      expandUriTemplate(
        "https://horizon.stellar.org/liquidity_pools{?reserves}",
        { reserves: ["EURT:GA", "PHP:GA"] },
      ),
    ).toBe(
      "https://horizon.stellar.org/liquidity_pools?reserves=EURT%3AGA%2CPHP%3AGA",
    );
  });

  it("keeps a boolean query variable", () => {
    expect(
      expandUriTemplate(
        "https://horizon.stellar.org/transactions?include_failed={include_failed}",
        { include_failed: true },
      ),
    ).toBe("https://horizon.stellar.org/transactions?include_failed=true");

    expect(
      expandUriTemplate(
        "https://horizon.stellar.org/transactions{?include_failed}",
        { include_failed: false },
      ),
    ).toBe("https://horizon.stellar.org/transactions?include_failed=false");
  });

  it("guards a path variable that precedes an inline query variable", () => {
    expect(() =>
      expandUriTemplate(
        "https://horizon.stellar.org/accounts/{account_id}/data?key={key}",
        { account_id: "..", key: ".." },
      ),
    ).toThrow('expected a single non-empty path segment, not ".."');
  });
});
