import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import http from "http";
import * as StellarSdk from "../../../../src/index.js";
import { create } from "../../../../src/http-client/index.js";

import { serverUrl } from "../../../constants.js";

const { rpc } = StellarSdk;
const { Server } = rpc;

describe("Server.constructor", () => {
  let server: any;
  beforeEach(() => {
    server = new Server(serverUrl);
    vi.spyOn(server.httpClient, "post");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const insecureServerUrl = serverUrl.replace("https://", "http://");

  it("throws error for insecure server", () => {
    expect(() => new Server(insecureServerUrl)).toThrow(
      /Cannot connect to insecure Soroban RPC server/i,
    );
  });

  it("allow insecure server when opts.allowHttp flag is set", () => {
    expect(
      () => new Server(insecureServerUrl, { allowHttp: true }),
    ).not.toThrow();
  });

  it("creates HttpClient instance with provided headers", () => {
    const headersA = { "Custom-Header-A": "CustomValue" };
    const headersB = { "Custom-Header-B": "CustomValue" };
    const serverA = new Server(serverUrl, { headers: headersA }) as any;
    const serverB = new Server(serverUrl, { headers: headersB }) as any;

    expect(serverA.httpClient.defaults.headers["Custom-Header-A"]).to.equal(
      "CustomValue",
    );
    expect(serverB.httpClient.defaults.headers["Custom-Header-B"]).to.equal(
      "CustomValue",
    );

    serverA.httpClient.defaults.headers["Custom-A"] = "modified-value";
    expect(serverA.httpClient.defaults.headers["Custom-A"]).to.equal(
      "modified-value",
    );
    serverA.httpClient.defaults.headers["Additional-A"] = "added-value";
    expect(serverA.httpClient.defaults.headers["Additional-A"]).to.equal(
      "added-value",
    );

    expect(
      serverA.httpClient.defaults.headers["Custom-Header-B"],
    ).toBeUndefined();
    expect(
      serverB.httpClient.defaults.headers["Custom-Header-A"],
    ).toBeUndefined();
  });

  describe("timeout", () => {
    it("applies opts.timeout to the HTTP client", () => {
      const s = new Server(serverUrl, { timeout: 200 });
      expect(s.httpClient.defaults.timeout).toBe(200);
    });

    it("leaves the HTTP client's timeout as is when opts.timeout is not set", () => {
      const s = new Server(serverUrl);
      expect(s.httpClient.defaults.timeout).toBe(create().defaults.timeout);
    });

    it.each([0, 1, 2_147_483_647])("accepts %s", (timeout) => {
      expect(() => new Server(serverUrl, { timeout })).not.toThrow();
    });

    it.each([-1, 1.5, NaN, Infinity, 2_147_483_648])(
      "rejects %s",
      (timeout) => {
        expect(() => new Server(serverUrl, { timeout })).toThrow(/timeout/);
      },
    );

    it.each(["200", null])("rejects %j from a plain-JS caller", (timeout) => {
      expect(() => Reflect.construct(Server, [serverUrl, { timeout }])).toThrow(
        /timeout/,
      );
    });

    it("rejects a request that exceeds opts.timeout", async () => {
      // Unable to create temp server in a browser
      if (typeof window !== "undefined") {
        return;
      }

      const hanging = http.createServer(() => undefined).listen(0);
      try {
        const address = hanging.address();
        if (address === null || typeof address === "string") {
          throw new Error("expected a TCP address");
        }
        const s = new Server(`http://localhost:${address.port}`, {
          allowHttp: true,
          timeout: 200,
        });
        let ceiling: ReturnType<typeof setTimeout> | undefined;
        const outcome = await Promise.race([
          s.getHealth().then(
            () => "resolved",
            (error: Error) => error.message,
          ),
          new Promise<string>((resolve) => {
            ceiling = setTimeout(() => resolve("still pending"), 2000);
          }),
        ]);
        clearTimeout(ceiling);
        expect(outcome).toMatch(/timeout/i);
      } finally {
        hanging.closeAllConnections();
        hanging.close();
      }
    });
  });
});
