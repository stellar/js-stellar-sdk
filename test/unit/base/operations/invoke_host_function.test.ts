import { describe, it, expect, beforeEach } from "vitest";
import { Operation } from "../../../../src/base/operation.js";
import { Contract } from "../../../../src/base/contract.js";
import { Address } from "../../../../src/base/address.js";
import { Asset } from "../../../../src/base/asset.js";
import { hash } from "../../../../src/base/hashing.js";
import { nativeToScVal } from "../../../../src/base/scval.js";
import type { InvokeHostFunctionOpts } from "../../../../src/base/operations/types.js";
import * as xdr from "../../../../src/xdr/index.js";
import { expectDefined } from "../support/expect_defined.js";
import { expectOperationType } from "../support/operation.js";
import { expectVariant } from "../support/xdr.js";

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
      const hex = op.toXdr("hex");
      const operation = xdr.Operation.fromXdr(hex, "hex");

      expect(operation.body.type).toBe("invokeHostFunction");
      const obj = expectOperationType(
        Operation.fromXdrObject(operation),
        "invokeHostFunction",
      );
      expect(obj.func.type).toBe("hostFunctionTypeInvokeContract");
      expect(expectDefined(obj.auth)).toEqual([]);

      expect(
        Operation.invokeContractFunction({
          contract: contractId,
          function: "hello",
          args: [nativeToScVal("world")],
        }).toXdr("hex"),
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
        const h = hash("random stuff");

        const op = Operation.createCustomContract({
          address: c.address(),
          wasmHash: h,
          salt: h,
        });
        expect(op.body.type).toBe("invokeHostFunction");

        // round trip back
        const hex = op.toXdr("hex");
        const xdrOp = xdr.Operation.fromXdr(hex, "hex");
        const decodedOp = expectOperationType(
          Operation.fromXdrObject(xdrOp),
          "invokeHostFunction",
        );
        expect(
          // check deep inner field to ensure RT
          Array.from(
            expectVariant(
              expectVariant(decodedOp.func, "hostFunctionTypeCreateContractV2")
                .value.contractIdPreimage,
              "contractIdPreimageFromAddress",
            ).value.salt.toBytes(),
          ),
        ).toEqual(Array.from(h));
        expect(expectDefined(decodedOp.auth)).toHaveLength(0);
      });

      describe("lets you create contracts from an external executable ref", () => {
        const ownerId =
          "CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5";

        const cases: [string, Address | string, string | Uint8Array][] = [
          ["a strkey owner and text tag", ownerId, "my-executable"],
          [
            "an Address owner and text tag",
            new Address(ownerId),
            "my-executable",
          ],
          [
            "a binary tag",
            ownerId,
            Uint8Array.from([0xc0, 0xff, 0xee, 0x00, 0x01]),
          ],
        ];

        cases.forEach(([label, owner, tag]) => {
          it(`with ${label}`, () => {
            const h = hash("random stuff");
            const op = Operation.createCustomContract({
              address: c.address(),
              externalRef: { owner, tag },
              salt: h,
            });
            expect(op.body.type).toBe("invokeHostFunction");

            // round trip back
            const hex = op.toXdr("hex");
            const xdrOp = xdr.Operation.fromXdr(hex, "hex");
            const decodedOp = expectOperationType(
              Operation.fromXdrObject(xdrOp),
              "invokeHostFunction",
            );
            const ref = expectVariant(
              expectVariant(decodedOp.func, "hostFunctionTypeCreateContractV2")
                .createContractV2.executable,
              "contractExecutableExternalRef",
            ).externalRef;

            expect(Address.fromScAddress(ref.executableOwner).toString()).toBe(
              ownerId,
            );
            if (typeof tag === "string") {
              expect(ref.tag.toStringStrict()).toBe(tag);
            } else {
              expect(Array.from(ref.tag.bytes)).toEqual(Array.from(tag));
            }
          });
        });

        it("accepts a ContractExecutableExternalRef directly", () => {
          const ref = new xdr.ContractExecutableExternalRef({
            executableOwner: new Address(ownerId).toScAddress(),
            tag: "my-executable",
          });
          const op = Operation.createCustomContract({
            address: c.address(),
            externalRef: ref,
            salt: hash("random stuff"),
          });

          const decodedOp = expectOperationType(
            Operation.fromXdrObject(xdr.Operation.fromXdr(op.toXdr())),
            "invokeHostFunction",
          );
          const decodedRef = expectVariant(
            expectVariant(decodedOp.func, "hostFunctionTypeCreateContractV2")
              .createContractV2.executable,
            "contractExecutableExternalRef",
          ).externalRef;
          expect(decodedRef.tag.toStringStrict()).toBe("my-executable");
        });

        it("throws when both wasmHash and externalRef are given", () => {
          expect(() =>
            Operation.createCustomContract({
              address: c.address(),
              wasmHash: hash("random stuff"),
              externalRef: { owner: ownerId, tag: "my-executable" },
            } as unknown as Parameters<
              typeof Operation.createCustomContract
            >[0]),
          ).toThrow(/mutually exclusive/);
        });

        it("throws when the owner is not a contract", () => {
          expect(() =>
            Operation.createCustomContract({
              address: c.address(),
              externalRef: {
                owner:
                  "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
                tag: "my-executable",
              },
            }),
          ).toThrow(/expected contract address/);
        });
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
            expect(op.body.type).toBe("invokeHostFunction");

            // round trip back
            const hex = op.toXdr("hex");
            const xdrOp = xdr.Operation.fromXdr(hex, "hex");
            const decodedOp = expectOperationType(
              Operation.fromXdrObject(xdrOp),
              "invokeHostFunction",
            );
            expect(decodedOp.func.type).toBe("hostFunctionTypeCreateContract");
            expect(
              // check deep inner field to ensure RT
              Asset.fromOperation(
                expectVariant(
                  expectVariant(
                    decodedOp.func,
                    "hostFunctionTypeCreateContract",
                  ).value.contractIdPreimage,
                  "contractIdPreimageFromAsset",
                ).fromAsset,
              ).toString(),
            ).toBe(asset.toString());
            expect(expectDefined(decodedOp.auth)).toHaveLength(0);
          });
        });
      });

      it("lets you upload wasm", () => {
        const wasm = new Uint8Array(512);
        const op = Operation.uploadContractWasm({ wasm });
        expect(op.body.type).toBe("invokeHostFunction");

        // round trip back
        const hex = op.toXdr("hex");
        const xdrOp = xdr.Operation.fromXdr(hex, "hex");
        const decodedOp = expectOperationType(
          Operation.fromXdrObject(xdrOp),
          "invokeHostFunction",
        );
        expect(decodedOp.func.type).toBe("hostFunctionTypeUploadContractWasm");
        expect(
          Array.from(
            expectVariant(decodedOp.func, "hostFunctionTypeUploadContractWasm")
              .wasm,
          ),
        ).toEqual(Array.from(wasm));
        expect(expectDefined(decodedOp.auth)).toHaveLength(0);
      });

      it("lets you create contracts with a constructor", () => {
        const h = hash("random stuff");
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
        expect(op.body.type).toBe("invokeHostFunction");

        // round trip back
        const hex = op.toXdr("hex");
        const xdrOp = xdr.Operation.fromXdr(hex, "hex");
        const decodedOp = expectOperationType(
          Operation.fromXdrObject(xdrOp),
          "invokeHostFunction",
        );
        expect(decodedOp.func.type).toBe("hostFunctionTypeCreateContractV2");

        // check deep inner field to ensure RT
        expect(
          Array.from(
            expectVariant(
              expectVariant(decodedOp.func, "hostFunctionTypeCreateContractV2")
                .createContractV2.contractIdPreimage,
              "contractIdPreimageFromAddress",
            ).fromAddress.salt.toBytes(),
          ),
        ).toEqual(Array.from(h));

        // check deep inner field to ensure ctor args match
        const ctorArgs = expectVariant(
          decodedOp.func,
          "hostFunctionTypeCreateContractV2",
        ).createContractV2.constructorArgs;

        expect(ctorArgs).toHaveLength(2);
        expect(ctorArgs[0]).toBeDefined();
        expect(ctorArgs[1]).toBeDefined();
        expect(constructorArgs[0]).toBeDefined();
        expect(ctorArgs[1]).toEqual(constructorArgs[1]);
        expect(expectDefined(decodedOp.auth)).toHaveLength(0);

        // `.str` is the raw XdrString wrapper — compare via equals (or
        // .asString() for textual equality).
        const decodedStr = expectVariant(ctorArgs[0], "scvString").str;
        const originalStr = expectVariant(constructorArgs[0], "scvString").str;

        expect(decodedStr).toBeDefined();
        expect(originalStr).toBeDefined();
        expect(decodedStr.equals(originalStr)).toBe(true);
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
        const cbAddress = Address.claimableBalance(new Uint8Array(33));
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
      const hex = op.toXdr("hex");
      const operation = xdr.Operation.fromXdr(hex, "hex");
      const obj = expectOperationType(
        Operation.fromXdrObject(operation),
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
      const hex = op.toXdr("hex");
      const operation = xdr.Operation.fromXdr(hex, "hex");
      const obj = expectOperationType(
        Operation.fromXdrObject(operation),
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
            wasmHash: undefined as unknown as Uint8Array,
            salt: hash("salt"),
          }),
        ).toThrow(/opts.wasmHash/);
      });

      it("throws when wasmHash has wrong length", () => {
        expect(() =>
          Operation.createCustomContract({
            address: c.address(),
            wasmHash: new Uint8Array(16),
            salt: hash("salt"),
          }),
        ).toThrow(/opts.wasmHash/);
      });

      it("throws when salt has wrong length", () => {
        const h = hash("random stuff");
        expect(() =>
          Operation.createCustomContract({
            address: c.address(),
            wasmHash: h,
            salt: new Uint8Array(16),
          }),
        ).toThrow(/opts.salt/);
      });

      it("auto-generates salt when omitted", () => {
        const h = hash("random stuff");
        const op = Operation.createCustomContract({
          address: c.address(),
          wasmHash: h,
        });
        expect(op.body.type).toBe("invokeHostFunction");

        const hex = op.toXdr("hex");
        const xdrOp = xdr.Operation.fromXdr(hex, "hex");
        const decodedOp = expectOperationType(
          Operation.fromXdrObject(xdrOp),
          "invokeHostFunction",
        );

        const salt = expectVariant(
          expectVariant(decodedOp.func, "hostFunctionTypeCreateContractV2")
            .createContractV2.contractIdPreimage,
          "contractIdPreimageFromAddress",
        ).fromAddress.salt.toBytes();
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
