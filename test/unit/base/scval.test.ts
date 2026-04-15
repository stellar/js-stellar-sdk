import { describe, it, expect } from "vitest";

import {
  ScInt,
  Address,
  Keypair,
  XdrLargeInt,
  scValToBigInt,
} from "../../src/index.js";
import { Contract } from "../../src/contract.js";
import xdr from "../../src/xdr.js";
import { nativeToScVal, scValToNative, scvSortedMap } from "../../src/scval.js";
import { expectDefined } from "../support/expect_defined.js";

// Migrated existing tests
describe("parsing and building ScVals - from scval_test.js", () => {
  const gigaMap = {
    bool: true,
    void: null,
    u32: xdr.ScVal.scvU32(1),
    i32: xdr.ScVal.scvI32(1),
    u64: 1n,
    i64: -1n,
    timepoint: new ScInt(1443571200n).toTimepoint(),
    duration: new ScInt(1000n).toDuration(),
    u128: new ScInt(1).toU128(),
    i128: new ScInt(1).toI128(),
    u256: new ScInt(1).toU256(),
    i256: new ScInt(1).toI256(),
    map: {
      arbitrary: 1n,
      nested: "values",
      etc: false,
    },
    vec: ["same", "type", "list"],
  };

  const targetScv = xdr.ScVal.scvMap(
    (
      [
        ["bool", xdr.ScVal.scvBool(true)],
        ["duration", new ScInt(1000n, { type: "duration" }).toScVal()],
        ["i128", new ScInt(1, { type: "i128" }).toScVal()],
        ["i256", new ScInt(1, { type: "i256" }).toScVal()],
        ["i32", xdr.ScVal.scvI32(1)],
        ["i64", xdr.ScVal.scvI64(new xdr.Int64(-1))],
        [
          "map",
          xdr.ScVal.scvMap([
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvString("arbitrary"),
              val: xdr.ScVal.scvU64(new xdr.Uint64(1)),
            }),
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvString("etc"),
              val: xdr.ScVal.scvBool(false),
            }),
            new xdr.ScMapEntry({
              key: xdr.ScVal.scvString("nested"),
              val: xdr.ScVal.scvString("values"),
            }),
          ]),
        ],
        ["timepoint", new ScInt(1443571200n, { type: "timepoint" }).toScVal()],
        ["u128", new ScInt(1, { type: "u128" }).toScVal()],
        ["u256", new ScInt(1, { type: "u256" }).toScVal()],
        ["u32", xdr.ScVal.scvU32(1)],
        ["u64", xdr.ScVal.scvU64(new xdr.Uint64(1))],
        [
          "vec",

          xdr.ScVal.scvVec(["same", "type", "list"].map(xdr.ScVal.scvString)),
        ],
        ["void", xdr.ScVal.scvVoid()],
      ] as const
    ).map(([type, scv]) => {
      return new xdr.ScMapEntry({
        key: xdr.ScVal.scvString(type),
        val: scv,
      });
    }),
  );

  it("builds an ScVal from all intended native types", () => {
    const scv = nativeToScVal(gigaMap);

    // test case expectation sanity check
    expect((targetScv.value() as any[]).length).toBe(
      Object.keys(gigaMap).length,
    );
    expect(scv.switch().name).toBe("scvMap");
    expect((scv.value() as any[]).length).toBe(
      (targetScv.value() as any[]).length,
    );

    // iterate for granular errors on failures
    (targetScv.value() as any[]).forEach((entry: any, idx: number) => {
      const actual = (scv.value() as any[])[idx];
      expect(actual).toEqual(entry);
    });

    expect(scv.toXDR("base64")).toEqual(targetScv.toXDR("base64"));
  });

  it("converts ScVal to intended native types", () => {
    const kp = Keypair.random();
    const inputVec = ["Hello", "there.", "General", "Kenobi!"];

    (
      [
        [xdr.ScVal.scvVoid(), null],
        [xdr.ScVal.scvBool(true), true],
        [xdr.ScVal.scvBool(false), false],
        [xdr.ScVal.scvU32(1), 1],
        [xdr.ScVal.scvI32(1), 1],
        [new ScInt(11).toU64(), 11n],
        [new ScInt(11).toI64(), 11n],
        [new ScInt(22).toU128(), 22n],
        [new ScInt(22).toI128(), 22n],
        [new ScInt(33).toU256(), 33n],
        [new ScInt(33).toI256(), 33n],
        [xdr.ScVal.scvTimepoint(new xdr.Uint64(44n)), 44n],
        [xdr.ScVal.scvDuration(new xdr.Uint64(55n)), 55n],
        [
          xdr.ScVal.scvBytes(Buffer.alloc(32, 123)),
          Buffer.from("{".repeat(32)),
        ],
        [
          xdr.ScVal.scvBytes(Buffer.alloc(32, 123)),
          (actual: any) => actual instanceof Uint8Array && actual[0] === 123,
        ],
        [xdr.ScVal.scvString("hello there!"), "hello there!"],
        [xdr.ScVal.scvSymbol("hello"), "hello"],
        [xdr.ScVal.scvString(Buffer.from("hello")), "hello"],
        [xdr.ScVal.scvSymbol(Buffer.from("hello")), "hello"],
        [
          new Address(kp.publicKey()).toScVal(),
          (actual: any) => actual.toString() === kp.publicKey(),
        ],
        [
          xdr.ScVal.scvVec(inputVec.map((s) => xdr.ScVal.scvString(s))),
          inputVec,
        ],
        [
          xdr.ScVal.scvMap(
            [
              [new ScInt(0).toI256(), xdr.ScVal.scvBool(true)],
              [xdr.ScVal.scvBool(false), xdr.ScVal.scvString("second")],
              [
                xdr.ScVal.scvU32(2),

                xdr.ScVal.scvVec(inputVec.map(xdr.ScVal.scvString)),
              ],
            ].map(([key, val]: any) => new xdr.ScMapEntry({ key, val })),
          ),
          {
            0: true,
            false: "second",
            2: inputVec,
          },
        ],
      ] as const
    ).forEach(([scv, expected]) => {
      expect(() => scv.toXDR()).not.toThrow();

      const actual = scValToNative(scv);

      if (typeof expected === "function") {
        expect(expected(actual)).toBe(true);
      } else {
        expect(actual).toEqual(expected);
      }
    });
  });

  it("converts native types with customized types", () => {
    (
      [
        [1, "u32", "scvU32"],
        [1, "i32", "scvI32"],
        [1, "i64", "scvI64"],
        [1, "i128", "scvI128"],
        [1, "u256", "scvU256"],
        [2, "timepoint", "scvTimepoint"],
        [3, "duration", "scvDuration"],
        ["a", "symbol", "scvSymbol"],
        ["a", undefined, "scvString"],
        [Keypair.random(), undefined, "scvAddress"],
        [Buffer.from("abcdefg"), undefined, "scvBytes"],
        [Buffer.from("abcdefg"), "string", "scvString"],
        [Buffer.from("abcdefg"), "symbol", "scvSymbol"],
      ] as const
    ).forEach(([input, typeSpec, outType]) => {
      const scv = nativeToScVal(input, { type: typeSpec });
      expect(scv.switch().name).toBe(outType);
    });

    let scv;

    scv = nativeToScVal(["a", "b", "c"], { type: "symbol" });
    expect(scv.switch().name).toBe("scvVec");
    (scv.value() as any[]).forEach((v: any) => {
      expect(v.switch().name).toBe("scvSymbol");
    });

    scv = nativeToScVal(
      {
        hello: "world",
        there: [1, 2, 3],
      },
      {
        type: {
          hello: ["symbol", null],
          there: [null, "i32"],
        },
      },
    );
    let e;
    expect(scv.switch().name).toBe("scvMap");

    e = (scv.value() as any[])[0];
    expect(e.key().switch().name).toBe("scvSymbol");
    expect(e.val().switch().name).toBe("scvString");

    e = (scv.value() as any[])[1];
    expect(e.key().switch().name).toBe("scvString");
    expect(e.val().switch().name).toBe("scvVec");
    expect(e.val().value()[0].switch().name).toBe("scvI32");
  });

  it("doesnt throw on arrays with mixed types", () => {
    expect(nativeToScVal([1, "a", false]).switch().name).toBe("scvVec");
  });

  it("allows type specifications across an array", () => {
    const scv = nativeToScVal([1, "a", false, "b"], {
      type: ["i128", "symbol"],
    });
    expect(scv.switch().name).toBe("scvVec");
    expect((scv.value() as any[]).length).toBe(4);
    ["scvI128", "scvSymbol", "scvBool", "scvString"].forEach(
      (expectedType, idx) => {
        expect((scv.value() as any[])[idx].switch().name).toBe(expectedType);
      },
    );
  });

  it("lets strings be small integer ScVals", () => {
    (["i32", "u32"] as const).forEach((type) => {
      const scv = nativeToScVal("12345", { type });
      expect(scv.switch()).toEqual(
        type === "u32" ? xdr.ScValType.scvU32() : xdr.ScValType.scvI32(),
      );
      expect(scv.value()).toBe(12345);
    });
  });

  it("lets strings be addresses", () => {
    [
      "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
      "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE",
      Keypair.random().publicKey(),
      Keypair.random().publicKey(),
    ].forEach((addr) => {
      const scv = nativeToScVal(addr, { type: "address" });
      const equiv = new Address(addr).toScVal();

      expect(scv.switch().name).toBe("scvAddress");
      expect(scv).toEqual(equiv);
    });
  });

  it("parses errors", () => {
    const userErr = xdr.ScVal.scvError(xdr.ScError.sceContract(1234));
    const systemErr = xdr.ScVal.scvError(
      xdr.ScError.sceWasmVm(xdr.ScErrorCode.scecInvalidInput()),
    );

    const native = scValToNative(xdr.ScVal.scvVec([userErr, systemErr]));

    expect(native).toEqual([
      { type: "contract", code: 1234 },
      {
        type: "system",
        code: systemErr.error().code().value,
        value: systemErr.error().code().name,
      },
    ]);
  });

  it("can sort maps by string", () => {
    const sample = nativeToScVal(
      { a: 1, b: 2, c: 3 },
      {
        type: {
          a: ["symbol", "i32"],
          b: ["symbol", "i32"],
          c: ["symbol", "i32"],
        },
      },
    );
    const sampleValue = sample.value() as any[];

    ["a", "b", "c"].forEach((val, idx) => {
      expect(sampleValue[idx].key().value()).toBe(val);
    });

    // nativeToScVal will sort, so we need to "unsort" to make sure it works.
    // We'll do this by swapping 0 (a) and 2 (c).
    const tmp = sampleValue[0];
    sampleValue[0] = sampleValue[2];
    sampleValue[2] = tmp;

    ["c", "b", "a"].forEach((val, idx) => {
      expect(sampleValue[idx].key().value()).toBe(val);
    });

    const sorted = xdr.scvSortedMap(sampleValue as xdr.ScMapEntry[]);
    expect(sorted.switch().name).toBe("scvMap");
    ["a", "b", "c"].forEach((val, idx) => {
      expect((sorted.value() as any[])[idx].key().value()).toBe(val);
    });
  });

  it("can sort number-like maps", () => {
    const sample = nativeToScVal(
      { 1: "a", 2: "b", 3: "c" },
      {
        type: {
          1: ["i64", "symbol"],
          2: ["i64", "symbol"],
          3: ["i64", "symbol"],
        },
      },
    );
    expect((sample.value() as any[])[0].key().switch().name).toBe("scvI64");

    [1n, 2n, 3n].forEach((val, idx) => {
      const underlyingKey = (sample.value() as any[])[idx].key().value();
      expect(underlyingKey.toBigInt()).toBe(val);
    });

    // nativeToScVal will sort, so we need to "unsort" to make sure it works.
    // We'll do this by swapping 0th (1n) and 2nd (3n).
    const tmp = (sample.value() as any[])[0];
    (sample.value() as any[])[0] = (sample.value() as any[])[2];
    (sample.value() as any[])[2] = tmp;

    [3n, 2n, 1n].forEach((val, idx) => {
      expect((sample.value() as any[])[idx].key().value().toBigInt()).toBe(val);
    });

    const sorted = xdr.scvSortedMap(sample.value() as xdr.ScMapEntry[]);
    expect(sorted.switch().name).toBe("scvMap");
    [1n, 2n, 3n].forEach((val, idx) => {
      expect((sorted.value() as any[])[idx].key().value().toBigInt()).toBe(val);
    });
  });
});

