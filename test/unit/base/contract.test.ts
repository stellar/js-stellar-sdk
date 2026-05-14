import { describe, it, expect } from "vitest";
import { Contract } from "../../../src/base/contract.js";
import { Address } from "../../../src/base/address.js";
import { nativeToScVal } from "../../../src/base/scval.js";
import { expectDefined } from "./support/expect_defined.js";
import xdr from "../../../src/base/xdr.js";

const NULL_ADDRESS = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
const VALID_ADDRESS =
  "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";

describe("Contract", () => {
  describe("constructor", () => {
    it("parses valid strkeys", () => {
      [NULL_ADDRESS, VALID_ADDRESS].forEach((cid) => {
        const contract = new Contract(cid);
        expect(contract.contractId()).toBe(cid);
      });
    });

    it("throws on obsolete hex ids", () => {
      expect(() => new Contract("0".repeat(63) + "1")).toThrow(
        /Invalid contract ID/,
      );
    });

    it("throws on invalid ids", () => {
      expect(() => new Contract("foobar")).toThrow(/Invalid contract ID/);
    });

    it("throws on empty string", () => {
      expect(() => new Contract("")).toThrow(/Invalid contract ID/);
    });

    it("throws on account strkey", () => {
      expect(
        () =>
          new Contract(
            "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
          ),
      ).toThrow(/Invalid contract ID/);
    });
  });

  describe("contractId", () => {
    it("returns the contract ID as a strkey", () => {
      const contract = new Contract(VALID_ADDRESS);
      expect(contract.contractId()).toBe(VALID_ADDRESS);
    });

    it("round-trips through construction", () => {
      const contract = new Contract(NULL_ADDRESS);
      const reconstructed = new Contract(contract.contractId());
      expect(reconstructed.contractId()).toBe(NULL_ADDRESS);
    });
  });

  describe("toString", () => {
    it("returns the same value as contractId", () => {
      const contract = new Contract(VALID_ADDRESS);
      expect(contract.toString()).toBe(contract.contractId());
    });

    it("returns the contract ID strkey", () => {
      const contract = new Contract(NULL_ADDRESS);
      expect(contract.toString()).toBe(NULL_ADDRESS);
    });
  });

  describe("address", () => {
    it("returns an Address instance", () => {
      const contract = new Contract(NULL_ADDRESS);
      expect(contract.address()).toBeInstanceOf(Address);
    });

    it("returns the contract address", () => {
      const contract = new Contract(NULL_ADDRESS);
      expect(contract.address().toString()).toBe(NULL_ADDRESS);
    });

    it("returns a contract-type Address", () => {
      const contract = new Contract(VALID_ADDRESS);
      const scAddress = contract.address().toScAddress();
      expect(scAddress.type).toBe("scAddressTypeContract");
    });
  });

  describe("getFootprint", () => {
    it("includes the correct contract ledger keys", () => {
      const contract = new Contract(NULL_ADDRESS);
      expect(contract.contractId()).toBe(NULL_ADDRESS);

      const actual = contract.getFootprint();
      const expected = xdr.LedgerKey.contractData({
        contract: contract.address().toScAddress(),
        key: xdr.ScVal.scvLedgerKeyContractInstance(),
        durability: "persistent",
      });

      expect(xdr.LedgerKey.toXDR(actual, "hex")).toBe(
        xdr.LedgerKey.toXDR(expected, "hex"),
      );
    });

    it("returns a contractData ledger key", () => {
      const contract = new Contract(VALID_ADDRESS);
      const footprint = contract.getFootprint();
      expect(footprint.type).toBe("contractData");
    });

    it("uses persistent durability", () => {
      const contract = new Contract(VALID_ADDRESS);
      const footprint = contract.getFootprint();
      if (footprint.type !== "contractData") {
        expect.fail("Expected contractData ledger key");
      }
      expect(footprint.contractData.durability).toBe("persistent");
    });

    it("uses the contract instance key", () => {
      const contract = new Contract(VALID_ADDRESS);
      const footprint = contract.getFootprint();
      if (footprint.type !== "contractData") {
        expect.fail("Expected contractData ledger key");
      }
      expect(footprint.contractData.key.type).toBe(
        "scvLedgerKeyContractInstance",
      );
    });
  });

  describe("call", () => {
    it("works with no parameters", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("empty");
      // should serialize without error
      xdr.Operation.toXDR(op);
    });

    it("builds valid XDR", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call(
        "method",
        nativeToScVal("arg!"),
        nativeToScVal(2, { type: "i32" }),
      );
      xdr.Operation.toXDR(op);
    });

    it("passes the contract id as an ScAddress", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("method");
      if (op.body.type !== "invokeHostFunction") {
        expect.fail("Expected invokeHostFunction operation");
      }
      if (
        op.body.invokeHostFunctionOp.hostFunction.type !==
        "hostFunctionTypeInvokeContract"
      ) {
        expect.fail("Expected hostFunctionTypeInvokeContract");
      }
      const args = op.body.invokeHostFunctionOp.hostFunction.invokeContract;

      expect(xdr.ScAddress.toXDR(args.contractAddress, "hex")).toEqual(
        xdr.ScAddress.toXDR(
          new Contract(NULL_ADDRESS).address().toScAddress(),
          "hex",
        ),
      );
    });

    it("passes the method name as the function name", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("myMethod");
      if (op.body.type !== "invokeHostFunction") {
        expect.fail("Expected invokeHostFunction operation");
      }
      if (
        op.body.invokeHostFunctionOp.hostFunction.type !==
        "hostFunctionTypeInvokeContract"
      ) {
        expect.fail("Expected hostFunctionTypeInvokeContract");
      }
      const args = op.body.invokeHostFunctionOp.hostFunction.invokeContract;

      expect(args.functionName).toBe("myMethod");
    });

    it("passes all params as args", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call(
        "method",
        nativeToScVal("arg!"),
        nativeToScVal(2, { type: "i32" }),
      );
      if (op.body.type !== "invokeHostFunction") {
        expect.fail("Expected invokeHostFunction operation");
      }
      if (
        op.body.invokeHostFunctionOp.hostFunction.type !==
        "hostFunctionTypeInvokeContract"
      ) {
        expect.fail("Expected hostFunctionTypeInvokeContract");
      }
      const args = op.body.invokeHostFunctionOp.hostFunction.invokeContract;

      const callArgs = args.args;
      expect(callArgs).toHaveLength(2);
      const firstArg = expectDefined(callArgs[0]);
      const secondArg = expectDefined(callArgs[1]);
      expect(xdr.ScVal.toXDR(firstArg, "hex")).toBe(
        xdr.ScVal.toXDR(xdr.ScVal.scvString("arg!"), "hex"),
      );
      expect(xdr.ScVal.toXDR(secondArg, "hex")).toBe(
        xdr.ScVal.toXDR(xdr.ScVal.scvI32(2), "hex"),
      );
    });

    it("passes empty args when called with no params", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("noArgs");
      if (op.body.type !== "invokeHostFunction") {
        expect.fail("Expected invokeHostFunction operation");
      }
      if (
        op.body.invokeHostFunctionOp.hostFunction.type !==
        "hostFunctionTypeInvokeContract"
      ) {
        expect.fail("Expected hostFunctionTypeInvokeContract");
      }
      const args = op.body.invokeHostFunctionOp.hostFunction.invokeContract;

      expect(args.args).toHaveLength(0);
    });

    it("returns an invokeHostFunction operation", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("method");
      if (op.body.type !== "invokeHostFunction") {
        expect.fail("Expected invokeHostFunction operation");
      }
    });

    it("uses invokeContract host function type", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("method");
      if (op.body.type !== "invokeHostFunction") {
        expect.fail("Expected invokeHostFunction operation");
      }
      if (
        op.body.invokeHostFunctionOp.hostFunction.type !==
        "hostFunctionTypeInvokeContract"
      ) {
        expect.fail("Expected hostFunctionTypeInvokeContract");
      }
      const hostFn = op.body.invokeHostFunctionOp.hostFunction;
      expect(hostFn.type).toBe("hostFunctionTypeInvokeContract");
    });
  });
});
