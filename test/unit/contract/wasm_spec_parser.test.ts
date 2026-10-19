import { describe, it, expect } from "vitest";
import { xdr, contract } from "../../../src/index.js";
import { BindingGenerator } from "../../../src/bindings/generator.js";
import { wasmWithSpec } from "./support/wasm.js";

const { Spec } = contract;

function hello(type: xdr.ScSpecTypeDef): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: "",
      name: "hello",
      inputs: [new xdr.ScSpecFunctionInputV0({ doc: "", name: "to", type })],
      outputs: [],
    }),
  );
}

const symbolHello = hello(xdr.ScSpecTypeDef.scSpecTypeSymbol());
const u32Hello = hello(xdr.ScSpecTypeDef.scSpecTypeU32());

const duplicateError =
  "Expected at most one 'contractspecv0' section in wasm, found";

describe("specFromWasm", () => {
  it("rejects two different contractspecv0 sections", () => {
    const wasm = wasmWithSpec([symbolHello], [u32Hello]);
    expect(() => Spec.fromWasm(wasm)).toThrow(`${duplicateError} 2`);
  });

  it("rejects two identical contractspecv0 sections", () => {
    const wasm = wasmWithSpec([symbolHello], [symbolHello]);
    expect(() => Spec.fromWasm(wasm)).toThrow(`${duplicateError} 2`);
  });

  it("reports the real number of sections", () => {
    const wasm = wasmWithSpec([symbolHello], [u32Hello], [symbolHello]);
    expect(() => Spec.fromWasm(wasm)).toThrow(`${duplicateError} 3`);
  });

  it("rejects duplicate sections in the bindings generator", () => {
    const wasm = wasmWithSpec([symbolHello], [u32Hello]);
    expect(() => BindingGenerator.fromWasm(wasm)).toThrow(
      `${duplicateError} 2`,
    );
  });

  it("counts an empty contractspecv0 section before a non-empty one", () => {
    const wasm = wasmWithSpec([], [u32Hello]);
    expect(() => Spec.fromWasm(wasm)).toThrow(`${duplicateError} 2`);
  });

  it("counts an empty contractspecv0 section after a non-empty one", () => {
    const wasm = wasmWithSpec([u32Hello], []);
    expect(() => Spec.fromWasm(wasm)).toThrow(`${duplicateError} 2`);
  });

  it("throws the old error when there is no contractspecv0 section", () => {
    expect(() => Spec.fromWasm(wasmWithSpec())).toThrow(
      "Could not obtain contract spec from wasm",
    );
  });

  it("throws the old error for a single empty contractspecv0 section", () => {
    expect(() => Spec.fromWasm(wasmWithSpec([]))).toThrow(
      "Could not obtain contract spec from wasm",
    );
  });

  it("reads a single contractspecv0 section", () => {
    const spec = Spec.fromWasm(wasmWithSpec([symbolHello, u32Hello]));
    expect(spec.entries).toHaveLength(2);
    expect(spec.getFunc("hello").inputs[0].type.type).toBe("scSpecTypeSymbol");
  });
});
