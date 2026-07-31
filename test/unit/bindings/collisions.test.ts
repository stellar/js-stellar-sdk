import { describe, it, expect } from "vitest";
import { xdr, contract } from "../../../src/index.js";
import { TypeGenerator } from "../../../src/bindings/types.js";
import { ClientGenerator } from "../../../src/bindings/client.js";
import { BindingGenerator } from "../../../src/bindings/generator.js";

const { Spec } = contract;

function param(
  name: string,
  type: xdr.ScSpecTypeDef,
  location: xdr.ScSpecEventParamLocationV0,
): xdr.ScSpecEventParamV0 {
  return new xdr.ScSpecEventParamV0({ doc: "", name, type, location });
}

const TOPIC = xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList;
const u32Type = xdr.ScSpecTypeDef.scSpecTypeU32();

function eventEntry(name: string, prefixTopics: string[]): xdr.ScSpecEntry {
  const event = new xdr.ScSpecEventV0({
    doc: "",
    lib: "",
    name,
    prefixTopics,
    params: [param("value", u32Type, TOPIC)],
    dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue,
  });
  return xdr.ScSpecEntry.scSpecEntryEventV0(event);
}

function funcEntry(name: string): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryFunctionV0(
    new xdr.ScSpecFunctionV0({ doc: "", name, inputs: [], outputs: [] }),
  );
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

