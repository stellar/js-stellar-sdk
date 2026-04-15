import { describe, it, expect, beforeEach } from "vitest";
import { Operation } from "../../../src/operation.js";
import { Contract } from "../../../src/contract.js";
import { Address } from "../../../src/address.js";
import { Asset } from "../../../src/asset.js";
import { hash } from "../../../src/hashing.js";
import { nativeToScVal } from "../../../src/scval.js";
import type { InvokeHostFunctionOpts } from "../../../src/operations/types.js";
import xdr from "../../../src/xdr.js";
import { expectDefined } from "../../support/expect_defined.js";
import { expectOperationType } from "../../support/operation.js";

describe("Operation", () => {
  describe(".invokeHostFunction()", () => {
    let contractId: string;
    let c: Contract;

    beforeEach(() => {
      contractId = "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
      c = new Contract(contractId);
    });

    it("creates operation", () => {
      const op = Operation.invokeHostFunction({
        auth: [],
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(
          new xdr.InvokeContractArgs({
            contractAddress: c.address().toScAddress(),
            functionName: "hello",
            args: [nativeToScVal("world")],
          }),
        ),
      });
      const hex = op.toXDR("hex");
      const operation = xdr.Operation.fromXDR(hex, "hex");

      expect(operation.body().switch().name).toBe("invokeHostFunction");
      const obj = expectOperationType(
        Operation.fromXDRObject(operation),
        "invokeHostFunction",
      );
      expect(obj.func.switch().name).toBe("hostFunctionTypeInvokeContract");
      expect(expectDefined(obj.auth)).toEqual([]);

      expect(
        Operation.invokeContractFunction({
          contract: contractId,
          function: "hello",
          args: [nativeToScVal("world")],
        }).toXDR("hex"),
      ).toEqual(hex);
    });

    it("throws when no func passed", () => {
      expect(() =>
        Operation.invokeHostFunction({
          auth: [],
        } as unknown as InvokeHostFunctionOpts),
      ).toThrow(/\('func'\) required/);
    });

    describe("abstractions", () => {
      it("lets you create custom contracts", () => {
        const h = hash(Buffer.from("random stuff"));

        const op = Operation.createCustomContract({
          address: c.address(),
          wasmHash: h,
          salt: h,
        });
        expect(op.body().switch().name).toBe("invokeHostFunction");

        // round trip back
        const hex = op.toXDR("hex");
        const xdrOp = xdr.Operation.fromXDR(hex, "hex");
        const decodedOp = expectOperationType(
          Operation.fromXDRObject(xdrOp),
          "invokeHostFunction",
        );
        expect(decodedOp.func.switch().name).toBe(
          "hostFunctionTypeCreateContractV2",
        );
        expect(
          // check deep inner field to ensure RT
          decodedOp.func
            .createContractV2()
            .contractIdPreimage()
            .fromAddress()
            .salt(),
        ).toEqual(h);
        expect(expectDefined(decodedOp.auth)).toHaveLength(0);
      });

      describe("lets you wrap tokens", () => {
        [
          "USD:GCP2QKBFLLEEWYVKAIXIJIJNCZ6XEBIE4PCDB6BF3GUB6FGE2RQ3HDVP",
          Asset.native(),
          new Asset(
            "USD",
            "GCP2QKBFLLEEWYVKAIXIJIJNCZ6XEBIE4PCDB6BF3GUB6FGE2RQ3HDVP",
          ),
        ].forEach((asset) => {
          it(`with asset ${asset.toString()}`, () => {
            const op = Operation.createStellarAssetContract({ asset });
            expect(op.body().switch().name).toBe("invokeHostFunction");

            // round trip back
            const hex = op.toXDR("hex");
            const xdrOp = xdr.Operation.fromXDR(hex, "hex");
            const decodedOp = expectOperationType(
              Operation.fromXDRObject(xdrOp),
              "invokeHostFunction",
            );
            expect(decodedOp.func.switch().name).toBe(
              "hostFunctionTypeCreateContract",
            );
            expect(
              // check deep inner field to ensure RT
              Asset.fromOperation(
                decodedOp.func
                  .createContract()
                  .contractIdPreimage()
                  .fromAsset(),
              ).toString(),
            ).toBe(asset.toString());
            expect(expectDefined(decodedOp.auth)).toHaveLength(0);
          });
        });
      });

      it("lets you upload wasm", () => {
        const wasm = Buffer.alloc(512);
        const op = Operation.uploadContractWasm({ wasm });
        expect(op.body().switch().name).toBe("invokeHostFunction");

        // round trip back
        const hex = op.toXDR("hex");
        const xdrOp = xdr.Operation.fromXDR(hex, "hex");
        const decodedOp = expectOperationType(
          Operation.fromXDRObject(xdrOp),
          "invokeHostFunction",
        );
        expect(decodedOp.func.switch().name).toBe(
          "hostFunctionTypeUploadContractWasm",
        );
        expect(decodedOp.func.wasm()).toEqual(wasm);
        expect(expectDefined(decodedOp.auth)).toHaveLength(0);
      });

      it("lets you create contracts with a constructor", () => {
        const h = hash(Buffer.from("random stuff"));
        const constructorArgs = [
          nativeToScVal("admin name"),
          nativeToScVal(1234, { type: "i128" }),
        ];

        const op = Operation.createCustomContract({
          address: c.address(),
          constructorArgs,
          wasmHash: h,
          salt: h,
        });
        expect(op.body().switch().name).toBe("invokeHostFunction");

        // round trip back
        const hex = op.toXDR("hex");
        const xdrOp = xdr.Operation.fromXDR(hex, "hex");
        const decodedOp = expectOperationType(
          Operation.fromXDRObject(xdrOp),
          "invokeHostFunction",
        );
        expect(decodedOp.func.switch().name).toBe(
          "hostFunctionTypeCreateContractV2",
        );

        // check deep inner field to ensure RT
        expect(
          decodedOp.func
            .createContractV2()
            .contractIdPreimage()
            .fromAddress()
            .salt(),
        ).toEqual(h);

        // check deep inner field to ensure ctor args match
        const ctorArgs = decodedOp.func.createContractV2().constructorArgs();

        expect(ctorArgs).toHaveLength(2);
        expect(ctorArgs[0]).toBeDefined();
        expect(ctorArgs[1]).toBeDefined();
        expect(constructorArgs[0]).toBeDefined();
        expect(ctorArgs[1]).toEqual(constructorArgs[1]);
        expect(expectDefined(decodedOp.auth)).toHaveLength(0);

        // note: we used a string initially but once the operation is
        // encoded/decoded it will be a Buffer internally, so we need to
        // compare that way instead.
        const decodedStr = ctorArgs[0]?.str();
        const originalStr = constructorArgs[0]?.str();

        expect(decodedStr).toBeDefined();
        expect(originalStr).toBeDefined();
        expect(decodedStr?.toString()).toBe(originalStr);
      });

      it("prevents invocation with liquidity pool args", () => {
        expect(() =>
          Operation.invokeContractFunction({
            contract:
              "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE",
            function: "increment",
            args: [
              nativeToScVal(
                "LA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUPJN",
                { type: "address" },
              ),
            ],
          }),
        ).toThrow(/claimable balances and liquidity pools/);
      });

      it("prevents invocation with claimable balance args", () => {
        const cbAddress = Address.claimableBalance(Buffer.alloc(33));
        expect(() =>
          Operation.invokeContractFunction({
            contract:
              "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE",
            function: "increment",
            args: [nativeToScVal(cbAddress.toString(), { type: "address" })],
          }),
        ).toThrow(/claimable balances and liquidity pools/);
      });
    });

    // ---------------------------------------------------------------
    // Additional tests for uncovered code paths
    // ---------------------------------------------------------------

    it("creates operation with source account", () => {
      const source = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
      const op = Operation.invokeHostFunction({
        auth: [],
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(
          new xdr.InvokeContractArgs({
            contractAddress: c.address().toScAddress(),
            functionName: "hello",
            args: [nativeToScVal("world")],
          }),
        ),
        source,
      });
      const hex = op.toXDR("hex");
      const operation = xdr.Operation.fromXDR(hex, "hex");
      const obj = expectOperationType(
        Operation.fromXDRObject(operation),
        "invokeHostFunction",
      );
      expect(obj.source).toBe(source);
    });

    it("defaults auth to empty array when omitted", () => {
      const op = Operation.invokeHostFunction({
        func: xdr.HostFunction.hostFunctionTypeInvokeContract(
          new xdr.InvokeContractArgs({
            contractAddress: c.address().toScAddress(),
            functionName: "hello",
            args: [nativeToScVal("world")],
          }),
        ),
      });
      const hex = op.toXDR("hex");
      const operation = xdr.Operation.fromXDR(hex, "hex");
      const obj = expectOperationType(
        Operation.fromXDRObject(operation),
        "invokeHostFunction",
      );
      expect(expectDefined(obj.auth)).toHaveLength(0);
    });

    it("throws when invokeContractFunction receives a non-contract address", () => {
      const accountAddress =
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
      expect(() =>
        Operation.invokeContractFunction({
          contract: accountAddress,
          function: "hello",
          args: [],
        }),
      ).toThrow(/expected contract strkey/);
    });

    describe("createCustomContract validation", () => {
      it("throws when wasmHash is missing", () => {
        expect(() =>
          Operation.createCustomContract({
            address: c.address(),
            wasmHash: undefined as unknown as Buffer,
            salt: hash(Buffer.from("salt")),
          }),
        ).toThrow(/opts.wasmHash/);
      });

      it("throws when wasmHash has wrong length", () => {
        expect(() =>
          Operation.createCustomContract({
            address: c.address(),
            wasmHash: Buffer.alloc(16),
            salt: hash(Buffer.from("salt")),
          }),
        ).toThrow(/opts.wasmHash/);
      });

      it("throws when salt has wrong length", () => {
        const h = hash(Buffer.from("random stuff"));
        expect(() =>
          Operation.createCustomContract({
            address: c.address(),
            wasmHash: h,
            salt: Buffer.alloc(16),
          }),
        ).toThrow(/opts.salt/);
      });

      it("auto-generates salt when omitted", () => {
        const h = hash(Buffer.from("random stuff"));
        const op = Operation.createCustomContract({
          address: c.address(),
          wasmHash: h,
        });
        expect(op.body().switch().name).toBe("invokeHostFunction");

        const hex = op.toXDR("hex");
        const xdrOp = xdr.Operation.fromXDR(hex, "hex");
        const decodedOp = expectOperationType(
          Operation.fromXDRObject(xdrOp),
          "invokeHostFunction",
        );

        const salt = decodedOp.func
          .createContractV2()
          .contractIdPreimage()
          .fromAddress()
          .salt();
        expect(salt).toHaveLength(32);
      });
    });

    it("throws when createStellarAssetContract receives an invalid asset", () => {
      expect(() =>
        Operation.createStellarAssetContract({
          asset: 123 as unknown as Asset,
        }),
      ).toThrow(/expected Asset/);
    });
  });
});
