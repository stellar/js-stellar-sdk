import { describe, it, expect } from "vitest";

import {
  BigIntValue,
  BytesValue,
  ContractDataDurability,
  decodeArray,
  decodeStream,
  encodeArray,
  EnumValue,
  Hash,
  Int32,
  Int64,
  ScVal,
  Uint32,
  Uint64,
  XdrString,
  XdrValue,
} from "../../../src/xdr/index.js";

/** The message a call throws, for asserting on wording rather than on class. */
const messageFrom = (fn: () => unknown): string => {
  try {
    fn();
    return "(did not throw)";
  } catch (e) {
    return (e as Error).message;
  }
};

// Every `xdr` export a caller might mistake for a generated XDR class: the four
// primitive shims wrap native number/bigint values, and the bases are abstract.
// None of them carries a static schema, so none can encode or decode.
const WITHOUT_SCHEMA: [string, unknown][] = [
  ["Int32", Int32],
  ["Uint32", Uint32],
  ["Int64", Int64],
  ["Uint64", Uint64],
  ["XdrValue", XdrValue],
  ["BytesValue", BytesValue],
  ["EnumValue", EnumValue],
  ["BigIntValue", BigIntValue],
  ["XdrString", XdrString],
];

// Only the `XdrValue` bases carry the statics; `XdrString` is not an
// `XdrValue` and has no `fromXdr`/`validateXdr` at all.
const ABSTRACT_BASES: [string, unknown][] = [
  ["XdrValue", XdrValue],
  ["BytesValue", BytesValue],
  ["EnumValue", EnumValue],
  ["BigIntValue", BigIntValue],
];

describe("array helpers reject a type with no schema", () => {
  for (const [name, type] of WITHOUT_SCHEMA) {
    describe(name, () => {
      // The element schema is only read per element, so an empty list used to
      // encode as a valid-looking 4-byte count with no error at all.
      it("encodeArray names the helper and the type, empty list included", () => {
        const values = [ScVal.scvU32(1)];
        expect(() => encodeArray(type as any, values)).toThrow(TypeError);
        expect(() => encodeArray(type as any, values)).toThrow(
          new RegExp(`encodeArray.*${name}`),
        );
        expect(() => encodeArray(type as any, [])).toThrow(
          new RegExp(`encodeArray.*${name}`),
        );
      });

      it("decodeArray names the helper and the type", () => {
        const buf = new Uint8Array([0, 0, 0, 1, 0, 0, 0, 7]);
        expect(() => decodeArray(type as any, buf)).toThrow(TypeError);
        expect(() => decodeArray(type as any, buf)).toThrow(
          new RegExp(`decodeArray.*${name}`),
        );
      });

      // A zero count decoded to `[]`, and a count that left bytes over blamed
      // the buffer ("trailing 4 byte(s)") for what is a type mistake.
      it("decodeArray rejects a zero-count and a trailing-byte buffer", () => {
        expect(() =>
          decodeArray(type as any, new Uint8Array([0, 0, 0, 0])),
        ).toThrow(new RegExp(`decodeArray.*${name}`));
        expect(() => decodeArray(type as any, new Uint8Array(8))).toThrow(
          new RegExp(`decodeArray.*${name}`),
        );
      });

      it("decodeStream names the helper and the type, empty buffer included", () => {
        const buf = new Uint8Array([0, 0, 0, 7]);
        expect(() => decodeStream(type as any, buf)).toThrow(TypeError);
        expect(() => decodeStream(type as any, buf)).toThrow(
          new RegExp(`decodeStream.*${name}`),
        );
        expect(() => decodeStream(type as any, new Uint8Array(0))).toThrow(
          new RegExp(`decodeStream.*${name}`),
        );
      });
    });
  }

  it("names the helper for a first argument that is not a type at all", () => {
    expect(() => encodeArray({} as any, [])).toThrow(TypeError);
    expect(() => encodeArray({} as any, [])).toThrow(/encodeArray/);
    expect(() => encodeArray(undefined as any, [])).toThrow(
      /encodeArray.*undefined/,
    );
    expect(() =>
      decodeArray(undefined as any, new Uint8Array([0, 0, 0, 0])),
    ).toThrow(/decodeArray.*undefined/);
  });
});

describe("statics reject a base class with no schema", () => {
  for (const [name, base] of ABSTRACT_BASES) {
    it(`${name} rejects fromXdr, validateXdr, and fromJson`, () => {
      expect(() => (base as any).fromXdr(new Uint8Array(4))).toThrow(
        new RegExp(`fromXdr.*${name}`),
      );
      expect(() => (base as any).validateXdr(new Uint8Array(4))).toThrow(
        new RegExp(`validateXdr.*${name}`),
      );
      expect(() => (base as any).fromJson(1)).toThrow(
        new RegExp(`fromJson.*${name}`),
      );
    });
  }
});

