import { describe, it, expect, beforeAll, assert } from "vitest";
import spec from "../spec.json";
import specStream from "../spec_stream.json";
import { xdr, Address, Contract, contract } from "../../../src/index.js";
import type { JSONSchema7 } from "json-schema";
import type { Spec } from "../../../src/contract/spec.js";

const publicKey = "GCBVOLOM32I7OD5TWZQCIXCXML3TK56MDY7ZMTAILIBQHHKPCVU42XYW";
const muxedKey =
  "MA2T2WYMPAPG3PGXIHA7H6BZDBX24ZHFXZFQ7PLAGIHKN5IFB4JBOAAAAAAAAAAAAEJLO";
const addr = Address.fromString(publicKey);
const muxedAddr = Address.fromString(muxedKey);
let SPEC: Spec;

function generateTestData(funcName: string, index: number): any {
  const baseValue = index + 1;

  switch (funcName) {
    case "hello":
      return { args: { hello: `test${baseValue}` } };
    case "u32_":
      return { args: { u32_: baseValue } };
    case "i32_":
      return { args: { i32_: baseValue } };
    case "i64_":
      return { args: { i64_: baseValue.toString() } };
    case "u64_":
      return { args: { u64_: baseValue.toString() } };
    case "i128":
      return { args: { i128: baseValue.toString() } };
    case "u128":
      return { args: { u128: baseValue.toString() } };
    case "i256":
      return { args: { i256: baseValue.toString() } };
    case "u256":
      return { args: { u256: baseValue.toString() } };
    case "timepoint":
      return { args: { timepoint: baseValue.toString() } };
    case "duration":
      return { args: { duration: baseValue.toString() } };
    case "strukt":
      return {
        args: { strukt: { a: baseValue, b: true, c: `test${baseValue}` } },
      };
    case "simple": {
      const simpleOptions = ["First", "Second", "Third"];
      return { args: { simple: { tag: simpleOptions[index % 3] } } };
    }
    case "complex": {
      const complexOptions = ["Struct", "Tuple", "Enum", "Asset", "Void"];
      const choice = complexOptions[index % 5];
      if (choice === "Void") {
        return { args: { complex: { tag: "Void" } } };
      }
      if (choice === "Asset") {
        return {
          args: {
            complex: {
              tag: "Asset",
              values: [publicKey, baseValue.toString()],
            },
          },
        };
      }
      if (choice === "Tuple") {
        return {
          args: {
            complex: {
              tag: "Tuple",
              values: [
                [
                  { a: baseValue, b: true, c: `test${baseValue}` },
                  { tag: "First" },
                ],
              ],
            },
          },
        };
      }
      if (choice === "Enum") {
        return {
          args: { complex: { tag: "Enum", values: [{ tag: "First" }] } },
        };
      }
      return {
        args: {
          complex: {
            tag: "Struct",
            values: [{ a: baseValue, b: true, c: `test${baseValue}` }],
          },
        },
      };
    }
    case "addresse":
      return { args: { addresse: publicKey } };
    case "muxed_address":
      return { args: { muxed_address: muxedKey } };
    case "bytes":
      return { args: { bytes: btoa(`test${baseValue}`) } };
    case "bytes_n": {
      const shortString = `t${baseValue}`;
      const base64 = btoa(shortString);
      return { args: { bytes_n: base64.substring(0, 9) } };
    }
    case "card": {
      const cardValues = [11, 12, 13];
      return { args: { card: cardValues[index % 3] } };
    }
    case "boolean":
      return { args: { boolean: index % 2 === 0 } };
    case "map":
      return {
        args: {
          map: [
            [baseValue, true],
            [baseValue + 1, false],
          ],
        },
      };
    case "vec":
      return { args: { vec: [baseValue, baseValue + 1, baseValue + 2] } };
    case "tuple":
      return { args: { tuple: [`test${baseValue}`, baseValue] } };
    case "option":
      return { args: { option: baseValue } };
    case "option_struct":
      return {
        args: {
          option_struct: { a: baseValue, b: true, c: `test${baseValue}` },
        },
      };
    case "option_option_struct":
      return {
        args: {
          option_option_struct: {
            a: baseValue,
            b: true,
            c: `test${baseValue}`,
          },
        },
      };
    case "option_vec_struct":
      return {
        args: {
          option_vec_struct: [{ a: baseValue, b: true, c: `test${baseValue}` }],
        },
      };
    case "string":
      return { args: { string: `test${baseValue}` } };
    case "tuple_strukt":
      return {
        args: {
          tuple_strukt: [
            { a: baseValue, b: true, c: `test${baseValue}` },
            { tag: "First" },
          ],
        },
      };
    default:
      return { args: {} };
  }
}

