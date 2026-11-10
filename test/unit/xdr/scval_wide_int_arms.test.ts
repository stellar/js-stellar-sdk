import { describe, it, expect } from "vitest";
import * as xdr from "../../../src/xdr/index.js";
import { scValToBigInt } from "../../../src/base/numbers/index.js";

const ARMS = [
  {
    name: "scvU128",
    make: (v: bigint) => xdr.ScVal.scvU128(v),
    Parts: xdr.Uint128Parts,
    min: 0n,
    max: (1n << 128n) - 1n,
  },
  {
    name: "scvI128",
    make: (v: bigint) => xdr.ScVal.scvI128(v),
    Parts: xdr.Int128Parts,
    min: -(1n << 127n),
    max: (1n << 127n) - 1n,
  },
  {
    name: "scvU256",
    make: (v: bigint) => xdr.ScVal.scvU256(v),
    Parts: xdr.Uint256Parts,
    min: 0n,
    max: (1n << 256n) - 1n,
  },
  {
    name: "scvI256",
    make: (v: bigint) => xdr.ScVal.scvI256(v),
    Parts: xdr.Int256Parts,
    min: -(1n << 255n),
    max: (1n << 255n) - 1n,
  },
] as const;

describe("ScVal wide-int arms accept a bigint", () => {
  for (const arm of ARMS) {
    describe(arm.name, () => {
      it("stores the parts struct and reads back the bigint", () => {
        const scv = arm.make(42n);
        expect(scv.value).toBeInstanceOf(arm.Parts);
        expect(scv.value.toBigInt()).toBe(42n);
      });

      it("round-trips the range bounds through XDR", () => {
        for (const v of [arm.min, arm.max]) {
          const decoded = xdr.ScVal.fromXdr(arm.make(v).toXdr());
          expect(decoded.type).toBe(arm.name);
          expect((decoded.value as any).toBigInt()).toBe(v);
        }
      });

      it("rejects values outside the range", () => {
        expect(() => arm.make(arm.max + 1n)).toThrow(/out of range/);
        expect(() => arm.make(arm.min - 1n)).toThrow(/out of range/);
      });

      it("rejects anything that is not a bigint or parts struct", () => {
        // A plain `{ hi, lo }` object has no `toXdrObject`, so it cannot encode.
        for (const bad of [42, "42", null, { hi: 0n, lo: 42n }]) {
          expect(() => arm.make(bad as any)).toThrow(TypeError);
        }
      });

      it("Parts.fromBigInt and toBigInt are inverses", () => {
        for (const v of [arm.min, 0n, 1n, arm.max]) {
          expect(arm.Parts.fromBigInt(v).toBigInt()).toBe(v);
        }
      });
    });
  }

  it("keeps a passed parts struct as-is", () => {
    const parts = new xdr.Int128Parts({ hi: -1n, lo: (1n << 64n) - 5n });
    expect(xdr.ScVal.scvI128(parts).i128).toBe(parts);
  });

  it("encodes the same bytes from a bigint as from hand-built parts", () => {
    const v = -(1n << 100n) + 12345n;
    const parts = new xdr.Int128Parts({
      hi: BigInt.asIntN(64, v >> 64n),
      lo: BigInt.asUintN(64, v),
    });
    expect(xdr.ScVal.scvI128(v).toXdr("base64")).toBe(
      xdr.ScVal.scvI128(parts).toXdr("base64"),
    );
  });
});

