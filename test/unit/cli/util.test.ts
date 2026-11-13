import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it, expect } from "vitest";
import { Networks, StrKey } from "../../../src/index.js";
import {
  createGenerator,
  parseRpcHeader,
  resolveHeaders,
  resolveNetwork,
} from "../../../src/cli/util.js";

const CUSTOM = "My Custom Network ; 2026";

describe("resolveNetwork", () => {
  it("resolves nothing when no network flag is given", () => {
    expect(resolveNetwork({})).toEqual({
      networkPassphrase: undefined,
      rpcUrl: undefined,
      allowHttp: false,
    });
  });

  it("uses --network-passphrase with --rpc-url and no --network", () => {
    expect(
      resolveNetwork({
        networkPassphrase: CUSTOM,
        rpcUrl: "https://rpc.example",
        needsRpcUrl: true,
      }),
    ).toEqual({
      networkPassphrase: CUSTOM,
      rpcUrl: "https://rpc.example",
      allowHttp: false,
    });
  });

  it("does not default the RPC URL or allowHttp for a bare passphrase", () => {
    expect(
      resolveNetwork({
        networkPassphrase: Networks.STANDALONE,
        needsRpcUrl: true,
      }),
    ).toEqual({
      networkPassphrase: Networks.STANDALONE,
      rpcUrl: undefined,
      allowHttp: false,
    });
  });

  it("keeps an explicit --allow-http", () => {
    expect(
      resolveNetwork({
        networkPassphrase: CUSTOM,
        rpcUrl: "http://localhost:9000",
        allowHttp: true,
      }).allowHttp,
    ).toBe(true);
  });

  it("maps a named network to its passphrase and default RPC URL", () => {
    expect(resolveNetwork({ network: "TestNet", needsRpcUrl: true })).toEqual({
      networkPassphrase: Networks.TESTNET,
      rpcUrl: "https://soroban-testnet.stellar.org",
      allowHttp: false,
      defaultRpcUrlFor: "testnet",
    });
  });

  it("does not default the RPC URL for a local WASM source", () => {
    expect(resolveNetwork({ network: "testnet" })).toEqual({
      networkPassphrase: Networks.TESTNET,
      rpcUrl: undefined,
      allowHttp: false,
    });
  });

  it("auto-enables allowHttp only for localnet on its default URL", () => {
    expect(resolveNetwork({ network: "localnet", needsRpcUrl: true })).toEqual({
      networkPassphrase: Networks.STANDALONE,
      rpcUrl: "http://localhost:8000/rpc",
      allowHttp: true,
      defaultRpcUrlFor: "localnet",
    });
    expect(
      resolveNetwork({
        network: "localnet",
        rpcUrl: "http://localhost:9000",
        needsRpcUrl: true,
      }),
    ).toEqual({
      networkPassphrase: Networks.STANDALONE,
      rpcUrl: "http://localhost:9000",
      allowHttp: false,
    });
  });

  it("requires --rpc-url for mainnet network sources", () => {
    expect(() =>
      resolveNetwork({ network: "mainnet", needsRpcUrl: true }),
    ).toThrow("--rpc-url is required for mainnet");
    expect(resolveNetwork({ network: "mainnet" }).networkPassphrase).toBe(
      Networks.PUBLIC,
    );
  });

  it("rejects an unknown network name", () => {
    expect(() => resolveNetwork({ network: "local" })).toThrow(
      "Invalid network: local. Must be mainnet, testnet, futurenet, or localnet",
    );
  });

  it("accepts --network with its own passphrase", () => {
    expect(
      resolveNetwork({
        network: "testnet",
        networkPassphrase: Networks.TESTNET,
      }).networkPassphrase,
    ).toBe(Networks.TESTNET);
  });

  it("rejects --network with a different passphrase", () => {
    expect(() =>
      resolveNetwork({ network: "testnet", networkPassphrase: CUSTOM }),
    ).toThrow(
      `--network-passphrase "${CUSTOM}" does not match the testnet passphrase "${Networks.TESTNET}"`,
    );
  });
});

