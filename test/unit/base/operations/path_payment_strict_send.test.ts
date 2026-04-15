import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import {
  encodeMuxedAccountToAddress,
  encodeMuxedAccount,
} from "../../../src/util/decode_encode_muxed_account.js";
import xdr from "../../../src/xdr.js";
import { expectDefined } from "../../support/expect_defined.js";
import { expectOperationType } from "../../support/operation.js";

const sendAsset = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);
const sendAmount = "3.0070000";
const destination = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
const destAsset = new Asset(
  "USD",
  "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
);
const destMin = "3.1415000";
const path = [
  new Asset("USD", "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB"),
  new Asset("EUR", "GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL"),
];

describe("Operation.pathPaymentStrictSend()", () => {
  it("creates a pathPaymentStrictSendOp", () => {
    const op = Operation.pathPaymentStrictSend({
      sendAsset,
      sendAmount,
      destination,
      destAsset,
      destMin,
      path,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "pathPaymentStrictSend",
    );
    const body = operation.body().value() as xdr.PathPaymentStrictSendOp;

    expect(obj.sendAsset.equals(sendAsset)).toBe(true);
    expect(body.sendAmount().toString()).toBe("30070000");
    expect(obj.sendAmount).toBe(sendAmount);
    expect(obj.destination).toBe(destination);
    expect(obj.destAsset.equals(destAsset)).toBe(true);
    expect(body.destMin().toString()).toBe("31415000");
    expect(obj.destMin).toBe(destMin);

    const path0 = expectDefined(obj.path[0]);
    const path1 = expectDefined(obj.path[1]);

    expect(path0.getCode()).toBe("USD");
    expect(path0.getIssuer()).toBe(
      "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
    );
    expect(path1.getCode()).toBe("EUR");
    expect(path1.getIssuer()).toBe(
      "GDTNXRLOJD2YEBPKK7KCMR7J33AAG5VZXHAJTHIG736D6LVEFLLLKPDL",
    );
  });

  it("supports muxed accounts", () => {
    const base = "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
    const muxedSource = encodeMuxedAccountToAddress(
      encodeMuxedAccount(base, "1"),
    );
    const muxedDestination = encodeMuxedAccountToAddress(
      encodeMuxedAccount(base, "2"),
    );
    const packed = Operation.pathPaymentStrictSend({
      source: muxedSource,
      destination: muxedDestination,
      sendAsset,
      sendAmount,
      destAsset,
      destMin,
      path: [
        new Asset(
          "USD",
          "GBBM6BKZPEHWYO3E3YKREDPQXMS4VK35YLNU7NFBRI26RAN7GI5POFBB",
        ),
      ],
    });

    expect(() => {
      xdr.Operation.fromXDR(packed.toXDR("raw"), "raw");
      xdr.Operation.fromXDR(packed.toXDR("hex"), "hex");
    }).not.toThrow();

    const unpacked = expectOperationType(
      Operation.fromXDRObject(packed),
      "pathPaymentStrictSend",
    );
    expect(unpacked.source).toBe(muxedSource);
    expect(unpacked.destination).toBe(muxedDestination);
  });

  it("fails with an invalid destination address", () => {
    expect(() =>
      Operation.pathPaymentStrictSend({
        destination: "GCEZW",
        sendAmount: "20",
        destMin: "50",
        sendAsset: Asset.native(),
        destAsset: new Asset(
          "USD",
          "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
        ),
      }),
    ).toThrow(/destination is invalid/);
  });

  it("fails with a non-string sendAmount", () => {
    expect(() =>
      Operation.pathPaymentStrictSend({
        destination,
        // @ts-expect-error: intentionally passing non-string amount to test runtime validation
        sendAmount: 20,
        destMin: "50",
        sendAsset: Asset.native(),
        destAsset: new Asset(
          "USD",
          "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
        ),
      }),
    ).toThrow(/sendAmount argument must be of type String/);
  });

  it("fails with a non-string destMin", () => {
    expect(() =>
      Operation.pathPaymentStrictSend({
        destination,
        sendAmount: "20",
        // @ts-expect-error: intentionally passing non-string amount to test runtime validation
        destMin: 50,
        sendAsset: Asset.native(),
        destAsset: new Asset(
          "USD",
          "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
        ),
      }),
    ).toThrow(/destMin argument must be of type String/);
  });

  it("fails without a sendAsset", () => {
    expect(() =>
      Operation.pathPaymentStrictSend({
        destination,
        sendAmount: "20",
        destMin: "50",
        // @ts-expect-error: intentionally omitting required field to test runtime validation
        sendAsset: undefined,
        destAsset: new Asset(
          "USD",
          "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7",
        ),
      }),
    ).toThrow(/Must specify a send asset/);
  });

  it("fails without a destAsset", () => {
    expect(() =>
      Operation.pathPaymentStrictSend({
        destination,
        sendAmount: "20",
        destMin: "50",
        sendAsset: Asset.native(),
        // @ts-expect-error: intentionally omitting required field to test runtime validation
        destAsset: undefined,
      }),
    ).toThrow(/Must provide a destAsset for a payment operation/);
  });

  it("creates a pathPaymentStrictSendOp with no path", () => {
    const op = Operation.pathPaymentStrictSend({
      sendAsset,
      sendAmount,
      destination,
      destAsset,
      destMin,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "pathPaymentStrictSend",
    );
    expect(obj.path).toHaveLength(0);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.pathPaymentStrictSend({
      sendAsset,
      sendAmount,
      destination,
      destAsset,
      destMin,
      path,
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("pathPaymentStrictSend");
  });
});