// ---------------------------------------------------------------------------
// nativeToScVal
// ---------------------------------------------------------------------------
describe("nativeToScVal", () => {
  it("converts number to u32", () => {
    const scv = nativeToScVal(42, { type: "u32" });
    expect(scv.switch().name).toBe("scvU32");
    expect(scv.value()).toBe(42);
  });

  it("converts number to i32", () => {
    const scv = nativeToScVal(-5, { type: "i32" });
    expect(scv.switch().name).toBe("scvI32");
    expect(scv.value()).toBe(-5);
  });

  it("converts number to i32 with zero", () => {
    const scv = nativeToScVal(0, { type: "i32" });
    expect(scv.switch().name).toBe("scvI32");
    expect(scv.value()).toBe(0);
  });

  it("converts number to u32 with zero", () => {
    const scv = nativeToScVal(0, { type: "u32" });
    expect(scv.switch().name).toBe("scvU32");
    expect(scv.value()).toBe(0);
  });

  it("falls through to ScInt for large int types", () => {
    (["i64", "u64", "i128", "u128", "i256", "u256"] as const).forEach(
      (type) => {
        const scv = nativeToScVal(999, { type });
        expect(XdrLargeInt.getType(scv.switch().name)).toBe(type);
        expect(scValToBigInt(scv)).toBe(999n);
      },
    );
  });

  it("falls through to ScInt for timepoint and duration", () => {
    const tp = nativeToScVal(1000, { type: "timepoint" });
    expect(tp.switch().name).toBe("scvTimepoint");
    expect(scValToNative(tp)).toBe(1000n);

    const dur = nativeToScVal(500, { type: "duration" });
    expect(dur.switch().name).toBe("scvDuration");
    expect(scValToNative(dur)).toBe(500n);
  });

  it("auto-selects type when no hint is given", () => {
    const scv = nativeToScVal(42);
    // Without a hint, ScInt picks the smallest fitting type
    expect(scValToBigInt(scv)).toBe(42n);
  });

  it("converts bigint to u32 (truncates to Number)", () => {
    const scv = nativeToScVal(100n, { type: "u32" });
    expect(scv.switch().name).toBe("scvU32");
    expect(scv.value()).toBe(100);
  });

  it("converts bigint to i32 (truncates to Number)", () => {
    const scv = nativeToScVal(-50n, { type: "i32" });
    expect(scv.switch().name).toBe("scvI32");
    expect(scv.value()).toBe(-50);
  });

  it("converts bigint without type hint", () => {
    const scv = nativeToScVal(1n << 100n);
    expect(scValToBigInt(scv)).toBe(1n << 100n);
  });

  it("handles MAX_SAFE_INTEGER", () => {
    const scv = nativeToScVal(Number.MAX_SAFE_INTEGER, { type: "i64" });
    expect(scValToBigInt(scv)).toBe(BigInt(Number.MAX_SAFE_INTEGER));
  });

  it("handles negative bigint in i64", () => {
    const scv = nativeToScVal(-999n, { type: "i64" });
    expect(scValToBigInt(scv)).toBe(-999n);
  });
});

// ---------------------------------------------------------------------------
// nativeToScVal
// ---------------------------------------------------------------------------
describe("nativeToScVal", () => {
  it("defaults to scvString when no type is given", () => {
    const scv = nativeToScVal("hello");
    expect(scv.switch().name).toBe("scvString");
  });

  it("converts to scvString explicitly", () => {
    const scv = nativeToScVal("world", { type: "string" });
    expect(scv.switch().name).toBe("scvString");
  });

  it("converts to scvSymbol", () => {
    const scv = nativeToScVal("mySymbol", { type: "symbol" });
    expect(scv.switch().name).toBe("scvSymbol");
  });

  it("converts to scvAddress from public key string", () => {
    const kp = Keypair.random();
    const scv = nativeToScVal(kp.publicKey(), { type: "address" });
    expect(scv.switch().name).toBe("scvAddress");
  });

  it("converts to scvAddress from contract id string", () => {
    const scv = nativeToScVal(
      "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
      { type: "address" },
    );
    expect(scv.switch().name).toBe("scvAddress");
  });

  it("converts numeric string to u32", () => {
    const scv = nativeToScVal("42", { type: "u32" });
    expect(scv.switch().name).toBe("scvU32");
    expect(scv.value()).toBe(42);
  });

  it("converts numeric string to i32", () => {
    const scv = nativeToScVal("-10", { type: "i32" });
    expect(scv.switch().name).toBe("scvI32");
    expect(scv.value()).toBe(-10);
  });

  it("converts numeric string to large int types", () => {
    (["i64", "u64", "i128", "u128", "i256", "u256"] as const).forEach(
      (type) => {
        const scv = nativeToScVal("99999", { type });
        expect(XdrLargeInt.getType(scv.switch().name)).toBe(type);
        expect(scValToBigInt(scv)).toBe(99999n);
      },
    );
  });

  it("converts numeric string to timepoint", () => {
    const scv = nativeToScVal("1000", { type: "timepoint" });
    expect(scv.switch().name).toBe("scvTimepoint");
  });

  it("converts numeric string to duration", () => {
    const scv = nativeToScVal("500", { type: "duration" });
    expect(scv.switch().name).toBe("scvDuration");
  });

  it("throws on non-numeric string with integer type hint", () => {
    expect(() => nativeToScVal("not-a-number", { type: "i128" })).toThrow();
  });

  it("throws on invalid type hint", () => {
    expect(() => nativeToScVal("hello", { type: "notatype" } as any)).toThrow(
      /invalid type/,
    );
  });

  it("handles empty string", () => {
    const scv = nativeToScVal("");
    expect(scv.switch().name).toBe("scvString");
  });

  it("handles empty string as symbol", () => {
    const scv = nativeToScVal("", { type: "symbol" });
    expect(scv.switch().name).toBe("scvSymbol");
  });
});

