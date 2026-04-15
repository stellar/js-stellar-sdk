import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import { Claimant } from "../../../src/claimant.js";
import xdr from "../../../src/xdr.js";
import { expectDefined } from "../../support/expect_defined.js";
import { expectOperationType } from "../../support/operation.js";

const asset = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);
const amount = "100.0000000";
const claimants = [
  new Claimant("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ"),
];

describe("Operation.createClaimableBalance()", () => {
  it("creates a createClaimableBalanceOp", () => {
    const op = Operation.createClaimableBalance({ asset, amount, claimants });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "createClaimableBalance",
    );

    expect(obj.asset.toString()).toBe(asset.toString());
    expect(obj.amount).toBe(amount);
    expect(obj.claimants).toHaveLength(1);

    const firstClaimant = expectDefined(obj.claimants[0]);
    const expectedClaimant = expectDefined(claimants[0]);

    expect(firstClaimant.toXDRObject().toXDR("hex")).toBe(
      expectedClaimant.toXDRObject().toXDR("hex"),
    );
  });

  it("throws when asset is not provided", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.createClaimableBalance({ amount, claimants }),
    ).toThrow(/must provide an asset for create claimable balance operation/);
  });

  it("throws when amount is not provided", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.createClaimableBalance({ asset, claimants }),
    ).toThrow(
      /amount argument must be of type String, represent a positive number and have at most 7 digits after the decimal/,
    );
  });

  it("throws when claimants is not provided", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.createClaimableBalance({ asset, amount }),
    ).toThrow(/must provide at least one claimant/);
  });

  it("throws when claimants is an empty array", () => {
    expect(() =>
      Operation.createClaimableBalance({ asset, amount, claimants: [] }),
    ).toThrow(/must provide at least one claimant/);
  });

  it("preserves an optional source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.createClaimableBalance({
      asset,
      amount,
      claimants,
      source,
    });

    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "createClaimableBalance",
    );

    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.createClaimableBalance({ asset, amount, claimants });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("createClaimableBalance");
  });
});