describe("bindings generated-name collision resolution", () => {
  it("disambiguates an event interface name that collides with a UDT name, keeping the UDT's name", () => {
    const spec = new Spec([
      structEntry("TransferEvent"),
      eventEntry("transfer", ["transfer"]),
    ]);
    const generator = new TypeGenerator(spec);
    const output = generator.generate();

    // The UDT keeps its natural name.
    expect(output).toMatch(/export interface TransferEvent \{/);
    // The event is disambiguated to the next free suffix.
    expect(output).toMatch(/export interface TransferEvent2 \{/);

    // No duplicate/merged declarations.
    const declMatches = output.match(/export interface (\w+) \{/g) ?? [];
    const declNames = declMatches.map((m: string) =>
      m.replace(/export interface (\w+) \{/, "$1"),
    );
    expect(new Set(declNames).size).toBe(declNames.length);
    expect(declNames.sort()).toEqual(["TransferEvent", "TransferEvent2"]);

    // The ContractEvent union references the renamed event interface.
    expect(output).toMatch(/export type ContractEvent = TransferEvent2;/);

    // The renamed event carries a JSDoc note explaining the rename.
    expect(output).toMatch(/renamed from "TransferEvent" to avoid a collision/);
  });

  it("disambiguates two events that normalize to the same interface name, deterministically by spec order", () => {
    const spec = new Spec([
      eventEntry("FooBar", ["FooBar"]),
      eventEntry("foo_bar", ["foo_bar"]),
    ]);
    const generator = new TypeGenerator(spec);
    const output = generator.generate();

    expect(output).toMatch(/export interface FooBarEvent \{/);
    expect(output).toMatch(/export interface FooBarEvent2 \{/);

    const declMatches = output.match(/export interface (\w+) \{/g) ?? [];
    const declNames = declMatches.map((m: string) =>
      m.replace(/export interface (\w+) \{/, "$1"),
    );
    expect(new Set(declNames).size).toBe(declNames.length);

    expect(output).toMatch(/renamed from "FooBarEvent" to avoid a collision/);
  });

  it("disambiguates duplicate raw event names, keeping the raw name as discriminant", () => {
    const spec = new Spec([
      eventEntry("transfer", ["first"]),
      eventEntry("transfer", ["second"]),
    ]);

    const typesOutput = new TypeGenerator(spec).generate();
    expect(typesOutput).toMatch(/export interface TransferEvent \{/);
    expect(typesOutput).toMatch(/export interface TransferEvent2 \{/);
    // Both interfaces keep the raw event name as their discriminant.
    const discriminants = typesOutput.match(/name: "transfer";/g) ?? [];
    expect(discriminants.length).toBe(2);
    expect(typesOutput).toMatch(
      /export type ContractEvent = TransferEvent \| TransferEvent2;/,
    );

    const clientOutput = new ClientGenerator(spec).generate();
    expect(clientOutput).toMatch(/transferEventFilter\(/);
    expect(clientOutput).toMatch(/transferEventFilter2\(/);
    // The first filter targets the first declaration (no occurrence arg);
    // the second passes its occurrence so it targets the right spec.
    expect(clientOutput).toMatch(/eventTopicFilter\("transfer", topicValues\)/);
    expect(clientOutput).toMatch(
      /eventTopicFilter\("transfer", topicValues, 1\)/,
    );
    expect(clientOutput).toMatch(/targets declaration 2 of the "transfer"/i);
  });

  it("builds occurrence-specific topic filters for duplicate event names at runtime", () => {
    const spec = new Spec([
      eventEntry("transfer", ["first"]),
      eventEntry("transfer", ["second"]),
    ]);

    const first = spec.eventTopicFilter("transfer");
    const second = spec.eventTopicFilter("transfer", undefined, 1);
    expect(first[0]).toBe(xdr.ScVal.scvSymbol("first").toXdr("base64"));
    expect(second[0]).toBe(xdr.ScVal.scvSymbol("second").toXdr("base64"));
    expect(() => spec.eventTopicFilter("transfer", undefined, 2)).toThrow(
      "no such event: transfer (occurrence 2)",
    );
    expect(() => spec.eventTopicFilter("transfer", undefined, -1)).toThrow(
      "invalid occurrence for event transfer: -1",
    );
    expect(() => spec.eventTopicFilter("transfer", undefined, 0.5)).toThrow(
      "invalid occurrence for event transfer: 0.5",
    );
  });

  it("disambiguates an event filter method that collides with a contract function member name, keeping the function's name", () => {
    const spec = new Spec([
      funcEntry("transferEventFilter"),
      eventEntry("transfer", ["transfer"]),
    ]);
    const generator = new ClientGenerator(spec);
    const output = generator.generate();

    // The function keeps its natural name.
    expect(output).toMatch(/transferEventFilter\(/);
    // The event's filter method is disambiguated.
    expect(output).toMatch(/transferEventFilter2\(/);

    expect(output).toMatch(
      /renamed from "transferEventFilter" to avoid a collision/,
    );
  });

  it("disambiguates the event parser when a contract function is named parseEvent", () => {
    const spec = new Spec([
      funcEntry("parseEvent"),
      eventEntry("transfer", ["transfer"]),
    ]);
    const output = new ClientGenerator(spec).generate();

    expect(output).toMatch(/parseEvent\(options\?: MethodOptions\)/);
    expect(output).toMatch(
      /parseEvent2\(topics: xdr\.ScVal\[\] \| string\[\], data:/,
    );
  });

  it("disambiguates two events whose filter method names collide with each other", () => {
    const spec = new Spec([
      eventEntry("FooBar", ["FooBar"]),
      eventEntry("foo_bar", ["foo_bar"]),
    ]);
    const generator = new ClientGenerator(spec);
    const output = generator.generate();

    expect(output).toMatch(/fooBarEventFilter\(/);
    expect(output).toMatch(/fooBarEventFilter2\(/);
  });

  it("does not gratuitously rename when there is no collision", () => {
    const spec = new Spec([
      funcEntry("doThing"),
      structEntry("SomeStruct"),
      eventEntry("transfer", ["transfer"]),
      eventEntry("mint", ["mint"]),
    ]);

    const typesOutput = new TypeGenerator(spec).generate();
    expect(typesOutput).toMatch(/export interface TransferEvent \{/);
    expect(typesOutput).toMatch(/export interface MintEvent \{/);
    expect(typesOutput).not.toMatch(/renamed from/);
    expect(typesOutput).not.toMatch(/TransferEvent2/);
    expect(typesOutput).not.toMatch(/MintEvent2/);

    const clientOutput = new ClientGenerator(spec).generate();
    expect(clientOutput).toMatch(/transferEventFilter\(/);
    expect(clientOutput).toMatch(/mintEventFilter\(/);
    expect(clientOutput).not.toMatch(/renamed from/);
  });

  it("reports diagnostics for duplicate event names and collision renames", () => {
    const spec = new Spec([
      eventEntry("transfer", ["first"]),
      eventEntry("transfer", ["second"]),
      eventEntry("FooBar", ["FooBar"]),
      eventEntry("foo_bar", ["foo_bar"]),
      eventEntry("mint", ["mint"]),
    ]);

    const { diagnostics } = BindingGenerator.fromSpec(spec).generate({
      contractName: "test-contract",
    });

    expect(diagnostics).toEqual([
      {
        rawName: "transfer",
        occurrence: 0,
        declarations: 2,
        interfaceName: "TransferEvent",
        filterMethodName: "transferEventFilter",
        interfaceRenamed: false,
        filterMethodRenamed: false,
      },
      {
        rawName: "transfer",
        occurrence: 1,
        declarations: 2,
        interfaceName: "TransferEvent2",
        filterMethodName: "transferEventFilter2",
        interfaceRenamed: true,
        filterMethodRenamed: true,
      },
      {
        rawName: "foo_bar",
        occurrence: 0,
        declarations: 1,
        interfaceName: "FooBarEvent2",
        filterMethodName: "fooBarEventFilter2",
        interfaceRenamed: true,
        filterMethodRenamed: true,
      },
    ]);
  });

  it("tracks interface and filter renames independently in diagnostics", () => {
    const spec = new Spec([
      structEntry("TransferEvent"),
      eventEntry("transfer", ["transfer"]),
    ]);

    const { diagnostics } = BindingGenerator.fromSpec(spec).generate({
      contractName: "test-contract",
    });
    // The UDT collision renames only the interface; the filter method keeps
    // its preferred name.
    expect(diagnostics).toEqual([
      {
        rawName: "transfer",
        occurrence: 0,
        declarations: 1,
        interfaceName: "TransferEvent2",
        filterMethodName: "transferEventFilter",
        interfaceRenamed: true,
        filterMethodRenamed: false,
      },
    ]);
  });

  it("reports no diagnostics when event names are unique and unrenamed", () => {
    const spec = new Spec([
      eventEntry("transfer", ["transfer"]),
      eventEntry("mint", ["mint"]),
    ]);

    const { diagnostics } = BindingGenerator.fromSpec(spec).generate({
      contractName: "test-contract",
    });
    expect(diagnostics).toEqual([]);
  });

  it("produces byte-identical output across repeated generation from the same spec", () => {
    const spec = new Spec([
      structEntry("TransferEvent"),
      funcEntry("transferEventFilter"),
      eventEntry("transfer", ["transfer"]),
      eventEntry("FooBar", ["FooBar"]),
      eventEntry("foo_bar", ["foo_bar"]),
    ]);

    const typeGen1 = new TypeGenerator(spec).generate();
    const typeGen2 = new TypeGenerator(spec).generate();
    expect(typeGen1).toBe(typeGen2);

    const clientGen1 = new ClientGenerator(spec).generate();
    const clientGen2 = new ClientGenerator(spec).generate();
    expect(clientGen1).toBe(clientGen2);

    // Also stable within a single generator instance (memoized resolution).
    const generator = new TypeGenerator(spec);
    expect(generator.generate()).toBe(generator.generate());
  });
});