// ---------------------------------------------------------------------------
// nativeToScVal
// ---------------------------------------------------------------------------
describe("nativeToScVal", () => {
  it("defaults to scvBytes when no type is given", () => {
    const scv = nativeToScVal(new Uint8Array([1, 2, 3]));
    expect(scv.switch().name).toBe("scvBytes");
  });

  it("converts to scvBytes explicitly", () => {
    const scv = nativeToScVal(Buffer.from("abc"), { type: "bytes" });
    expect(scv.switch().name).toBe("scvBytes");
  });

  it("converts to scvSymbol", () => {
    const scv = nativeToScVal(Buffer.from("abc"), { type: "symbol" });
    expect(scv.switch().name).toBe("scvSymbol");
  });

  it("converts to scvString", () => {
    const scv = nativeToScVal(Buffer.from("abc"), { type: "string" });
    expect(scv.switch().name).toBe("scvString");
  });

  it("throws on invalid type hint", () => {
    expect(() =>
      nativeToScVal(Buffer.from("abc"), { type: "notatype" } as any),
    ).toThrow(/invalid type/);
  });

  it("handles empty Uint8Array", () => {
    const scv = nativeToScVal(new Uint8Array(0));
    expect(scv.switch().name).toBe("scvBytes");
  });

  it("makes a copy of the input buffer", () => {
    const original = Buffer.from([1, 2, 3]);
    const scv = nativeToScVal(original, { type: "bytes" });
    // Mutate original — the ScVal should be unaffected
    original[0] = 99;
    expect((scv.value() as Buffer)[0]).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// nativeToScVal
// ---------------------------------------------------------------------------
describe("nativeToScVal", () => {
  it("converts Address instance", () => {
    const kp = Keypair.random();
    const addr = new Address(kp.publicKey());
    const scv = nativeToScVal(addr, { type: "address" });
    expect(scv.switch().name).toBe("scvAddress");
  });

  it("converts Contract instance", () => {
    const contract = new Contract(
      "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    );
    const scv = nativeToScVal(contract, { type: "address" });
    expect(scv.switch().name).toBe("scvAddress");
  });

  it("converts Keypair instance", () => {
    const kp = Keypair.random();
    const scv = nativeToScVal(kp, { type: "address" });
    expect(scv.switch().name).toBe("scvAddress");
    // Verify it resolves to the same address as the public key
    const equiv = new Address(kp.publicKey()).toScVal();
    expect(scv.toXDR("base64")).toBe(equiv.toXDR("base64"));
  });

  it("converts string (public key)", () => {
    const kp = Keypair.random();
    const scv = nativeToScVal(kp.publicKey(), { type: "address" });
    expect(scv.switch().name).toBe("scvAddress");
  });

  it("converts string (contract id)", () => {
    const contractId =
      "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
    const scv = nativeToScVal(contractId, { type: "address" });
    expect(scv.switch().name).toBe("scvAddress");
  });

  it("throws on invalid address string", () => {
    expect(() =>
      nativeToScVal("not-an-address", { type: "address" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// nativeToScVal — primitives
// ---------------------------------------------------------------------------
describe("nativeToScVal", () => {
  describe("null / undefined / void", () => {
    it("converts null to scvVoid", () => {
      expect(nativeToScVal(null).switch().name).toBe("scvVoid");
    });

    it("converts undefined to scvVoid", () => {
      expect(nativeToScVal(undefined).switch().name).toBe("scvVoid");
    });
  });

  describe("booleans", () => {
    it("converts true to scvBool", () => {
      const scv = nativeToScVal(true);
      expect(scv.switch().name).toBe("scvBool");
      expect(scv.value()).toBe(true);
    });

    it("converts false to scvBool", () => {
      const scv = nativeToScVal(false);
      expect(scv.switch().name).toBe("scvBool");
      expect(scv.value()).toBe(false);
    });
  });

  describe("numbers", () => {
    it("converts small positive number without type hint", () => {
      const scv = nativeToScVal(42);
      expect(scValToBigInt(scv)).toBe(42n);
    });

    it("converts zero without type hint", () => {
      const scv = nativeToScVal(0);
      expect(scValToBigInt(scv)).toBe(0n);
    });

    it("converts negative number without type hint", () => {
      const scv = nativeToScVal(-100);
      expect(scValToBigInt(scv)).toBe(-100n);
    });

    it("converts number with u32 hint", () => {
      const scv = nativeToScVal(42, { type: "u32" });
      expect(scv.switch().name).toBe("scvU32");
      expect(scv.value()).toBe(42);
    });

    it("converts number with i32 hint", () => {
      const scv = nativeToScVal(-5, { type: "i32" });
      expect(scv.switch().name).toBe("scvI32");
      expect(scv.value()).toBe(-5);
    });

    it("converts number with i128 hint", () => {
      const scv = nativeToScVal(999, { type: "i128" });
      expect(scv.switch().name).toBe("scvI128");
      expect(scValToBigInt(scv)).toBe(999n);
    });

    it("converts number with u256 hint", () => {
      const scv = nativeToScVal(1, { type: "u256" });
      expect(scv.switch().name).toBe("scvU256");
      expect(scValToBigInt(scv)).toBe(1n);
    });

    it("converts number with timepoint hint", () => {
      const scv = nativeToScVal(1443571200, { type: "timepoint" });
      expect(scv.switch().name).toBe("scvTimepoint");
    });

    it("converts number with duration hint", () => {
      const scv = nativeToScVal(3600, { type: "duration" });
      expect(scv.switch().name).toBe("scvDuration");
    });
  });

  describe("bigints", () => {
    it("converts positive bigint", () => {
      const scv = nativeToScVal(1000n);
      expect(scValToBigInt(scv)).toBe(1000n);
    });

    it("converts negative bigint", () => {
      const scv = nativeToScVal(-1n);
      expect(scValToBigInt(scv)).toBe(-1n);
    });

    it("converts zero bigint", () => {
      const scv = nativeToScVal(0n);
      expect(scValToBigInt(scv)).toBe(0n);
    });

    it("converts very large bigint (fits u128)", () => {
      const val = 1n << 100n;
      const scv = nativeToScVal(val);
      expect(scValToBigInt(scv)).toBe(val);
    });

    it("converts very large bigint (fits u256)", () => {
      const val = 1n << 200n;
      const scv = nativeToScVal(val);
      expect(scValToBigInt(scv)).toBe(val);
    });

    it("converts bigint with explicit i128 hint", () => {
      const scv = nativeToScVal(42n, { type: "i128" });
      expect(scv.switch().name).toBe("scvI128");
      expect(scValToBigInt(scv)).toBe(42n);
    });
  });

  describe("strings", () => {
    it("converts string to scvString by default", () => {
      const scv = nativeToScVal("hello");
      expect(scv.switch().name).toBe("scvString");
    });

    it("converts string to scvSymbol", () => {
      const scv = nativeToScVal("hello", { type: "symbol" });
      expect(scv.switch().name).toBe("scvSymbol");
    });

    it("converts string to address", () => {
      const kp = Keypair.random();
      const scv = nativeToScVal(kp.publicKey(), { type: "address" });
      expect(scv.switch().name).toBe("scvAddress");
    });

    it("converts numeric string to u32", () => {
      const scv = nativeToScVal("42", { type: "u32" });
      expect(scv.switch().name).toBe("scvU32");
      expect(scv.value()).toBe(42);
    });

    it("converts numeric string to i32", () => {
      const scv = nativeToScVal("-7", { type: "i32" });
      expect(scv.switch().name).toBe("scvI32");
      expect(scv.value()).toBe(-7);
    });

    it("converts numeric string to i64", () => {
      const scv = nativeToScVal("12345", { type: "i64" });
      expect(scValToBigInt(scv)).toBe(12345n);
    });

    it("converts numeric string to i128", () => {
      const scv = nativeToScVal("12345", { type: "i128" });
      expect(scValToBigInt(scv)).toBe(12345n);
    });

    it("throws on non-numeric string with integer type hint", () => {
      expect(() => nativeToScVal("not a number", { type: "i128" })).toThrow();
    });

    it("throws on invalid type hint for string", () => {
      // @ts-expect-error testing runtime behavior with invalid type
      expect(() => nativeToScVal("hello", { type: "notatype" })).toThrow();
    });

    it("handles empty string", () => {
      const scv = nativeToScVal("");
      expect(scv.switch().name).toBe("scvString");
    });
  });

  describe("Uint8Array / Buffer", () => {
    it("converts Uint8Array to scvBytes by default", () => {
      const scv = nativeToScVal(new Uint8Array([1, 2, 3]));
      expect(scv.switch().name).toBe("scvBytes");
    });

    it("converts Buffer to scvBytes by default", () => {
      const scv = nativeToScVal(Buffer.from("hello"));
      expect(scv.switch().name).toBe("scvBytes");
    });

    it("converts Buffer to scvString with hint", () => {
      const scv = nativeToScVal(Buffer.from("hello"), { type: "string" });
      expect(scv.switch().name).toBe("scvString");
    });

    it("converts Buffer to scvSymbol with hint", () => {
      const scv = nativeToScVal(Buffer.from("hello"), { type: "symbol" });
      expect(scv.switch().name).toBe("scvSymbol");
    });

    it("handles empty Uint8Array", () => {
      const scv = nativeToScVal(new Uint8Array(0));
      expect(scv.switch().name).toBe("scvBytes");
    });
  });

  describe("xdr.ScVal passthrough", () => {
    it("returns the same ScVal object unchanged", () => {
      const original = xdr.ScVal.scvU32(42);
      const result = nativeToScVal(original);
      expect(result).toBe(original);
    });

    it("passes through any ScVal type", () => {
      const values = [
        xdr.ScVal.scvVoid(),
        xdr.ScVal.scvBool(true),
        xdr.ScVal.scvString("test"),
        xdr.ScVal.scvSymbol("sym"),
        xdr.ScVal.scvI32(-1),
      ];
      for (const v of values) {
        expect(nativeToScVal(v)).toBe(v);
      }
    });
  });

  describe("Address / Contract / Keypair", () => {
    it("converts Address instance", () => {
      const kp = Keypair.random();
      const addr = new Address(kp.publicKey());
      const scv = nativeToScVal(addr);
      expect(scv.switch().name).toBe("scvAddress");
    });

    it("converts Contract instance", () => {
      const contract = new Contract(
        "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
      );
      const scv = nativeToScVal(contract);
      expect(scv.switch().name).toBe("scvAddress");
    });

    it("converts Keypair instance", () => {
      const kp = Keypair.random();
      const scv = nativeToScVal(kp);
      expect(scv.switch().name).toBe("scvAddress");
      // Should resolve to the same address
      const addr = new Address(kp.publicKey()).toScVal();
      expect(scv.toXDR("base64")).toBe(addr.toXDR("base64"));
    });
  });

  describe("arrays", () => {
    it("converts an array of numbers to scvVec", () => {
      const scv = nativeToScVal([1, 2, 3]);
      expect(scv.switch().name).toBe("scvVec");
      expect((scv.value() as any[]).length).toBe(3);
    });

    it("converts an array of strings to scvVec", () => {
      const scv = nativeToScVal(["a", "b", "c"]);
      expect(scv.switch().name).toBe("scvVec");
      (scv.value() as any[]).forEach((v: any) => {
        expect(v.switch().name).toBe("scvString");
      });
    });

    it("converts empty array to scvVec", () => {
      const scv = nativeToScVal([]);
      expect(scv.switch().name).toBe("scvVec");
      expect((scv.value() as any[]).length).toBe(0);
    });

    it("applies uniform type hint to all elements", () => {
      const scv = nativeToScVal([1, 2, 3], { type: "i128" });
      expect(scv.switch().name).toBe("scvVec");
      (scv.value() as any[]).forEach((v: any) => {
        expect(v.switch().name).toBe("scvI128");
      });
    });

    it("applies per-element type hints", () => {
      const scv = nativeToScVal([1, "a", 3], {
        type: ["i128", "symbol", "u32"],
      });
      expect(scv.switch().name).toBe("scvVec");
      const vec = scv.value() as any[];
      expect(vec[0].switch().name).toBe("scvI128");
      expect(vec[1].switch().name).toBe("scvSymbol");
      expect(vec[2].switch().name).toBe("scvU32");
    });

    it("falls back to default type for extra array elements beyond type hints", () => {
      // type array is shorter than value array
      const scv = nativeToScVal([1, "a", false, "b"], {
        type: ["i128", "symbol"],
      });
      const vec = scv.value() as any[];
      expect(vec.length).toBe(4);
      expect(vec[0].switch().name).toBe("scvI128");
      expect(vec[1].switch().name).toBe("scvSymbol");
      // Elements beyond the type array fall back to default conversion
      expect(vec[2].switch().name).toBe("scvBool");
      expect(vec[3].switch().name).toBe("scvString");
    });

    it("handles nested arrays", () => {
      const scv = nativeToScVal([
        [1, 2],
        [3, 4],
      ]);
      expect(scv.switch().name).toBe("scvVec");
      const outer = scv.value() as any[];
      expect(outer.length).toBe(2);
      expect(outer[0].switch().name).toBe("scvVec");
      expect(outer[1].switch().name).toBe("scvVec");
    });

    it("handles mixed-type arrays", () => {
      const scv = nativeToScVal([1, "a", false, null]);
      expect(scv.switch().name).toBe("scvVec");
      const vec = scv.value() as any[];
      expect(vec.length).toBe(4);
      // number, string, bool, void
      expect(vec[2].switch().name).toBe("scvBool");
      expect(vec[3].switch().name).toBe("scvVoid");
    });

    it("handles array containing xdr.ScVal (passthrough)", () => {
      const inner = xdr.ScVal.scvU32(999);
      const scv = nativeToScVal([inner, 1, "hello"]);
      const vec = scv.value() as any[];
      expect(vec[0]).toBe(inner);
    });
  });

  describe("plain objects (maps)", () => {
    it("converts a simple object to scvMap", () => {
      const scv = nativeToScVal({ foo: 1, bar: "hello" });
      expect(scv.switch().name).toBe("scvMap");
    });

    it("sorts keys alphabetically", () => {
      const scv = nativeToScVal({ z: 1, a: 2, m: 3 });
      const entries = scv.value() as any[];
      expect(entries[0].key().value()).toBe("a");
      expect(entries[1].key().value()).toBe("m");
      expect(entries[2].key().value()).toBe("z");
    });

    it("sorts mixed-case keys by codepoint order, not locale order", () => {
      // Codepoint order: 'B' (66) < '_' (95) < 'a' (97)
      // localeCompare would give: _key, admin, Balance (case-insensitive)
      // Correct byte order: Balance, _key, admin
      const scv = nativeToScVal({ admin: 1, _key: 2, Balance: 3 });
      const entries = scv.value() as any[];
      expect(entries[0].key().value()).toBe("Balance");
      expect(entries[1].key().value()).toBe("_key");
      expect(entries[2].key().value()).toBe("admin");
    });

    it("handles empty object", () => {
      const scv = nativeToScVal({});
      expect(scv.switch().name).toBe("scvMap");
      expect((scv.value() as any[]).length).toBe(0);
    });

    it("handles nested objects", () => {
      const scv = nativeToScVal({ outer: { inner: true } });
      expect(scv.switch().name).toBe("scvMap");
      const entries = scv.value() as any[];
      expect(entries[0].val().switch().name).toBe("scvMap");
    });

    it("applies per-key type hints for keys and values", () => {
      const scv = nativeToScVal(
        { hello: 42, world: "test" },
        {
          type: {
            hello: ["symbol", "u32"],
            world: ["symbol", "symbol"],
          },
        },
      );
      const entries = scv.value() as any[];
      // Sorted: hello, world
      expect(entries[0].key().switch().name).toBe("scvSymbol");
      expect(entries[0].val().switch().name).toBe("scvU32");
      expect(entries[1].key().switch().name).toBe("scvSymbol");
      expect(entries[1].val().switch().name).toBe("scvSymbol");
    });

    it("uses default types for keys without hints", () => {
      const scv = nativeToScVal(
        { hinted: 42, unhinted: "default" },
        {
          type: {
            hinted: ["symbol", "i32"],
          },
        },
      );
      const entries = scv.value() as any[];
      // "hinted" comes first alphabetically
      expect(entries[0].key().switch().name).toBe("scvSymbol");
      expect(entries[0].val().switch().name).toBe("scvI32");
      // "unhinted" falls back to default
      expect(entries[1].key().switch().name).toBe("scvString");
      expect(entries[1].val().switch().name).toBe("scvString");
    });

    it("uses null in type hint pair for default", () => {
      const scv = nativeToScVal(
        { key: "val" },
        {
          type: {
            key: [null, "symbol"],
          },
        },
      );
      const entries = scv.value() as any[];
      // null key hint => default (string)
      expect(entries[0].key().switch().name).toBe("scvString");
      expect(entries[0].val().switch().name).toBe("scvSymbol");
    });

    it("handles object with nested arrays", () => {
      const scv = nativeToScVal({
        items: [1, 2, 3],
        label: "test",
      });
      const entries = scv.value() as any[];
      // sorted: items, label
      expect(entries[0].key().value()).toBe("items");
      expect(entries[0].val().switch().name).toBe("scvVec");
      expect(entries[1].key().value()).toBe("label");
      expect(entries[1].val().switch().name).toBe("scvString");
    });

    it("handles object with null values", () => {
      const scv = nativeToScVal({ key: null });
      const entries = scv.value() as any[];
      expect(entries[0].val().switch().name).toBe("scvVoid");
    });

    it("handles object with boolean values", () => {
      const scv = nativeToScVal({ flag: true });
      const entries = scv.value() as any[];
      expect(entries[0].val().switch().name).toBe("scvBool");
    });
  });

  describe("unsupported types / error cases", () => {
    it("throws on custom class instances", () => {
      class Foo {
        x = 1;
      }
      expect(() => nativeToScVal(new Foo() as any)).toThrow(/cannot interpret/);
    });

    it("throws on Date objects", () => {
      expect(() => nativeToScVal(new Date() as any)).toThrow(
        /cannot interpret/,
      );
    });

    it("throws on Map objects", () => {
      expect(() => nativeToScVal(new Map() as any)).toThrow(/cannot interpret/);
    });

    it("throws on Set objects", () => {
      expect(() => nativeToScVal(new Set() as any)).toThrow(/cannot interpret/);
    });

    it("throws on RegExp", () => {
      expect(() => nativeToScVal(/abc/ as any)).toThrow(/cannot interpret/);
    });

    it("throws on Symbol", () => {
      expect(() => nativeToScVal(Symbol("test") as any)).toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// scValToNative
// ---------------------------------------------------------------------------
describe("scValToNative", () => {
  describe("void", () => {
    it("converts scvVoid to null", () => {
      expect(scValToNative(xdr.ScVal.scvVoid())).toBe(null);
    });
  });

  describe("booleans", () => {
    it("converts scvBool(true) to true", () => {
      expect(scValToNative(xdr.ScVal.scvBool(true))).toBe(true);
    });

    it("converts scvBool(false) to false", () => {
      expect(scValToNative(xdr.ScVal.scvBool(false))).toBe(false);
    });
  });

  describe("small integers", () => {
    it("converts scvU32 to number", () => {
      expect(scValToNative(xdr.ScVal.scvU32(42))).toBe(42);
    });

    it("converts scvI32 to number", () => {
      expect(scValToNative(xdr.ScVal.scvI32(-5))).toBe(-5);
    });

    it("converts scvU32(0) to 0", () => {
      expect(scValToNative(xdr.ScVal.scvU32(0))).toBe(0);
    });

    it("converts scvI32(0) to 0", () => {
      expect(scValToNative(xdr.ScVal.scvI32(0))).toBe(0);
    });
  });

  describe("large integers", () => {
    it("converts scvU64 to bigint", () => {
      const scv = new ScInt(100).toU64();
      expect(scValToNative(scv)).toBe(100n);
    });

    it("converts scvI64 to bigint", () => {
      const scv = new ScInt(-100).toI64();
      expect(scValToNative(scv)).toBe(-100n);
    });

    it("converts scvU128 to bigint", () => {
      const scv = new ScInt(1000).toU128();
      expect(scValToNative(scv)).toBe(1000n);
    });

    it("converts scvI128 to bigint", () => {
      const scv = new ScInt(-1000).toI128();
      expect(scValToNative(scv)).toBe(-1000n);
    });

    it("converts scvU256 to bigint", () => {
      const scv = new ScInt(1).toU256();
      expect(scValToNative(scv)).toBe(1n);
    });

    it("converts scvI256 to bigint", () => {
      const scv = new ScInt(-1).toI256();
      expect(scValToNative(scv)).toBe(-1n);
    });

    it("converts zero u64 to 0n", () => {
      const scv = new ScInt(0).toU64();
      expect(scValToNative(scv)).toBe(0n);
    });

    it("converts zero i64 to 0n", () => {
      const scv = new ScInt(0).toI64();
      expect(scValToNative(scv)).toBe(0n);
    });
  });

  describe("timepoint and duration", () => {
    it("converts scvTimepoint to bigint", () => {
      const scv = xdr.ScVal.scvTimepoint(new xdr.Uint64(1443571200n));
      expect(scValToNative(scv)).toBe(1443571200n);
    });

    it("converts scvDuration to bigint", () => {
      const scv = xdr.ScVal.scvDuration(new xdr.Uint64(3600n));
      expect(scValToNative(scv)).toBe(3600n);
    });

    it("converts zero timepoint", () => {
      const scv = xdr.ScVal.scvTimepoint(new xdr.Uint64(0n));
      expect(scValToNative(scv)).toBe(0n);
    });

    it("converts zero duration", () => {
      const scv = xdr.ScVal.scvDuration(new xdr.Uint64(0n));
      expect(scValToNative(scv)).toBe(0n);
    });
  });

  describe("strings and symbols", () => {
    it("converts scvString to string", () => {
      expect(scValToNative(xdr.ScVal.scvString("hello"))).toBe("hello");
    });

    it("converts scvSymbol to string", () => {
      expect(scValToNative(xdr.ScVal.scvSymbol("sym"))).toBe("sym");
    });

    it("converts scvString from Buffer to string", () => {
      expect(scValToNative(xdr.ScVal.scvString(Buffer.from("hello")))).toBe(
        "hello",
      );
    });

    it("converts scvSymbol from Buffer to string", () => {
      expect(scValToNative(xdr.ScVal.scvSymbol(Buffer.from("sym")))).toBe(
        "sym",
      );
    });

    it("converts empty scvString", () => {
      expect(scValToNative(xdr.ScVal.scvString(""))).toBe("");
    });

    it("converts empty scvSymbol", () => {
      expect(scValToNative(xdr.ScVal.scvSymbol(""))).toBe("");
    });

    it("handles utf8 string content", () => {
      const utf8 = "héllo wörld";
      expect(scValToNative(xdr.ScVal.scvString(utf8))).toBe(utf8);
    });
  });

  describe("bytes", () => {
    it("converts scvBytes to Uint8Array", () => {
      const bytes = Buffer.from([1, 2, 3]);
      const result = scValToNative(xdr.ScVal.scvBytes(bytes));
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result).toEqual(bytes);
    });

    it("converts empty scvBytes", () => {
      const result = scValToNative(xdr.ScVal.scvBytes(Buffer.alloc(0)));
      expect(result).toBeInstanceOf(Uint8Array);
      expect((result as Uint8Array).length).toBe(0);
    });
  });

  describe("addresses", () => {
    it("converts scvAddress (account) to string", () => {
      const kp = Keypair.random();
      const scv = new Address(kp.publicKey()).toScVal();
      const result = scValToNative(scv);
      expect(result).toBe(kp.publicKey());
    });

    it("converts scvAddress (contract) to string", () => {
      const contractId =
        "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
      const scv = new Address(contractId).toScVal();
      const result = scValToNative(scv);
      expect(result).toBe(contractId);
    });
  });

  describe("vectors", () => {
    it("converts scvVec to array", () => {
      const scv = xdr.ScVal.scvVec([xdr.ScVal.scvU32(1), xdr.ScVal.scvU32(2)]);
      expect(scValToNative(scv)).toEqual([1, 2]);
    });

    it("converts empty scvVec to empty array", () => {
      const scv = xdr.ScVal.scvVec([]);
      expect(scValToNative(scv)).toEqual([]);
    });

    it("converts nested scvVec", () => {
      const inner = xdr.ScVal.scvVec([xdr.ScVal.scvU32(1)]);
      const outer = xdr.ScVal.scvVec([inner, xdr.ScVal.scvBool(true)]);
      expect(scValToNative(outer)).toEqual([[1], true]);
    });

    it("converts vec with mixed types", () => {
      const scv = xdr.ScVal.scvVec([
        xdr.ScVal.scvU32(1),
        xdr.ScVal.scvString("two"),
        xdr.ScVal.scvBool(false),
        xdr.ScVal.scvVoid(),
      ]);
      expect(scValToNative(scv)).toEqual([1, "two", false, null]);
    });
  });

  describe("maps", () => {
    it("converts scvMap to object", () => {
      const scv = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvString("a"),
          val: xdr.ScVal.scvU32(1),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvString("b"),
          val: xdr.ScVal.scvBool(true),
        }),
      ]);
      expect(scValToNative(scv)).toEqual({ a: 1, b: true });
    });

    it("converts empty scvMap to empty object", () => {
      const scv = xdr.ScVal.scvMap([]);
      expect(scValToNative(scv)).toEqual({});
    });

    it("converts scvMap with non-string keys (coerced)", () => {
      const scv = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvU32(1),
          val: xdr.ScVal.scvString("one"),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvBool(false),
          val: xdr.ScVal.scvString("nope"),
        }),
      ]);
      const result = scValToNative(scv);
      expect(result["1"]).toBe("one");
      expect(result["false"]).toBe("nope");
    });

    it("converts nested scvMap", () => {
      const inner = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvString("x"),
          val: xdr.ScVal.scvU32(99),
        }),
      ]);
      const outer = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvString("nested"),
          val: inner,
        }),
      ]);
      expect(scValToNative(outer)).toEqual({ nested: { x: 99 } });
    });

    it("converts scvMap with vec values", () => {
      const scv = xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvString("list"),
          val: xdr.ScVal.scvVec([
            xdr.ScVal.scvString("a"),
            xdr.ScVal.scvString("b"),
          ]),
        }),
      ]);
      expect(scValToNative(scv)).toEqual({ list: ["a", "b"] });
    });
  });

  describe("errors", () => {
    it("converts contract error", () => {
      const scv = xdr.ScVal.scvError(xdr.ScError.sceContract(1234));
      expect(scValToNative(scv)).toEqual({ type: "contract", code: 1234 });
    });

    it("converts contract error with code 0", () => {
      const scv = xdr.ScVal.scvError(xdr.ScError.sceContract(0));
      expect(scValToNative(scv)).toEqual({ type: "contract", code: 0 });
    });

    it("converts system error", () => {
      const scv = xdr.ScVal.scvError(
        xdr.ScError.sceWasmVm(xdr.ScErrorCode.scecInvalidInput()),
      );
      const result = scValToNative(scv);
      expect(result.type).toBe("system");
      expect(typeof result.code).toBe("number");
      expect(typeof result.value).toBe("string");
    });

    it("converts various system error codes", () => {
      const codes = [
        xdr.ScErrorCode.scecArithDomain(),
        xdr.ScErrorCode.scecInvalidInput(),
        xdr.ScErrorCode.scecInternalError(),
      ];
      for (const code of codes) {
        const scv = xdr.ScVal.scvError(xdr.ScError.sceWasmVm(code));
        const result = scValToNative(scv);
        expect(result.type).toBe("system");
      }
    });
  });
});

