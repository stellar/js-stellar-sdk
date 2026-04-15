import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

const selling = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);
const buying = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);
const amount = "11.2782700";

describe("Operation.createPassiveSellOffer()", () => {
  it("creates a createPassiveSellOfferOp with string price", () => {
    const price = "3.07";
    const op = Operation.createPassiveSellOffer({
      selling,
      buying,
      amount,
      price,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "createPassiveSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    expect(
      (operation.body().value() as xdr.CreatePassiveSellOfferOp)
        .amount()
        .toString(),
    ).toBe("112782700");
    expect(obj.amount).toBe(amount);
    expect(obj.price).toBe(price);
  });

  it("creates a createPassiveSellOfferOp with number price", () => {
    const price = 3.07;
    const op = Operation.createPassiveSellOffer({
      selling,
      buying,
      amount,
      price,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "createPassiveSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    expect(obj.amount).toBe(amount);
    expect(obj.price).toBe(price.toString());
  });

  it("creates a createPassiveSellOfferOp with BigNumber price", () => {
    const price = new BigNumber(5).dividedBy(4);
    const op = Operation.createPassiveSellOffer({
      selling,
      buying,
      amount,
      price,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "createPassiveSellOffer",
    );

    expect(obj.selling.equals(selling)).toBe(true);
    expect(obj.buying.equals(buying)).toBe(true);
    expect(obj.amount).toBe(amount);
    expect(obj.price).toBe("1.25");
  });

  it("fails with an invalid amount", () => {
    expect(() =>
      Operation.createPassiveSellOffer({
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
      Operation.createPassiveSellOffer({
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
      Operation.createPassiveSellOffer({
        selling,
        buying,
        amount: "20",
        price: "-2",
      }),
    ).toThrow(/price must be positive/);
  });

  it("preserves an optional source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.createPassiveSellOffer({
      selling,
      buying,
      amount,
      price: "3.07",
      source,
    });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "createPassiveSellOffer",
    );

    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.createPassiveSellOffer({
      selling,
      buying,
      amount,
      price: "3.07",
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("createPassiveSellOffer");
  });
});
