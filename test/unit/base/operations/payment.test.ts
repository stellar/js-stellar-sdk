import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import xdr from "../../../src/xdr.js";
import {
  encodeMuxedAccountToAddress,
  encodeMuxedAccount,
} from "../../../src/util/decode_encode_muxed_account.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.payment()", () => {
  const destination =
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
  const base = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";

  it("creates a paymentOp with a custom asset", () => {
    const amount = "1000.0000000";
    const asset = new Asset(
      "USDUSD",
      "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
    );
    const op = Operation.payment({ destination, asset, amount });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "payment",
    );
    expect(obj.destination).toBe(destination);
  });

  it("creates a paymentOp with native asset", () => {
    const amount = "200.0000000";
    const asset = Asset.native();
    const op = Operation.payment({ destination, asset, amount });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "payment",
    );
    expect(obj.destination).toBe(destination);
    expect(obj.amount).toBe("200.0000000");
  });

  it("supports muxed destination account", () => {
    const muxedDest = encodeMuxedAccountToAddress(
      encodeMuxedAccount(base, "1"),
    );
    const muxedSource = encodeMuxedAccountToAddress(
      encodeMuxedAccount(base, "2"),
    );

    const op = Operation.payment({
      destination: muxedDest,
      asset: Asset.native(),
      amount: "1000.0000000",
      source: muxedSource,
    });

    const packed = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const unpacked = expectOperationType(
      Operation.fromXDRObject(packed),
      "payment",
    );
    expect(unpacked.destination).toBe(muxedDest);
    expect(unpacked.source).toBe(muxedSource);
  });

  it("supports non-muxed accounts for both destination and source", () => {
    const op = Operation.payment({
      destination: base,
      asset: Asset.native(),
      amount: "1000.0000000",
      source: base,
    });

    const packed = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const unpacked = expectOperationType(
      Operation.fromXDRObject(packed),
      "payment",
    );
    expect(unpacked.destination).toBe(base);
    expect(unpacked.source).toBe(base);
  });

  it("supports mixing muxed and unmuxed properties", () => {
    const muxedDest = encodeMuxedAccountToAddress(
      encodeMuxedAccount(base, "1"),
    );

    const op = Operation.payment({
      destination: muxedDest,
      asset: Asset.native(),
      amount: "1000.0000000",
      source: base,
    });

    const packed = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const unpacked = expectOperationType(
      Operation.fromXDRObject(packed),
      "payment",
    );
    expect(unpacked.destination).toBe(muxedDest);
    expect(unpacked.source).toBe(base);
  });

  it("fails when no asset is provided", () => {
    // @ts-expect-error: intentionally incomplete opts to test runtime validation
    expect(() => Operation.payment({ destination, amount: "20" })).toThrow(
      /Must provide an asset for a payment operation/,
    );
  });

  it("fails with an invalid destination address", () => {
    expect(() =>
      Operation.payment({
        destination: "GCEZW",
        asset: Asset.native(),
        amount: "20",
      }),
    ).toThrow(/destination is invalid/);
  });

  it("fails with an invalid amount", () => {
    expect(() =>
      Operation.payment({
        destination,
        asset: Asset.native(),
        // @ts-expect-error: intentionally passing non-string to test runtime validation
        amount: 20,
      }),
    ).toThrow(/amount argument must be of type String/);
  });

  it("fails with a negative amount", () => {
    expect(() =>
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: "-1",
      }),
    ).toThrow(/amount argument must be of type String/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.payment({
      destination,
      asset: Asset.native(),
      amount: "50.0000000",
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("payment");
  });
});
