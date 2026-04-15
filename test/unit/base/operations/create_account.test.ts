import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.createAccount()", () => {
  const destination =
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";

  it("creates a createAccountOp", () => {
    const startingBalance = "1000.0000000";
    const op = Operation.createAccount({ destination, startingBalance });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "createAccount",
    );
    expect(obj.destination).toBe(destination);
    expect(
      operation.body().createAccountOp().startingBalance().toString(),
    ).toBe("10000000000");
    expect(obj.startingBalance).toBe(startingBalance);
  });

  it("creates a createAccount operation with startingBalance equal to 0", () => {
    const opts = {
      destination,
      startingBalance: "0",
      source: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    };
    expect(() => Operation.createAccount(opts)).not.toThrow();
  });

  it("creates a createAccount operation with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.createAccount({
      destination,
      startingBalance: "100",
      source,
    });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "createAccount",
    );
    expect(obj.source).toBe(source);
  });

  it("fails to create createAccount operation with an invalid destination address", () => {
    const opts = {
      destination: "GCEZW",
      startingBalance: "20",
      source: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    };
    expect(() => Operation.createAccount(opts)).toThrow(
      /destination is invalid/,
    );
  });

  it("fails to create createAccount operation with an invalid startingBalance", () => {
    const opts = {
      destination,
      startingBalance: 20 as unknown as string,
      source: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    };
    expect(() => Operation.createAccount(opts)).toThrow(
      /startingBalance argument must be of type String, represent a positive number and have at most 7 digits after the decimal/,
    );
  });

  it("fails to create createAccount operation with an invalid source address", () => {
    const opts = {
      destination,
      startingBalance: "20",
      source: "GCEZ",
    };
    expect(() => Operation.createAccount(opts)).toThrow(
      /Source address is invalid/,
    );
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.createAccount({
      destination,
      startingBalance: "50.0000000",
    });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("createAccount");
  });
});
