import { describe, it, expect } from "vitest";
import { Operation } from "../../../../src/base/operation.js";
import * as xdr from "../../../../src/xdr/index.js";
import { expectOperationType } from "../support/operation.js";

describe("Operation.inflation()", () => {
  it("creates an inflation operation", () => {
    const op = Operation.inflation();
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(Buffer.from(xdrHex, "hex"));
    expectOperationType(Operation.fromXdrObject(operation), "inflation");
  });

  it("creates an inflation operation with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.inflation({ source });
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "inflation",
    );
    expect(obj.source).toBe(source);
  });

  it("creates an inflation operation with empty opts", () => {
    const op = Operation.inflation({});
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "inflation",
    );
    expect(obj.source).toBeUndefined();
  });

  it("creates an inflation operation with no args", () => {
    const op = Operation.inflation();
    expect(op).toBeInstanceOf(xdr.Operation);
    expect(op.body.type).toBe("inflation");
  });

  it("fails to create inflation operation with an invalid source address", () => {
    expect(() => Operation.inflation({ source: "GCEZ" })).toThrow(
      /Source address is invalid/,
    );
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.inflation();
    const hex = op.toXdr("hex");
    const roundtripped = xdr.Operation.fromXdr(hex, "hex");
    expect(roundtripped.body.type).toBe("inflation");
  });
});