// Every guard message above interpolates `type.name`. Both shim factories
// declare `function Shim`, so without an explicit name all four read "Shim".
describe("primitive shims report their XDR type name", () => {
  it("names each shim after its XDR type", () => {
    expect(Int32.name).toBe("Int32");
    expect(Uint32.name).toBe("Uint32");
    expect(Int64.name).toBe("Int64");
    expect(Uint64.name).toBe("Uint64");
  });
});

// Controls: the guard must not reject a type that works today.
describe("generated classes are unaffected", () => {
  const values = [ScVal.scvU32(1), ScVal.scvSymbol("hi")];

  it("round-trips through the array helpers", () => {
    expect(decodeArray(ScVal, encodeArray(ScVal, values))).toHaveLength(2);
    expect(encodeArray(ScVal, [])).toEqual(new Uint8Array([0, 0, 0, 0]));
    expect(decodeArray(ScVal, new Uint8Array([0, 0, 0, 0]))).toEqual([]);
    expect(decodeStream(ScVal, new Uint8Array(0))).toEqual([]);
  });

  it("round-trips through the statics", () => {
    const v = ScVal.scvU32(1);
    expect(ScVal.fromXdr(v.toXdr()).equals(v)).toBe(true);
    expect(ScVal.validateXdr(v.toXdr())).toBe(true);
    expect(ScVal.fromJson(v.toJson()).equals(v)).toBe(true);
  });

  // The guard reads `schema` through the prototype chain, so a subclass that
  // inherits one is accepted. Tightening the check to an own-property test
  // (`Object.hasOwn`) would break every consumer subclass while leaving the
  // rest of this file green, so it is asserted here rather than assumed.
  it("accepts a subclass that inherits its schema", () => {
    // `Hash`, not `ScVal`: the union bases are abstract, so extending one
    // without implementing `type`/`toXdrObject` does not compile.
    class Sub extends Hash {}
    const bytes = new Uint8Array(32).fill(3);
    expect(Sub.fromXdr(bytes).toBytes()).toEqual(bytes);
    expect(Sub.validateXdr(bytes)).toBe(true);
    expect(encodeArray(Sub, [])).toEqual(new Uint8Array([0, 0, 0, 0]));
    expect(decodeArray(Sub, new Uint8Array([0, 0, 0, 0]))).toEqual([]);
  });

  // A static pulled off its class loses `this`, which used to surface as
  // `Cannot read properties of undefined (reading 'decode')`. TypeScript
  // rejects the detached call outright, so this is a plain-JS-only path.
  it("names the helper when a static is called detached", () => {
    const { fromXdr } = ScVal as any;
    expect(() => fromXdr(ScVal.scvU32(1).toXdr())).toThrow(
      /fromXdr.*undefined has no static schema/,
    );
  });
});

// A returned empty value is not a failure the guard should convert into a
// throw: an empty XDR array is a real value, and `validateXdr` is documented
// as `fromXdr` without the throw so a caller can branch on a boolean instead
// of a try/catch. The guard fires on an unusable *type*, never on thin data.
describe("intentional non-throwing paths are preserved", () => {
  it("encodes and decodes an empty list without throwing", () => {
    expect(encodeArray(ScVal, [])).toEqual(new Uint8Array([0, 0, 0, 0]));
    expect(decodeArray(ScVal, new Uint8Array([0, 0, 0, 0]))).toEqual([]);
    expect(decodeStream(ScVal, new Uint8Array(0))).toEqual([]);
  });

  it("returns false from validateXdr for every flavour of bad data", () => {
    const good = ScVal.scvU32(1).toXdr();
    expect(ScVal.validateXdr(good)).toBe(true);
    expect(ScVal.validateXdr(new Uint8Array([9, 9, 9, 9]))).toBe(false);
    expect(ScVal.validateXdr(good.slice(0, -1))).toBe(false);
    expect(ScVal.validateXdr(new Uint8Array([...good, 0, 0, 0, 0]))).toBe(
      false,
    );
    expect(ScVal.validateXdr("!!not base64!!", "base64")).toBe(false);
  });
});

// The boundary: bad *data* is a value the caller checks, bad *type* is a
// programming error. Reporting a type mistake as `false` would send someone
// looking at their bytes.
describe("a type mistake is not reported as invalid data", () => {
  it("throws from validateXdr rather than returning false", () => {
    expect(() => (XdrValue as any).validateXdr(new Uint8Array(4))).toThrow(
      /validateXdr.*XdrValue/,
    );
    expect(() => (BytesValue as any).validateXdr(new Uint8Array(4))).toThrow(
      /validateXdr.*BytesValue/,
    );
  });
});

