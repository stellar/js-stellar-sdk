import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Asset } from "../../../src/asset.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.setTrustLineFlags()", () => {
  const account = "GDGU5OAPHNPU5UCLE5RDJHG7PXZFQYWKCFOEXSXNMR6KRQRI5T6XXCD7";
  const asset = new Asset("GCOIN", account);

  it("creates a SetTrustLineFlagsOp with all flags", () => {
    const op = Operation.setTrustLineFlags({
      trustor: account,
      asset,
      flags: {
        authorized: false,
        authorizedToMaintainLiabilities: true,
        clawbackEnabled: false,
      },
    });
    const opBody = op.body().setTrustLineFlagsOp();
    // authorized (1) | clawbackEnabled (4) = 5
    expect(opBody.clearFlags()).toBe(1 | 4);
    // authorizedToMaintainLiabilities (2)
    expect(opBody.setFlags()).toBe(2);

    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setTrustLineFlags",
    );
    expect(obj.asset.equals(asset)).toBe(true);
    expect(obj.trustor).toBe(account);
    expect(obj.flags.authorized).toBe(false);
    expect(obj.flags.authorizedToMaintainLiabilities).toBe(true);
    expect(obj.flags.clawbackEnabled).toBe(false);
  });

  it("leaves unmodified flags as undefined", () => {
    const op = Operation.setTrustLineFlags({
      trustor: account,
      asset,
      flags: {
        authorized: true,
      },
    });
    const opBody = op.body().setTrustLineFlagsOp();
    expect(opBody.setFlags()).toBe(1);

    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setTrustLineFlags",
    );
    expect(obj.asset.equals(asset)).toBe(true);
    expect(obj.trustor).toBe(account);
    expect(obj.flags.authorized).toBe(true);
    expect(obj.flags.authorizedToMaintainLiabilities).toBeUndefined();
    expect(obj.flags.clawbackEnabled).toBeUndefined();
  });

  it("creates a SetTrustLineFlagsOp with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.setTrustLineFlags({
      trustor: account,
      asset,
      flags: { authorized: true },
      source,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "setTrustLineFlags",
    );
    expect(obj.source).toBe(source);
  });

  it("fails with missing flags", () => {
    expect(() =>
      Operation.setTrustLineFlags({
        trustor: account,
        asset,
      } as Parameters<typeof Operation.setTrustLineFlags>[0]),
    ).toThrow();
  });

  it("fails with empty flags array", () => {
    expect(() =>
      Operation.setTrustLineFlags({
        trustor: account,
        asset,
        flags: [] as unknown as { authorized?: boolean },
      }),
    ).toThrow();
  });

  it("fails with empty flags object (no keys)", () => {
    expect(() =>
      Operation.setTrustLineFlags({
        trustor: account,
        asset,
        flags: {},
      }),
    ).toThrow(/opts.flags must be a map of boolean flags to modify/);
  });

  it("fails with invalid flag names", () => {
    expect(() =>
      Operation.setTrustLineFlags({
        trustor: account,
        asset,
        flags: {
          authorized: false,
          invalidFlag: true,
        } as { authorized?: boolean },
      }),
    ).toThrow(/unsupported flag name specified/);
  });

  it("fails when no options are provided", () => {
    expect(() =>
      Operation.setTrustLineFlags(
        {} as Parameters<typeof Operation.setTrustLineFlags>[0],
      ),
    ).toThrow();
  });

  it("fails to create operation with an invalid source address", () => {
    expect(() =>
      Operation.setTrustLineFlags({
        trustor: account,
        asset,
        flags: { authorized: true },
        source: "GCEZ",
      }),
    ).toThrow(/Source address is invalid/);
  });

  it("throws when flag value is truthy but not boolean true", () => {
    expect(() =>
      Operation.setTrustLineFlags({
        trustor: account,
        asset,
        flags: { authorized: 1 } as unknown as { authorized?: boolean },
      }),
    ).toThrow();
  });

  it("throws when flag value is falsy but not boolean false", () => {
    expect(() =>
      Operation.setTrustLineFlags({
        trustor: account,
        asset,
        flags: { authorized: 0 } as unknown as { authorized?: boolean },
      }),
    ).toThrow();
  });

  it("throws when flag value is a string", () => {
    expect(() =>
      Operation.setTrustLineFlags({
        trustor: account,
        asset,
        flags: { authorized: "true" } as unknown as { authorized?: boolean },
      }),
    ).toThrow();
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.setTrustLineFlags({
      trustor: account,
      asset,
      flags: { authorized: true },
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("setTrustLineFlags");
  });
});
