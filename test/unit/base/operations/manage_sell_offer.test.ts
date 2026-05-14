import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import { Operation } from "../../../../src/base/operation.js";
import { Asset } from "../../../../src/base/asset.js";
import xdr from "../../../../src/base/xdr.js";
import { expectOperationType } from "../support/operation.js";

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
    const xdrHex = xdr.Operation.toXDR(op, "hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    if (operation.body.type !== xdr.OperationType.manageSellOffer) {
      expect.fail("Expected manageSellOffer operation");
    }
    expect(
      (
        operation.body.manageSellOfferOp as xdr.ManageSellOfferOp
      ).amount.toString(),
    ).toBe("31234560");
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
      Operation.fromXDRObject(
        xdr.Operation.fromXDR(xdr.Operation.toXDR(op, "hex"), "hex"),
      ),
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
      Operation.fromXDRObject(
        xdr.Operation.fromXDR(xdr.Operation.toXDR(op, "hex"), "hex"),
      ),
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
      Operation.fromXDRObject(
        xdr.Operation.fromXDR(xdr.Operation.toXDR(op, "hex"), "hex"),
      ),
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
    const operation = xdr.Operation.fromXDR(
      xdr.Operation.toXDR(op, "hex"),
      "hex",
    );
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    if (operation.body.type !== xdr.OperationType.manageSellOffer) {
      expect.fail("Expected manageSellOffer operation");
    }
    expect(
      (
        operation.body.manageSellOfferOp as xdr.ManageSellOfferOp
      ).amount.toString(),
    ).toBe("10000000000");
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
    const operation = xdr.Operation.fromXDR(
      xdr.Operation.toXDR(op, "hex"),
      "hex",
    );
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    if (operation.body.type !== xdr.OperationType.manageSellOffer) {
      expect.fail("Expected manageSellOffer operation");
    }
    expect(
      (
        operation.body.manageSellOfferOp as xdr.ManageSellOfferOp
      ).amount.toString(),
    ).toBe("0");
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
      Operation.fromXDRObject(
        xdr.Operation.fromXDR(xdr.Operation.toXDR(op, "hex"), "hex"),
      ),
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
    const hex = xdr.Operation.toXDR(op, "hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body.type).toBe("manageSellOffer");
  });
});
