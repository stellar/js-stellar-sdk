// A union is exported under a name whose class is the abstract `<Name>Base`.
// `abstract` is erased at runtime, so the pre-v17 `new xdr.TransactionMeta(3,
// value)` builds a base instance that silently discards both arguments and
// only fails frames later, inside toXdr()/toJson(), with a `TypeError` naming
// neither the union nor the call that created it. The base constructor rejects
// the legacy form at the call site instead, the way the `xdr.Int64` shim does.

import { describe, it, expect } from "vitest";

import * as classXdr from "../../../src/xdr/index.js";

interface UnionBase {
  name: string;
  cls: new (...args: unknown[]) => unknown;
}

// The exported value is the abstract base; the concrete arm subclasses are
// exported alongside it under their own names. Match on the `<Name>Base`
// class name to visit each union's base exactly once.
function unionBases(): UnionBase[] {
  const bases: UnionBase[] = [];
  for (const [name, exported] of Object.entries(classXdr)) {
    if (typeof exported !== "function") continue;
    if ((exported as { name?: string }).name !== `${name}Base`) continue;
    bases.push({ name, cls: exported as UnionBase["cls"] });
  }
  return bases;
}

describe("union bases reject the legacy `new xdr.Union(disc, value)` form", () => {
  const bases = unionBases();

  it("finds every generated union (suite sanity check)", () => {
    expect(bases.length).toBeGreaterThanOrEqual(115);
  });

  for (const { name, cls } of bases) {
    it(`new xdr.${name}() throws instead of building a broken instance`, () => {
      let caught: unknown;
      let constructed: unknown;
      try {
        constructed = new cls(0, null);
      } catch (error) {
        caught = error;
      }

      // asserted separately from the throw: constructing an argument-less
      // base instance is the regression, and `expect(...).toThrow()` alone
      // reads as if any failure mode would do
      expect(
        constructed,
        `new xdr.${name}() constructed instead of throwing`,
      ).toBeUndefined();
      expect(caught).toBeInstanceOf(TypeError);
      expect((caught as Error).message).toContain(
        `new xdr.${name}(...) is not supported`,
      );
      // names a replacement the caller can paste
      expect((caught as Error).message).toContain(`xdr.${name}.`);
    });
  }
});

describe("the guard leaves real union construction alone", () => {
  it("builds a payload arm through its factory", () => {
    const scv = classXdr.ScVal.scvU32(7);

    expect(scv.type).toBe("scvU32");
    expect(scv.u32).toBe(7);
    expect(classXdr.ScVal.is(scv)).toBe(true);
  });

  it("builds a void arm through its factory", () => {
    // void arms declare no constructor of their own, so they reach the base
    // through an implicit one
    const ext = classXdr.ExtensionPoint.v0();

    expect(ext.type).toBe("v0");
    expect(ext.value).toBeNull();
  });

  it("builds arms on the decode path", () => {
    const scv = classXdr.ScVal.scvU32(7);
    const decoded = classXdr.ScVal.fromXdr(scv.toXdr());

    expect(decoded.type).toBe("scvU32");
    expect(decoded.equals(scv)).toBe(true);
  });

  it("round-trips a nested union", () => {
    const memo = classXdr.Memo.memoId(42n);
    const decoded = classXdr.Memo.fromXdr(memo.toXdr("base64"), "base64");

    expect(decoded.type).toBe("memoId");
    expect(decoded.equals(memo)).toBe(true);
  });
});