// Regression cover for the label: `type?.name || String(type)` printed base64
// for an instance, dumped class source text for an anonymous class, threw on a
// null-prototype object, and named a real class for inputs that were not it.
describe("the message names the argument accurately", () => {
  it("marks a string as a string, not as the class of that name", () => {
    const msg = messageFrom(() => encodeArray("ScVal" as any, []));
    expect(msg).toContain('the string "ScVal"');
    expect(msg).not.toMatch(/^encodeArray: ScVal has no/);
  });

  it("marks a raw schema object as an instance, not as its schema name", () => {
    const msg = messageFrom(() => encodeArray(ScVal.schema as any, []));
    expect(msg).toContain("an instance of");
    expect(msg).not.toMatch(/^encodeArray: ScVal has no/);
  });

  it("survives a null-prototype object instead of throwing on String()", () => {
    expect(() => encodeArray(Object.create(null) as any, [])).toThrow(
      /encodeArray.*has no static schema/,
    );
  });

  it("marks an instance passed where a class belongs", () => {
    expect(
      messageFrom(() => encodeArray(ScVal.scvU32(42) as any, [])),
    ).toContain("an instance of");
    expect(
      messageFrom(() =>
        encodeArray(ContractDataDurability.persistent as any, []),
      ),
    ).toContain("an instance of ContractDataDurability");
  });

  it("names an unnamed callable without dumping its source", () => {
    // Anonymous classes and anonymous functions share this branch, since
    // `typeof` cannot separate them, so the wording must fit both.
    // Declared inline: a function assigned to a `const` would inherit that
    // name, which would skip the branch under test.
    const AnonClass = (() => class extends BytesValue {})();
    for (const value of [AnonClass, () => undefined]) {
      const msg = messageFrom(() => encodeArray(value as any, []));
      expect(msg).toContain("an anonymous function or class");
      expect(msg).not.toContain("extends");
      expect(msg).not.toContain("=>");
    }
  });
});

// Consumer-defined XDR classes on the SDK bases are a supported pattern, so
// the guard has to reject an incomplete one by name without rejecting a
// complete one.
describe("consumer-defined XDR classes", () => {
  class NoSchema extends BytesValue {}
  class SchemaOnly extends BytesValue {
    static readonly schema = Hash.schema;
  }
  class Complete extends BytesValue {
    static readonly schema = Hash.schema;
    static fromXdrObject(wire: Uint8Array): Complete {
      return new Complete(wire);
    }
  }

  it("rejects a subclass that never declared a schema, by name", () => {
    expect(() => encodeArray(NoSchema as any, [])).toThrow(
      /encodeArray.*NoSchema.*static readonly schema/s,
    );
    expect(() => decodeArray(NoSchema as any, new Uint8Array(4))).toThrow(
      /decodeArray.*NoSchema/,
    );
    expect(() => decodeStream(NoSchema as any, new Uint8Array(4))).toThrow(
      /decodeStream.*NoSchema/,
    );
    expect(() => (NoSchema as any).fromXdr(new Uint8Array(4))).toThrow(
      /fromXdr.*NoSchema/,
    );
  });

  it("rejects a subclass whose schema is null", () => {
    class NullSchema extends BytesValue {
      static readonly schema = null as never;
    }
    expect(() => encodeArray(NullSchema as any, [])).toThrow(
      /encodeArray.*NullSchema/,
    );
  });

  it("leaves a complete subclass working", () => {
    const bytes = new Uint8Array(32).fill(7);
    expect(Complete.fromXdr(bytes).toBytes()).toEqual(bytes);
    expect(
      decodeArray(Complete, encodeArray(Complete, [new Complete(bytes)])),
    ).toHaveLength(1);
  });

  // A schema without a `fromXdrObject` can encode but not decode, so the
  // requirement is checked per direction: the decode paths name the missing
  // member at the call site, and the encode paths must not reject the type.
  it("names the missing fromXdrObject on every decode path", () => {
    const bytes = new Uint8Array(32).fill(9);
    const arr = new Uint8Array([0, 0, 0, 1, ...bytes]);
    for (const [fn, call] of [
      ["fromXdr", () => (SchemaOnly as any).fromXdr(bytes)],
      ["fromJson", () => (SchemaOnly as any).fromJson("09".repeat(32))],
      ["decodeArray", () => decodeArray(SchemaOnly as any, arr)],
      ["decodeStream", () => decodeStream(SchemaOnly as any, bytes)],
    ] as [string, () => unknown][]) {
      expect(call).toThrow(TypeError);
      expect(call).toThrow(
        new RegExp(`${fn}: SchemaOnly has a static schema but no static`),
      );
      expect(call).toThrow(/fromXdrObject/);
    }
  });

  it("still encodes a schema-only subclass, which needs no fromXdrObject", () => {
    const bytes = new Uint8Array(32).fill(9);
    const encoded = encodeArray(SchemaOnly as any, [new SchemaOnly(bytes)]);
    expect(encoded).toHaveLength(36);
    expect(Array.from(encoded.subarray(0, 4))).toEqual([0, 0, 0, 1]);
    // `as any`: the `XdrValueConstructor` type requires `fromXdrObject` for
    // both directions, so tsc rejects this call even though it works.
    expect((SchemaOnly as any).validateXdr(bytes)).toBe(true);
  });
});
