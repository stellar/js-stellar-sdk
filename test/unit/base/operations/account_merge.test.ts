import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import {
  encodeMuxedAccountToAddress,
  encodeMuxedAccount,
} from "../../../src/util/decode_encode_muxed_account.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.accountMerge()", () => {
  const base = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";

  it("creates an accountMergeOp", () => {
    const op = Operation.accountMerge({ destination: base });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "accountMerge",
    );

    expect(obj.destination).toBe(base);
  });

  it("supports muxed destination account", () => {
    const dest = encodeMuxedAccountToAddress(encodeMuxedAccount(base, "1"));
    const source = encodeMuxedAccountToAddress(encodeMuxedAccount(base, "2"));

    const op = Operation.accountMerge({ destination: dest, source });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "accountMerge",
    );

    expect(obj.destination).toBe(dest);
    expect(obj.source).toBe(source);
  });

  it("supports non-muxed accounts for both destination and source", () => {
    const op = Operation.accountMerge({ destination: base, source: base });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "accountMerge",
    );

    expect(obj.destination).toBe(base);
    expect(obj.source).toBe(base);
  });

  it("fails to create accountMergeOp with invalid destination", () => {
    expect(() => Operation.accountMerge({ destination: "GCEZW" })).toThrow(
      /destination is invalid/,
    );
  });

  it("fails to create accountMergeOp with an invalid source address", () => {
    expect(() =>
      Operation.accountMerge({ destination: base, source: "GCEZ" }),
    ).toThrow(/Source address is invalid/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.accountMerge({ destination: base });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("accountMerge");
  });
});
