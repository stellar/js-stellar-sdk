import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../../src/index.js";

import { serverUrl } from "../../../constants";

const { Server } = StellarSdk.rpc;
const { Client } = StellarSdk.contract;

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
    const from = vi.spyOn(Client, "from").mockResolvedValue({
      decimals: vi.fn().mockResolvedValue({ result: 7 }),
    } as any);

    const result = await server.queryContract(contractId, "decimals");

    expect(result).toBe(7);
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
    const from = vi.spyOn(Client, "from").mockResolvedValue({
      decimals: vi.fn().mockResolvedValue({ result: 7 }),
    } as any);

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
    const balance = vi.fn().mockResolvedValue({ result: 100n });
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue({ balance } as any);

    const args = {
      id: "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
    };
    const result = await server.queryContract(contractId, "balance", args);

    expect(balance).toHaveBeenCalledWith(args);
    expect(result).toBe(100n);
  });

  it("throws a TypeError when the contract has no such method", async () => {
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue({} as any);

    await expect(server.queryContract(contractId, "missing")).rejects.toThrow(
      TypeError,
    );
    await expect(server.queryContract(contractId, "missing")).rejects.toThrow(
      /no method 'missing'/,
    );
  });
});
