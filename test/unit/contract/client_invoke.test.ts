import { describe, it, expect, vi, afterEach } from "vitest";
import { xdr, contract } from "../../../src/index.js";

const { AssembledTransaction, Client, Spec } = contract;

afterEach(() => {
  vi.restoreAllMocks();
});

const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
const options = {
  contractId,
  networkPassphrase: "Standalone Network ; February 2017",
  rpcUrl: "https://example.com",
};

// A contract function with a `u32` input per name in `inputs`, returning `u32`.
function func(name: string, inputs: string[] = []): xdr.ScSpecEntry {
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

const errorEnum = xdr.ScSpecEntry.scSpecEntryUdtErrorEnumV0(
  new xdr.ScSpecUdtErrorEnumV0({
    doc: "",
    lib: "",
    name: "Error",
    cases: [
      new xdr.ScSpecUdtErrorEnumCaseV0({
        doc: "Not allowed",
        name: "NotAllowed",
        value: 1,
      }),
    ],
  }),
);

const makeClient = (...entries: xdr.ScSpecEntry[]) =>
  new Client(new Spec(entries), options);

const spyBuild = () =>
  vi.spyOn(AssembledTransaction, "build").mockImplementation(() => {
    throw new Error("build called");
  });

describe("contract.Client.invoke", () => {
  it.each([
    ["delete", ["delete", "delete_"]],
    ["delete_", ["delete", "delete_"]],
    ["then", ["then"]],
    ["toString", ["toString"]],
    ["options", ["options"]],
    ["balance", ["balance"]],
  ])("builds a call to %j by its on-chain name", async (name, names) => {
    const build = spyBuild();
    const client = makeClient(...names.map((n) => func(n, ["amount"])));

    await expect(
      Client.invoke(client, name, { amount: 1 }, { fee: "1000" }),
    ).rejects.toThrow("build called");
    expect(build).toHaveBeenCalledOnce();
    expect(build.mock.calls[0][0]).toMatchObject({
      contractId,
      method: name,
      args: [xdr.ScVal.scvU32(1)],
      fee: "1000",
    });
  });

  it("keeps the contract's error types and decodes the named function's result", async () => {
    const build = spyBuild();
    const client = makeClient(func("delete", ["amount"]), errorEnum);

    await expect(
      Client.invoke(client, "delete", { amount: 1 }),
    ).rejects.toThrow("build called");
    const built = build.mock.calls[0][0];
    expect(built.errorTypes).toEqual({ 1: { message: "Not allowed" } });
    expect(built.parseResultXdr(xdr.ScVal.scvU32(7))).toBe(7);
  });

  it("never reads call options from args, also for a function with no inputs", async () => {
    const build = spyBuild();
    const client = makeClient(func("decimals"));

    await expect(
      Client.invoke(client, "decimals", {
        contractId: "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5",
        method: "balance",
        simulate: false,
      }),
    ).rejects.toThrow("build called");
    expect(build.mock.calls[0][0]).toMatchObject({
      contractId,
      method: "decimals",
      args: [],
    });
    expect(build.mock.calls[0][0]).not.toHaveProperty("simulate");
  });

  it.each([undefined, null])("treats %j args as no arguments", async (args) => {
    const build = spyBuild();
    const client = makeClient(func("decimals"), func("balance", ["amount"]));

    await expect(Client.invoke(client, "decimals", args)).rejects.toThrow(
      "build called",
    );
    expect(build.mock.calls[0][0]).toMatchObject({ args: [] });
    await expect(Client.invoke(client, "balance", args)).rejects.toThrow(
      "Missing field amount",
    );
    expect(build).toHaveBeenCalledOnce();
  });

  it.each(["missing", "__constructor", "txFromJSON", "__proto__"])(
    "rejects %j, which is not a callable contract function",
    async (name) => {
      const build = spyBuild();
      const client = makeClient(func("__constructor"), func("balance"));

      await expect(Client.invoke(client, name)).rejects.toThrow(
        new TypeError(`Contract ${contractId} has no method '${name}'`),
      );
      expect(build).not.toHaveBeenCalled();
    },
  );

  it("is inherited by a subclass, as in generated bindings", async () => {
    const build = spyBuild();
    class Generated extends Client {}
    const client = new Generated(new Spec([func("delete_")]), options);

    await expect(Generated.invoke(client, "delete_")).rejects.toThrow(
      "build called",
    );
    expect(build.mock.calls[0][0]).toMatchObject({ method: "delete_" });
  });
});
