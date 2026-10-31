import { describe, it, expect } from "vitest";
import { xdr, contract } from "../../../src/index.js";
import { BindingGenerator } from "../../../src/bindings/generator.js";
import {
  specSectionName,
  wasmWithNamedSections,
  wasmWithSpec,
} from "./support/wasm.js";

const { Spec } = contract;

function func(name: string, type: xdr.ScSpecTypeDef): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: "",
      name,
      inputs: [new xdr.ScSpecFunctionInputV0({ doc: "", name: "to", type })],
      outputs: [],
    }),
  );
}

const symbolHello = func("hello", xdr.ScSpecTypeDef.scSpecTypeSymbol());
const u32Hello = func("hello", xdr.ScSpecTypeDef.scSpecTypeU32());

function struct(name: string): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryUdtStructV0(
    new xdr.ScSpecUdtStructV0({
      doc: "",
      lib: "",
      name,
      fields: [
        new xdr.ScSpecUdtStructFieldV0({
          doc: "",
          name: "a",
          type: xdr.ScSpecTypeDef.scSpecTypeU32(),
        }),
      ],
    }),
  );
}

function enumType(name: string): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryUdtEnumV0(
    new xdr.ScSpecUdtEnumV0({
      doc: "",
      lib: "",
      name,
      cases: [new xdr.ScSpecUdtEnumCaseV0({ doc: "", name: "X", value: 0 })],
    }),
  );
}

const duplicateError =
  "Expected at most one 'contractspecv0' section in wasm, found";

const duplicateTypeNameError = 'duplicate type name in contract spec: "Foo"';

// EF BB BF is the UTF-8 byte-order mark.
const bomSpecName = Uint8Array.of(0xef, 0xbb, 0xbf, ...specSectionName);

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

  it("rejects duplicate sections in Client.fromWasm", async () => {
    const wasm = wasmWithSpec([symbolHello], [u32Hello]);
    await expect(
      contract.Client.fromWasm(wasm, {
        contractId: "CCN57TGC6EXFCYIQJ4UCD2UDZ4C3AQCHVMK74DGZ3JYCA5HD4BY7FNPC",
        networkPassphrase: "Test SDF Network ; September 2015",
        rpcUrl: "https://rpc.example.com",
      }),
    ).rejects.toThrow(`${duplicateError} 2`);
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

  it("ignores a section whose name has a leading BOM", () => {
    const wasm = wasmWithNamedSections([
      { name: bomSpecName, entries: [u32Hello] },
    ]);
    expect(() => Spec.fromWasm(wasm)).toThrow(
      "Could not obtain contract spec from wasm",
    );
  });

  it("does not count a BOM-prefixed section as a duplicate", () => {
    const wasm = wasmWithNamedSections([
      { name: specSectionName, entries: [symbolHello] },
      { name: bomSpecName, entries: [u32Hello] },
    ]);
    const spec = Spec.fromWasm(wasm);
    expect(spec.entries).toHaveLength(1);
    expect(spec.getFunc("hello").inputs[0].type.type).toBe("scSpecTypeSymbol");
  });

  it("reads a single contractspecv0 section", () => {
    const u32Goodbye = func("goodbye", xdr.ScSpecTypeDef.scSpecTypeU32());
    const spec = Spec.fromWasm(wasmWithSpec([symbolHello, u32Goodbye]));
    expect(spec.entries).toHaveLength(2);
    expect(spec.getFunc("hello").inputs[0].type.type).toBe("scSpecTypeSymbol");
    expect(spec.getFunc("goodbye").inputs[0].type.type).toBe("scSpecTypeU32");
  });

  // #1762: a struct and an enum (or any two UDTs) sharing a name compile
  // fine on-chain (soroban-sdk's own exporter only warns), but
  // funcArgsToScVals and jsonSchema() would silently disagree about which
  // one a shared name means. fromWasm now rejects the spec outright instead
  // of loading it into an inconsistent state.
  describe("duplicate type names", () => {
    it("rejects a struct and an enum sharing a name", () => {
      const wasm = wasmWithSpec([struct("Foo"), enumType("Foo")]);
      expect(() => Spec.fromWasm(wasm)).toThrow(duplicateTypeNameError);
    });

    it("rejects two structs sharing a name", () => {
      const wasm = wasmWithSpec([struct("Foo"), struct("Foo")]);
      expect(() => Spec.fromWasm(wasm)).toThrow(duplicateTypeNameError);
    });

    it("does not reject distinct type names", () => {
      const wasm = wasmWithSpec([struct("Foo"), enumType("Bar")]);
      expect(() => Spec.fromWasm(wasm)).not.toThrow();
    });

    it("does not reject a type name that collides only with a function name", () => {
      // funcArgsToScVals/getFunc and nativeToUdt/findEntry for types are
      // different lookups keyed by different XDR entry kinds, and
      // jsonSchema() already covers this combination without a bug — only
      // UDT-vs-UDT is in scope here (see #1762).
      const wasm = wasmWithSpec([
        func("Foo", xdr.ScSpecTypeDef.scSpecTypeU32()),
        struct("Foo"),
      ]);
      expect(() => Spec.fromWasm(wasm)).not.toThrow();
    });
  });
});
