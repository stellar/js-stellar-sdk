// Every generated union's `fromXdrObject` dispatches on the discriminant with a
// `case` per arm. The wire type declares the discriminant as a closed set of
// literals, so that switch is exhaustive to the compiler and typechecks without
// a fall-through — but a wire object built by hand, or by a JSON decoder that
// skipped schema validation, can carry an out-of-range value. Without a guard
// the method returns `undefined` against a non-optional return type, and the
// caller fails with a `TypeError` frames away from the bad input.

import { describe, it, expect } from "vitest";
import { XdrError } from "@stellar/js-xdr";

import * as classXdr from "../../../src/xdr/index.js";

interface UnionExport {
  name: string;
  cls: { fromXdrObject(wire: unknown): unknown };
  switchKey: string;
}

// A discriminant no union declares a case for: enum and `v`-style discriminants
// are small, and bool-switched unions only match `true` / `false`.
const UNKNOWN_DISCRIMINANT = 0x7ffffffe;

// Variant subclasses are exported alongside their abstract base and inherit its
// statics, so several exports share one union schema. Key by schema identity to
// visit each union once, under the name the schema itself carries.
function unionExports(): UnionExport[] {
  const bySchema = new Map<object, UnionExport>();
  for (const exported of Object.values(classXdr)) {
    const schema = (exported as { schema?: { kind?: string } })?.schema as
      | { kind: string; name: string; switchKey: string }
      | undefined;
    if (schema?.kind !== "union" || bySchema.has(schema)) continue;
    bySchema.set(schema, {
      name: schema.name,
      cls: exported as UnionExport["cls"],
      switchKey: schema.switchKey,
    });
  }
  return [...bySchema.values()];
}

describe("union fromXdrObject rejects unknown discriminants", () => {
  const unions = unionExports();

  it("finds every generated union (suite sanity check)", () => {
    expect(unions.length).toBeGreaterThanOrEqual(115);
  });

  for (const { name, cls, switchKey } of unions) {
    it(`${name} throws on ${switchKey} ${UNKNOWN_DISCRIMINANT}`, () => {
      let caught: unknown;
      let returned: unknown;
      try {
        returned = cls.fromXdrObject({ [switchKey]: UNKNOWN_DISCRIMINANT });
      } catch (error) {
        caught = error;
      }

      // asserted separately from the throw: returning `undefined` is the
      // regression, and `expect(...).toThrow()` alone reads as if any
      // failure mode would do
      expect(
        returned,
        `${name}.fromXdrObject returned instead of throwing`,
      ).toBeUndefined();
      expect(caught).toBeInstanceOf(XdrError);
      expect((caught as Error).message).toContain(name);
    });
  }
});