// ---------------------------------------------------------------------------
// scvSortedMap
// ---------------------------------------------------------------------------
describe("scvSortedMap", () => {
  it("sorts string-keyed entries", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("c"),
        val: xdr.ScVal.scvU32(3),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("a"),
        val: xdr.ScVal.scvU32(1),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("b"),
        val: xdr.ScVal.scvU32(2),
      }),
    ];
    const sorted = scvSortedMap(entries);
    const result = sorted.value() as any[];
    expect(result[0].key().value()).toBe("a");
    expect(result[1].key().value()).toBe("b");
    expect(result[2].key().value()).toBe("c");
  });

  it("sorts symbol-keyed entries", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("z"),
        val: xdr.ScVal.scvU32(1),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("a"),
        val: xdr.ScVal.scvU32(2),
      }),
    ];
    const sorted = scvSortedMap(entries);
    const result = sorted.value() as any[];
    expect(scValToNative(result[0].key())).toBe("a");
    expect(scValToNative(result[1].key())).toBe("z");
  });

  it("sorts numeric-keyed entries", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: new ScInt(3).toI64(),
        val: xdr.ScVal.scvString("c"),
      }),
      new xdr.ScMapEntry({
        key: new ScInt(1).toI64(),
        val: xdr.ScVal.scvString("a"),
      }),
      new xdr.ScMapEntry({
        key: new ScInt(2).toI64(),
        val: xdr.ScVal.scvString("b"),
      }),
    ];
    const sorted = scvSortedMap(entries);
    const result = sorted.value() as any[];
    expect(result[0].key().value().toBigInt()).toBe(1n);
    expect(result[1].key().value().toBigInt()).toBe(2n);
    expect(result[2].key().value().toBigInt()).toBe(3n);
  });

  it("handles empty array", () => {
    const sorted = scvSortedMap([]);
    expect(sorted.switch().name).toBe("scvMap");
    expect((sorted.value() as any[]).length).toBe(0);
  });

  it("handles single entry", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("only"),
        val: xdr.ScVal.scvU32(1),
      }),
    ];
    const sorted = scvSortedMap(entries);
    const result = sorted.value() as any[];
    expect(result.length).toBe(1);
    expect(result[0].key().value()).toBe("only");
  });

  it("does not mutate the input array", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("b"),
        val: xdr.ScVal.scvU32(2),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("a"),
        val: xdr.ScVal.scvU32(1),
      }),
    ];
    const copy = [...entries];
    scvSortedMap(entries);
    const firstEntry = expectDefined(entries[0]);
    const firstCopy = expectDefined(copy[0]);
    const secondEntry = expectDefined(entries[1]);
    const secondCopy = expectDefined(copy[1]);

    // Original array should be unchanged
    expect(scValToNative(firstEntry.key())).toBe(
      scValToNative(firstCopy.key()),
    );
    expect(scValToNative(secondEntry.key())).toBe(
      scValToNative(secondCopy.key()),
    );
  });

  it("is available as xdr.scvSortedMap (monkey-patch)", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("b"),
        val: xdr.ScVal.scvU32(2),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("a"),
        val: xdr.ScVal.scvU32(1),
      }),
    ];
    const sorted = xdr.scvSortedMap(entries);
    expect(sorted.switch().name).toBe("scvMap");
    expect((sorted.value() as any[])[0].key().value()).toBe("a");
  });

  it("sorts u32-keyed entries numerically", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvU32(10),
        val: xdr.ScVal.scvBool(true),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvU32(2),
        val: xdr.ScVal.scvBool(true),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvU32(100),
        val: xdr.ScVal.scvBool(true),
      }),
    ];
    const sorted = scvSortedMap(entries);
    const result = sorted.value() as any[];
    expect(scValToNative(result[0].key())).toBe(2);
    expect(scValToNative(result[1].key())).toBe(10);
    expect(scValToNative(result[2].key())).toBe(100);
  });

  it("sorts bool-keyed entries via JSON.stringify fallback", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvBool(true),
        val: xdr.ScVal.scvU32(1),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvBool(false),
        val: xdr.ScVal.scvU32(2),
      }),
    ];
    const sorted = scvSortedMap(entries);
    const result = sorted.value() as any[];
    // "false" < "true" lexicographically
    expect(scValToNative(result[0].key())).toBe(false);
    expect(scValToNative(result[1].key())).toBe(true);
  });

  it("handles already-sorted entries", () => {
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("a"),
        val: xdr.ScVal.scvU32(1),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvString("b"),
        val: xdr.ScVal.scvU32(2),
      }),
    ];
    const sorted = scvSortedMap(entries);
    const result = sorted.value() as any[];
    expect(result[0].key().value()).toBe("a");
    expect(result[1].key().value()).toBe("b");
  });

  it("sorts mixed-case string keys by codepoint order, not locale order", () => {
    // Codepoint order: 'A' (65) < 'I' (73) < '_' (95) < 'a' (97) < 'i' (105)
    // localeCompare would sort case-insensitively: _admin, Admin, balance
    // Correct byte order: Admin, _admin, balance
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("balance"),
        val: xdr.ScVal.scvU32(3),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("Admin"),
        val: xdr.ScVal.scvU32(1),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("_admin"),
        val: xdr.ScVal.scvU32(2),
      }),
    ];
    const sorted = scvSortedMap(entries);
    const result = sorted.value() as any[];
    expect(result[0].key().value()).toBe("Admin");
    expect(result[1].key().value()).toBe("_admin");
    expect(result[2].key().value()).toBe("balance");
  });
});

