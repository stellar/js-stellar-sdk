import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.beginSponsoringFutureReserves()", () => {
  const sponsoredId =
    "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";

  it("creates a beginSponsoringFutureReservesOp", () => {
    const op = Operation.beginSponsoringFutureReserves({ sponsoredId });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    expect(operation.body().switch().name).toBe(
      "beginSponsoringFutureReserves",
    );
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "beginSponsoringFutureReserves",
    );
    expect(obj.sponsoredId).toBe(sponsoredId);
  });

  it("creates a beginSponsoringFutureReserves operation with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.beginSponsoringFutureReserves({
      sponsoredId,
      source,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "beginSponsoringFutureReserves",
    );
    expect(obj.sponsoredId).toBe(sponsoredId);
    expect(obj.source).toBe(source);
  });

  it("throws an error when sponsoredId is missing", () => {
    expect(() =>
      Operation.beginSponsoringFutureReserves({} as { sponsoredId: string }),
    ).toThrow(/sponsoredId is invalid/);
  });

  it("throws an error when sponsoredId is invalid", () => {
    expect(() =>
      Operation.beginSponsoringFutureReserves({ sponsoredId: "GBAD" }),
    ).toThrow(/sponsoredId is invalid/);
  });

  it("fails to create operation with an invalid source address", () => {
    expect(() =>
      Operation.beginSponsoringFutureReserves({
        sponsoredId,
        source: "GCEZ",
      }),
    ).toThrow(/Source address is invalid/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.beginSponsoringFutureReserves({ sponsoredId });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe(
      "beginSponsoringFutureReserves",
    );
  });
});
