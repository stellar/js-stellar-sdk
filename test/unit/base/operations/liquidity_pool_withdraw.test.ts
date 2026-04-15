import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.liquidityPoolWithdraw()", () => {
  const liquidityPoolId =
    "dd7b1ab831c273310ddbec6f97870aa83c2fbd78ce22aded37ecbf4f3380fac7";

  it("creates a liquidityPoolWithdraw operation", () => {
    const opts = {
      liquidityPoolId,
      amount: "5.0000000",
      minAmountA: "10.0000000",
      minAmountB: "20.0000000",
    };
    const op = Operation.liquidityPoolWithdraw(opts);
    const xdrHex = op.toXDR("hex");
    const xdrObj = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    expect(xdrObj.body().switch().name).toBe("liquidityPoolWithdraw");
    expect(xdrObj.body().value().amount().toString()).toBe("50000000");
    expect(xdrObj.body().value().minAmountA().toString()).toBe("100000000");
    expect(xdrObj.body().value().minAmountB().toString()).toBe("200000000");

    const operation = expectOperationType(
      Operation.fromXDRObject(xdrObj),
      "liquidityPoolWithdraw",
    );
    expect(operation.liquidityPoolId).toBe(opts.liquidityPoolId);
    expect(operation.amount).toBe(opts.amount);
    expect(operation.minAmountA).toBe(opts.minAmountA);
    expect(operation.minAmountB).toBe(opts.minAmountB);
  });

  it("creates a liquidityPoolWithdraw operation with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const opts = {
      liquidityPoolId,
      amount: "5.0000000",
      minAmountA: "10.0000000",
      minAmountB: "20.0000000",
      source,
    };
    const op = Operation.liquidityPoolWithdraw(opts);
    const xdrHex = op.toXDR("hex");
    const xdrObj = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const operation = expectOperationType(
      Operation.fromXDRObject(xdrObj),
      "liquidityPoolWithdraw",
    );
    expect(operation.source).toBe(source);
  });

  it("creates a liquidityPoolWithdraw with zero minAmountA", () => {
    const opts = {
      liquidityPoolId,
      amount: "5.0000000",
      minAmountA: "0",
      minAmountB: "20.0000000",
    };
    const op = Operation.liquidityPoolWithdraw(opts);
    const xdrHex = op.toXDR("hex");
    const xdrObj = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const operation = expectOperationType(
      Operation.fromXDRObject(xdrObj),
      "liquidityPoolWithdraw",
    );
    expect(operation.minAmountA).toBe("0.0000000");
  });

  it("creates a liquidityPoolWithdraw with zero minAmountB", () => {
    const opts = {
      liquidityPoolId,
      amount: "5.0000000",
      minAmountA: "10.0000000",
      minAmountB: "0",
    };
    const op = Operation.liquidityPoolWithdraw(opts);
    const xdrHex = op.toXDR("hex");
    const xdrObj = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const operation = expectOperationType(
      Operation.fromXDRObject(xdrObj),
      "liquidityPoolWithdraw",
    );
    expect(operation.minAmountB).toBe("0.0000000");
  });

  describe("throws an error if a required parameter is missing", () => {
    it("throws when liquidityPoolId is missing", () => {
      expect(() =>
        Operation.liquidityPoolWithdraw(
          {} as {
            liquidityPoolId: string;
            amount: string;
            minAmountA: string;
            minAmountB: string;
          },
        ),
      ).toThrow(/liquidityPoolId argument is required/);
    });

    it("throws when amount is missing", () => {
      expect(() =>
        Operation.liquidityPoolWithdraw({
          liquidityPoolId,
        } as {
          liquidityPoolId: string;
          amount: string;
          minAmountA: string;
          minAmountB: string;
        }),
      ).toThrow(
        /amount argument must be of type String, represent a positive number and have at most 7 digits after the decimal/,
      );
    });

    it("throws when minAmountA is missing", () => {
      expect(() =>
        Operation.liquidityPoolWithdraw({
          liquidityPoolId,
          amount: "10",
        } as {
          liquidityPoolId: string;
          amount: string;
          minAmountA: string;
          minAmountB: string;
        }),
      ).toThrow(
        /minAmountA argument must be of type String, represent a positive number and have at most 7 digits after the decimal/,
      );
    });

    it("throws when minAmountB is missing", () => {
      expect(() =>
        Operation.liquidityPoolWithdraw({
          liquidityPoolId,
          amount: "10",
          minAmountA: "10000",
        } as {
          liquidityPoolId: string;
          amount: string;
          minAmountA: string;
          minAmountB: string;
        }),
      ).toThrow(
        /minAmountB argument must be of type String, represent a positive number and have at most 7 digits after the decimal/,
      );
    });

    it("does not throw when all required params are present", () => {
      expect(() =>
        Operation.liquidityPoolWithdraw({
          liquidityPoolId,
          amount: "10",
          minAmountA: "10000",
          minAmountB: "20000",
        }),
      ).not.toThrow();
    });
  });

  it("fails to create operation with an invalid source address", () => {
    expect(() =>
      Operation.liquidityPoolWithdraw({
        liquidityPoolId,
        amount: "5.0000000",
        minAmountA: "10.0000000",
        minAmountB: "20.0000000",
        source: "GCEZ",
      }),
    ).toThrow(/Source address is invalid/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.liquidityPoolWithdraw({
      liquidityPoolId,
      amount: "5.0000000",
      minAmountA: "10.0000000",
      minAmountB: "20.0000000",
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("liquidityPoolWithdraw");
  });
});
