import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import xdr from "../../../src/xdr.js";
import {
  encodeMuxedAccountToAddress,
  encodeMuxedAccount,
} from "../../../src/util/decode_encode_muxed_account.js";
import { expectDefined } from "../../support/expect_defined.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.pathPaymentStrictReceive()", () => {
  const destination =
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
  const base = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
  const sendAsset = new Asset(
    "USD",
    "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
  );
  const destAsset = new Asset(
    "USD",
    "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
  );
  const path = [
    new Asset(
      "USD",
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
    ),
    new Asset(
      "EUR",
      "GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL",
    ),
  ];

  it("creates a pathPaymentStrictReceiveOp", () => {
    const sendMax = "3.0070000";
    const destAmount = "3.1415000";
    const op = Operation.pathPaymentStrictReceive({
      sendAsset,
      sendMax,
      destination,
      destAsset,
      destAmount,
      path,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "pathPaymentStrictReceive",
    );
    expect(obj.sendAsset.equals(sendAsset)).toBe(true);
    expect(
      (operation.body().value() as xdr.PathPaymentStrictReceiveOp)
        .sendMax()
        .toString(),
    ).toBe("30070000");
    expect(obj.sendMax).toBe(sendMax);
    expect(obj.destination).toBe(destination);
    expect(obj.destAsset.equals(destAsset)).toBe(true);
    expect(
      (operation.body().value() as xdr.PathPaymentStrictReceiveOp)
        .destAmount()
        .toString(),
    ).toBe("31415000");
    expect(obj.destAmount).toBe(destAmount);
    expect(expectDefined(obj.path[0]).getCode()).toBe("USD");
    expect(expectDefined(obj.path[0]).getIssuer()).toBe(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
    );
    expect(expectDefined(obj.path[1]).getCode()).toBe("EUR");
    expect(expectDefined(obj.path[1]).getIssuer()).toBe(
      "GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL",
    );
  });

  it("creates a pathPaymentStrictReceiveOp with no path", () => {
    const op = Operation.pathPaymentStrictReceive({
      sendAsset,
      sendMax: "10.0000000",
      destination,
      destAsset,
      destAmount: "5.0000000",
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "pathPaymentStrictReceive",
    );
    expect(obj.path).toHaveLength(0);
  });

  it("supports muxed accounts", () => {
    const muxedSource = encodeMuxedAccountToAddress(
      encodeMuxedAccount(base, "1"),
    );
    const muxedDest = encodeMuxedAccountToAddress(
      encodeMuxedAccount(base, "2"),
    );

    const op = Operation.pathPaymentStrictReceive({
      sendAsset,
      sendMax: "3.0070000",
      destination: muxedDest,
      destAsset,
      destAmount: "3.1415000",
      path,
      source: muxedSource,
    });

    const packed = xdr.Operation.fromXDR(op.toXDR("hex"), "hex");
    const unpacked = expectOperationType(
      Operation.fromXDRObject(packed),
      "pathPaymentStrictReceive",
    );
    expect(unpacked.source).toBe(muxedSource);
    expect(unpacked.destination).toBe(muxedDest);
  });

  it("fails with an invalid destination address", () => {
    expect(() =>
      Operation.pathPaymentStrictReceive({
        sendAsset,
        sendMax: "3.0070000",
        destination: "GCEZW",
        destAsset,
        destAmount: "3.1415000",
      }),
    ).toThrow(/destination is invalid/);
  });

  it("fails with an invalid sendMax", () => {
    expect(() =>
      Operation.pathPaymentStrictReceive({
        sendAsset,
        // @ts-expect-error: intentionally passing non-string to test runtime validation
        sendMax: 20,
        destination,
        destAsset,
        destAmount: "3.1415000",
      }),
    ).toThrow(/sendMax argument must be of type String/);
  });

  it("fails with an invalid destAmount", () => {
    expect(() =>
      Operation.pathPaymentStrictReceive({
        sendAsset,
        sendMax: "20",
        destination,
        destAsset,
        // @ts-expect-error: intentionally passing non-string to test runtime validation
        destAmount: 50,
      }),
    ).toThrow(/destAmount argument must be of type String/);
  });

  it("fails with no sendAsset", () => {
    expect(() =>
      // @ts-expect-error: intentionally incomplete opts to test runtime validation
      Operation.pathPaymentStrictReceive({
        sendMax: "3.0070000",
        destination,
        destAsset,
        destAmount: "3.1415000",
      }),
    ).toThrow(/Must specify a send asset/);
  });

  it("fails with no destAsset", () => {
    expect(() =>
      // @ts-expect-error: intentionally incomplete opts to test runtime validation
      Operation.pathPaymentStrictReceive({
        sendAsset,
        sendMax: "3.0070000",
        destination,
        destAmount: "3.1415000",
      }),
    ).toThrow(/Must provide a destAsset for a payment operation/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.pathPaymentStrictReceive({
      sendAsset,
      sendMax: "3.0070000",
      destination,
      destAsset,
      destAmount: "3.1415000",
      path,
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("pathPaymentStrictReceive");
  });
});