function replaceBigIntWithStrings(obj: any): any {
  if (Buffer.isBuffer(obj)) {
    return obj;
  }
  // If obj is an array, process each element
  if (Array.isArray(obj)) {
    return obj.map(replaceBigIntWithStrings);
  }

  // If obj is an object, process each property
  if (obj !== null && !Array.isArray(obj) && typeof obj === "object") {
    const newObj: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      newObj[key] = replaceBigIntWithStrings(value);
    });
    return newObj;
  }

  // If obj is a BigInt, convert it to a string
  if (typeof obj === "bigint") {
    return obj.toString();
  }

  // Otherwise, return the value as it is
  return obj;
}

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

const func = xdr.ScSpecEntry.scSpecEntryFunctionV0(
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

beforeAll(() => {
  SPEC = new contract.Spec(spec);
});

describe("Spec constructor", () => {
  it("loading the spec entries separately is the same result as loading the spec entries from a stream", () => {
    const specFromXdr = new contract.Spec(specStream);
    expect(specFromXdr).deep.equal(SPEC);
  });

  it("loading the spec entries separately is the same result as loading the spec entries from a base64 stream", () => {
    const specFromXdr = new contract.Spec(specStream);
    expect(specFromXdr).deep.equal(SPEC);
  });

  it("throws if no entries", () => {
    expect(() => new contract.Spec([])).toThrow(
      /Contract spec must have at least one entry/i,
    );
  });
});

describe("Can round trip custom types", () => {
  function getResultType(funcName: string): xdr.ScSpecTypeDef {
    const fn = SPEC.findEntry(funcName).value();
    if (!(fn instanceof xdr.ScSpecFunctionV0)) {
      throw new Error("Not a function");
    }
    if (fn.outputs().length === 0) {
      return xdr.ScSpecTypeDef.scSpecTypeVoid();
    }
    const output = fn.outputs()[0];
    if (!output) {
      throw new Error("No output type found");
    }
    return output;
  }

  function jsonSchemaRoundtrip(
    contractSpec: Spec,
    funcName: string,
    num: number = 100,
  ) {
    const funcSpec = contractSpec.jsonSchema(funcName);

    const args: any[] = [];
    for (let i = 0; i < num; i += 1) {
      const generatedData = generateTestData(funcName, i);
      args.push(generatedData);
    }

    args.forEach((arg) => {
      const res = arg.args;
      try {
        const scVals = SPEC.funcArgsToScVals(funcName, res);
        const scVal = scVals[0];
        if (!scVal) {
          throw new Error("No ScVal returned");
        }
        const result = SPEC.funcResToNative(funcName, scVal);
        if (funcName.startsWith("bytes")) {
          res[funcName] = Buffer.from(res[funcName], "base64");
        }
        const expected = res[funcName];
        const actual = replaceBigIntWithStrings(result);
        assert.deepEqual(expected, actual);
      } catch (e) {
        console.error(
          funcName,
          JSON.stringify(arg, null, 2),

          "\n",
          JSON.stringify(
            (funcSpec.definitions![funcName] as JSONSchema7).properties,
            null,
            2,
          ),
        );
        throw e;
      }
    });
  }

  describe("Json Schema", () => {
    SPEC = new contract.Spec(spec);
    const names = SPEC.funcs().map((f) => f.name().toString());
    const banned = ["strukt_hel", "not", "woid", "val", "multi_args"];
    names
      .filter((name) => !name.includes("fail"))
      .filter((name) => !banned.includes(name))
      .forEach((name) => {
        it(name, () => {
          jsonSchemaRoundtrip(SPEC, name);
        });
      });
  });

  function roundtrip(funcName: string, input: any, typeName?: string) {
    const type = getResultType(funcName);
    const ty = typeName ?? funcName;
    const obj: any = {};
    obj[ty] = input;
    const scVals = SPEC.funcArgsToScVals(funcName, obj);
    const scVal = scVals[0];
    if (!scVal) {
      throw new Error("No ScVal returned");
    }
    const result = SPEC.scValToNative(scVal, type);
    expect(result).deep.equal(input);
  }

  it("u32", () => {
    roundtrip("u32_", 1);
  });

  it("u32_fail_on_even", () => {
    roundtrip("u32_fail_on_even", 1, "u32_");
    roundtrip("u32_fail_on_even", 2, "u32_");
  });

  it("i32", () => {
    roundtrip("i32_", -1);
  });

  it("i64", () => {
    roundtrip("i64_", 1n);
  });

  it("timepoint", () => {
    roundtrip("timepoint", BigInt(Date.now()) / 1000n);
  });

  it("duration", () => {
    roundtrip("duration", BigInt(Date.now()) / 1000n);
  });

  it("strukt", () => {
    roundtrip("strukt", { a: 0, b: true, c: "hello" });
  });

  describe("simple", () => {
    it("first", () => {
      const simple = { tag: "First" } as const;
      roundtrip("simple", simple);
    });
    it("simple second", () => {
      const simple = { tag: "Second" } as const;
      roundtrip("simple", simple);
    });

    it("simple third", () => {
      const simple = { tag: "Third" } as const;
      roundtrip("simple", simple);
    });
  });

  describe("complex", () => {
    it("struct", () => {
      const complex = {
        tag: "Struct",
        values: [{ a: 0, b: true, c: "hello" }],
      } as const;
      roundtrip("complex", complex);
    });

    it("tuple", () => {
      const complex = {
        tag: "Tuple",
        values: [[{ a: 0, b: true, c: "hello" }, { tag: "First" }]],
      } as const;
      roundtrip("complex", complex);
    });

    it("enum", () => {
      const complex = {
        tag: "Enum",
        values: [{ tag: "First" }],
      } as const;
      roundtrip("complex", complex);
    });

    it("asset", () => {
      const complex = { tag: "Asset", values: [addr.toString(), 1n] } as const;
      roundtrip("complex", complex);
    });

    it("void", () => {
      const complex = { tag: "Void" } as const;
      roundtrip("complex", complex);
    });
  });

  it("addresse", () => {
    roundtrip("addresse", addr.toString());
  });

  it("muxed_address", () => {
    roundtrip("muxed_address", muxedAddr.toString());
  });

  it("bytes", () => {
    const bytes = new TextEncoder().encode("hello");
    roundtrip("bytes", bytes);
  });

  it("bytes_n", () => {
    const bytesN = new TextEncoder().encode("123456789"); // what's the correct way to construct bytes_n?
    roundtrip("bytes_n", bytesN);
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
    roundtrip("map", [...map.entries()]);

    map.set(3, "hahaha");
    expect(() => roundtrip("map", [...map.entries()])).toThrow(
      /invalid type scSpecTypeBool specified for string value/i,
    );
  });

  it("vec", () => {
    const vec = [1, 2, 3];
    roundtrip("vec", vec);
  });

  it("tuple", () => {
    const tuple = ["hello", 1] as const;
    roundtrip("tuple", tuple);
  });

  it("option", () => {
    roundtrip("option", 1);
    roundtrip("option", null);

    roundtrip("option_struct", { a: 0, b: true, c: "hello" });
    roundtrip("option_struct", null);

    roundtrip("option_option_struct", { a: 0, b: true, c: "hello" });
    roundtrip("option_option_struct", null);

    roundtrip("option_vec_struct", [{ a: 0, b: true, c: "hello" }]);
    roundtrip("option_vec_struct", null);
  });

  it("u256", () => {
    roundtrip("u256", 1n);
    expect(() => roundtrip("u256", -1n)).toThrow(
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
    const arg = [{ a: 0, b: true, c: "hello" }, { tag: "First" }] as const;

    roundtrip("tuple_strukt", arg);
  });
});

describe("Spec nativeToScVal with scSpecTypeVal", () => {
  it("converts a string to scvString", () => {
    const scv = SPEC.nativeToScVal("hello", xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvString");
    expect(scv.value()?.toString()).toBe("hello");
  });

  it("converts a Stellar address string to scvString (no address guessing)", () => {
    // Strings are always scvString for Val; pass an Address object for scvAddress
    const scv = SPEC.nativeToScVal(
      publicKey,
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvString");
  });

  it("converts a small number to scvU64 (smallest fitting type)", () => {
    const scv = SPEC.nativeToScVal(42, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvU64");
  });

  it("converts a small bigint to scvU64 (smallest fitting type)", () => {
    const scv = SPEC.nativeToScVal(42n, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvU64");
  });

  it("converts a u128-range bigint to scvU128", () => {
    const val = 1n << 127n;
    const scv = SPEC.nativeToScVal(val, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvU128");
  });

  it("converts a negative i128-range bigint to scvI128", () => {
    const val = -(1n << 127n);
    const scv = SPEC.nativeToScVal(val, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvI128");
  });

  it("converts a u256-range bigint to scvU256", () => {
    const val = 1n << 200n;
    const scv = SPEC.nativeToScVal(val, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvU256");
  });

  it("converts a zero bigint to scvU64", () => {
    const scv = SPEC.nativeToScVal(0n, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvU64");
  });

  it("converts a boolean to scvBool", () => {
    const scv = SPEC.nativeToScVal(true, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvBool");
    expect(scv.value()).toBe(true);

    const scv2 = SPEC.nativeToScVal(false, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv2.switch().name).toBe("scvBool");
    expect(scv2.value()).toBe(false);
  });

  it("converts null to scvVoid", () => {
    const scv = SPEC.nativeToScVal(null, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvVoid");
  });

  it("converts undefined to scvVoid (Val can carry void)", () => {
    const scv = SPEC.nativeToScVal(
      undefined,
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvVoid");
  });

  it("converts an array to scvVec", () => {
    const scv = SPEC.nativeToScVal(
      [1, 2, 3],
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvVec");
    const vec = scv.vec() ?? [];
    expect(vec.length).toBe(3);
  });

  it("converts a mixed array to scvVec", () => {
    const scv = SPEC.nativeToScVal(
      ["hello", 42, true],
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvVec");
    const vec = scv.vec() ?? [];
    expect(vec.length).toBe(3);
    expect(vec[0]?.switch().name).toBe("scvString");
    expect(vec[1]?.switch().name).toBe("scvU64");
    expect(vec[2]?.switch().name).toBe("scvBool");
  });

  it("converts a nested array to scvVec of scvVec", () => {
    const scv = SPEC.nativeToScVal(
      [
        [1, 2],
        [3, 4],
      ],
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvVec");
    const outer = scv.vec() ?? [];
    expect(outer.length).toBe(2);
    expect(outer[0]?.switch().name).toBe("scvVec");
    expect(outer[1]?.switch().name).toBe("scvVec");
  });

  it("converts a Map to scvMap", () => {
    const m = new Map<string, any>();
    m.set("key1", "value1");
    m.set("key2", 42);
    const scv = SPEC.nativeToScVal(m, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvMap");
    const entries = scv.map() ?? [];
    expect(entries.length).toBe(2);
  });

  it("converts a plain object to scvMap with string keys", () => {
    const scv = SPEC.nativeToScVal(
      { a: 1, b: "hello" },
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvMap");
    const entries = scv.map() ?? [];
    expect(entries.length).toBe(2);
    // base nativeToScVal uses scvString for plain object keys
    const keyNames = entries.map((e) => e.key().str()?.toString()).sort();
    expect(keyNames).toEqual(["a", "b"]);
    // Value types should be correct
    const entryA = entries.find((e) => e.key().str()?.toString() === "a");
    expect(entryA?.val().switch().name).toBe("scvU64");
  });

  it("converts a plain object with keys in non-sorted order to a sorted scvMap", () => {
    // Soroban requires map keys to be sorted; verify the output is sorted
    const scv = SPEC.nativeToScVal(
      { z: 1, a: 2, m: 3 },
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvMap");
    const entries = scv.map() ?? [];
    const keys = entries.map((e) => e.key().str()?.toString());
    expect(keys).toEqual(["a", "m", "z"]);
  });

  it("converts a nested plain object to scvMap of scvMap", () => {
    const scv = SPEC.nativeToScVal(
      { outer: { inner: 42 } },
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvMap");
    const outerEntries = scv.map() ?? [];
    expect(outerEntries.length).toBe(1);
    const innerVal = outerEntries[0]?.val();
    expect(innerVal?.switch().name).toBe("scvMap");
    const innerEntries = innerVal?.map() ?? [];
    expect(innerEntries.length).toBe(1);
    expect(innerEntries[0]?.val().switch().name).toBe("scvU64");
  });

  it("converts a plain object with 'constructor' key to scvMap (not shadowed)", () => {
    const scv = SPEC.nativeToScVal(
      { constructor: "x", name: "test" },
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvMap");
    const entries = scv.map() ?? [];
    expect(entries.length).toBe(2);
    // Verify the keys are preserved as-is
    const keys = entries.map((e) => e.key().str()?.toString()).sort();
    expect(keys).toEqual(["constructor", "name"]);
  });

  it("converts an empty plain object to empty scvMap", () => {
    const scv = SPEC.nativeToScVal({}, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvMap");
    const entries = scv.map() ?? [];
    expect(entries.length).toBe(0);
  });

  it("converts an Address object to scvAddress", () => {
    const scv = SPEC.nativeToScVal(addr, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvAddress");
  });

  it("converts a Contract object to scvAddress", () => {
    const contractId =
      "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
    const contractObj = new Contract(contractId);
    const scv = SPEC.nativeToScVal(
      contractObj,
      xdr.ScSpecTypeDef.scSpecTypeVal(),
    );
    expect(scv.switch().name).toBe("scvAddress");
  });

  it("passes through an existing ScVal", () => {
    const existing = xdr.ScVal.scvU32(99);
    const scv = SPEC.nativeToScVal(existing, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvU32");
    expect(scv.value()).toBe(99);
  });

  it("converts Uint8Array to scvBytes", () => {
    const data = new Uint8Array([0, 1, 2, 3]);
    const scv = SPEC.nativeToScVal(data, xdr.ScSpecTypeDef.scSpecTypeVal());
    expect(scv.switch().name).toBe("scvBytes");
  });

  it("works with funcArgsToScVals for val-typed function inputs", () => {
    // Create a spec with a function that takes a val-typed input
    const funcSpec = xdr.ScSpecEntry.scSpecEntryFunctionV0(
      new xdr.ScSpecFunctionV0({
        doc: "Takes a val",
        name: "takes_val",
        inputs: [
          new xdr.ScSpecFunctionInputV0({
            doc: "",
            name: "some_val",
            type: xdr.ScSpecTypeDef.scSpecTypeVal(),
          }),
        ],
        outputs: [],
      }),
    );
    const localSpec = new contract.Spec([funcSpec.toXDR("base64")]);

    // Test with a string
    const scVals = localSpec.funcArgsToScVals("takes_val", {
      some_val: "hello",
    });
    expect(scVals.length).toBe(1);
    expect(scVals[0].switch().name).toBe("scvString");
    expect(scVals[0].value()?.toString()).toBe("hello");

    // Test with a number
    const scVals2 = localSpec.funcArgsToScVals("takes_val", { some_val: 42 });
    expect(scVals2.length).toBe(1);
    expect(scVals2[0].switch().name).toBe("scvU64");

    // Test with a boolean
    const scVals3 = localSpec.funcArgsToScVals("takes_val", {
      some_val: true,
    });
    expect(scVals3.length).toBe(1);
    expect(scVals3[0].switch().name).toBe("scvBool");
    expect(scVals3[0].value()).toBe(true);

    // Strings are always scvString for Val — pass Address object for scvAddress
    const scVals4 = localSpec.funcArgsToScVals("takes_val", {
      some_val: publicKey,
    });
    expect(scVals4.length).toBe(1);
    expect(scVals4[0].switch().name).toBe("scvString");

    // Test with a plain object — string keys, sorted
    const scVals5 = localSpec.funcArgsToScVals("takes_val", {
      some_val: { x: 1, y: 2 },
    });
    expect(scVals5.length).toBe(1);
    expect(scVals5[0].switch().name).toBe("scvMap");
    const entries = scVals5[0].map() ?? [];
    expect(entries.length).toBe(2);
    const keys = entries.map((e) => e.key().str()?.toString()).sort();
    expect(keys).toEqual(["x", "y"]);

    // Test with undefined — should produce scvVoid
    const scVals6 = localSpec.funcArgsToScVals("takes_val", {
      some_val: undefined,
    });
    expect(scVals6.length).toBe(1);
    expect(scVals6[0].switch().name).toBe("scvVoid");

    // Test with an Address object — should produce scvAddress
    const scVals7 = localSpec.funcArgsToScVals("takes_val", {
      some_val: addr,
    });
    expect(scVals7.length).toBe(1);
    expect(scVals7[0].switch().name).toBe("scvAddress");
    expect(scVals7[0].toXDR("base64")).toEqual(addr.toScVal().toXDR("base64"));
  });
});

describe.skip("Print contract spec", () => {
  it("print", () => {
    const res = JSON.stringify(SPEC.jsonSchema("complex"), null, 2);

    console.log(`complex schema: ${res}`);
  });
});

describe("parsing and building ScVals", () => {
  it("Can parse entries", () => {
    const contractSpec = new contract.Spec([GIGA_MAP, func]);
    const fn = contractSpec.findEntry("giga_map");
    const gigaMap = contractSpec.findEntry("GigaMap");
    expect(gigaMap).deep.equal(GIGA_MAP);
    expect(fn).deep.equal(func);
  });
});
