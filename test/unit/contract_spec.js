import { xdr, Address, ContractSpec } from "../../lib";
//@ts-ignore
import spec from "../spec.json";
import { expect } from "chai";
const publicKey = "GCBVOLOM32I7OD5TWZQCIXCXML3TK56MDY7ZMTAILIBQHHKPCVU42XYW";
const addr = Address.fromString(publicKey);
let SPEC;
before(() => {
  SPEC = new ContractSpec(spec);
});
it("throws if no entries", () => {
  expect(() => new ContractSpec([])).to.throw(
    /Contract spec must have at least one entry/i,
  );
});
describe("Can round trip custom types", function () {
  function getResultType(funcName) {
    let fn = SPEC.findEntry(funcName).value();
    if (!(fn instanceof xdr.ScSpecFunctionV0)) {
      throw new Error("Not a function");
    }
    if (fn.outputs().length === 0) {
      return xdr.ScSpecTypeDef.scSpecTypeVoid();
    }
    return fn.outputs()[0];
  }
  function roundtrip(funcName, input, typeName) {
    let type = getResultType(funcName);
    let ty = typeName ?? funcName;
    let obj = {};
    obj[ty] = input;
    let scVal = SPEC.funcArgsToScVals(funcName, obj)[0];
    let result = SPEC.scValToNative(scVal, type);
    expect(result).deep.equal(input);
  }
  it("u32", () => {
    roundtrip("u32_", 1);
  });
  it("i32", () => {
    roundtrip("i32_", -1);
  });
  it("i64", () => {
    roundtrip("i64_", 1n);
  });
  it("strukt", () => {
    roundtrip("strukt", { a: 0, b: true, c: "hello" });
  });
  describe("simple", () => {
    it("first", () => {
      const simple = { tag: "First", values: undefined };
      roundtrip("simple", simple);
    });
    it("simple second", () => {
      const simple = { tag: "Second", values: undefined };
      roundtrip("simple", simple);
    });
    it("simple third", () => {
      const simple = { tag: "Third", values: undefined };
      roundtrip("simple", simple);
    });
  });
  describe("complex", () => {
    it("struct", () => {
      const complex = {
        tag: "Struct",
        values: [{ a: 0, b: true, c: "hello" }],
      };
      roundtrip("complex", complex);
    });
    it("tuple", () => {
      const complex = {
        tag: "Tuple",
        values: [
          [
            { a: 0, b: true, c: "hello" },
            { tag: "First", values: undefined },
          ],
        ],
      };
      roundtrip("complex", complex);
    });
    it("enum", () => {
      const complex = {
        tag: "Enum",
        values: [{ tag: "First", values: undefined }],
      };
      roundtrip("complex", complex);
    });
    it("asset", () => {
      const complex = { tag: "Asset", values: [addr, 1n] };
      roundtrip("complex", complex);
    });
    it("void", () => {
      const complex = { tag: "Void", values: undefined };
      roundtrip("complex", complex);
    });
  });
  it("addresse", () => {
    roundtrip("addresse", addr);
  });
  it("bytes", () => {
    const bytes = Buffer.from("hello");
    roundtrip("bytes", bytes);
  });
  it("bytes_n", () => {
    const bytes_n = Buffer.from("123456789"); // what's the correct way to construct bytes_n?
    roundtrip("bytes_n", bytes_n);
  });
  it("card", () => {
    const card = 11;
    roundtrip("card", card);
  });
  it("boolean", () => {
    roundtrip("boolean", true);
  });
  it("not", () => {
    roundtrip("boolean", false);
  });
  it("i128", () => {
    roundtrip("i128", -1n);
  });
  it("u128", () => {
    roundtrip("u128", 1n);
  });
  it("map", () => {
    const map = new Map();
    map.set(1, true);
    map.set(2, false);
    roundtrip("map", map);
    map.set(3, "hahaha");
    expect(() => roundtrip("map", map)).to.throw(
      /invalid type scSpecTypeBool specified for string value/i,
    );
  });
  it("vec", () => {
    const vec = [1, 2, 3];
    roundtrip("vec", vec);
  });
  it("tuple", () => {
    const tuple = ["hello", 1];
    roundtrip("tuple", tuple);
  });
  it("option", () => {
    roundtrip("option", 1);
    roundtrip("option", undefined);
  });
  it("u256", () => {
    roundtrip("u256", 1n);
    expect(() => roundtrip("u256", -1n)).to.throw(
      /expected a positive value, got: -1/i,
    );
  });
  it("i256", () => {
    roundtrip("i256", -1n);
  });
  it("string", () => {
    roundtrip("string", "hello");
  });
  it("tuple_strukt", () => {
    const arg = [
      { a: 0, b: true, c: "hello" },
      { tag: "First", values: undefined },
    ];
    roundtrip("tuple_strukt", arg);
  });
});
describe("parsing and building ScVals", function () {
  it("Can parse entries", function () {
    let spec = new ContractSpec([GIGA_MAP, func]);
    let fn = spec.findEntry("giga_map");
    let gigaMap = spec.findEntry("GigaMap");
    expect(gigaMap).deep.equal(GIGA_MAP);
    expect(fn).deep.equal(func);
  });
});
export const GIGA_MAP = xdr.ScSpecEntry.scSpecEntryUdtStructV0(
  new xdr.ScSpecUdtStructV0({
    doc: "This is a kitchen sink of all the types",
    lib: "",
    name: "GigaMap",
    fields: [
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "bool",
        type: xdr.ScSpecTypeDef.scSpecTypeBool(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "i128",
        type: xdr.ScSpecTypeDef.scSpecTypeI128(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "u128",
        type: xdr.ScSpecTypeDef.scSpecTypeU128(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "i256",
        type: xdr.ScSpecTypeDef.scSpecTypeI256(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "u256",
        type: xdr.ScSpecTypeDef.scSpecTypeU256(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "i32",
        type: xdr.ScSpecTypeDef.scSpecTypeI32(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "u32",
        type: xdr.ScSpecTypeDef.scSpecTypeU32(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "i64",
        type: xdr.ScSpecTypeDef.scSpecTypeI64(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "u64",
        type: xdr.ScSpecTypeDef.scSpecTypeU64(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "symbol",
        type: xdr.ScSpecTypeDef.scSpecTypeSymbol(),
      }),
      new xdr.ScSpecUdtStructFieldV0({
        doc: "",
        name: "string",
        type: xdr.ScSpecTypeDef.scSpecTypeString(),
      }),
    ],
  }),
);
const GIGA_MAP_TYPE = xdr.ScSpecTypeDef.scSpecTypeUdt(
  new xdr.ScSpecTypeUdt({ name: "GigaMap" }),
);
let func = xdr.ScSpecEntry.scSpecEntryFunctionV0(
  new xdr.ScSpecFunctionV0({
    doc: "Kitchen Sink",
    name: "giga_map",
    inputs: [
      new xdr.ScSpecFunctionInputV0({
        doc: "",
        name: "giga_map",
        type: GIGA_MAP_TYPE,
      }),
    ],
    outputs: [GIGA_MAP_TYPE],
  }),
);