// ---------------------------------------------------------------------------
// Round-trip (nativeToScVal -> scValToNative)
// ---------------------------------------------------------------------------
describe("round-trip: nativeToScVal -> scValToNative", () => {
  it("round-trips null", () => {
    expect(scValToNative(nativeToScVal(null))).toBe(null);
  });

  it("round-trips booleans", () => {
    expect(scValToNative(nativeToScVal(true))).toBe(true);
    expect(scValToNative(nativeToScVal(false))).toBe(false);
  });

  it("round-trips strings", () => {
    expect(scValToNative(nativeToScVal("hello world"))).toBe("hello world");
  });

  it("round-trips i32 numbers", () => {
    const scv = nativeToScVal(42, { type: "u32" });
    expect(scValToNative(scv)).toBe(42);
  });

  it("round-trips bigints through u64", () => {
    const scv = nativeToScVal(42n, { type: "u64" });
    expect(scValToNative(scv)).toBe(42n);
  });

  it("round-trips arrays of strings", () => {
    const arr = ["a", "b", "c"];
    expect(scValToNative(nativeToScVal(arr))).toEqual(arr);
  });

  it("round-trips simple objects", () => {
    const obj = { x: 1n, y: 2n };
    const scv = nativeToScVal(obj);
    const result = scValToNative(scv);
    // Keys become sorted, bigints stay as bigint
    expect(result.x).toBe(1n);
    expect(result.y).toBe(2n);
  });

  it("round-trips nested structures", () => {
    const obj = {
      name: "test",
      items: ["a", "b"],
      flag: true,
      nothing: null,
    };
    const result = scValToNative(nativeToScVal(obj));
    expect(result.name).toBe("test");
    expect(result.items).toEqual(["a", "b"]);
    expect(result.flag).toBe(true);
    expect(result.nothing).toBe(null);
  });

  it("round-trips bytes (Buffer input, Uint8Array output)", () => {
    const buf = Buffer.from([10, 20, 30]);
    const scv = nativeToScVal(buf);
    const result = scValToNative(scv);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Buffer.from(result as Uint8Array)).toEqual(buf);
  });

  it("round-trips Keypair through address", () => {
    const kp = Keypair.random();
    const scv = nativeToScVal(kp);
    const result = scValToNative(scv);
    expect(result).toBe(kp.publicKey());
  });

  it("round-trips undefined to null (lossy)", () => {
    expect(scValToNative(nativeToScVal(undefined))).toBe(null);
  });

  it("round-trips Contract through address", () => {
    const contract = new Contract(
      "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
    );
    const scv = nativeToScVal(contract);
    expect(scValToNative(scv)).toBe(contract.contractId());
  });

  it("round-trips empty string", () => {
    expect(scValToNative(nativeToScVal(""))).toBe("");
  });

  it("round-trips empty array", () => {
    expect(scValToNative(nativeToScVal([]))).toEqual([]);
  });

  it("round-trips empty object", () => {
    expect(scValToNative(nativeToScVal({}))).toEqual({});
  });

  it("round-trips mixed array", () => {
    const arr = [true, "str", null];
    expect(scValToNative(nativeToScVal(arr))).toEqual(arr);
  });

  it("round-trips large integers through u128", () => {
    const val = (1n << 100n) + 42n;
    const scv = nativeToScVal(val, { type: "u128" });
    expect(scValToNative(scv)).toBe(val);
  });

  it("round-trips large negative integers through i256", () => {
    const val = -(1n << 200n);
    const scv = nativeToScVal(val, { type: "i256" });
    expect(scValToNative(scv)).toBe(val);
  });
});

