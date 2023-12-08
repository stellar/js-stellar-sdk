import {
  xdr,
  Address,
  ContractSpec,
  Keypair,
  SorobanRpc,
  u32,
  toLowerCamelCase,
} from "../../..";
import { JSONSchemaFaker } from "json-schema-faker";

import spec from "../spec.json";
import { expect } from "chai";

const publicKey = "GCBVOLOM32I7OD5TWZQCIXCXML3TK56MDY7ZMTAILIBQHHKPCVU42XYW";
const addr = Address.fromString(publicKey);
let SPEC: ContractSpec;
let contract: any;

JSONSchemaFaker.format("address", () => {
  let keypair = Keypair.random();
  return keypair.publicKey();
});

before(() => {
  SPEC = new ContractSpec(spec);
  contract = SPEC.generateContractClient(OPTIONS);
});

it("throws if no entries", () => {
  expect(() => new ContractSpec([])).to.throw(
    /Contract spec must have at least one entry/i
  );
});

describe("Can round trip custom types", function () {
  function getResultType(funcName: string): xdr.ScSpecTypeDef {
    let fn = SPEC.findEntry(funcName).value();
    if (!(fn instanceof xdr.ScSpecFunctionV0)) {
      throw new Error("Not a function");
    }
    if (fn.outputs().length === 0) {
      return xdr.ScSpecTypeDef.scSpecTypeVoid();
    }
    return fn.outputs()[0];
  }

  async function jsonSchema_roundtrip(
    spec: ContractSpec,
    funcName: string,
    num: number = 100
  ) {
    let funcSpec = spec.jsonSchema(funcName);

    for (let i = 0; i < num; i++) {
      let arg = await JSONSchemaFaker.resolve(funcSpec)!;
      // @ts-ignore
      let res = arg.args;
      try {
        let scVal = SPEC.funcArgsToScVals(funcName, res)[0];
        let result = SPEC.funcResToNative(funcName, scVal);
        if (funcName.startsWith("bytes")) {
          res[funcName] = Buffer.from(res[funcName], "base64");
        }
        let expected = res[funcName];
        let actual = replaceBigIntWithStrings(result);
        expect(expected).deep.equal(actual);
      } catch (e) {
        console.error(
          funcName,
          JSON.stringify(arg, null, 2),

          "\n",
          //@ts-ignore
          JSON.stringify(funcSpec.definitions![funcName]["properties"], null, 2)
        );
        throw e;
      }
    }
  }

  describe("Json Schema", () => {
    SPEC = new ContractSpec(spec);
    let names = SPEC.funcs().map((f) => f.name().toString());
    const banned = ["strukt_hel", "not", "woid", "val", "multi_args"];
    names
      .filter((name) => !name.includes("fail"))
      .filter((name) => !banned.includes(name))
      .forEach((name) => {
        it(name, async () => {
          await jsonSchema_roundtrip(SPEC, name);
        });
      });
  });

  async function roundtrip(funcName: string, input: any, typeName?: string) {
    let type = getResultType(funcName);
    let ty = typeName ?? funcName;
    let obj: any = {};
    obj[ty] = input;
    let scVal = SPEC.funcArgsToScVals(funcName, obj)[0];
    let result = SPEC.funcResToNative(funcName, scVal);
    let contract = SPEC.generateContractClient(OPTIONS);
    //@ts-ignore
    let { result: networkResult } = (await contract[toLowerCamelCase(funcName)](
      obj
    )) as SorobanRpc.AssembledTransaction<any>;
    if (type.switch().value === xdr.ScSpecType.scSpecTypeResult().value) {
      // @ts-ignore
      result = result.unwrap();
      //@ts-ignore
      networkResult = networkResult.unwrap();
    }
    expect(result).deep.equal(input);
    expect(networkResult).deep.equal(input, "failed network call");
  }

  it("u32", async () => {
    await roundtrip("u32_", 1);
  });

  it("i32", async () => {
    await roundtrip("i32_", -1);
  });

  it("i64", async () => {
    await roundtrip("i64_", 1n);
  });

  it("strukt", async () => {
    await roundtrip("strukt", { a: 0, b: true, c: "hello" });
  });

  describe("simple", () => {
    it("first", async () => {
      const simple = { tag: "First" } as const;
      await roundtrip("simple", simple);
    });
    it("simple second", async () => {
      const simple = { tag: "Second" } as const;
      await roundtrip("simple", simple);
    });

    it("simple third", async () => {
      const simple = { tag: "Third" } as const;
      await roundtrip("simple", simple);
    });
  });

  describe("complex", () => {
    it("struct", async () => {
      const complex = {
        tag: "Struct",
        values: [{ a: 0, b: true, c: "hello" }],
      } as const;
      await roundtrip("complex", complex);
    });

    it("tuple", async () => {
      const complex = {
        tag: "Tuple",
        values: [[{ a: 0, b: true, c: "hello" }, { tag: "First" }]],
      } as const;
      await roundtrip("complex", complex);
    });

    it("enum", async () => {
      const complex = {
        tag: "Enum",
        values: [{ tag: "First" }],
      } as const;
      await roundtrip("complex", complex);
    });

    it("asset", async () => {
      const complex = { tag: "Asset", values: [addr.toString(), 1n] } as const;
      await roundtrip("complex", complex);
    });

    it("void", async () => {
      const complex = { tag: "Void" } as const;
      await roundtrip("complex", complex);
    });
  });

  it("u32_fail_on_even", async () => {
    await roundtrip("u32_fail_on_even", 1, "u32_");
    expect(
      async () =>
        //@ts-ignore
        (
          (await contract.u32FailOnEven({
            u32_: 2,
          })) as SorobanRpc.AssembledTransaction<u32>
        ).result
    );
  });

  it("addresse", async () => {
    await roundtrip("addresse", addr.toString());
  });

  it("bytes", async () => {
    const bytes = Buffer.from("hello");
    await roundtrip("bytes", bytes);
  });

  it("bytes_n", async () => {
    const bytes_n = Buffer.from("123456789"); // what's the correct way to construct bytes_n?
    await roundtrip("bytes_n", bytes_n);
  });

  it("card", async () => {
    const card = 11;
    await roundtrip("card", card);
  });

  it("boolean", async () => {
    await roundtrip("boolean", true);
  });

  it("not", async () => {
    await roundtrip("boolean", false);
  });

  it("i128", async () => {
    await roundtrip("i128", -1n);
  });

  it("u128", async () => {
    await roundtrip("u128", 1n);
  });

  it("map", async () => {
    const map = new Map();
    map.set(1, true);
    map.set(2, false);
    await roundtrip("map", [...map.entries()]);

    map.set(3, "hahaha");
    await expectAsyncThrow(
      async () => await roundtrip("map", [...map.entries()]),
      /invalid type scSpecTypeBool specified for string value/i
    );
  });

  it("vec", async () => {
    const vec = [1, 2, 3];
    await roundtrip("vec", vec);
  });

  it("tuple", async () => {
    const tuple = ["hello", 1] as const;
    await roundtrip("tuple", tuple);
  });

  it("option", async () => {
    await roundtrip("option", 1);
    await roundtrip("option", undefined);
  });

  it("u256", async () => {
    await roundtrip("u256", 1n);
    await expectAsyncThrow(async () => await roundtrip("u256", -1n), /expected a positive value, got: -1/i);
  });

  it("i256", async () => {
    await roundtrip("i256", -1n);
  });

  it("string", async () => {
    await roundtrip("string", "hello");
  });

  it("tuple_strukt", async () => {
    const arg = [{ a: 0, b: true, c: "hello" }, { tag: "First" }] as const;

    await roundtrip("tuple_strukt", arg);
  });
});

