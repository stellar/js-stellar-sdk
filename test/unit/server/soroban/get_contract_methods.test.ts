import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import * as StellarSdk from "../../../../src/index.js";

import { serverUrl } from "../../../constants";

const { Server } = StellarSdk.rpc;
const { Client } = StellarSdk.contract;
const { xdr } = StellarSdk;

/** A `ScSpecTypeDef` for a user-defined type referenced by name. */
function udt(name: string) {
  return xdr.ScSpecTypeDef.scSpecTypeUdt(new xdr.ScSpecTypeUdt({ name }));
}

/** A real `ScSpecFunctionV0`, so the type-name mapping is exercised for real. */
function func(opts: {
  doc?: string;
  name: string;
  inputs?: { name: string; type: xdr.ScSpecTypeDef }[];
  outputs?: xdr.ScSpecTypeDef[];
}) {
  return new xdr.ScSpecFunctionV0({
    doc: opts.doc ?? "",
    name: opts.name,
    inputs: (opts.inputs ?? []).map(
      (i) =>
        new xdr.ScSpecFunctionInputV0({
          doc: "",
          name: i.name,
          type: i.type,
        }),
    ),
    outputs: opts.outputs ?? [],
  });
}

/** Build a fake `contract.Client` whose `spec.funcs()` returns the given funcs. */
function fakeClient(funcs: xdr.ScSpecFunctionV0[]) {
  return { spec: { funcs: () => funcs } };
}

describe("Server#getContractMethods", () => {
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
    const from = vi
      .spyOn(Client, "from")
      .mockResolvedValue(fakeClient([func({ name: "decimals" })]) as any);

    await server.getContractMethods(contractId);

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
    const from = vi
      .spyOn(Client, "from")
      .mockResolvedValue(fakeClient([func({ name: "decimals" })]) as any);

    await server.getContractMethods(contractId, "Custom Network ; 2024");

    expect(getNetwork).not.toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith(
      expect.objectContaining({ networkPassphrase: "Custom Network ; 2024" }),
    );
  });

  it("maps names, inputs, and outputs to readable type names", async () => {
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient([
        func({
          name: "decimals",
          outputs: [xdr.ScSpecTypeDef.scSpecTypeU32()],
        }),
        func({
          name: "balance",
          inputs: [{ name: "id", type: xdr.ScSpecTypeDef.scSpecTypeAddress() }],
          outputs: [xdr.ScSpecTypeDef.scSpecTypeI128()],
        }),
        func({
          name: "transfer",
          inputs: [
            { name: "from", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
            { name: "to", type: xdr.ScSpecTypeDef.scSpecTypeAddress() },
            { name: "amount", type: xdr.ScSpecTypeDef.scSpecTypeI128() },
          ],
        }),
      ]) as any,
    );

    const methods = await server.getContractMethods(contractId);

    expect(methods).toEqual([
      { name: "decimals", inputs: [], outputs: ["U32"] },
      {
        name: "balance",
        inputs: [{ name: "id", type: "Address" }],
        outputs: ["I128"],
      },
      {
        name: "transfer",
        inputs: [
          { name: "from", type: "Address" },
          { name: "to", type: "Address" },
          { name: "amount", type: "I128" },
        ],
        outputs: [],
      },
    ]);
  });

  it("resolves user-defined types by their declared name", async () => {
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient([
        func({
          name: "submit",
          inputs: [{ name: "order", type: udt("Order") }],
          outputs: [udt("Receipt")],
        }),
      ]) as any,
    );

    const [method] = await server.getContractMethods(contractId);

    expect(method.inputs).toEqual([{ name: "order", type: "Order" }]);
    expect(method.outputs).toEqual(["Receipt"]);
  });

  it("includes doc only when the spec declares one", async () => {
    vi.spyOn(server, "getNetwork").mockResolvedValue({
      passphrase: networkPassphrase,
    } as any);
    vi.spyOn(Client, "from").mockResolvedValue(
      fakeClient([
        func({ name: "documented", doc: "Returns the token decimals." }),
        func({ name: "undocumented" }),
      ]) as any,
    );

    const [documented, undocumented] =
      await server.getContractMethods(contractId);

    expect(documented.doc).toBe("Returns the token decimals.");
    expect(undocumented).not.toHaveProperty("doc");
  });
});
