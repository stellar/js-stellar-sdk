import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.allowTrust()", () => {
  const trustor = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";

  it("creates an allowTrustOp with boolean authorize=true", () => {
    const op = Operation.allowTrust({
      trustor,
      assetCode: "USD",
      authorize: true,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "allowTrust",
    );
    expect(obj.trustor).toBe(trustor);
    expect(obj.assetCode).toBe("USD");
    expect(obj.authorize).toBe(1);
  });

  it("creates an allowTrustOp with boolean authorize=false", () => {
    const op = Operation.allowTrust({
      trustor,
      assetCode: "USD",
      authorize: false,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "allowTrust",
    );
    expect(obj.authorize).toBe(0);
  });

  it("creates an allowTrustOp with numeric authorize=2 (maintain liabilities)", () => {
    const op = Operation.allowTrust({
      trustor,
      assetCode: "USD",
      authorize: 2,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "allowTrust",
    );
    expect(obj.authorize).toBe(2);
  });

  it("creates an allowTrustOp with short asset code (<=4 chars)", () => {
    const op = Operation.allowTrust({
      trustor,
      assetCode: "USD",
      authorize: true,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "allowTrust",
    );
    expect(obj.assetCode).toBe("USD");
  });

  it("creates an allowTrustOp with long asset code (5-12 chars)", () => {
    const op = Operation.allowTrust({
      trustor,
      assetCode: "LONGASSET",
      authorize: true,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "allowTrust",
    );
    expect(obj.assetCode).toBe("LONGASSET");
  });

  it("creates an allowTrustOp with exactly 4 char asset code", () => {
    const op = Operation.allowTrust({
      trustor,
      assetCode: "ABCD",
      authorize: true,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "allowTrust",
    );
    expect(obj.assetCode).toBe("ABCD");
  });

  it("creates an allowTrustOp with exactly 12 char asset code", () => {
    const op = Operation.allowTrust({
      trustor,
      assetCode: "ABCDEFGHIJKL",
      authorize: true,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "allowTrust",
    );
    expect(obj.assetCode).toBe("ABCDEFGHIJKL");
  });

  it("creates an allowTrustOp with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.allowTrust({
      trustor,
      assetCode: "USD",
      authorize: true,
      source,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "allowTrust",
    );
    expect(obj.source).toBe(source);
  });

  it("fails to create allowTrust operation with an invalid trustor address", () => {
    expect(() =>
      Operation.allowTrust({
        trustor: "GCEZW",
        assetCode: "USD",
        authorize: true,
      }),
    ).toThrow(/trustor is invalid/);
  });

  it("fails to create allowTrust operation with asset code longer than 12 chars", () => {
    expect(() =>
      Operation.allowTrust({
        trustor,
        assetCode: "ABCDEFGHIJKLM",
        authorize: true,
      }),
    ).toThrow(/Asset code must be 12 characters at max/);
  });

  it("fails to create allowTrust operation with an invalid source address", () => {
    expect(() =>
      Operation.allowTrust({
        trustor,
        assetCode: "USD",
        authorize: true,
        source: "GCEZ",
      }),
    ).toThrow(/Source address is invalid/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.allowTrust({
      trustor,
      assetCode: "USD",
      authorize: true,
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("allowTrust");
  });
});
