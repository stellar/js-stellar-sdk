import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

import { serverUrl } from "../../../constants";

const { Server } = StellarSdk.rpc;

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
});
