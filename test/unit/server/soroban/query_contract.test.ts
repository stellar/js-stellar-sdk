import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../../src/index.js";

import { serverUrl } from "../../../constants.js";

const { Address, SorobanDataBuilder, xdr } = StellarSdk;
const { Server } = StellarSdk.rpc;
const { AssembledTransaction, Client, Spec } = StellarSdk.contract;

// A contract function with a `u32` input per name in `inputs`, returning `u32`.
function func(name: string, inputs: string[] = []): StellarSdk.xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: "",
      name,
      inputs: inputs.map(
        (input) =>
          new xdr.ScSpecFunctionInputV0({
            doc: "",
            name: input,
            type: xdr.ScSpecTypeDef.scSpecTypeU32(),
          }),
      ),
      outputs: [xdr.ScSpecTypeDef.scSpecTypeU32()],
    }),
  );
}

// Runs the real `Client` constructor, so its method-name rules apply.
const fromSpec = (...entries: StellarSdk.xdr.ScSpecEntry[]) =>
  vi
    .spyOn(Client, "from")
    .mockImplementation((options) =>
      Promise.resolve(new Client(new Spec(entries), options)),
    );

const spyBuild = () =>
  vi.spyOn(AssembledTransaction, "build").mockImplementation(() => {
    throw new Error("build called");
  });

describe("Server#queryContract", () => {
  let server: any;
  const contractId = "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";
  const networkPassphrase = "Test SDF Network ; September 2015";

  // A read-write footprint entry makes the simulated call a write call.
  const simulates = (retval: StellarSdk.xdr.ScVal, write = false) =>
    vi.spyOn(server, "simulateTransaction").mockResolvedValue({
      id: "1",
      latestLedger: 3,
      events: [],
      _parsed: true,
      minResourceFee: "15",
      result: { auth: [], retval },
      transactionData: new SorobanDataBuilder().setReadWrite(
        write
          ? [
              xdr.LedgerKey.contractData(
                new xdr.LedgerKeyContractData({
                  contract: Address.fromString(contractId).toScAddress(),
                  key: xdr.ScVal.scvU32(0),
                  durability: xdr.ContractDataDurability.persistent,
                }),
              ),
            ]
          : [],
      ),
    });

  beforeEach(() => {
    server = new Server(serverUrl);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults the network passphrase to getNetwork() when not provided", async () => {
    const getNetwork = vi
      .spyOn(server, "getNetwork")
      .mockResolvedValue({ passphrase: networkPassphrase });
    const from = fromSpec(func("decimals"));
    simulates(xdr.ScVal.scvU32(7));

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
    const from = fromSpec(func("decimals"));
    simulates(xdr.ScVal.scvU32(7));

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
    const build = vi.spyOn(AssembledTransaction, "build");
    fromSpec(func("balance", ["amount"]));
    simulates(xdr.ScVal.scvU32(100));

    const { result } = await server.queryContract(
      contractId,
      "balance",
      { amount: 5 },
      networkPassphrase,
    );

    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "balance",
        args: [xdr.ScVal.scvU32(5)],
      }),
    );
    expect(result).toBe(100);
  });

  it("surfaces isReadCall:false for a call that would change state", async () => {
    // `queryContract` still simulates and decodes a write method, but the
    // returned value is only a preview — isReadCall flags that.
    fromSpec(func("transfer", ["amount"]));
    simulates(xdr.ScVal.scvU32(0), true);

    const { result, isReadCall } = await server.queryContract(
      contractId,
      "transfer",
      { amount: 5 },
      networkPassphrase,
    );

    expect(result).toBe(0);
    expect(isReadCall).toBe(false);
  });

  it("does not invoke built-in Client members that aren't contract methods", async () => {
    const build = spyBuild();
    fromSpec(func("balance"));

    await expect(
      server.queryContract(contractId, "txFromJSON", {}, networkPassphrase),
    ).rejects.toThrow(/no method 'txFromJSON'/);
    expect(build).not.toHaveBeenCalled();
  });

  it("throws a TypeError when the contract has no such method", async () => {
    fromSpec(func("decimals"));

    await expect(
      server.queryContract(contractId, "missing", {}, networkPassphrase),
    ).rejects.toThrow(
      new TypeError(`Contract ${contractId} has no method 'missing'`),
    );
  });

  it.each([
    ["delete", ["delete", "delete_", "balance"]],
    ["delete_", ["delete", "delete_", "balance"]],
    ["toString", ["toString", "balance"]],
    ["then", ["then", "balance"]],
    ["options", ["options", "balance"]],
    ["txFromXDR", ["txFromXDR", "balance"]],
  ])("calls %j by its on-chain name", async (method, names) => {
    const build = spyBuild();
    fromSpec(...names.map((name) => func(name, ["amount"])));

    await expect(
      server.queryContract(
        contractId,
        method,
        { amount: 1 },
        networkPassphrase,
      ),
    ).rejects.toThrow("build called");
    expect(build).toHaveBeenCalledOnce();
    expect(build).toHaveBeenCalledWith(
      expect.objectContaining({
        contractId,
        method,
        args: [xdr.ScVal.scvU32(1)],
      }),
    );
  });

  it("does not take call options from the args of a function with no inputs", async () => {
    const build = spyBuild();
    fromSpec(func("decimals"));

    await expect(
      server.queryContract(
        contractId,
        "decimals",
        {
          contractId:
            "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
          method: "balance",
          simulate: false,
        },
        networkPassphrase,
      ),
    ).rejects.toThrow("build called");
    expect(build).toHaveBeenCalledOnce();
    expect(build.mock.calls[0][0]).toMatchObject({
      contractId,
      method: "decimals",
      args: [],
    });
    expect(build.mock.calls[0][0]).not.toHaveProperty("simulate");
  });

  it("builds the call through contract.Client.invoke", async () => {
    spyBuild();
    const invoke = vi
      .spyOn(Client, "invoke")
      .mockRejectedValue(new Error("invoke called"));
    fromSpec(func("balance", ["amount"]));

    await expect(
      server.queryContract(
        contractId,
        "balance",
        { amount: 1 },
        networkPassphrase,
      ),
    ).rejects.toThrow("invoke called");
    expect(invoke).toHaveBeenCalledWith(expect.any(Client), "balance", {
      amount: 1,
    });
  });

  it("treats null args as no arguments", async () => {
    const build = spyBuild();
    fromSpec(func("balance", ["amount"]));

    await expect(
      server.queryContract(contractId, "balance", null, networkPassphrase),
    ).rejects.toThrow("Missing field amount");
    expect(build).not.toHaveBeenCalled();
  });

  it("throws for __constructor, which the client does not attach", async () => {
    const build = vi.spyOn(AssembledTransaction, "build");
    fromSpec(func("__constructor"), func("balance"));

    await expect(
      server.queryContract(contractId, "__constructor", {}, networkPassphrase),
    ).rejects.toThrow(`Contract ${contractId} has no method '__constructor'`);
    expect(build).not.toHaveBeenCalled();
  });
});
