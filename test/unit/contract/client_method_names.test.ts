import { describe, it, expect, vi, afterEach } from "vitest";
import { xdr, contract } from "../../../src/index.js";

const { AssembledTransaction, Client, Spec } = contract;

afterEach(() => {
  vi.restoreAllMocks();
});

const options = {
  contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
  networkPassphrase: "Standalone Network ; February 2017",
  rpcUrl: "https://example.com",
};

function funcEntry(name: string): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: "",
      name,
      inputs: [],
      outputs: [xdr.ScSpecTypeDef.scSpecTypeU32()],
    }),
  );
}

function makeClient(...names: string[]): contract.Client {
  return new Client(new Spec(names.map(funcEntry)), options);
}

// Contract methods are own properties that the static `Client` type does not declare.
function ownMethod(client: contract.Client, name: string): unknown {
  return Object.getOwnPropertyDescriptor(client, name)?.value;
}

describe("contract.Client method names", () => {
  it.each([
    ["delete", "delete_", "delete_"],
    ["delete_", "delete", "delete_"],
    ["class", "class_", "class_"],
    ["__", "___", "_unnamed"],
    ["_unnamed", "__", "_unnamed"],
    ["safe-withdraw", "safe_withdraw", "safe_withdraw"],
    ["1st", "_1st", "_1st"],
  ])("throws when %j and %j both map to %j", (first, second, property) => {
    expect(() => makeClient(first, second)).toThrow(
      `Contract function "${second}" maps to the client property "${property}", which is already used by contract function "${first}".`,
    );
  });

  it.each([
    "then",
    ...Object.getOwnPropertyNames(Object.prototype).filter(
      (name) => name !== "constructor",
    ),
  ])(
    "does not attach a function that maps to the inherited name %j",
    (name) => {
      const client = makeClient(name, "other");
      expect(Object.hasOwn(client, name)).toBe(false);
      expect(Object.getPrototypeOf(client)).toBe(Client.prototype);
      expect(typeof ownMethod(client, "other")).toBe("function");
    },
  );

  it("keeps spec and options when functions map to them", () => {
    const client = makeClient("spec", "options", "other");
    expect(client.spec).toBeInstanceOf(Spec);
    expect(client.options.contractId).toBe(options.contractId);
    expect(typeof ownMethod(client, "other")).toBe("function");
  });

  it("keeps the transaction helpers when functions map to them", () => {
    const client = makeClient("txFromJson", "txFromJSON", "txFromXDR");
    vi.spyOn(AssembledTransaction, "fromJson").mockImplementation(() => {
      throw new Error("fromJson called");
    });
    vi.spyOn(AssembledTransaction, "fromXdr").mockImplementation(() => {
      throw new Error("fromXdr called");
    });

    const json = '{"method":"other"}';
    expect(() => client.txFromJson(json)).toThrow("fromJson called");
    expect(() => client.txFromJSON(json)).toThrow("fromJson called");
    expect(() => client.txFromXDR("AAAA")).toThrow("fromXdr called");
  });

  it("allows the same raw name twice", () => {
    const client = makeClient("init", "init");
    expect(typeof ownMethod(client, "init")).toBe("function");
  });

  it("still renames a single reserved word", () => {
    const client = makeClient("delete", "constructor");
    expect(typeof ownMethod(client, "delete_")).toBe("function");
    expect(typeof ownMethod(client, "constructor_")).toBe("function");
    expect(client.constructor).toBe(Client);
  });

  it("skips __constructor", () => {
    const client = makeClient("__constructor", "hello");
    expect(ownMethod(client, "__constructor")).toBeUndefined();
    expect(typeof ownMethod(client, "hello")).toBe("function");
  });

  it("accepts a spec whose only function is __constructor", () => {
    expect(() => makeClient("__constructor")).not.toThrow();
  });
});