// ---------------------------------------------------------------------------
// Edge cases and stress tests
// ---------------------------------------------------------------------------
describe("edge cases and stress tests", () => {
  it("handles deeply nested objects (10 levels)", () => {
    let val: any = 42;
    for (let i = 0; i < 10; i++) {
      val = { nested: val };
    }
    const scv = nativeToScVal(val);
    let result = scValToNative(scv);
    for (let i = 0; i < 10; i++) {
      expect(result).toHaveProperty("nested");
      result = result.nested;
    }
    // 42 -> u64 -> bigint
    expect(result).toBe(42n);
  });

  it("handles deeply nested arrays", () => {
    const scv = nativeToScVal([[[1]], [[2]]]);
    const result = scValToNative(scv);
    expect(result).toEqual([[[1n]], [[2n]]]);
  });

  it("handles object with numeric string keys", () => {
    const scv = nativeToScVal({ "0": "a", "1": "b", "2": "c" });
    const result = scValToNative(scv);
    expect(result["0"]).toBe("a");
    expect(result["1"]).toBe("b");
    expect(result["2"]).toBe("c");
  });

  it("handles object with special character keys", () => {
    const scv = nativeToScVal({
      "key with spaces": true,
      "key-with-dashes": false,
    });
    const result = scValToNative(scv);
    expect(result["key with spaces"]).toBe(true);
    expect(result["key-with-dashes"]).toBe(false);
  });

  it("preserves ScVal passthrough inside arrays", () => {
    const inner = xdr.ScVal.scvU32(99);
    const scv = nativeToScVal([inner]);
    expect((scv.value() as any[])[0]).toBe(inner);
  });

  it("preserves ScVal passthrough inside object values", () => {
    const inner = xdr.ScVal.scvBool(true);
    const scv = nativeToScVal({ key: inner });
    const entries = scv.value() as any[];
    expect(entries[0].val()).toBe(inner);
  });

  it("handles u32 max boundary", () => {
    const scv = nativeToScVal(4294967295, { type: "u32" });
    expect(scv.value()).toBe(4294967295);
    expect(scValToNative(scv)).toBe(4294967295);
  });

  it("handles i32 min boundary", () => {
    const scv = nativeToScVal(-2147483648, { type: "i32" });
    expect(scv.value()).toBe(-2147483648);
    expect(scValToNative(scv)).toBe(-2147483648);
  });

  it("handles i32 max boundary", () => {
    const scv = nativeToScVal(2147483647, { type: "i32" });
    expect(scv.value()).toBe(2147483647);
    expect(scValToNative(scv)).toBe(2147483647);
  });

  it("handles u32 zero", () => {
    const scv = nativeToScVal(0, { type: "u32" });
    expect(scv.value()).toBe(0);
    expect(scValToNative(scv)).toBe(0);
  });

  it("handles MAX_SAFE_INTEGER", () => {
    const scv = nativeToScVal(Number.MAX_SAFE_INTEGER);
    expect(scValToNative(scv)).toBe(BigInt(Number.MAX_SAFE_INTEGER));
  });

  it("handles opts with empty type hints object for maps", () => {
    const scv = nativeToScVal({ a: 1 }, { type: {} });
    expect(scv.switch().name).toBe("scvMap");
    const entries = scv.value() as any[];
    // No hints -> default string key, default u64 value
    expect(entries[0].key().switch().name).toBe("scvString");
  });

  it("handles boolean-key maps coerced to string keys in output", () => {
    const scv = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvBool(true),
        val: xdr.ScVal.scvString("yes"),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvBool(false),
        val: xdr.ScVal.scvString("no"),
      }),
    ]);
    const result = scValToNative(scv);
    expect(result["true"]).toBe("yes");
    expect(result["false"]).toBe("no");
  });

  it("handles object with many keys (50)", () => {
    const obj: Record<string, number> = {};
    for (let i = 0; i < 50; i++) {
      obj[`key${String(i).padStart(3, "0")}`] = i;
    }
    const scv = nativeToScVal(obj);
    const entries = scv.value() as any[];
    expect(entries.length).toBe(50);
    // Verify keys are sorted
    const keys = entries.map((e: any) => scValToNative(e.key()));
    const sorted = [...keys].sort();
    expect(keys).toEqual(sorted);
  });

  it("throws on class instance (Error message includes class name)", () => {
    class MyCustomClass {
      x = 1;
    }
    expect(() => nativeToScVal(new MyCustomClass() as any)).toThrow(
      /cannot interpret MyCustomClass/,
    );
  });

  it("throws on anonymous class instance", () => {
    const anon = new (class {
      x = 1;
    })();
    // Anonymous classes still have a constructor name
    expect(() => nativeToScVal(anon as any)).toThrow(/cannot interpret/);
  });

  it("handles large byte arrays", () => {
    const large = new Uint8Array(10000);
    large.fill(42);
    const scv = nativeToScVal(large);
    expect(scv.switch().name).toBe("scvBytes");
    const result = scValToNative(scv) as Uint8Array;
    expect(result.length).toBe(10000);
    expect(result[0]).toBe(42);
  });

  it("handles array containing Address, null, and nested objects", () => {
    const kp = Keypair.random();
    const scv = nativeToScVal([
      new Address(kp.publicKey()),
      null,
      { key: "val" },
    ]);
    expect(scv.switch().name).toBe("scvVec");
    const vec = scv.value() as any[];
    expect(vec[0].switch().name).toBe("scvAddress");
    expect(vec[1].switch().name).toBe("scvVoid");
    expect(vec[2].switch().name).toBe("scvMap");
  });

  it("handles gigaMap round-trip", () => {
    const gigaMap = {
      bool: true,
      void: null,
      u32: xdr.ScVal.scvU32(1),
      i32: xdr.ScVal.scvI32(1),
      u64: 1n,
      i64: -1n,
      u128: new ScInt(1).toU128(),
      i128: new ScInt(1).toI128(),
      u256: new ScInt(1).toU256(),
      i256: new ScInt(1).toI256(),
      map: {
        arbitrary: 1n,
        nested: "values",
        etc: false,
      },
      vec: ["same", "type", "list"],
    };

    const scv = nativeToScVal(gigaMap);
    expect(scv.switch().name).toBe("scvMap");

    const result = scValToNative(scv);
    expect(result.bool).toBe(true);
    expect(result.void).toBe(null);
    expect(result.u64).toBe(1n);
    expect(result.i64).toBe(-1n);
    expect(result.map).toEqual({
      arbitrary: 1n,
      nested: "values",
      etc: false,
    });
    expect(result.vec).toEqual(["same", "type", "list"]);
  });

  it("correctly handles XDR serialization round-trip", () => {
    const scv = nativeToScVal({ key: [1, 2, 3] });
    const base64 = scv.toXDR("base64");
    const decoded = xdr.ScVal.fromXDR(base64, "base64");
    expect(scValToNative(decoded)).toEqual(scValToNative(scv));
  });

  it("handles nativeToScVal with address for invalid address", () => {
    expect(() =>
      nativeToScVal("not-an-address", { type: "address" }),
    ).toThrow();
  });

  it("handles nativeToScVal with invalid type", () => {
    expect(() =>
      // @ts-expect-error - testing runtime error for invalid type hint
      nativeToScVal(new Uint8Array([1, 2]), { type: "invalid" }),
    ).toThrow(/invalid type/);
  });

  it("handles nativeToScVal with all input types producing same result", () => {
    const kp = Keypair.random();
    const addr = new Address(kp.publicKey());
    const fromAddr = nativeToScVal(addr).toXDR("base64");
    const fromKp = nativeToScVal(kp).toXDR("base64");
    const fromStr = nativeToScVal(kp.publicKey(), { type: "address" }).toXDR(
      "base64",
    );
    expect(fromAddr).toBe(fromKp);
    expect(fromKp).toBe(fromStr);
  });

  it("scvSortedMap sorts entries with equal numeric keys stably", () => {
    // Two entries with the same key value
    const entries = [
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvU32(1),
        val: xdr.ScVal.scvString("first"),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvU32(1),
        val: xdr.ScVal.scvString("second"),
      }),
    ];
    // Should not throw
    const sorted = scvSortedMap(entries);
    expect((sorted.value() as any[]).length).toBe(2);
  });

  it("handles parseInt edge case: string '0' to u32", () => {
    const scv = nativeToScVal("0", { type: "u32" });
    expect(scv.switch().name).toBe("scvU32");
    expect(scv.value()).toBe(0);
  });

  it("handles parseInt edge case: string '0' to i32", () => {
    const scv = nativeToScVal("0", { type: "i32" });
    expect(scv.switch().name).toBe("scvI32");
    expect(scv.value()).toBe(0);
  });

  it("rejects string with trailing non-numeric characters for u32", () => {
    expect(() => nativeToScVal("123abc", { type: "u32" })).toThrow(SyntaxError);
  });

  it("rejects string with trailing non-numeric characters for i32", () => {
    expect(() => nativeToScVal("42xyz", { type: "i32" })).toThrow(SyntaxError);
  });

  it("correctly parses hex-prefix string for u32", () => {
    // BigInt("0x10") = 16n — hex is parsed correctly, unlike parseInt which returned 0
    const scv = nativeToScVal("0x10", { type: "u32" });
    expect(scv.switch().name).toBe("scvU32");
    expect(scv.value()).toBe(16);
  });

  it("rejects pure non-numeric string for u32", () => {
    expect(() => nativeToScVal("hello", { type: "u32" })).toThrow(SyntaxError);
  });

  it("rejects scientific notation string for i32", () => {
    expect(() => nativeToScVal("1e2", { type: "i32" })).toThrow(SyntaxError);
  });

  it("nativeToScVal with no type hint auto-selects appropriate type", () => {
    // Positive -> unsigned
    expect(nativeToScVal(0).switch().name).not.toBe("scvI64");
    // Negative -> signed
    const neg = nativeToScVal(-1);
    expect(scValToBigInt(neg)).toBe(-1n);
  });

  it("auto-invokes function values and converts the result", () => {
    const scv = nativeToScVal(() => 42);
    expect(scv.switch().name).toBe("scvU64");
    expect(scValToNative(scv)).toBe(42n);
  });

  it("throws when u32 value exceeds max", () => {
    expect(() => nativeToScVal(4294967296, { type: "u32" })).toThrow(
      /invalid value.*for type u32/,
    );
  });

  it("throws when u32 value is negative", () => {
    expect(() => nativeToScVal(-1, { type: "u32" })).toThrow(
      /invalid value.*for type u32/,
    );
  });

  it("throws when i32 value exceeds max", () => {
    expect(() => nativeToScVal(2147483648, { type: "i32" })).toThrow(
      /invalid value.*for type i32/,
    );
  });

  it("throws when i32 value is below min", () => {
    expect(() => nativeToScVal(-2147483649, { type: "i32" })).toThrow(
      /invalid value.*for type i32/,
    );
  });
});

