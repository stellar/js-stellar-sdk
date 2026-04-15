import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import xdr from "../../../src/xdr.js";
import {
  encodeMuxedAccountToAddress,
  encodeMuxedAccount,
} from "../../../src/util/decode_encode_muxed_account.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.clawback()", () => {
  const account = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";
  const asset = new Asset("GCOIN", account);
  const amount = "100.0000000";

  it("creates a clawback operation", () => {
    const op = Operation.clawback({ from: account, amount, asset });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "clawback",
    );
    expect(obj.asset.equals(asset)).toBe(true);
    expect(obj.from).toBe(account);
    expect(obj.amount).toBe(amount);
  });

  it("supports muxed from address", () => {
    const muxedFrom = encodeMuxedAccountToAddress(
      encodeMuxedAccount(account, "1"),
    );
    const op = Operation.clawback({ from: muxedFrom, amount, asset });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    expectOperationType(Operation.fromXDRObject(operation), "clawback");
  });

  it("supports a source account", () => {
    const op = Operation.clawback({
      from: account,
      amount,
      asset,
      source: account,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "clawback",
    );
    expect(obj.source).toBe(account);
  });

  it("fails when from address is missing", () => {
    expect(() =>
      Operation.clawback({
        from: "GDGU5",
        amount,
        asset,
      }),
    ).toThrow(/from address is invalid/);
  });

  it("fails when amount is invalid", () => {
    expect(() =>
      Operation.clawback({ from: account, amount: "not-a-number", asset }),
    ).toThrow(/amount argument must be of type String/);
  });

  it("fails when only from is provided (no asset/amount)", () => {
    // @ts-expect-error: intentionally incomplete opts to test runtime validation
    expect(() => Operation.clawback({ from: account })).toThrow();
  });

  it("fails when only amount is provided", () => {
    // @ts-expect-error: intentionally incomplete opts to test runtime validation
    expect(() => Operation.clawback({ amount })).toThrow();
  });

  it("fails when only asset is provided", () => {
    // @ts-expect-error: intentionally incomplete opts to test runtime validation
    expect(() => Operation.clawback({ asset })).toThrow();
  });

  it("fails with empty opts", () => {
    // @ts-expect-error: intentionally incomplete opts to test runtime validation
    expect(() => Operation.clawback({})).toThrow();
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.clawback({ from: account, amount, asset });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("clawback");
  });
});
