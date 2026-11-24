import { afterEach, describe, expect, it } from "vitest";
import { Config, contract, xdr } from "../../../src/index.js";

const { Client, Spec } = contract;

const options = {
  contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
  networkPassphrase: "Standalone Network ; February 2017",
  rpcUrl: "http://localhost:8000/rpc",
};

const spec = new Spec([
  xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: "",
      name: "hello",
      inputs: [],
      outputs: [],
    }),
  ),
]);

describe("contract.Client with an http rpcUrl", () => {
  afterEach(() => {
    Config.setDefault();
  });

  it("refuses the URL when allowHttp and the global flag are unset", () => {
    expect(() => new Client(spec, { ...options })).toThrow(
      /Cannot connect to insecure Soroban RPC server/,
    );
  });

  it("uses the global flag when allowHttp is unset", () => {
    Config.setAllowHttp(true);
    expect(() => new Client(spec, { ...options })).not.toThrow();
  });
});