describe("nativeToScVal prototype pollution safety", () => {
  describe("Object.prototype keys in map type spec lookup", () => {
    it("should handle object with 'toString' key without type hints", () => {
      const result = nativeToScVal({ toString: "hello" });
      const native = scValToNative(result);
      expect(native).toEqual({ toString: "hello" });
    });

    it("should handle object with 'hasOwnProperty' key without type hints", () => {
      const result = nativeToScVal({ hasOwnProperty: "test" });
      const native = scValToNative(result);
      expect(native).toEqual({ hasOwnProperty: "test" });
    });

    it("should handle object with 'valueOf' key without type hints", () => {
      const result = nativeToScVal({ valueOf: 42 });
      const native = scValToNative(result);
      expect(native).toEqual({ valueOf: 42n }); // numbers roundtrip as bigint
    });

    it("should handle object with '__proto__' key without type hints", () => {
      const result = nativeToScVal({ __proto__: "value" });
      const native = scValToNative(result);
      expect(native).toEqual({ __proto__: "value" });
    });

    it("should handle multiple prototype keys mixed with normal keys", () => {
      const input = {
        toString: "a",
        normal: "b",
        hasOwnProperty: "c",
      };
      const result = nativeToScVal(input);
      const native = scValToNative(result);
      expect(native).toEqual(input);
    });
  });

  describe("val.constructor?.name check with 'constructor' key", () => {
    it("should handle object with 'constructor' key (string value)", () => {
      const result = nativeToScVal({ constructor: "test" });
      const native = scValToNative(result);
      expect(native).toEqual({ constructor: "test" });
    });

    it("should handle object with 'constructor' key (null value)", () => {
      const result = nativeToScVal({ constructor: null });
      const native = scValToNative(result);
      expect(native).toEqual({ constructor: null });
    });

    it("should handle object with 'constructor' key (number value)", () => {
      const result = nativeToScVal({ constructor: 42 });
      const native = scValToNative(result);
      expect(native).toEqual({ constructor: 42n }); // numbers roundtrip as bigint
    });

    it("should handle object with 'constructor' key alongside normal keys", () => {
      const input = { constructor: "foo", name: "bar", value: 123 };
      const result = nativeToScVal(input);
      const native = scValToNative(result);
      expect(native).toEqual({ constructor: "foo", name: "bar", value: 123n });
    });
  });
});
