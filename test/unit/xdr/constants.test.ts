// Regression coverage for XDR constant names. The generator's type-name
// normalization pass once rewrote constant definitions too (MAX_OPS_PER_TX →
// Max_Ops_Per_Tx), silently breaking every consumer reading the canonical
// SCREAMING_SNAKE names. Constants must keep the exact names and values the
// .x sources (and the legacy SDK) use.

import { describe, it, expect } from "vitest";

import xdrJson from "../../../xdr/xdr.json";
import * as classXdr from "../../../src/xdr/index.js";

describe("XDR constants keep their canonical names and values", () => {
  const consts = (xdrJson as any).definitions.filter(
    (d: any) => d.kind === "const",
  );

  it("finds all 17 constants (suite sanity check)", () => {
    expect(consts.length).toBe(17);
  });

  for (const { name, value } of consts) {
    it(`${name} === ${value}`, () => {
      expect((classXdr as Record<string, unknown>)[name]).toBe(value);
    });
  }
});
