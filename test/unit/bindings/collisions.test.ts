import { describe, it, expect } from "vitest";
import { xdr, contract } from "../../../src/index.js";
import { TypeGenerator } from "../../../src/bindings/types.js";
import { ClientGenerator } from "../../../src/bindings/client.js";

const { Spec } = contract;

function param(
  name: string,
  type: xdr.ScSpecTypeDef,
  location: xdr.ScSpecEventParamLocationV0,
): xdr.ScSpecEventParamV0 {
  return new xdr.ScSpecEventParamV0({ doc: "", name, type, location });
}

const TOPIC =
  xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList();
const u32Type = xdr.ScSpecTypeDef.scSpecTypeU32();

function eventEntry(name: string, prefixTopics: string[]): xdr.ScSpecEntry {
  const event = new xdr.ScSpecEventV0({
    doc: "",
    lib: "",
    name,
    prefixTopics,
    params: [param("value", u32Type, TOPIC)],
    dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
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
