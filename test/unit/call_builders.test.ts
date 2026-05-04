/* eslint-disable @typescript-eslint/dot-notation */
import { describe, it, expect, vi } from "vitest";
import { CallBuilder } from "../../src/horizon/call_builder.js";
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
