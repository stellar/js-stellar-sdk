import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.restoreFootprint()", () => {
  it("creates a restoreFootprint operation", () => {
    const op = Operation.restoreFootprint();
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    expect(operation.body().switch().name).toBe("restoreFootprint");
    expectOperationType(Operation.fromXDRObject(operation), "restoreFootprint");
  });

  it("creates a restoreFootprint operation with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.restoreFootprint({ source });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "restoreFootprint",
    );
    expect(obj.source).toBe(source);
  });

  it("creates a restoreFootprint operation with empty opts", () => {
    const op = Operation.restoreFootprint({});
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "restoreFootprint",
    );
    expect(obj.source).toBeUndefined();
  });

  it("creates a restoreFootprint operation with no args", () => {
    const op = Operation.restoreFootprint();
    expect(op).toBeInstanceOf(xdr.Operation);
  });

  it("fails to create restoreFootprint operation with an invalid source address", () => {
    expect(() => Operation.restoreFootprint({ source: "GCEZ" })).toThrow(
      /Source address is invalid/,
    );
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.restoreFootprint();
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("restoreFootprint");
  });
});
