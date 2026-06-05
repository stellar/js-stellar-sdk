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
});