describe("parseRpcHeader", () => {
  it("splits on the first colon and trims both sides", () => {
    expect(parseRpcHeader("X-Test: 1")).toEqual(["X-Test", "1"]);
    expect(parseRpcHeader("  X-Test  :  a b  ")).toEqual(["X-Test", "a b"]);
    expect(parseRpcHeader("Referer: https://example.com:8080/x")).toEqual([
      "Referer",
      "https://example.com:8080/x",
    ]);
  });

  it("accepts an empty value", () => {
    expect(parseRpcHeader("X-Empty:")).toEqual(["X-Empty", ""]);
  });

  it.each(["Bearer secret-token", ": secret-token", "   : secret-token", ""])(
    "rejects %j without echoing it",
    (header) => {
      let message = "";
      try {
        parseRpcHeader(header);
      } catch (e) {
        message = (e as Error).message;
      }
      expect(message).toBe(
        'Invalid --rpc-header: expected "Name: value" with a non-empty name',
      );
    },
  );
});

describe("resolveHeaders", () => {
  it("returns undefined when no header flag is given", () => {
    expect(resolveHeaders()).toBeUndefined();
    expect(resolveHeaders(undefined, [])).toBeUndefined();
  });

  it("parses --headers alone as before", () => {
    expect(resolveHeaders('{"Authorization": "Bearer t"}')).toEqual({
      Authorization: "Bearer t",
    });
  });

  it("rejects invalid --headers JSON", () => {
    expect(() => resolveHeaders("not-valid-json")).toThrow(
      "Invalid JSON for --headers: not-valid-json",
    );
  });

  it("collects repeated --rpc-header values", () => {
    expect(resolveHeaders(undefined, ["X-A: 1", "X-B: 2"])).toEqual({
      "X-A": "1",
      "X-B": "2",
    });
  });

  it("uses the last of two --rpc-header values with the same name", () => {
    expect(resolveHeaders(undefined, ["X-A: 1", "x-a: 2"])).toEqual({
      "x-a": "2",
    });
  });

  it("merges both flags, with --rpc-header winning without regard to case", () => {
    expect(
      resolveHeaders('{"authorization": "old", "X-Keep": "k"}', [
        "Authorization: new",
        "X-New: n",
      ]),
    ).toEqual({ Authorization: "new", "X-Keep": "k", "X-New": "n" });
  });

  it("leaves --headers names that differ only by case alone", () => {
    expect(
      resolveHeaders('{"X-Dup": "a", "x-dup": "b"}', ["X-Other: 2"]),
    ).toEqual({ "X-Dup": "a", "x-dup": "b", "X-Other": "2" });
  });

  it("rejects a malformed --rpc-header", () => {
    expect(() => resolveHeaders('{"X-A": "1"}', ["bad"])).toThrow(
      "Invalid --rpc-header",
    );
  });
});

describe("createGenerator", () => {
  it("names both network flags when a network source has no passphrase", async () => {
    await expect(
      createGenerator({ contractId: "CABC", rpcUrl: "https://rpc.example" }),
    ).rejects.toThrow(
      "--network or --network-passphrase is required when fetching from network",
    );
  });

  it("sends the merged headers to the RPC server", async () => {
    const seen: {
      method: string;
      headers: Record<string, string | string[] | undefined>;
    }[] = [];
    const server = createServer((req, res) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        const { id, method } = JSON.parse(body);
        seen.push({ method, headers: req.headers });
        const result =
          method === "getNetwork"
            ? { passphrase: CUSTOM, protocolVersion: 27 }
            : { entries: [], latestLedger: 1 };
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ jsonrpc: "2.0", id, result }));
      });
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    const { port } = server.address() as AddressInfo;

    try {
      // the stub holds no contract, so the fetch fails after the network
      // check; only the requests it received matter here
      await createGenerator({
        contractId: StrKey.encodeContract(new Uint8Array(32)),
        rpcUrl: `http://127.0.0.1:${port}`,
        networkPassphrase: CUSTOM,
        serverOptions: {
          allowHttp: true,
          headers: resolveHeaders('{"x-test": "json", "X-Keep": "k"}', [
            "X-Test: 1",
            "X-Other: 2",
          ]),
        },
      }).catch(() => undefined);
    } finally {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }

    expect(seen.map(({ method }) => method)).toEqual([
      "getNetwork",
      "getLedgerEntries",
    ]);
    seen.forEach(({ headers }) => {
      expect(headers).toMatchObject({
        "x-test": "1",
        "x-keep": "k",
        "x-other": "2",
      });
    });
  });
});
