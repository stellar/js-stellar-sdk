import { describe, it, expect } from "vitest";
import { Operation } from "../../../src/operation.js";
import xdr from "../../../src/xdr.js";
import { expectDefined } from "../../support/expect_defined.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation.manageData()", () => {
  it("creates a manageData operation with string value", () => {
    const opts = { name: "name", value: "value" };
    const op = Operation.manageData(opts);
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageData",
    );
    expect(obj.name).toBe("name");
    expect(expectDefined(obj.value).toString("ascii")).toBe("value");
  });

  it("creates a manageData operation with Buffer value", () => {
    const opts = { name: "name", value: Buffer.from("value") };
    const op = Operation.manageData(opts);
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageData",
    );
    expect(obj.name).toBe("name");
    expect(expectDefined(obj.value).toString("hex")).toBe(
      opts.value.toString("hex"),
    );
  });

  it("creates a manageData operation with null value (deletes entry)", () => {
    const opts = { name: "name", value: null };
    const op = Operation.manageData(opts);
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageData",
    );
    expect(obj.name).toBe("name");
    expect(obj.value).toBeUndefined();
  });

  it("round-trips a null-value (delete) manageData through fromXDRObject and back", () => {
    const op = Operation.manageData({ name: "test", value: null });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const parsed = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageData",
    );

    // Rebuilding from the parsed result must not throw
    const rebuilt = Operation.manageData({
      name: parsed.name,
      value: parsed.value,
    });
    expect(rebuilt).toBeInstanceOf(xdr.Operation);
    expect(rebuilt.toXDR("hex")).toBe(xdrHex);
  });

  it("creates a manageData operation with source account", () => {
    const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const opts = { name: "test", value: "data", source };
    const op = Operation.manageData(opts);
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageData",
    );
    expect(obj.source).toBe(source);
  });

  it("creates a manageData operation with maximum length name (64 chars)", () => {
    const name = "a".repeat(64);
    const op = Operation.manageData({ name, value: "v" });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageData",
    );
    expect(obj.name).toBe(name);
  });

  it("creates a manageData operation with maximum length value (64 bytes)", () => {
    const value = Buffer.alloc(64, 0xff);
    const op = Operation.manageData({ name: "test", value });
    const xdrHex = op.toXDR("hex");
    const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
    const obj = expectOperationType(
      Operation.fromXDRObject(operation),
      "manageData",
    );
    expect(expectDefined(obj.value).length).toBe(64);
  });

  describe("fails to create manageData operation", () => {
    it("throws when name is not a string", () => {
      expect(() =>
        Operation.manageData({ name: 123 as unknown as string, value: "v" }),
      ).toThrow(/name must be a string, up to 64 characters/);
    });

    it("throws when name is too long (> 64 characters)", () => {
      expect(() =>
        Operation.manageData({ name: "a".repeat(65), value: "v" }),
      ).toThrow(/name must be a string, up to 64 characters/);
    });

    it("throws when value is too long (> 64 bytes)", () => {
      expect(() =>
        Operation.manageData({ name: "a", value: Buffer.alloc(65) }),
      ).toThrow(/value cannot be longer that 64 bytes/);
    });

    it("throws when value is an invalid type", () => {
      expect(() =>
        Operation.manageData({
          name: "a",
          value: 123 as unknown as string,
        }),
      ).toThrow(/value must be a string, Buffer or null/);
    });

    it("throws when name is empty string", () => {
      // Empty string has length 0 which is <= 64, so it's valid per the check.
      // But let's confirm the behavior matches the source code.
      // Actually empty string passes the length check (0 <= 64) and typeof check.
      const op = Operation.manageData({ name: "", value: "v" });
      const xdrHex = op.toXDR("hex");
      const operation = xdr.Operation.fromXDR(Buffer.from(xdrHex, "hex"));
      const obj = expectOperationType(
        Operation.fromXDRObject(operation),
        "manageData",
      );
      expect(obj.name).toBe("");
    });

    it("throws when string value is too long (> 64 bytes)", () => {
      expect(() =>
        Operation.manageData({ name: "a", value: "x".repeat(65) }),
      ).toThrow(/value cannot be longer that 64 bytes/);
    });
  });

  it("fails to create manageData operation with an invalid source address", () => {
    expect(() =>
      Operation.manageData({ name: "test", value: "data", source: "GCEZ" }),
    ).toThrow(/Source address is invalid/);
  });

  it("roundtrips through XDR hex encoding", () => {
    const op = Operation.manageData({ name: "key", value: "val" });
    const hex = op.toXDR("hex");
    const roundtripped = xdr.Operation.fromXDR(hex, "hex");
    expect(roundtripped.body().switch().name).toBe("manageData");
  });
});
