import { describe, it, expect } from "vitest";
import { Operation } from "../../../../src/base/operation.js";
import * as xdr from "../../../../src/xdr/index.js";
import { expectOperationType } from "../support/operation.js";

describe("Operation.endSponsoringFutureReserves()", () => {
  it("creates an endSponsoringFutureReserves operation", () => {
    const op = Operation.endSponsoringFutureReserves();
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(xdrHex, "hex");
    expect(operation.body.type).toBe("endSponsoringFutureReserves");
    expectOperationType(
      Operation.fromXdrObject(operation),
      "endSponsoringFutureReserves",
    );
  });

  it("creates an endSponsoringFutureReserves operation with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.endSponsoringFutureReserves({ source });
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(xdrHex, "hex");
    expect(operation.body.type).toBe("endSponsoringFutureReserves");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "endSponsoringFutureReserves",
    );
    expect(obj.source).toBe(source);
  });

  it("creates an endSponsoringFutureReserves operation with empty opts", () => {
    const op = Operation.endSponsoringFutureReserves({});
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "endSponsoringFutureReserves",
    );
    expect(obj.source).toBeUndefined();
  });

  it("creates an endSponsoringFutureReserves operation with no args", () => {
    const op = Operation.endSponsoringFutureReserves();
    expect(op).toBeInstanceOf(xdr.Operation);
  });

  it("fails to create endSponsoringFutureReserves operation with an invalid source address", () => {
    expect(() =>
      Operation.endSponsoringFutureReserves({ source: "GCEZ" }),
    ).toThrow(/Source address is invalid/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.endSponsoringFutureReserves();
    const hex = op.toXdr("hex");
    const roundtripped = xdr.Operation.fromXdr(hex, "hex");
    expect(roundtripped.body.type).toBe("endSponsoringFutureReserves");
  });
});
