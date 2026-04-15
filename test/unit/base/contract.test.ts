import { describe, it, expect } from "vitest";
import { Contract } from "../../src/contract.js";
import { Address } from "../../src/address.js";
import { nativeToScVal } from "../../src/scval.js";
import { expectDefined } from "../support/expect_defined.js";
import xdr from "../../src/xdr.js";

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
      expect(scAddress.switch()).toBe(
        xdr.ScAddressType.scAddressTypeContract(),
      );
    });
  });

  describe("getFootprint", () => {
    it("includes the correct contract ledger keys", () => {
      const contract = new Contract(NULL_ADDRESS);
      expect(contract.contractId()).toBe(NULL_ADDRESS);

      const actual = contract.getFootprint();
      const expected = xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: contract.address().toScAddress(),
          key: xdr.ScVal.scvLedgerKeyContractInstance(),
          durability: xdr.ContractDataDurability.persistent(),
        }),
      );

      expect(actual.toXDR("hex")).toBe(expected.toXDR("hex"));
    });

    it("returns a contractData ledger key", () => {
      const contract = new Contract(VALID_ADDRESS);
      const footprint = contract.getFootprint();
      expect(footprint.switch()).toBe(xdr.LedgerEntryType.contractData());
    });

    it("uses persistent durability", () => {
      const contract = new Contract(VALID_ADDRESS);
      const footprint = contract.getFootprint();
      expect(footprint.contractData().durability()).toBe(
        xdr.ContractDataDurability.persistent(),
      );
    });

    it("uses the contract instance key", () => {
      const contract = new Contract(VALID_ADDRESS);
      const footprint = contract.getFootprint();
      expect(footprint.contractData().key().switch()).toBe(
        xdr.ScValType.scvLedgerKeyContractInstance(),
      );
    });
  });

  describe("call", () => {
    it("works with no parameters", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("empty");
      // should serialize without error
      op.toXDR();
    });

    it("builds valid XDR", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call(
        "method",
        nativeToScVal("arg!"),
        nativeToScVal(2, { type: "i32" }),
      );
      op.toXDR();
    });

    it("passes the contract id as an ScAddress", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("method");
      const args = op
        .body()
        .invokeHostFunctionOp()
        .hostFunction()
        .invokeContract();

      expect(args.contractAddress().toXDR("hex")).toBe(
        new Contract(NULL_ADDRESS).address().toScAddress().toXDR("hex"),
      );
    });

    it("passes the method name as the function name", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("myMethod");
      const args = op
        .body()
        .invokeHostFunctionOp()
        .hostFunction()
        .invokeContract();

      expect(args.functionName()).toBe("myMethod");
    });

    it("passes all params as args", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call(
        "method",
        nativeToScVal("arg!"),
        nativeToScVal(2, { type: "i32" }),
      );
      const args = op
        .body()
        .invokeHostFunctionOp()
        .hostFunction()
        .invokeContract();

      const callArgs = args.args();
      expect(callArgs).toHaveLength(2);
      const firstArg = expectDefined(callArgs[0]);
      const secondArg = expectDefined(callArgs[1]);
      expect(firstArg.toXDR("hex")).toBe(
        xdr.ScVal.scvString("arg!").toXDR("hex"),
      );
      expect(secondArg.toXDR("hex")).toBe(
        xdr.ScVal.scvI32(2).toXDR("hex"),
      );
    });

    it("passes empty args when called with no params", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("noArgs");
      const args = op
        .body()
        .invokeHostFunctionOp()
        .hostFunction()
        .invokeContract();

      expect(args.args()).toHaveLength(0);
    });

    it("returns an invokeHostFunction operation", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("method");
      expect(op.body().switch()).toBe(xdr.OperationType.invokeHostFunction());
    });

    it("uses invokeContract host function type", () => {
      const contract = new Contract(NULL_ADDRESS);
      const op = contract.call("method");
      const hostFn = op.body().invokeHostFunctionOp().hostFunction();
      expect(hostFn.switch()).toBe(
        xdr.HostFunctionType.hostFunctionTypeInvokeContract(),
      );
    });
  });
});
