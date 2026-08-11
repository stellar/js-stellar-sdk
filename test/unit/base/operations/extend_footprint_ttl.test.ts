import { describe, it, expect } from "vitest";
import { Operation } from "../../../../src/base/operation.js";
import * as xdr from "../../../../src/xdr/index.js";
import { expectOperationType } from "../support/operation.js";
import { expectVariant } from "../support/xdr.js";

describe("Operation.extendFootprintTtl()", () => {
  it("creates an extendFootprintTtl operation", () => {
    const op = Operation.extendFootprintTtl({ extendTo: 1234 });
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(xdrHex, "hex");
    expect(operation.body.type).toBe("extendFootprintTtl");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "extendFootprintTtl",
    );
    expect(obj.extendTo).toBe(1234);
  });

  it("creates an extendFootprintTtl operation with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const op = Operation.extendFootprintTtl({ extendTo: 5000, source });
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "extendFootprintTtl",
    );
    expect(obj.extendTo).toBe(5000);
    expect(obj.source).toBe(source);
  });

  it("throws when extendTo is 0", () => {
    expect(() => Operation.extendFootprintTtl({ extendTo: 0 })).toThrow(
      /has to be positive/i,
    );
  });

  it("throws when extendTo is negative", () => {
    expect(() => Operation.extendFootprintTtl({ extendTo: -1 })).toThrow(
      /has to be positive/i,
    );
  });

  it("throws when extendTo is null/undefined", () => {
    expect(() =>
      Operation.extendFootprintTtl({ extendTo: null as unknown as number }),
    ).toThrow(/has to be positive/i);
    expect(() =>
      Operation.extendFootprintTtl({
        extendTo: undefined as unknown as number,
      }),
    ).toThrow(/has to be positive/i);
  });

  it("fails to create extendFootprintTtl operation with an invalid source address", () => {
    expect(() =>
      Operation.extendFootprintTtl({ extendTo: 100, source: "GCEZ" }),
    ).toThrow(/Source address is invalid/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.extendFootprintTtl({ extendTo: 999 });
    const hex = op.toXdr("hex");
    const roundtripped = xdr.Operation.fromXdr(hex, "hex");
    expect(roundtripped.body.type).toBe("extendFootprintTtl");
    const opValue = expectVariant(
      roundtripped.body,
      "extendFootprintTtl",
    ).value;
    expect(opValue.extendTo).toBe(999);
  });

  it("accepts extendTo value of 1 (minimum positive)", () => {
    const op = Operation.extendFootprintTtl({ extendTo: 1 });
    const xdrHex = op.toXdr("hex");
    const operation = xdr.Operation.fromXdr(xdrHex, "hex");
    const obj = expectOperationType(
      Operation.fromXdrObject(operation),
      "extendFootprintTtl",
    );
    expect(obj.extendTo).toBe(1);
  });
});
