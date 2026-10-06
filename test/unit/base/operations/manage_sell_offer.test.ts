import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import { Operation } from "../../../../src/base/operation.js";
import { Asset } from "../../../../src/base/asset.js";
import * as xdr from "../../../../src/xdr/index.js";
import { expectOperationType } from "../support/operation.js";
import { expectVariant } from "../support/xdr.js";

const selling = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);
const buying = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);

describe("Operation.manageSellOffer()", () => {
  it("creates a manageSellOfferOp with string price", () => {
    const opts = {
      selling,
      buying,
      amount: "3.1234560",
      price: "8.141592",
      offerId: "1",
    };
    const op = Operation.manageSellOffer(opts);
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "manageSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    const body = expectVariant(
      operation.body,
      "manageSellOffer",
    ).manageSellOfferOp;
    expect(body.amount.toString()).toBe("31234560");
    expect(obj.amount).toBe(opts.amount);
    expect(obj.price).toBe(opts.price);
    expect(obj.offerId).toBe(opts.offerId);
  });

  it("creates a manageSellOfferOp with fraction price", () => {
    const opts = {
      selling,
      buying,
      amount: "3.123456",
      price: { n: 11, d: 10 },
      offerId: "1",
    };
    const op = Operation.manageSellOffer(opts);
    const obj = expectOperationType(
      Operation.fromXdrObject(xdr.Operation.fromXdr(op.toXdr("hex"), "hex")),
      "manageSellOffer",
    );
    expect(obj.price).toBe(new BigNumber(11).div(10).toString());
  });

  it("fails with a negative fraction price", () => {
    expect(() =>
      Operation.manageSellOffer({
        selling,
        buying,
        amount: "3.123456",
        price: { n: 11, d: -1 },
        offerId: "1",
      }),
    ).toThrow(/price must be positive/);
  });

  it("creates a manageSellOfferOp with number price", () => {
    const opts = {
      selling,
      buying,
      amount: "3.123456",
      price: 3.07,
      offerId: "1",
    };
    const op = Operation.manageSellOffer(opts);
    const obj = expectOperationType(
      Operation.fromXdrObject(xdr.Operation.fromXdr(op.toXdr("hex"), "hex")),
      "manageSellOffer",
    );
    expect(obj.price).toBe((3.07).toString());
  });

  it("creates a manageSellOfferOp with BigNumber price", () => {
    const opts = {
      selling,
      buying,
      amount: "3.123456",
      price: new BigNumber(5).dividedBy(4),
      offerId: "1",
    };
    const op = Operation.manageSellOffer(opts);
    const obj = expectOperationType(
      Operation.fromXdrObject(xdr.Operation.fromXdr(op.toXdr("hex"), "hex")),
      "manageSellOffer",
    );
    expect(obj.price).toBe("1.25");
  });

  it("defaults offerId to '0' when not provided", () => {
    const opts = {
      selling,
      buying,
      amount: "1000.0000000",
      price: "3.141592",
    };
    const op = Operation.manageSellOffer(opts);
    const operation = xdr.Operation.fromXdr(op.toXdr("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "manageSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    const body = expectVariant(
      operation.body,
      "manageSellOffer",
    ).manageSellOfferOp;
    expect(body.amount.toString()).toBe("10000000000");
    expect(obj.amount).toBe(opts.amount);
    expect(obj.price).toBe(opts.price);
    expect(obj.offerId).toBe("0");
  });

  it("cancels an offer by setting amount to zero", () => {
    const opts = {
      selling,
      buying,
      amount: "0.0000000",
      price: "3.141592",
      offerId: "1",
    };
    const op = Operation.manageSellOffer(opts);
    const operation = xdr.Operation.fromXdr(op.toXdr("hex"), "hex");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "manageSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    const body = expectVariant(
      operation.body,
      "manageSellOffer",
    ).manageSellOfferOp;
    expect(body.amount.toString()).toBe("0");
    expect(obj.amount).toBe(opts.amount);
    expect(obj.price).toBe(opts.price);
    expect(obj.offerId).toBe("1");
  });

  it("fails with an invalid amount", () => {
    expect(() =>
      Operation.manageSellOffer({
        selling,
        buying,
        // @ts-expect-error: intentionally passing non-string amount to test runtime validation
        amount: 20,
        price: "10",
      }),
    ).toThrow(/amount argument must be of type String/);
  });

  it("fails with a missing price", () => {
    expect(() =>
      Operation.manageSellOffer({
        selling,
        buying,
        amount: "20",
        // @ts-expect-error: intentionally omitting required field to test runtime validation
        price: undefined,
      }),
    ).toThrow(/price argument is required/);
  });

  it("fails with a negative price", () => {
    expect(() =>
      Operation.manageSellOffer({
        selling,
        buying,
        amount: "20",
        price: "-1",
      }),
    ).toThrow(/price must be positive/);
  });

  it("fails with a non-numeric price string", () => {
    expect(() =>
      Operation.manageSellOffer({
        selling,
        buying,
        amount: "20",
        price: "test",
      }),
    ).toThrow(/not a number/i);
  });

  it("preserves an optional source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.manageSellOffer({
      selling,
      buying,
      amount: "3.1234560",
      price: "8.141592",
      offerId: "1",
      source,
    });
    const obj = expectOperationType(
      Operation.fromXdrObject(xdr.Operation.fromXdr(op.toXdr("hex"), "hex")),
      "manageSellOffer",
    );

    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.manageSellOffer({
      selling,
      buying,
      amount: "3.1234560",
      price: "8.141592",
      offerId: "1",
    });
    const hex = op.toXdr("hex");
    const roundtripped = xdr.Operation.fromXdr(hex, "hex");
    expect(roundtripped.body.type).toBe("manageSellOffer");
  });

  describe("offerId", () => {
    const build = (offerId: number | string | bigint) =>
      expectOperationType(
        Operation.fromXdrObject(
          Operation.manageSellOffer({
            selling,
            buying,
            amount: "1",
            price: "1",
            offerId,
          }),
        ),
        "manageSellOffer",
      ).offerId;

    it("encodes the largest safe number and a larger decimal string exactly", () => {
      expect(build(Number.MAX_SAFE_INTEGER)).toBe("9007199254740991");
      expect(build("9007199254740993")).toBe("9007199254740993");
    });

    it("removes leading zeros from a decimal string", () => {
      expect(build("016")).toBe("16");
    });

    it("rejects a number that is not a non-negative safe integer", () => {
      for (const offerId of [
        Number.MAX_SAFE_INTEGER + 2,
        1.5,
        -1,
        NaN,
        Infinity,
      ]) {
        expect(() => build(offerId)).toThrow(
          /offerId must be a non-negative safe integer/,
        );
      }
    });

    it("accepts a non-negative bigint", () => {
      expect(build(123n)).toBe("123");
    });

    it("rejects a negative bigint", () => {
      expect(() => build(-1n)).toThrow(/offerId must not be negative/);
    });

    it("accepts the int64 maximum and rejects a larger ID", () => {
      expect(build("9223372036854775807")).toBe("9223372036854775807");
      for (const offerId of ["9223372036854775808", 2n ** 63n]) {
        expect(() => build(offerId)).toThrow(
          /offerId must not exceed 9223372036854775807/,
        );
      }
    });

    it("rejects a string that is not decimal digits", () => {
      for (const offerId of ["", " 16 ", "0x10", "-1", "+1", "1e3"]) {
        expect(() => build(offerId)).toThrow(
          /offerId must be a string of decimal digits/,
        );
      }
    });

    it("rejects a string longer than the 64-bit digit budget before parsing it", () => {
      expect(() => build("1".repeat(1_000_000))).toThrow(
        /exceeds the 22-character budget/,
      );
      expect(build(`${"0".repeat(21)}1`)).toBe("1");
    });
  });
});
