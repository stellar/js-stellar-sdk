import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import { LiquidityPoolAsset } from "../../../src/liquidity_pool_asset.js";
import { LiquidityPoolFeeV18 } from "../../../src/get_liquidity_pool_id.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

const usd = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);

const lpAsset = new LiquidityPoolAsset(
  new Asset("ARST", "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB"),
  new Asset("USD", "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7"),
  LiquidityPoolFeeV18,
);

describe("Operation.changeTrust()", () => {
  it("creates a changeTrustOp with Asset using default limit (MAX_INT64)", () => {
    const op = Operation.changeTrust({ asset: usd });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "changeTrust",
    );

    expect(obj.line).toEqual(usd);
    expect(
      (operation.body().value() as xdr.ChangeTrustOp).limit().toString(),
    ).toBe("9223372036854775807");
    expect(obj.limit).toBe("922337203685.4775807");
  });

  it("creates a changeTrustOp with Asset and explicit limit", () => {
    const op = Operation.changeTrust({ asset: usd, limit: "50.0000000" });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "changeTrust",
    );

    expect(obj.line).toEqual(usd);
    expect(
      (operation.body().value() as xdr.ChangeTrustOp).limit().toString(),
    ).toBe("500000000");
    expect(obj.limit).toBe("50.0000000");
  });

  it("creates a changeTrustOp with LiquidityPoolAsset using default limit (MAX_INT64)", () => {
    const op = Operation.changeTrust({ asset: lpAsset });
    expect(op).toBeInstanceOf(xdr.Operation);

    const xdrOp = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(xdrOp),
      "changeTrust",
    );

    expect(obj.line).toEqual(lpAsset);
    expect((xdrOp.body().value() as xdr.ChangeTrustOp).limit().toString()).toBe(
      "9223372036854775807",
    );
    expect(obj.limit).toBe("922337203685.4775807");
  });

  it("deletes an Asset trustline by setting limit to 0", () => {
    const op = Operation.changeTrust({ asset: usd, limit: "0.0000000" });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "changeTrust",
    );

    expect(obj.line).toEqual(usd);
    expect(obj.limit).toBe("0.0000000");
  });

  it("deletes a LiquidityPoolAsset trustline by setting limit to 0", () => {
    const op = Operation.changeTrust({ asset: lpAsset, limit: "0.0000000" });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "changeTrust",
    );

    expect(obj.line).toEqual(lpAsset);
    expect(obj.limit).toBe("0.0000000");
  });

  it("throws TypeError for a non-string limit", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing non-string limit to test runtime validation
      Operation.changeTrust({ asset: usd, limit: 0 }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for an invalid asset type", () => {
    expect(() =>
      // @ts-expect-error: intentionally passing invalid asset to test runtime validation
      Operation.changeTrust({ asset: "not-an-asset" }),
    ).toThrow(TypeError);
  });

  it("round-trips an Asset changeTrust through fromXDRObject and back", () => {
    const op = Operation.changeTrust({ asset: usd, limit: "50.0000000" });
    const xdrHex = op.toXDR("hex");
    const parsed = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(xdrHex, "hex")),
      "changeTrust",
    );

    // parsed has `line` (not `asset`); changeTrust accepts both
    const rebuilt = Operation.changeTrust(parsed);
    expect(rebuilt).toBeInstanceOf(xdr.Operation);
    expect(rebuilt.toXDR("hex")).toBe(xdrHex);
  });

  it("round-trips a LiquidityPoolAsset changeTrust through fromXDRObject and back", () => {
    const op = Operation.changeTrust({ asset: lpAsset });
    const xdrHex = op.toXDR("hex");
    const parsed = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(xdrHex, "hex")),
      "changeTrust",
    );

    // parsed has `line` (not `asset`); changeTrust accepts both
    const rebuilt = Operation.changeTrust(parsed);
    expect(rebuilt).toBeInstanceOf(xdr.Operation);
    expect(rebuilt.toXDR("hex")).toBe(xdrHex);
  });

  it("preserves an optional source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.changeTrust({ asset: usd, source });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "changeTrust",
    );

    expect(obj.source).toBe(source);
  });
});
