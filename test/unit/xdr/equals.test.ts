// Runtime behavior of `XdrValue.equals`. The signature takes `XdrValue`
// (not `this`) so it stays callable on union-typed values — see issue #1630
// and test/types/xdr-equals.ts for the compile-time side. These tests pin the
// runtime contract: structural comparison by encoded bytes, `false` for
// mismatched types, and `false` (never a throw) for junk arguments.

import { describe, it, expect } from "vitest";

import {
  ScVal,
  Memo,
  InvokeContractArgs,
  ScAddress,
  ContractId,
} from "../../../src/xdr/index.js";

describe("XdrValue.equals", () => {
  it("returns true for structurally equal values", () => {
    expect(ScVal.scvU32(7).equals(ScVal.scvU32(7))).toBe(true);
  });

  it("returns true for self-comparison", () => {
    const value = ScVal.scvU32(7);
    expect(value.equals(value)).toBe(true);
  });

  it("returns false for unequal values of the same type", () => {
    expect(ScVal.scvU32(7).equals(ScVal.scvU32(8))).toBe(false);
  });

  it("returns false across arms of the same union", () => {
    expect(ScVal.scvU32(7).equals(ScVal.scvBool(true))).toBe(false);
  });

  it("returns false across different XDR types", () => {
    expect(ScVal.scvVoid().equals(Memo.memoNone())).toBe(false);
  });

  it("compares union-typed values (the issue #1630 shape)", () => {
    const a: ScVal = ScVal.scvU32(7);
    const b: ScVal = ScVal.scvU32(7);
    expect(a.equals(b)).toBe(true);
  });

  it("works on structs, not just unions", () => {
    const make = () =>
      new InvokeContractArgs({
        contractAddress: ScAddress.scAddressTypeContract(
          new ContractId(new Uint8Array(32)),
        ),
        functionName: "hello",
        args: [ScVal.scvU32(1)],
      });
    expect(make().equals(make())).toBe(true);
  });

  it("returns false for null and non-XdrValue arguments", () => {
    const value = ScVal.scvU32(7);
    expect(value.equals(null as unknown as ScVal)).toBe(false);
    expect(value.equals(undefined as unknown as ScVal)).toBe(false);
    expect(value.equals({} as ScVal)).toBe(false);
  });
});