describe("Parts.toBigInt rejects out-of-range limbs", () => {
  const CASES = [
    [
      "Int128Parts hi too big",
      () => new xdr.Int128Parts({ hi: 1n << 63n, lo: 0n }),
    ],
    [
      "Int128Parts lo too big",
      () => new xdr.Int128Parts({ hi: 0n, lo: 1n << 64n }),
    ],
    ["Int128Parts lo negative", () => new xdr.Int128Parts({ hi: 0n, lo: -1n })],
    [
      "Uint128Parts hi negative",
      () => new xdr.Uint128Parts({ hi: -1n, lo: 0n }),
    ],
    [
      "Uint128Parts lo too big",
      () => new xdr.Uint128Parts({ hi: 0n, lo: 1n << 64n }),
    ],
    [
      "Uint256Parts hiHi too big",
      () =>
        new xdr.Uint256Parts({ hiHi: 1n << 64n, hiLo: 0n, loHi: 0n, loLo: 0n }),
    ],
    [
      "Int256Parts loHi negative",
      () => new xdr.Int256Parts({ hiHi: 0n, hiLo: 0n, loHi: -1n, loLo: 0n }),
    ],
  ] as const;

  for (const [label, make] of CASES) {
    it(label, () => {
      expect(() => make().toBigInt()).toThrow(/out of range/);
      // scValToBigInt goes through toBigInt, so it rejects the same parts.
      const parts = make() as any;
      const scv =
        parts instanceof xdr.Int128Parts
          ? xdr.ScVal.scvI128(parts)
          : parts instanceof xdr.Uint128Parts
            ? xdr.ScVal.scvU128(parts)
            : parts instanceof xdr.Int256Parts
              ? xdr.ScVal.scvI256(parts)
              : xdr.ScVal.scvU256(parts);
      expect(() => scValToBigInt(scv)).toThrow(/out of range/);
    });
  }

  it("rejects a non-bigint limb", () => {
    const parts = new xdr.Int128Parts({ hi: 0n, lo: 5 as any });
    expect(() => parts.toBigInt()).toThrow(TypeError);
  });

  it("accepts the limb bounds", () => {
    const max64 = (1n << 64n) - 1n;
    expect(new xdr.Int128Parts({ hi: -(1n << 63n), lo: 0n }).toBigInt()).toBe(
      -(1n << 127n),
    );
    expect(new xdr.Uint128Parts({ hi: max64, lo: max64 }).toBigInt()).toBe(
      (1n << 128n) - 1n,
    );
  });
});

describe("scValToBigInt range-checks the 64-bit arms", () => {
  it("rejects out-of-range values", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvU64(-1n))).toThrow(/out of range/);
    expect(() => scValToBigInt(xdr.ScVal.scvU64(1n << 64n))).toThrow(
      /out of range/,
    );
    expect(() => scValToBigInt(xdr.ScVal.scvI64(1n << 70n))).toThrow(
      /out of range/,
    );
    expect(() => scValToBigInt(xdr.ScVal.scvTimepoint(-5n))).toThrow(
      /out of range/,
    );
    expect(() => scValToBigInt(xdr.ScVal.scvDuration(-5n))).toThrow(
      /out of range/,
    );
  });

  it("rejects a non-bigint value", () => {
    expect(() => scValToBigInt(xdr.ScVal.scvU64(1.5 as any))).toThrow(
      TypeError,
    );
  });

  it("accepts the bounds", () => {
    expect(scValToBigInt(xdr.ScVal.scvU64((1n << 64n) - 1n))).toBe(
      (1n << 64n) - 1n,
    );
    expect(scValToBigInt(xdr.ScVal.scvI64(-(1n << 63n)))).toBe(-(1n << 63n));
  });
});

describe("parts from another copy of the SDK", () => {
  // Stands in for an Int128Parts from an older SDK install: right fields and
  // `toXdrObject`, but not an instance of this copy's class and no `toBigInt`.
  const v = (1n << 64n) + 2n;
  const foreignParts = () => ({
    hi: 1n,
    lo: 2n,
    toXdrObject() {
      return { hi: this.hi, lo: this.lo };
    },
  });

  it("are accepted by the ScVal factory and encode the same bytes", () => {
    const scv = xdr.ScVal.scvI128(foreignParts() as any);
    expect(scv.toXdr("base64")).toBe(xdr.ScVal.scvI128(v).toXdr("base64"));
  });

  it("convert through scValToBigInt without a toBigInt method", () => {
    expect(scValToBigInt(xdr.ScVal.scvI128(foreignParts() as any))).toBe(v);
    // A whole ScVal from the other copy, not just its parts.
    const foreignScVal = { type: "scvI128", value: foreignParts() };
    expect(scValToBigInt(foreignScVal as any)).toBe(v);
  });

  it("still get their limbs range-checked by scValToBigInt", () => {
    const bad = { ...foreignParts(), lo: 1n << 64n };
    expect(() => scValToBigInt(xdr.ScVal.scvI128(bad as any))).toThrow(
      /out of range/,
    );
  });
});
