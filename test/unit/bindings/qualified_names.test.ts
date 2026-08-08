import { describe, it, expect } from "vitest";
import { xdr, contract } from "../../../src/index.js";
import { TypeGenerator } from "../../../src/bindings/types.js";
import { ClientGenerator } from "../../../src/bindings/client.js";

const { Spec } = contract;

const u32Type = xdr.ScSpecTypeDef.scSpecTypeU32();

function udtType(name: string): xdr.ScSpecTypeDef {
  return xdr.ScSpecTypeDef.scSpecTypeUdt(new xdr.ScSpecTypeUdt({ name }));
}

function structEntry(name: string): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryUdtStructV0(
    new xdr.ScSpecUdtStructV0({
      doc: "",
      lib: "",
      name,
      fields: [
        new xdr.ScSpecUdtStructFieldV0({
          doc: "",
          name: "value",
          type: u32Type,
        }),
      ],
    }),
  );
}

function enumEntry(name: string): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryUdtEnumV0(
    new xdr.ScSpecUdtEnumV0({
      doc: "",
      lib: "",
      name,
      cases: [
        new xdr.ScSpecUdtEnumCaseV0({ doc: "", name: "First", value: 0 }),
      ],
    }),
  );
}

function funcEntry(
  name: string,
  inputType: xdr.ScSpecTypeDef,
  outputType: xdr.ScSpecTypeDef,
): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({
      doc: "",
      name,
      inputs: [
        new xdr.ScSpecFunctionInputV0({
          doc: "",
          name: "arg",
          type: inputType,
        }),
      ],
      outputs: [outputType],
    }),
  );
}

function eventEntry(name: string): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryEventV0(
    new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name,
      prefixTopics: [name],
      params: [
        new xdr.ScSpecEventParamV0({
          doc: "",
          name: "value",
          type: u32Type,
          location:
            xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList(),
        }),
      ],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
    }),
  );
}

describe("module-qualified user-defined type names", () => {
  it("declares a qualified type under its bare name and records the spec name", () => {
    const spec = new Spec([structEntry("test_udt::UdtStruct")]);
    const output = new TypeGenerator(spec).generate();

    expect(output).toMatch(/export interface UdtStruct \{/);
    expect(output).not.toMatch(/test_udt__UdtStruct/);
    expect(output).toMatch(
      /Declared in the contract spec as `test_udt::UdtStruct`\./,
    );
  });

  it("leaves an unqualified type name (and its doc comment) untouched", () => {
    const spec = new Spec([structEntry("UdtStruct")]);
    const output = new TypeGenerator(spec).generate();

    expect(output).toMatch(/export interface UdtStruct \{/);
    expect(output).not.toMatch(/Declared in the contract spec as/);
  });

  it("references and imports qualified types by their bare name in the client", () => {
    const spec = new Spec([
      structEntry("test_udt::UdtStruct"),
      enumEntry("test_udt::nested::UdtEnum"),
      funcEntry(
        "convert",
        udtType("test_udt::UdtStruct"),
        udtType("test_udt::nested::UdtEnum"),
      ),
    ]);
    const output = new ClientGenerator(spec).generate();

    expect(output).toMatch(
      /import \{UdtStruct, UdtEnum\} from '\.\/types\.js'/,
    );
    expect(output).toMatch(
      /convert\(\{ arg \}: \{ arg: UdtStruct \}, options\?: MethodOptions\): Promise<AssembledTransaction<UdtEnum>>;/,
    );
  });

  it("resolves types with the same bare name by prefixing the module path", () => {
    const spec = new Spec([
      structEntry("first::Shared"),
      structEntry("second::Shared"),
      structEntry("third::nested::Shared"),
      funcEntry("convert", udtType("second::Shared"), udtType("first::Shared")),
    ]);

    const types = new TypeGenerator(spec).generate();
    expect(types).toMatch(/export interface Shared \{/);
    expect(types).toMatch(/export interface second_Shared \{/);
    expect(types).toMatch(/export interface nested_Shared \{/);

    // The client agrees with the names types.ts declares.
    const client = new ClientGenerator(spec).generate();
    expect(client).toMatch(
      /import \{second_Shared, Shared\} from '\.\/types\.js'/,
    );
    expect(client).toMatch(
      /convert\(\{ arg \}: \{ arg: second_Shared \}, options\?: MethodOptions\): Promise<AssembledTransaction<Shared>>;/,
    );
  });

  it("falls back to a numeric suffix when every module-path candidate is taken", () => {
    const spec = new Spec([
      structEntry("Shared"),
      structEntry("first_Shared"),
      structEntry("first::Shared"),
    ]);
    const types = new TypeGenerator(spec).generate();

    expect(types).toMatch(/export interface Shared \{/);
    expect(types).toMatch(/export interface first_Shared \{/);
    expect(types).toMatch(/export interface first_Shared2 \{/);

    const declNames = (types.match(/export interface (\w+) \{/g) ?? []).map(
      (m: string) => m.replace(/export interface (\w+) \{/, "$1"),
    );
    expect(new Set(declNames).size).toBe(declNames.length);
  });

  it("reserves the bare name of a qualified type against event interface names", () => {
    const spec = new Spec([
      structEntry("test_udt::TransferEvent"),
      eventEntry("transfer"),
    ]);
    const types = new TypeGenerator(spec).generate();

    // The UDT keeps the bare name; the event is disambiguated around it.
    expect(types).toMatch(/export interface TransferEvent \{/);
    expect(types).toMatch(/export interface TransferEvent2 \{/);
    expect(types).toMatch(/export type ContractEvent = TransferEvent2;/);
  });

  it("resolves names deterministically across generator instances", () => {
    const spec = new Spec([
      structEntry("first::Shared"),
      structEntry("second::Shared"),
    ]);

    expect(new TypeGenerator(spec).generate()).toBe(
      new TypeGenerator(spec).generate(),
    );
  });
});

describe("Spec.findEntry with module-qualified names", () => {
  it("finds a qualified entry by its bare type name", () => {
    const spec = new Spec([structEntry("test_udt::UdtStruct")]);

    expect(
      spec.findEntry("test_udt::UdtStruct").value().name().toString(),
    ).toBe("test_udt::UdtStruct");
    expect(spec.findEntry("UdtStruct").value().name().toString()).toBe(
      "test_udt::UdtStruct",
    );
  });

  it("rejects a bare name that matches more than one qualified entry", () => {
    const spec = new Spec([
      structEntry("first::Shared"),
      structEntry("second::Shared"),
    ]);

    expect(() => spec.findEntry("Shared")).toThrow(
      "ambiguous entry: Shared matches first::Shared, second::Shared",
    );
  });

  it("still throws for an unknown name", () => {
    const spec = new Spec([structEntry("test_udt::UdtStruct")]);

    expect(() => spec.findEntry("Missing")).toThrow("no such entry: Missing");
  });

  it("converts values for a qualified type", () => {
    const spec = new Spec([structEntry("test_udt::UdtStruct")]);
    const scVal = spec.nativeToScVal(
      { value: 1 },
      udtType("test_udt::UdtStruct"),
    );

    expect(spec.scValToNative(scVal, udtType("test_udt::UdtStruct"))).toEqual({
      value: 1,
    });
  });
});
