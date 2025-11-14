import { describe, it, expect, beforeAll, assert } from "vitest";
import spec from "../spec.json";
import specStream from "../spec_stream.json";

import {
  StellarSdk,
  type Spec,
  type ScSpecTypeDef,
} from "../../test-utils/stellar-sdk-import";

const { xdr, Address, contract } = StellarSdk;

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
  function getResultType(funcName: string): ScSpecTypeDef {
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

    const args = [];
    for (let i = 0; i < num; i += 1) {
      const generatedData = generateTestData(funcName, i);
      args.push(generatedData);
    }

    args.forEach((arg) => {
      // @ts-ignore
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
        // eslint-disable-next-line no-console
        console.error(
          funcName,
          JSON.stringify(arg, null, 2),

          "\n",
          JSON.stringify(
            //@ts-ignore
            funcSpec.definitions![funcName].properties,
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

describe.skip("Print contract spec", () => {
  it("print", () => {
    const res = JSON.stringify(SPEC.jsonSchema("complex"), null, 2);
    // eslint-disable-next-line no-console
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
