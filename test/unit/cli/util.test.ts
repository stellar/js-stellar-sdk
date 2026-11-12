import { describe, it, expect } from "vitest";
import { Networks } from "../../../src/index.js";
import {
  createGenerator,
  parseRpcHeader,
  resolveContractId,
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

  it("rejects an empty --network-passphrase", () => {
    expect(() => resolveNetwork({ networkPassphrase: "" })).toThrow(
      "--network-passphrase cannot be empty",
    );
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

describe("resolveContractId", () => {
  it("returns undefined when neither flag is given", () => {
    expect(resolveContractId()).toBeUndefined();
  });

  it("accepts either flag alone", () => {
    expect(resolveContractId("CABC")).toBe("CABC");
    expect(resolveContractId(undefined, "CABC")).toBe("CABC");
  });

  it("accepts both flags with the same value", () => {
    expect(resolveContractId("CABC", "CABC")).toBe("CABC");
  });

  it("rejects both flags with different values", () => {
    expect(() => resolveContractId("CABC", "CXYZ")).toThrow(
      "--contract-id (CABC) and --id (CXYZ) are aliases and must not differ",
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

  it.each(["no-colon", ": value", "   : value", ""])(
    "rejects %j without echoing it",
    (header) => {
      expect(() => parseRpcHeader(header)).toThrow(
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

  it("rejects a non-object --headers when merging", () => {
    expect(() => resolveHeaders('["a"]', ["X-A: 1"])).toThrow(
      "--headers must be a JSON object when combined with --rpc-header",
    );
    expect(() => resolveHeaders('"abc"', ["X-A: 1"])).toThrow(
      "--headers must be a JSON object",
    );
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
});
