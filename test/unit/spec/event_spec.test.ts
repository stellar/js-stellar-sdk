import { describe, it, expect } from "vitest";
import { xdr, Address, contract } from "../../../src/index.js";

const { Spec } = contract;

const publicKey = "GCBVOLOM32I7OD5TWZQCIXCXML3TK56MDY7ZMTAILIBQHHKPCVU42XYW";
const addr = Address.fromString(publicKey);

function param(
  name: string,
  type: xdr.ScSpecTypeDef,
  location: xdr.ScSpecEventParamLocationV0,
): xdr.ScSpecEventParamV0 {
  return new xdr.ScSpecEventParamV0({
    doc: "",
    name,
    type,
    location,
  });
}

const TOPIC =
  xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationTopicList();
const DATA = xdr.ScSpecEventParamLocationV0.scSpecEventParamLocationData();

const u32Type = xdr.ScSpecTypeDef.scSpecTypeU32();
const addrType = xdr.ScSpecTypeDef.scSpecTypeAddress();
const i128Type = xdr.ScSpecTypeDef.scSpecTypeI128();

function entryFor(event: xdr.ScSpecEventV0): xdr.ScSpecEntry {
  return xdr.ScSpecEntry.scSpecEntryEventV0(event);
}

describe("Spec events", () => {
  it("events() and findEvent() return event entries only", () => {
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name: "transfer",
      prefixTopics: ["transfer"],
      params: [
        param("from", addrType, TOPIC),
        param("to", addrType, TOPIC),
        param("amount", i128Type, DATA),
      ],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
    });
    const funcEntry = xdr.ScSpecEntry.scSpecEntryFunctionV0(
      new xdr.ScSpecFunctionV0({
        doc: "",
        name: "transfer",
        inputs: [],
        outputs: [],
      }),
    );
    const spec = new Spec([funcEntry, entryFor(event)]);

    expect(spec.events().length).toBe(1);
    expect(spec.events()[0].name().toString()).toBe("transfer");
    expect(spec.findEvent("transfer").name().toString()).toBe("transfer");
    expect(() => spec.findEvent("nope")).toThrow();
  });

  it("parses singleValue data format events, round-tripping natives", () => {
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name: "transfer",
      prefixTopics: ["transfer"],
      params: [
        param("from", addrType, TOPIC),
        param("to", addrType, TOPIC),
        param("amount", i128Type, DATA),
      ],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
    });
    const spec = new Spec([entryFor(event)]);

    const from = Address.fromString(publicKey);
    const to = Address.fromString(
      "GDGQVOKHW4VEJRU2TETD6DBRKEO5ERCNF353LW5WBFW3JJWQ2BRQ6KDD",
    );
    const topics = [
      xdr.ScVal.scvSymbol("transfer"),
      from.toScVal(),
      to.toScVal(),
    ];
    const data = xdr.ScVal.scvI128(
      new xdr.Int128Parts({ hi: new xdr.Int64(0), lo: new xdr.Uint64(12345) }),
    );

    const parsed = spec.parseEvent(topics, data);
    expect(parsed).toBeDefined();
    expect(parsed!.name).toBe("transfer");
    expect(parsed!.topics.from).toBe(from.toString());
    expect(parsed!.topics.to).toBe(to.toString());
    expect(parsed!.data.amount).toBe(12345n);
  });

  it("parses vec data format events", () => {
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name: "swap",
      prefixTopics: ["swap"],
      params: [
        param("who", addrType, TOPIC),
        param("sell_amount", u32Type, DATA),
        param("buy_amount", u32Type, DATA),
      ],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatVec(),
    });
    const spec = new Spec([entryFor(event)]);

    const who = Address.fromString(publicKey);
    const topics = [xdr.ScVal.scvSymbol("swap"), who.toScVal()];
    const data = xdr.ScVal.scvVec([xdr.ScVal.scvU32(10), xdr.ScVal.scvU32(20)]);

    const parsed = spec.parseEvent(topics, data);
    expect(parsed).toBeDefined();
    expect(parsed!.topics.who).toBe(who.toString());
    expect(parsed!.data.sell_amount).toBe(10);
    expect(parsed!.data.buy_amount).toBe(20);
  });

  it("parses map data format events", () => {
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name: "mint",
      prefixTopics: ["mint"],
      params: [
        param("to", addrType, TOPIC),
        param("amount", u32Type, DATA),
        param("memo", u32Type, DATA),
      ],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatMap(),
    });
    const spec = new Spec([entryFor(event)]);

    const to = Address.fromString(publicKey);
    const topics = [xdr.ScVal.scvSymbol("mint"), to.toScVal()];
    const data = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("amount"),
        val: xdr.ScVal.scvU32(7),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("memo"),
        val: xdr.ScVal.scvU32(99),
      }),
    ]);

    const parsed = spec.parseEvent(topics, data);
    expect(parsed).toBeDefined();
    expect(parsed!.data.amount).toBe(7);
    expect(parsed!.data.memo).toBe(99);
  });

  it("supports multiple prefix topics", () => {
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name: "nested_event",
      prefixTopics: ["namespace", "nested_event"],
      params: [param("value", u32Type, TOPIC)],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
    });
    const spec = new Spec([entryFor(event)]);

    const topics = [
      xdr.ScVal.scvSymbol("namespace"),
      xdr.ScVal.scvSymbol("nested_event"),
      xdr.ScVal.scvU32(5),
    ];
    const data = xdr.ScVal.scvVoid();

    const parsed = spec.parseEvent(topics, data);
    expect(parsed).toBeDefined();
    expect(parsed!.name).toBe("nested_event");
    expect(parsed!.topics.value).toBe(5);
  });

  it("returns undefined for non-matching topics", () => {
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name: "transfer",
      prefixTopics: ["transfer"],
      params: [param("from", addrType, TOPIC)],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
    });
    const spec = new Spec([entryFor(event)]);

    // Wrong prefix symbol
    const wrongPrefix = [xdr.ScVal.scvSymbol("not_transfer"), addr.toScVal()];
    expect(spec.parseEvent(wrongPrefix, xdr.ScVal.scvVoid())).toBeUndefined();

    // Wrong topic count
    const wrongCount = [xdr.ScVal.scvSymbol("transfer")];
    expect(spec.parseEvent(wrongCount, xdr.ScVal.scvVoid())).toBeUndefined();
  });

  it("accepts base64 XDR strings for topics and data", () => {
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name: "transfer",
      prefixTopics: ["transfer"],
      params: [param("from", addrType, TOPIC), param("amount", u32Type, DATA)],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
    });
    const spec = new Spec([entryFor(event)]);

    const topics = [
      xdr.ScVal.scvSymbol("transfer").toXDR("base64"),
      addr.toScVal().toXDR("base64"),
    ];
    const data = xdr.ScVal.scvU32(42).toXDR("base64");

    const parsed = spec.parseEvent(topics, data);
    expect(parsed).toBeDefined();
    expect(parsed!.topics.from).toBe(addr.toString());
    expect(parsed!.data.amount).toBe(42);
  });

  it("builds eventTopicFilter with and without provided values", () => {
    const event = new xdr.ScSpecEventV0({
      doc: "",
      lib: "",
      name: "transfer",
      prefixTopics: ["transfer"],
      params: [
        param("from", addrType, TOPIC),
        param("to", addrType, TOPIC),
        param("amount", i128Type, DATA),
      ],
      dataFormat: xdr.ScSpecEventDataFormat.scSpecEventDataFormatSingleValue(),
    });
    const spec = new Spec([entryFor(event)]);

    // No values provided: wildcard for both topic-list params
    const filterAll = spec.eventTopicFilter("transfer");
    expect(filterAll.length).toBe(3);
    expect(xdr.ScVal.fromXDR(filterAll[0], "base64").sym().toString()).toBe(
      "transfer",
    );
    expect(filterAll[1]).toBe("*");
    expect(filterAll[2]).toBe("*");

    // Provide a value for "from" only
    const filterPartial = spec.eventTopicFilter("transfer", {
      from: publicKey,
    });
    expect(filterPartial[1]).not.toBe("*");
    const decoded = xdr.ScVal.fromXDR(filterPartial[1], "base64");
    expect(Address.fromScVal(decoded).toString()).toBe(publicKey);
    expect(filterPartial[2]).toBe("*");

    expect(() => spec.eventTopicFilter("nonexistent")).toThrow();
  });
});
