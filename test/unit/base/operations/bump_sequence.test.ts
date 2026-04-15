import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.bumpSequence()", () => {
  it("creates a bumpSequence operation", () => {
    const opts = { bumpTo: "77833036561510299" };
    const op = Operation.bumpSequence(opts);
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "bumpSequence",
    );

    expect(obj.bumpTo).toBe(opts.bumpTo);
  });

  it("fails when bumpTo is not a string", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing non-string to test runtime validation
      Operation.bumpSequence({ bumpTo: 1000 }),
    ).toThrow(/bumpTo must be a string/);
  });

  it("fails when bumpTo is not a stringified number", () => {
    expect(() => Operation.bumpSequence({ bumpTo: "not-a-number" })).toThrow(
      /bumpTo must be a stringified number/,
    );
  });

  it("preserves an optional source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.bumpSequence({ bumpTo: "100", source });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "bumpSequence",
    );

    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.bumpSequence({ bumpTo: "77833036561510299" });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("bumpSequence");
  });
});
