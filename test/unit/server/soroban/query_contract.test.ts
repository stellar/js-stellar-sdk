import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../../src/index.js";

import { serverUrl } from "../../../constants";

const { Server } = StellarSdk.rpc;
const { Client } = StellarSdk.contract;

/**
 * Build a fake `contract.Client`: `spec.funcs()` reports the declared on-chain
 * method names, and `attached` holds the dynamically-attached method functions
 * (keyed by their sanitized identifiers, exactly as the real Client does).
 */
function fakeClient(opts: {
  specNames: string[];
  attached?: Record<string, any>;
}) {
  return {
    spec: {
      funcs: () => opts.specNames.map((name) => ({ name })),
    },
    ...(opts.attached ?? {}),
  };
}

describe("Server#queryContract", () => {
  let server: any;
  const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
  const networkPassphrase = "Test SDF Network ; September 2015";

  beforeEach(() => {
    server = new Server(serverUrl);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults the network passphrase to getNetwork() when not provided", async () => {
    const getNetwork = vi
      .spyOn(server, "getNetwork")
      .mockResolvedValue({ passphrase: networkPassphrase } as any);
    const from = vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient({
        specNames: ["decimals"],
        attached: {
          decimals: vi.fn().mockResolvedValue({ result: 7, isReadCall: true }),
        },
      }) as any,
    );

    const { result, isReadCall } = await server.queryContract(
      contractId,
      "decimals",
    );

    expect(result).toBe(7);
    expect(isReadCall).toBe(true);
    expect(getNetwork).toHaveBeenCalledOnce();
    expect(from).toHaveBeenCalledWith(
      expect.objectContaining({
        contractId,
        rpcUrl: server.serverURL.toString(),
        networkPassphrase,
        server,
      }),
    );
  });

  it("uses the provided networkPassphrase and skips getNetwork()", async () => {
    const getNetwork = vi.spyOn(server, "getNetwork");
    const from = vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient({
        specNames: ["decimals"],
        attached: { decimals: vi.fn().mockResolvedValue({ result: 7 }) },
      }) as any,
    );

    await server.queryContract(
      contractId,
      "decimals",
      {},
      "Custom Network ; 2024",
    );

    expect(getNetwork).not.toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith(
      expect.objectContaining({ networkPassphrase: "Custom Network ; 2024" }),
    );
  });

  it("forwards named args to the contract method and returns the decoded result", async () => {
    const balance = vi
      .fn()
      .mockResolvedValue({ result: 100n, isReadCall: true });
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient({ specNames: ["balance"], attached: { balance } }) as any,
    );

    const args = {
      id: "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
    };
    const { result } = await server.queryContract(contractId, "balance", args);

    expect(balance).toHaveBeenCalledWith(args);
    expect(result).toBe(100n);
  });

  it("surfaces isReadCall:false for a call that would change state", async () => {
    // `queryContract` still simulates and decodes a write method, but the
    // returned value is only a preview — isReadCall flags that.
    const transfer = vi
      .fn()
      .mockResolvedValue({ result: null, isReadCall: false });
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient({ specNames: ["transfer"], attached: { transfer } }) as any,
    );

    const { result, isReadCall } = await server.queryContract(
      contractId,
      "transfer",
    );

    expect(result).toBeNull();
    expect(isReadCall).toBe(false);
  });

  it("resolves methods whose names are sanitized by Client (e.g. reserved words)", async () => {
    // A contract method named `delete` is declared as `delete` in the spec but
    // attached on the Client under the sanitized key `delete_`.
    const deleteFn = vi
      .fn()
      .mockResolvedValue({ result: true, isReadCall: true });
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient({
        specNames: ["delete"],
        attached: { delete_: deleteFn },
      }) as any,
    );

    const { result } = await server.queryContract(contractId, "delete");

    expect(deleteFn).toHaveBeenCalledOnce();
    expect(result).toBe(true);
  });

  it("does not invoke built-in Client members that aren't contract methods", async () => {
    // `txFromJSON` is a real Client method but not a contract method; passing it
    // must throw, not call the built-in.
    const txFromJSON = vi.fn();
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient({
        specNames: ["balance"],
        attached: { balance: vi.fn(), txFromJSON },
      }) as any,
    );

    await expect(
      server.queryContract(contractId, "txFromJSON"),
    ).rejects.toThrow(/no method 'txFromJSON'/);
    expect(txFromJSON).not.toHaveBeenCalled();
  });

  it("throws a TypeError when the contract has no such method", async () => {
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient({
        specNames: ["decimals"],
        attached: { decimals: vi.fn().mockResolvedValue({ result: 7 }) },
      }) as any,
    );

    await expect(server.queryContract(contractId, "missing")).rejects.toThrow(
      TypeError,
    );
    await expect(server.queryContract(contractId, "missing")).rejects.toThrow(
      /no method 'missing'/,
    );
  });
});