describe.skip("Print contract spec", function () {
  it("print", function () {
    let res = JSON.stringify(SPEC.jsonSchema("complex"), null, 2);
    console.log("complex schema: " + res);
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
  })
);
const GIGA_MAP_TYPE = xdr.ScSpecTypeDef.scSpecTypeUdt(
  new xdr.ScSpecTypeUdt({ name: "GigaMap" })
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
  })
);

function replaceBigIntWithStrings(obj: any): any {
  if (obj instanceof Buffer) {
    return obj;
  }
  // If obj is an array, process each element
  if (Array.isArray(obj)) {
    return obj.map(replaceBigIntWithStrings);
  }

  // If obj is an object, process each property
  else if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = replaceBigIntWithStrings(value);
    }
    return newObj;
  }

  // If obj is a BigInt, convert it to a string
  else if (typeof obj === "bigint") {
    return obj.toString();
  }

  // Otherwise, return the value as it is
  return obj;
}

function getUserInfo() {
  return {
    publicKey: "GDIY6AQQ75WMD4W46EYB7O6UYMHOCGQHLAQGQTKHDX4J2DYQCHVCR4W4",
  };
}

const OPTIONS = {
  contractId: "CBUCOWICZPC3DYYD6ZAV25FEQNY47VJJB6K4XNYDNFT5J73LKTM7LEMB",
  rpcUrl: "https://rpc-futurenet.stellar.org:443",
  networkPassphrase: "Test SDF Future Network ; October 2022",
  wallet: {
    getUserInfo,
    isConnected: () => true,
    isAllowed: () => true,
  } as unknown as SorobanRpc.Wallet,
};

// Utility function to test async error throwing
async function expectAsyncThrow(asyncFn: any, errorMessage: any) {
  try {
    await asyncFn();
    expect.fail("Did not throw expected error");
  } catch (error) {
    if (errorMessage) {
      expect(error.message).to.match(errorMessage);
    } else {
      expect(error).to.be.an("error");
    }
  }
}
