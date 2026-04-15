import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

const balanceId =
  "00000000da0d57da7d4850e7fc10d2a9d0ebc731f7afb40574c03395b17d49149b91f5be";

describe("Operation.claimClaimableBalance()", () => {
  it("creates a claimClaimableBalanceOp", () => {
    const op = Operation.claimClaimableBalance({ balanceId });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "claimClaimableBalance",
    );

    expect(obj.balanceId).toBe(balanceId);
  });

  it("throws when balanceId is not present", () => {
    expect(() =>
      // @ts-expect-error: intentionally omitting required field to test runtime validation
      Operation.claimClaimableBalance({}),
    ).toThrow(/must provide a valid claimable balance id/);
  });

  it("throws for an invalid balanceId", () => {
    expect(() =>
      Operation.claimClaimableBalance({ balanceId: "badc0ffee" }),
    ).toThrow(/must provide a valid claimable balance id/);
  });

  it("preserves an optional source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.claimClaimableBalance({ balanceId, source });
    const obj = expectOperationType(
      Operation.fromXDRObject(xdr.Operation.fromXDR(op.toXDR("hex"), "hex")),
      "claimClaimableBalance",
    );

    expect(obj.source).toBe(source);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.claimClaimableBalance({ balanceId });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("claimClaimableBalance");
  });
});
