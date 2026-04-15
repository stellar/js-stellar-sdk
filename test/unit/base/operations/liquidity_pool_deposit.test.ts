import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

const liquidityPoolId =
  "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7";
const maxAmountA = "10.0000000";
const maxAmountB = "20.0000000";

describe("Operation.liquidityPoolDeposit()", () => {
  it("fails without liquidityPoolId", () => {
    expect(() => Operation.liquidityPoolDeposit()).toThrow(
      /liquidityPoolId argument is required/,
    );

    expect(() =>
      // @ts-expect-error: intentionally passing empty opts to test runtime validation
      Operation.liquidityPoolDeposit({}),
    ).toThrow(/liquidityPoolId argument is required/);
  });

  it("fails without maxAmountA", () => {
    expect(() =>
      Operation.liquidityPoolDeposit({
        liquidityPoolId,
        // @ts-expect-error: intentionally omitting required field to test runtime validation
        maxAmountA: undefined,
        maxAmountB,
        minPrice: "0.45",
        maxPrice: "0.55",
      }),
    ).toThrow(
      /maxAmountA argument must be of type String, represent a positive number and have at most 7 digits after the decimal/,
    );
  });

  it("fails without maxAmountB", () => {
    expect(() =>
      Operation.liquidityPoolDeposit({
        liquidityPoolId,
        maxAmountA,
        // @ts-expect-error: intentionally omitting required field to test runtime validation
        maxAmountB: undefined,
        minPrice: "0.45",
        maxPrice: "0.55",
      }),
    ).toThrow(
      /maxAmountB argument must be of type String, represent a positive number and have at most 7 digits after the decimal/,
    );
  });

  it("fails without minPrice", () => {
    expect(() =>
      Operation.liquidityPoolDeposit({
        liquidityPoolId,
        maxAmountA,
        maxAmountB,
        // @ts-expect-error: intentionally omitting required field to test runtime validation
        minPrice: undefined,
        maxPrice: "0.55",
      }),
    ).toThrow(/minPrice argument is required/);
  });

  it("fails without maxPrice", () => {
    expect(() =>
      Operation.liquidityPoolDeposit({
        liquidityPoolId,
        maxAmountA,
        maxAmountB,
        minPrice: "0.45",
        // @ts-expect-error: intentionally omitting required field to test runtime validation
        maxPrice: undefined,
      }),
    ).toThrow(/maxPrice argument is required/);
  });

  it("fails with a negative price", () => {
    expect(() =>
      Operation.liquidityPoolDeposit({
        liquidityPoolId,
        maxAmountA,
        maxAmountB,
        minPrice: "-0.45",
        maxPrice: "0.55",
      }),
    ).toThrow(/price must be positive/);
  });

  it("creates a liquidityPoolDeposit with string prices", () => {
    const opts = {
      liquidityPoolId,
      maxAmountA,
      maxAmountB,
      minPrice: "0.45",
      maxPrice: "0.55",
    };
    const op = Operation.liquidityPoolDeposit(opts);
    const xdrHex = op.toXDR("hex");
    const xdrOp = xdr.Operation.fromXDR(xdrHex, "hex");
    const body = xdrOp.body().value() as xdr.LiquidityPoolDepositOp;

    expect(body.maxAmountA().toString()).toBe("100000000");
    expect(body.maxAmountB().toString()).toBe("200000000");

    const obj = expectOperationType(
      Operation.fromXDRObject(xdrOp),
      "liquidityPoolDeposit",
    );

    expect(obj.liquidityPoolId).toBe(liquidityPoolId);
    expect(obj.maxAmountA).toBe(maxAmountA);
    expect(obj.maxAmountB).toBe(maxAmountB);
    expect(obj.minPrice).toBe("0.45");
    expect(obj.maxPrice).toBe("0.55");
  });

  it("creates a liquidityPoolDeposit with fraction prices", () => {
    const opts = {
      liquidityPoolId,
      maxAmountA,
      maxAmountB,
      minPrice: { n: 9, d: 20 },
      maxPrice: { n: 11, d: 20 },
    };
    const op = Operation.liquidityPoolDeposit(opts);
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "liquidityPoolDeposit",
    );

    expect(obj.liquidityPoolId).toBe(liquidityPoolId);
    expect(obj.maxAmountA).toBe(maxAmountA);
    expect(obj.maxAmountB).toBe(maxAmountB);
    expect(obj.minPrice).toBe(new BigNumber(9).div(20).toString());
    expect(obj.maxPrice).toBe(new BigNumber(11).div(20).toString());
  });

  it("creates a liquidityPoolDeposit with number prices", () => {
    const opts = {
      liquidityPoolId,
      maxAmountA,
      maxAmountB,
      minPrice: 0.45,
      maxPrice: 0.55,
    };
    const op = Operation.liquidityPoolDeposit(opts);
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "liquidityPoolDeposit",
    );

    expect(obj.liquidityPoolId).toBe(liquidityPoolId);
    expect(obj.maxAmountA).toBe(maxAmountA);
    expect(obj.maxAmountB).toBe(maxAmountB);
    expect(obj.minPrice).toBe((0.45).toString());
    expect(obj.maxPrice).toBe((0.55).toString());
  });

  it("creates a liquidityPoolDeposit with BigNumber prices", () => {
    const opts = {
      liquidityPoolId,
      maxAmountA,
      maxAmountB,
      minPrice: new BigNumber(9).dividedBy(20),
      maxPrice: new BigNumber(11).dividedBy(20),
    };
    const op = Operation.liquidityPoolDeposit(opts);
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "liquidityPoolDeposit",
    );

    expect(obj.liquidityPoolId).toBe(liquidityPoolId);
    expect(obj.maxAmountA).toBe(maxAmountA);
    expect(obj.maxAmountB).toBe(maxAmountB);
    expect(obj.minPrice).toBe(new BigNumber(9).dividedBy(20).toString());
    expect(obj.maxPrice).toBe(new BigNumber(11).dividedBy(20).toString());
  });

  it("preserves an optional source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.liquidityPoolDeposit({
      liquidityPoolId,
      maxAmountA,
      maxAmountB,
      minPrice: "0.45",
      maxPrice: "0.55",
      source,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "liquidityPoolDeposit",
    );
    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.liquidityPoolDeposit({
      liquidityPoolId,
      maxAmountA,
      maxAmountB,
      minPrice: "0.45",
      maxPrice: "0.55",
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("liquidityPoolDeposit");
  });
});
