import { describe, it, expect, beforeEach } from "vitest";
import {
  TransactionBuilder,
  BASE_FEE,
  TimeoutInfinite,
  isValidDate,
} from "../../src/transaction_builder.js";
import { Account } from "../../src/account.js";
import { MuxedAccount } from "../../src/muxed_account.js";
import { Operation } from "../../src/operation.js";
import { Asset } from "../../src/asset.js";
import { Memo, MemoText } from "../../src/memo.js";
import { Keypair } from "../../src/keypair.js";
import { Networks } from "../../src/network.js";
import { StrKey } from "../../src/strkey.js";
import { Contract } from "../../src/contract.js";
import { Address } from "../../src/address.js";
import { Transaction } from "../../src/transaction.js";
import { FeeBumpTransaction } from "../../src/fee_bump_transaction.js";
import { SorobanDataBuilder } from "../../src/sorobandata_builder.js";
import { expectDefined } from "../support/expect_defined.js";
import { nativeToScVal } from "../../src/scval.js";
import { SignerKey } from "../../src/signerkey.js";
import { encodeMuxedAccountToAddress } from "../../src/util/decode_encode_muxed_account.js";
import xdr from "../../src/xdr.js";

describe("TransactionBuilder", () => {
  describe("constructs a native payment transaction with one operation", () => {
    let source: Account;
    let destination: string;
    let amount: string;
    let asset: Asset;
    let transaction: Transaction;
    let memo: Memo;
    beforeEach(() => {
      source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      destination = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
      amount = "1000";
      asset = Asset.native();
      memo = Memo.id("100");

      transaction = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: destination,
            asset: asset,
            amount: amount,
          }),
        )
        .addMemo(memo)
        .setTimeout(TimeoutInfinite)
        .build();
    });

    it("should have the same source account", () => {
      expect(transaction.source).toBe(source.accountId());
    });

    it("should have the incremented sequence number", () => {
      expect(transaction.sequence).toBe("1");
    });

    it("should increment the account's sequence number", () => {
      expect(source.sequenceNumber()).toBe("1");
    });

    it("should have one payment operation", () => {
      expect(transaction.operations.length).toBe(1);
      const op = transaction.operations[0];

      if (op === undefined) throw new Error("expected operation");

      expect(op.type).toBe("payment");
    });

    it("should have 100 stroops fee", () => {
      expect(transaction.fee).toBe("100");
    });
  });

  describe("constructs a transaction with soroban data", () => {
    let source: Account;
    let sorobanTransactionData: xdr.SorobanTransactionData;

    beforeEach(() => {
      source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      sorobanTransactionData = new SorobanDataBuilder()
        .setResources(0, 5, 0)
        .setResourceFee(1)
        .build();
    });

    const contractId =
      "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
    const c = new Contract(contractId);

    it("should set the soroban data from object", () => {
      const transaction = new TransactionBuilder(source, { fee: "100" })
        .setNetworkPassphrase(Networks.TESTNET)
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: c.address().toScAddress(),
                functionName: "hello",
                args: [nativeToScVal("world")],
              }),
            ),
            auth: [],
          }),
        )
        .setSorobanData(sorobanTransactionData)
        .setTimeout(TimeoutInfinite)
        .build();

      expect(transaction.toEnvelope().v1().tx().ext().sorobanData()).toEqual(
        sorobanTransactionData,
      );
    });
    it("should set the soroban data from xdr string", () => {
      const transaction = new TransactionBuilder(source, { fee: "100" })
        .setNetworkPassphrase(Networks.TESTNET)
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: c.address().toScAddress(),
                functionName: "hello",
                args: [nativeToScVal("world")],
              }),
            ),
            auth: [],
          }),
        )
        .setSorobanData(sorobanTransactionData.toXDR("base64"))
        .setTimeout(TimeoutInfinite)
        .build();

      expect(transaction.toEnvelope().v1().tx().ext().sorobanData()).toEqual(
        sorobanTransactionData,
      );
    });

    it("should set the transaction Ext to default when soroban data present", () => {
      const transaction = new TransactionBuilder(source, { fee: "100" })
        .setNetworkPassphrase(Networks.TESTNET)
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: c.address().toScAddress(),
                functionName: "hello",
                args: [nativeToScVal("world")],
              }),
            ),
            auth: [],
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();

      expect(transaction.toEnvelope().v1().tx().ext().switch()).toBe(0);
    });

    it("should calculate fee bumps correctly with soroban data", () => {
      sorobanTransactionData = new SorobanDataBuilder()
        .setResourceFee(420)
        .build();

      let transaction = new TransactionBuilder(source, {
        fee: "200" /* assume BASE_FEE*2 */,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: c.address().toScAddress(),
                functionName: "test",
                args: [],
              }),
            ),
            auth: [],
          }),
        )
        .setSorobanData(sorobanTransactionData)
        .setTimeout(TimeoutInfinite)
        .build(); // Building includes resource fee in the total fee

      expect(
        transaction.toEnvelope().v1().tx().ext().sorobanData().toXDR("base64"),
      ).toEqual(sorobanTransactionData.toXDR("base64"));

      let feeBump = TransactionBuilder.buildFeeBumpTransaction(
        Keypair.random(),
        "200", // omit resource fee
        transaction,
        Networks.TESTNET,
      );

      expect(feeBump.fee).toBe("820"); // fee bump is an "op" so double the base

      sorobanTransactionData = new SorobanDataBuilder()
        .setResourceFee(1000)
        .build();
      transaction = new TransactionBuilder(source, {
        fee: BASE_FEE, // P23+: fee doesn't need to include resources
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: c.address().toScAddress(),
                functionName: "test",
                args: [],
              }),
            ),
            auth: [],
          }),
        )
        .setSorobanData(sorobanTransactionData)
        .setTimeout(TimeoutInfinite)
        .build();

      feeBump = TransactionBuilder.buildFeeBumpTransaction(
        Keypair.random(),
        "100", // omit resource fee
        transaction,
        Networks.TESTNET,
      );

      expect(feeBump.fee).toBe("1200"); // fee bump is an "op" so double the base
      sorobanTransactionData = null as unknown as xdr.SorobanTransactionData;
    });
  });

  describe("addSacTransferOperation", () => {
    const networkPassphrase = Networks.TESTNET;

    const SOURCE_ACCOUNT =
      "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ";
    const DESTINATION_ACCOUNT =
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
    const DESTINATION_CONTRACT =
      "CA3D5KRYM6CB7OWQ6TWYRR3Z4T7GNZLKERYNZGGA5SOAOPIFY6YQGAXE";
    const ISSUER_ACCOUNT =
      "GC6ACGSA2NJGD6YWUNX2BYBL3VM4MZRSEU2RLIUZZL35NLV5IAHAX2E2";

    let source: Account;

    beforeEach(() => {
      source = new Account(SOURCE_ACCOUNT, "0");
    });

    function buildSacTx(destination: string, asset: Asset) {
      return new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
      })
        .addSacTransferOperation(destination, asset, "10")
        .setTimeout(TimeoutInfinite)
        .build();
    }

    function contractAddressFromId(contractId: string) {
      return Address.fromString(contractId).toScAddress();
    }

    function ledgerKeyContractInstance(contractId: string) {
      return xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contract: contractAddressFromId(contractId),
          key: xdr.ScVal.scvLedgerKeyContractInstance(),
          durability: xdr.ContractDataDurability.persistent(),
        }),
      );
    }

    function ledgerKeyAccount(accountId: string) {
      return xdr.LedgerKey.account(
        new xdr.LedgerKeyAccount({
          accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
        }),
      );
    }

    function ledgerKeyTrustline(accountId: string, asset: Asset) {
      return xdr.LedgerKey.trustline(
        new xdr.LedgerKeyTrustLine({
          accountId: Keypair.fromPublicKey(accountId).xdrPublicKey(),
          asset: asset.toTrustLineXDRObject(),
        }),
      );
    }

    describe("authorization", () => {
      it("creates a source-account-credentialed authorization for the transfer", () => {
        const asset = new Asset("TEST", ISSUER_ACCOUNT);
        const tx = buildSacTx(DESTINATION_ACCOUNT, asset);

        expect(tx.operations).toHaveLength(1);

        // auth is on the decoded operation
        const op = tx.operations[0] as unknown as { auth: any[] };
        const auths = op.auth;
        expect(auths).toHaveLength(1);

        const auth = auths[0];

        // credentials: must be source-account (no explicit signature required)
        expect(auth.credentials().switch()).toEqual(
          xdr.SorobanCredentialsType.sorobanCredentialsSourceAccount(),
        );

        const rootInvoc = auth.rootInvocation();

        // function type: contract function
        expect(rootInvoc.function().switch()).toEqual(
          xdr.SorobanAuthorizedFunctionType.sorobanAuthorizedFunctionTypeContractFn(),
        );

        // contract address matches the asset's SAC contract
        const contractId = asset.contractId(networkPassphrase);
        const contractFn = rootInvoc.function().contractFn();
        expect(contractFn.contractAddress().toXDR("base64")).toBe(
          Address.fromString(contractId).toScAddress().toXDR("base64"),
        );

        // function name is 'transfer'
        expect(Buffer.from(contractFn.functionName()).toString("utf8")).toBe(
          "transfer",
        );

        // args: [source address, destination address, amount as i128]
        const args = contractFn.args();
        expect(args).toHaveLength(3);
        expect(args[0].toXDR("base64")).toBe(
          nativeToScVal(SOURCE_ACCOUNT, { type: "address" }).toXDR("base64"),
        );
        expect(args[1].toXDR("base64")).toBe(
          nativeToScVal(DESTINATION_ACCOUNT, {
            type: "address",
          }).toXDR("base64"),
        );
        expect(args[2].toXDR("base64")).toBe(
          nativeToScVal("10", { type: "i128" }).toXDR("base64"),
        );

        // no sub-invocations
        expect(rootInvoc.subInvocations()).toHaveLength(0);
      });
    });

    describe("native asset footprint", () => {
      let asset: Asset;
      let contractId: string;

      beforeEach(() => {
        asset = Asset.native();
        contractId = asset.contractId(networkPassphrase);
      });

      it("destination contract: writes balance contractData and source account", () => {
        const tx = buildSacTx(DESTINATION_CONTRACT, asset);

        expect(tx.toEnvelope().v1().tx().ext().switch()).toBe(1);

        const sorobanData = tx.toEnvelope().v1().tx().ext().sorobanData();
        const footprint = sorobanData.resources().footprint();

        const expectedReadOnly = [ledgerKeyContractInstance(contractId)];
        const expectedReadWrite = [
          xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
              contract: contractAddressFromId(contractId),
              key: xdr.ScVal.scvVec([
                nativeToScVal("Balance", { type: "symbol" }),
                nativeToScVal(DESTINATION_CONTRACT, {
                  type: "address",
                }),
              ]),
              durability: xdr.ContractDataDurability.persistent(),
            }),
          ),
          ledgerKeyAccount(SOURCE_ACCOUNT),
        ];

        expect(footprint.readOnly().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadOnly.map((k) => k.toXDR("base64")),
        );
        expect(footprint.readWrite().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadWrite.map((k) => k.toXDR("base64")),
        );
      });

      it("destination account: writes destination and source accounts", () => {
        const tx = buildSacTx(DESTINATION_ACCOUNT, asset);

        const sorobanData = tx.toEnvelope().v1().tx().ext().sorobanData();
        const footprint = sorobanData.resources().footprint();

        const expectedReadOnly = [ledgerKeyContractInstance(contractId)];
        const expectedReadWrite = [
          ledgerKeyAccount(DESTINATION_ACCOUNT),
          ledgerKeyAccount(SOURCE_ACCOUNT),
        ];
        expect(footprint.readOnly().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadOnly.map((k) => k.toXDR("base64")),
        );
        expect(footprint.readWrite().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadWrite.map((k) => k.toXDR("base64")),
        );
      });
    });

    describe("credit asset footprint", () => {
      let asset: Asset;
      let contractId: string;

      beforeEach(() => {
        asset = new Asset("TEST", ISSUER_ACCOUNT);
        contractId = asset.contractId(networkPassphrase);
      });

      it("destination account: writes destination and source trustlines", () => {
        const tx = buildSacTx(DESTINATION_ACCOUNT, asset);

        const sorobanData = tx.toEnvelope().v1().tx().ext().sorobanData();
        const footprint = sorobanData.resources().footprint();

        const expectedReadOnly = [ledgerKeyContractInstance(contractId)];
        const expectedReadWrite = [
          ledgerKeyTrustline(DESTINATION_ACCOUNT, asset),
          ledgerKeyTrustline(SOURCE_ACCOUNT, asset),
        ];
        expect(footprint.readOnly().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadOnly.map((k) => k.toXDR("base64")),
        );
        expect(footprint.readWrite().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadWrite.map((k) => k.toXDR("base64")),
        );
      });

      it("destination contract: reads issuer account and writes source trustline", () => {
        const tx = buildSacTx(DESTINATION_CONTRACT, asset);

        const sorobanData = tx.toEnvelope().v1().tx().ext().sorobanData();
        const footprint = sorobanData.resources().footprint();

        const expectedReadOnly = [
          ledgerKeyContractInstance(contractId),
          ledgerKeyAccount(ISSUER_ACCOUNT),
        ];
        const expectedReadWrite = [
          xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
              contract: contractAddressFromId(contractId),
              key: xdr.ScVal.scvVec([
                nativeToScVal("Balance", { type: "symbol" }),
                nativeToScVal(DESTINATION_CONTRACT, {
                  type: "address",
                }),
              ]),
              durability: xdr.ContractDataDurability.persistent(),
            }),
          ),
          ledgerKeyTrustline(SOURCE_ACCOUNT, asset),
        ];
        expect(footprint.readOnly().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadOnly.map((k) => k.toXDR("base64")),
        );
        expect(footprint.readWrite().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadWrite.map((k) => k.toXDR("base64")),
        );
      });

      it("destination is issuer: omits destination trustline", () => {
        const tx = buildSacTx(ISSUER_ACCOUNT, asset);

        const sorobanData = tx.toEnvelope().v1().tx().ext().sorobanData();
        const footprint = sorobanData.resources().footprint();

        const expectedReadOnly = [ledgerKeyContractInstance(contractId)];
        const expectedReadWrite = [ledgerKeyTrustline(SOURCE_ACCOUNT, asset)];

        expect(footprint.readOnly().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadOnly.map((k) => k.toXDR("base64")),
        );
        expect(footprint.readWrite().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadWrite.map((k) => k.toXDR("base64")),
        );
      });

      it("source is issuer: omits source trustline", () => {
        source = new Account(ISSUER_ACCOUNT, "0");
        const tx = buildSacTx(DESTINATION_ACCOUNT, asset);

        const sorobanData = tx.toEnvelope().v1().tx().ext().sorobanData();
        const footprint = sorobanData.resources().footprint();

        const expectedReadOnly = [ledgerKeyContractInstance(contractId)];
        const expectedReadWrite = [
          ledgerKeyTrustline(DESTINATION_ACCOUNT, asset),
        ];

        expect(footprint.readOnly().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadOnly.map((k) => k.toXDR("base64")),
        );
        expect(footprint.readWrite().map((k) => k.toXDR("base64"))).toEqual(
          expectedReadWrite.map((k) => k.toXDR("base64")),
        );
      });
    });

    describe("input validation", () => {
      it("rejects amount greater than i64 max", () => {
        const asset = Asset.native();
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(
            DESTINATION_ACCOUNT,
            asset,
            "9223372036854775808",
          );
        }).toThrow(/Amount exceeds maximum value for i64/);
      });

      it("accepts amount equal to i64 max", () => {
        const asset = Asset.native();
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(
            DESTINATION_ACCOUNT,
            asset,
            "9223372036854775807",
          );
        }).not.toThrow();
      });

      it("rejects amount of zero", () => {
        const asset = Asset.native();
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          })
            .addSacTransferOperation(DESTINATION_ACCOUNT, asset, "0")
            .setTimeout(TimeoutInfinite)
            .build();
        }).toThrow(/Amount must be a positive integer/);
      });

      it("rejects negative amount", () => {
        const asset = Asset.native();
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "-1");
        }).toThrow(/Amount must be a positive integer/);
      });

      it("rejects destination equal to source account", () => {
        const asset = Asset.native();
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(SOURCE_ACCOUNT, asset, "10");
        }).toThrow(/Destination cannot be the same as the source account/);
      });

      it("validates sorobanFees are greater than zero", () => {
        const asset = Asset.native();
        const validFees = {
          instructions: 1,
          readBytes: 2,
          writeBytes: 3,
          resourceFee: BigInt(4),
        };

        // each u32 field rejects 0
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
            ...validFees,
            instructions: 0,
          });
        }).toThrow(/instructions must be greater than 0/);
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
            ...validFees,
            readBytes: 0,
          });
        }).toThrow(/readBytes must be greater than 0/);
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
            ...validFees,
            writeBytes: 0,
          });
        }).toThrow(/writeBytes must be greater than 0/);

        // resourceFee rejects 0
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
            ...validFees,
            resourceFee: BigInt(0),
          });
        }).toThrow(/resourceFee must be greater than 0/);
      });

      it("rejects u32 fields exceeding u32 max", () => {
        const asset = Asset.native();
        const U32_MAX = 4294967295;
        const validFees = {
          instructions: 1,
          readBytes: 2,
          writeBytes: 3,
          resourceFee: BigInt(4),
        };

        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
            ...validFees,
            instructions: U32_MAX + 1,
          });
        }).toThrow(/instructions must be greater than 0/);
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
            ...validFees,
            readBytes: U32_MAX + 1,
          });
        }).toThrow(/readBytes must be greater than 0/);
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
            ...validFees,
            writeBytes: U32_MAX + 1,
          });
        }).toThrow(/writeBytes must be greater than 0/);
      });

      it("accepts u32 fields at u32 max", () => {
        const asset = Asset.native();
        const U32_MAX = 4294967295;

        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          })
            .addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
              instructions: U32_MAX,
              readBytes: U32_MAX,
              writeBytes: U32_MAX,
              resourceFee: BigInt(1),
            })
            .setTimeout(TimeoutInfinite)
            .build();
        }).not.toThrow();
      });

      it("rejects resourceFee exceeding i64 max", () => {
        const asset = Asset.native();

        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          }).addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
            instructions: 1,
            readBytes: 1,
            writeBytes: 1,
            resourceFee: BigInt("9223372036854775808"),
          });
        }).toThrow(/resourceFee must be greater than 0/);
      });

      it("rejects resourceFee at i64 max (total fee overflows uint32)", () => {
        const asset = Asset.native();

        // Transaction.fee is Uint32 in XDR. An i64-max resourceFee added to
        // any baseFee will always exceed uint32 max.
        expect(() => {
          new TransactionBuilder(source, {
            fee: "100",
            networkPassphrase,
          })
            .addSacTransferOperation(DESTINATION_ACCOUNT, asset, "10", {
              instructions: 1,
              readBytes: 1,
              writeBytes: 1,
              resourceFee: BigInt("9223372036854775807"),
            })
            .setTimeout(TimeoutInfinite)
            .build();
        }).toThrow(/exceeds the maximum uint32 value/);
      });
    });
  });

  describe("constructs a native payment transaction with two operations", () => {
    let source: Account;
    let destination1: string;
    let amount1: string;
    let destination2: string;
    let amount2: string;
    let asset: Asset;
    let transaction: Transaction;

    beforeEach(() => {
      asset = Asset.native();
      source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );

      destination1 = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
      amount1 = "1000";
      destination2 = "GC6ACGSA2NJGD6YWUNX2BYBL3VM4MZRSEU2RLIUZZL35NLV5IAHAX2E2";
      amount2 = "2000";

      transaction = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: destination1,
            asset: asset,
            amount: amount1,
          }),
        )
        .addOperation(
          Operation.payment({
            destination: destination2,
            asset: asset,
            amount: amount2,
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();
    });

    it("should have the same source account", () => {
      expect(transaction.source).toBe(source.accountId());
    });

    it("should have the incremented sequence number", () => {
      expect(transaction.sequence).toBe("1");
    });

    it("should increment the account's sequence number", () => {
      expect(source.sequenceNumber()).toBe("1");
    });

    it("should have two payment operation", () => {
      expect(transaction.operations.length).toBe(2);
      const op0 = transaction.operations[0];
      const op1 = transaction.operations[1];

      if (op0 === undefined || op1 === undefined)
        throw new Error("expected operations");

      expect(op0.type).toBe("payment");
      expect(op1.type).toBe("payment");
    });

    it("should have 200 stroops fee", () => {
      expect(transaction.fee).toBe("200");
    });
  });

  describe("constructs a native payment transaction with custom base fee", () => {
    let source: Account;
    let destination1: string;
    let amount1: string;
    let destination2: string;
    let amount2: string;
    let asset: Asset;
    let transaction: Transaction;

    beforeEach(() => {
      asset = Asset.native();
      source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );

      destination1 = "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
      amount1 = "1000";
      destination2 = "GC6ACGSA2NJGD6YWUNX2BYBL3VM4MZRSEU2RLIUZZL35NLV5IAHAX2E2";
      amount2 = "2000";

      transaction = new TransactionBuilder(source, {
        fee: "1000",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: destination1,
            asset: asset,
            amount: amount1,
          }),
        )
        .addOperation(
          Operation.payment({
            destination: destination2,
            asset: asset,
            amount: amount2,
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();
    });

    it("should have 2000 stroops fee", () => {
      expect(transaction.fee).toBe("2000");
    });
  });

  describe("constructs a native payment transaction with integer timebounds", () => {
    it("should have have timebounds", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      const timebounds = {
        minTime: "1455287522",
        maxTime: "1455297545",
      };
      const transaction = new TransactionBuilder(source, {
        timebounds,
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination:
              "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
            asset: Asset.native(),
            amount: "1000",
          }),
        )
        .build();

      if (!transaction.timeBounds) throw new Error("expected timeBounds");

      expect(transaction.timeBounds.minTime).toBe(timebounds.minTime);
      expect(transaction.timeBounds.maxTime).toBe(timebounds.maxTime);
    });
  });

  describe("distinguishes whether a provided Date is valid or invalid", () => {
    it("should accept empty Date objects", () => {
      const d = new Date();
      expect(isValidDate(d)).toBe(true);
    });

    it("should accept configured Date objects", () => {
      const d = new Date(1455287522000);
      expect(isValidDate(d)).toBe(true);
    });

    it("should reject mis-configured Date objects", () => {
      const d = new Date("bad string here");
      expect(isValidDate(d)).toBe(false);
    });

    it("should reject objects that are not Dates", () => {
      const d = [1455287522000];
      // @ts-expect-error: intentionally passing invalid type
      expect(isValidDate(d)).toBe(false);
    });
  });

  describe("constructs a native payment transaction with date timebounds", () => {
    it("should have expected timebounds", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      const timebounds = {
        minTime: new Date(1528145519000),
        maxTime: new Date(1528231982000),
      };

      const transaction = new TransactionBuilder(source, {
        timebounds,
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination:
              "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
            asset: Asset.native(),
            amount: "1000",
          }),
        )
        .build();

      // getTime returns milliseconds, but we store seconds internally
      const expectedMinTime = timebounds.minTime.getTime() / 1000;
      const expectedMaxTime = timebounds.maxTime.getTime() / 1000;

      if (!transaction.timeBounds) throw new Error("expected timeBounds");

      expect(transaction.timeBounds.minTime).toBe(expectedMinTime.toString());
      expect(transaction.timeBounds.maxTime).toBe(expectedMaxTime.toString());
    });

    it("floors sub-second precision Date timebounds", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      const timebounds = {
        minTime: new Date(1528145519500), // 500ms sub-second
        maxTime: new Date(1528231982999), // 999ms sub-second
      };

      let transaction: Transaction | undefined;

      expect(() => {
        transaction = new TransactionBuilder(source, {
          timebounds,
          fee: "100",
          networkPassphrase: Networks.TESTNET,
        })
          .addOperation(
            Operation.payment({
              destination:
                "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
              asset: Asset.native(),
              amount: "1000",
            }),
          )
          .build();
      }).not.toThrow();

      if (!transaction) throw new Error("expected transaction");
      if (!transaction.timeBounds) throw new Error("expected timeBounds");

      expect(transaction.timeBounds.minTime).toBe("1528145519");
      expect(transaction.timeBounds.maxTime).toBe("1528231982");
    });
  });

  describe("timebounds", () => {
    it("requires maxTime", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );

      expect(() => {
        new TransactionBuilder(source, {
          timebounds: {
            minTime: "0",
          } as any,
          fee: "100",
        }).build();
      }).toThrow(
        "TimeBounds has to be set or you must call setTimeout(TimeoutInfinite).",
      );
    });

    it("requires minTime", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      expect(() => {
        new TransactionBuilder(source, {
          timebounds: {
            maxTime: "10",
          } as any,
          fee: "100",
        }).build();
      }).toThrow(
        "TimeBounds has to be set or you must call setTimeout(TimeoutInfinite).",
      );
    });

    it("works with timebounds defined", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      expect(() => {
        new TransactionBuilder(source, {
          timebounds: {
            minTime: "1",
            maxTime: "10",
          },
          fee: "100",
          networkPassphrase: Networks.TESTNET,
        }).build();
      }).not.toThrow();
    });

    it("fails with empty timebounds", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      expect(() => {
        new TransactionBuilder(source, {
          timebounds: {} as any,
          fee: "100",
        }).build();
      }).toThrow(
        "TimeBounds has to be set or you must call setTimeout(TimeoutInfinite).",
      );
    });
  });

  describe("setTimeout", () => {
    it("not called", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      const transactionBuilder = new TransactionBuilder(source, {
        fee: "100",
      }).addOperation(
        Operation.payment({
          destination:
            "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
          asset: Asset.native(),
          amount: "1000",
        }),
      );

      expect(() => transactionBuilder.build()).toThrow(
        /TimeBounds has to be set/,
      );
      expect(source.sequenceNumber()).toBe("0");
    });

    it("timeout negative", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      const transactionBuilder = new TransactionBuilder(source, {
        fee: "100",
      }).addOperation(
        Operation.payment({
          destination:
            "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
          asset: Asset.native(),
          amount: "1000",
        }),
      );

      expect(() => transactionBuilder.setTimeout(-1)).toThrow(
        /timeout cannot be negative/,
      );
      expect(source.sequenceNumber()).toBe("0");
    });

    it("sets timebounds", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      const transaction = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination:
              "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
            asset: Asset.native(),
            amount: "1000",
          }),
        )
        .setTimeout(10)
        .build();

      const timeoutTimestamp = Math.floor(Date.now() / 1000) + 10;
      if (!transaction.timeBounds) throw new Error("expected timeBounds");
      expect(transaction.timeBounds.maxTime).toBe(timeoutTimestamp.toString());
    });

    it("fails when maxTime already set", () => {
      const timebounds = {
        minTime: "1455287522",
        maxTime: "1455297545",
      };
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      const transactionBuilder = new TransactionBuilder(source, {
        timebounds,
        fee: "100",
      }).addOperation(
        Operation.payment({
          destination:
            "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
          asset: Asset.native(),
          amount: "1000",
        }),
      );

      expect(() => transactionBuilder.setTimeout(10)).toThrow(
        /TimeBounds.max_time has been already set/,
      );
    });

    it("sets timebounds.maxTime when minTime already set", () => {
      const timebounds = {
        minTime: "1455287522",
        maxTime: "0",
      };
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );
      const transaction = new TransactionBuilder(source, {
        timebounds,
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination:
              "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
            asset: Asset.native(),
            amount: "1000",
          }),
        )
        .setTimeout(10)
        .build();

      const timeoutTimestamp = Math.floor(Date.now() / 1000) + 10;

      if (!transaction.timeBounds) throw new Error("expected timeBounds");

      expect(transaction.timeBounds.maxTime).toBe(timeoutTimestamp.toString());
    });
    it("works with TimeoutInfinite", () => {
      const source = new Account(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        "0",
      );

      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase: Networks.TESTNET,
        })
          .setTimeout(0)
          .build();
      }).not.toThrow();
    });
  });

  describe(".buildFeeBumpTransaction", () => {
    it("builds a fee bump transaction", () => {
      const networkPassphrase = "Standalone Network ; February 2017";
      const innerSource = Keypair.master(networkPassphrase);
      const innerAccount = new Account(innerSource.publicKey(), "7");
      const destination =
        "GDQERENWDDSQZS7R7WKHZI3BSOYMV3FSWR7TFUYFTKQ447PIX6NREOJM";
      const amount = "2000.0000000";
      const asset = Asset.native();

      let innerTx = new TransactionBuilder(innerAccount, {
        fee: "200",
        networkPassphrase: networkPassphrase,
        timebounds: {
          minTime: 0,
          maxTime: 0,
        },
      })
        .addOperation(
          Operation.payment({
            destination,
            asset,
            amount,
          }),
        )
        .build();

      const feeSource = Keypair.fromSecret(
        "SB7ZMPZB3YMMK5CUWENXVLZWBK4KYX4YU5JBXQNZSK2DP2Q7V3LVTO5V",
      );
      const transaction = TransactionBuilder.buildFeeBumpTransaction(
        feeSource,
        "200",
        innerTx,
        networkPassphrase,
      );

      expect(transaction).toBeInstanceOf(FeeBumpTransaction);

      // The fee rate for fee bump is at least the fee rate of the inner transaction
      expect(() => {
        TransactionBuilder.buildFeeBumpTransaction(
          feeSource,
          "100",
          innerTx,
          networkPassphrase,
        );
      }).toThrow(/Invalid baseFee, it should be at least 200 stroops./);

      innerTx = new TransactionBuilder(innerAccount, {
        fee: "80",
        networkPassphrase: networkPassphrase,
        timebounds: {
          minTime: 0,
          maxTime: 0,
        },
      })
        .addOperation(
          Operation.payment({
            destination,
            asset,
            amount,
          }),
        )
        .addMemo(Memo.text("Happy birthday!"))
        .build();

      // The fee rate for fee bump is at least the minimum fee
      expect(() => {
        TransactionBuilder.buildFeeBumpTransaction(
          feeSource,
          "90",
          innerTx,
          networkPassphrase,
        );
      }).toThrow(/Invalid baseFee, it should be at least 100 stroops./);

      innerTx = new TransactionBuilder(innerAccount, {
        fee: "100",
        networkPassphrase: networkPassphrase,
        timebounds: {
          minTime: 0,
          maxTime: 0,
        },
      })
        .addOperation(
          Operation.payment({
            destination,
            asset,
            amount,
          }),
        )
        .build();

      const signer = Keypair.master(Networks.TESTNET);
      innerTx.sign(signer);

      const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
        feeSource,
        "200",
        innerTx,
        networkPassphrase,
      );

      const innerTxEnvelope = innerTx.toEnvelope();

      expect((innerTxEnvelope as any).arm()).toBe("v1");
      expect(innerTxEnvelope.v1().signatures()).toHaveLength(1);

      const v1Tx = innerTxEnvelope.v1().tx();
      const sourceAccountEd25519 = Keypair.fromPublicKey(
        StrKey.encodeEd25519PublicKey(v1Tx.sourceAccount().ed25519()),
      )
        .xdrAccountId()
        .value();
      const v0Tx = new xdr.TransactionV0({
        sourceAccountEd25519: sourceAccountEd25519,
        fee: v1Tx.fee(),
        seqNum: v1Tx.seqNum(),
        timeBounds: v1Tx.cond().timeBounds(),
        memo: v1Tx.memo(),
        operations: v1Tx.operations(),
        ext: new xdr.TransactionV0Ext(0),
      });
      const innerV0TxEnvelope = xdr.TransactionEnvelope.envelopeTypeTxV0(
        new xdr.TransactionV0Envelope({
          tx: v0Tx,
          signatures: innerTxEnvelope.v1().signatures(),
        }),
      );
      expect(innerV0TxEnvelope.v0().signatures()).toHaveLength(1);

      const feeBumpV0Tx = TransactionBuilder.buildFeeBumpTransaction(
        feeSource,
        "200",
        new Transaction(innerV0TxEnvelope, networkPassphrase),
        networkPassphrase,
      );

      expect(feeBumpTx.toXDR()).toBe(feeBumpV0Tx.toXDR());
    });
  });

  describe(".fromXDR", () => {
    it("builds a fee bump transaction", () => {
      const xdrStr =
        "AAAABQAAAADgSJG2GOUMy/H9lHyjYZOwyuyytH8y0wWaoc596L+bEgAAAAAAAADIAAAAAgAAAABzdv3ojkzWHMD7KUoXhrPx0GH18vHKV0ZfqpMiEblG1gAAAGQAAAAAAAAACAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAA9IYXBweSBiaXJ0aGRheSEAAAAAAQAAAAAAAAABAAAAAOBIkbYY5QzL8f2UfKNhk7DK7LK0fzLTBZqhzn3ov5sSAAAAAAAAAASoF8gAAAAAAAAAAAERuUbWAAAAQK933Dnt1pxXlsf1B5CYn81PLxeYsx+MiV9EGbMdUfEcdDWUySyIkdzJefjpR5ejdXVp/KXosGmNUQ+DrIBlzg0AAAAAAAAAAei/mxIAAABAijIIQpL6KlFefiL4FP8UWQktWEz4wFgGNSaXe7mZdVMuiREntehi1b7MRqZ1h+W+Y0y+Z2HtMunsilT2yS5mAA==";
      let tx = TransactionBuilder.fromXDR(xdrStr, Networks.TESTNET);

      expect(tx).toBeInstanceOf(FeeBumpTransaction);
      expect(tx.toXDR()).toBe(xdrStr);

      tx = TransactionBuilder.fromXDR(
        tx.toEnvelope(), // xdr object
        Networks.TESTNET,
      );

      expect(tx).toBeInstanceOf(FeeBumpTransaction);
      expect(tx.toXDR()).toBe(xdrStr);
    });
    it("builds a transaction", () => {
      const xdrStr =
        "AAAAAAW8Dk9idFR5Le+xi0/h/tU47bgC1YWjtPH1vIVO3BklAAAAZACoKlYAAAABAAAAAAAAAAEAAAALdmlhIGtleWJhc2UAAAAAAQAAAAAAAAAIAAAAAN7aGcXNPO36J1I8MR8S4QFhO79T5JGG2ZeS5Ka1m4mJAAAAAAAAAAFO3BklAAAAQP0ccCoeHdm3S7bOhMjXRMn3EbmETJ9glxpKUZjPSPIxpqZ7EkyTgl3FruieqpZd9LYOzdJrNik1GNBLhgTh/AU=";
      let tx = TransactionBuilder.fromXDR(xdrStr, Networks.TESTNET);

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx.toXDR()).toBe(xdrStr);

      tx = TransactionBuilder.fromXDR(
        tx.toEnvelope(), // xdr object
        Networks.TESTNET,
      );

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx.toXDR()).toBe(xdrStr);
    });
  });

  describe("muxed account support", () => {
    // Simultaneously, let's test some of the operations that should support
    // muxed accounts.
    const asset = Asset.native();
    const amount = "1000.0000000";

    const base = new Account(
      "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
      "1234",
    );
    const source = new MuxedAccount(base, "2");
    const destination = new MuxedAccount(base, "3").accountId();

    const PUBKEY_SRC = StrKey.decodeEd25519PublicKey(
      source.baseAccount().accountId(),
    );
    const MUXED_SRC_ID = xdr.Uint64.fromString(source.id());
    const networkPassphrase = "Standalone Network ; February 2017";
    const signer = Keypair.master(Networks.TESTNET);

    it("works with muxed accounts by default", () => {
      const operations = [
        Operation.payment({
          source: source.accountId(),
          destination: destination,
          amount: amount,
          asset: asset,
        }),
        Operation.clawback({
          source: source.baseAccount().accountId(),
          from: destination,
          amount: amount,
          asset: asset,
        }),
      ];

      const builder = new TransactionBuilder(source, {
        fee: "100",
        timebounds: { minTime: 0, maxTime: 0 },
        memo: new Memo(MemoText, "Testing muxed accounts"),
        networkPassphrase: networkPassphrase,
      });

      operations.forEach((op) => builder.addOperation(op));

      const tx = builder.build();
      tx.sign(signer);

      const envelope = tx.toEnvelope();
      const xdrTx = (envelope.value() as any).tx();

      const rawMuxedSourceAccount = xdrTx.sourceAccount();

      expect(rawMuxedSourceAccount.switch()).toBe(
        xdr.CryptoKeyType.keyTypeMuxedEd25519(),
      );

      const innerMux = rawMuxedSourceAccount.med25519();

      expect(innerMux.ed25519()).toEqual(PUBKEY_SRC);
      expect(encodeMuxedAccountToAddress(rawMuxedSourceAccount)).toBe(
        source.accountId(),
      );
      expect(innerMux.id()).toEqual(MUXED_SRC_ID);

      expect(source.sequenceNumber()).toBe("1235");
      expect(source.baseAccount().sequenceNumber()).toBe("1235");

      // it should decode muxed properties by default
      const decodedTx = TransactionBuilder.fromXDR(
        (tx as any).toXDR("base64"),
        networkPassphrase,
      ) as Transaction;
      expect(decodedTx.source).toBe(source.accountId());

      const paymentOp = decodedTx.operations[0] as any;

      if (paymentOp === undefined) throw new Error("expected paymentOp");

      expect(paymentOp.destination).toBe(destination);
      expect(paymentOp.source).toBe(source.accountId());

      // and unmuxed where appropriate
      const clawbackOp = decodedTx.operations[1] as any;

      if (clawbackOp === undefined) throw new Error("expected clawbackOp");

      expect(clawbackOp.source).toBe(source.baseAccount().accountId());
      expect(clawbackOp.from).toBe(destination);
    });

    it("does not regress js-stellar-sdk#646", () => {
      expect(() => {
        TransactionBuilder.fromXDR(
          "AAAAAgAAAABg/GhKJU5ut52ih6Klx0ymGvsac1FPJig1CHYqyesIHQAAJxACBmMCAAAADgAAAAAAAAABAAAAATMAAAAAAAABAAAAAQAAAABg/GhKJU5ut52ih6Klx0ymGvsac1FPJig1CHYqyesIHQAAAAAAAAAAqdkSiA5dzNXstOtkPkHd6dAMPMA+MSXwK8OlrAGCKasAAAAAAcnDgAAAAAAAAAAByesIHQAAAEAuLrTfW6D+HYlUD9y+JolF1qrb40hIRATzsQaQjchKJuhOZJjLO0d7oaTD3JZ4UL4vVKtV7TvV17rQgCQnuz8F",
          "Public Global Stellar Network ; September 2015",
        );
      }).not.toThrow();
    });

    it("works with fee-bump transactions", () => {
      // We create a non-muxed transaction, then fee-bump with a muxed source.
      const builder = new TransactionBuilder(source.baseAccount(), {
        fee: "100",
        timebounds: { minTime: 0, maxTime: 0 },
        networkPassphrase: networkPassphrase,
      });

      const muxed = MuxedAccount.fromAddress(destination, "0");
      const gAddress = muxed.baseAccount().accountId();

      builder.addOperation(
        Operation.payment({
          source: source.baseAccount().accountId(),
          destination: gAddress,
          amount: amount,
          asset: asset,
        }),
      );

      const tx = builder.build();
      tx.sign(signer);

      const feeTx = TransactionBuilder.buildFeeBumpTransaction(
        source.accountId(),
        "1000",
        tx,
        networkPassphrase,
      );

      expect(feeTx).toBeInstanceOf(FeeBumpTransaction);
      const envelope = feeTx.toEnvelope();
      const xdrTx = (envelope.value() as any).tx();

      const rawFeeSource = xdrTx.feeSource();

      expect(rawFeeSource.switch()).toBe(
        xdr.CryptoKeyType.keyTypeMuxedEd25519(),
      );

      const innerMux = rawFeeSource.med25519();
      expect(innerMux.ed25519()).toEqual(PUBKEY_SRC);
      expect(encodeMuxedAccountToAddress(rawFeeSource)).toBe(
        source.accountId(),
      );
      expect(innerMux.id()).toEqual(MUXED_SRC_ID);

      const decodedTx = TransactionBuilder.fromXDR(
        (feeTx as any).toXDR("base64"),
        networkPassphrase,
      ) as FeeBumpTransaction;
      expect(decodedTx.feeSource).toBe(source.accountId());

      const innerOp = decodedTx.innerTransaction.operations[0];

      if (innerOp === undefined) throw new Error("expected operation");

      expect(innerOp.source).toBe(source.baseAccount().accountId());
    });

    it("clones existing transactions", () => {
      const operations = [
        Operation.payment({
          source: source.accountId(),
          destination: destination,
          amount: amount,
          asset: asset,
        }),
        Operation.clawback({
          source: source.baseAccount().accountId(),
          from: destination,
          amount: amount,
          asset: asset,
        }),
      ];

      const op0 = operations[0];
      const op1 = operations[1];

      if (op0 === undefined || op1 === undefined)
        throw new Error("expected operations");

      const builder = new TransactionBuilder(source, {
        fee: "100",
        timebounds: { minTime: 0, maxTime: 0 },
        memo: new Memo(MemoText, "Testing cloning"),
        networkPassphrase,
      })
        .addOperation(op0)
        .addOperation(op1);

      const tx = builder.build();
      let cloneTx = TransactionBuilder.cloneFrom(tx).build();

      // Vitest toEqual doesn't support custom messages inline
      expect(cloneTx).toEqual(tx);

      cloneTx = TransactionBuilder.cloneFrom(tx, {
        fee: "10000",
      }).build();
      expect(cloneTx.fee).toBe("20000"); // double because two ops

      cloneTx = TransactionBuilder.cloneFrom(tx).clearOperations().build();
      expect(cloneTx.operations).toHaveLength(0);
    });

    it("adds operations at a specific index", () => {
      const builder = new TransactionBuilder(source, {
        fee: "100",
        timebounds: { minTime: 0, maxTime: 0 },
        memo: new Memo(MemoText, "Testing adding op at index"),
        networkPassphrase,
      });

      builder.addOperationAt(
        Operation.payment({
          source: source.accountId(),
          destination: destination,
          amount: "1",
          asset: asset,
        }),
        0,
      );

      builder.addOperationAt(
        Operation.payment({
          source: source.accountId(),
          destination: destination,
          amount: "2",
          asset: asset,
        }),
        1,
      );

      const tx = builder.build();
      // Assert operations
      expect(tx.operations.length).toBe(2);

      const txOp0 = tx.operations[0] as any;
      const txOp1 = tx.operations[1] as any;

      if (txOp0 === undefined || txOp1 === undefined)
        throw new Error("expected operations");

      expect(txOp0.source).toBe(source.accountId());
      expect(parseInt(txOp0.amount)).toBe(1);
      expect(txOp1.source).toBe(source.accountId());
      expect(parseInt(txOp1.amount)).toBe(2);

      const clonedTx = TransactionBuilder.cloneFrom(tx);
      clonedTx.clearOperationAt(0);
      const newOperation = Operation.payment({
        source: source.accountId(),
        destination: destination,
        amount: "3",
        asset: asset,
      });
      clonedTx.addOperationAt(newOperation, 0);
      const newTx = clonedTx.build();
      // Assert that the operations are the same, but the first one is updated
      expect(newTx.operations.length).toBe(2);

      const newOp0 = newTx.operations[0] as any;
      const newOp1 = newTx.operations[1] as any;

      if (newOp0 === undefined || newOp1 === undefined)
        throw new Error("expected operations");

      expect(newOp0.source).toBe(source.accountId());
      expect(parseInt(newOp0.amount)).toBe(3);
      expect(newOp1.source).toBe(source.accountId());
      expect(parseInt(newOp1.amount)).toBe(2);
    });
  });
});

describe("TransactionBuilder.cloneFrom", () => {
  const networkPassphrase = Networks.TESTNET;
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const destination =
    "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2";
  const op = Operation.payment({
    destination,
    asset: Asset.native(),
    amount: "100",
  });

  it("handles a total fee not evenly divisible by the operation count", () => {
    // TransactionBuilder always produces total fees divisible by op count,
    // but arbitrary network transactions can have any fee. Simulate one by
    // patching the XDR fee field directly to 1000 across 3 ops.
    // Previously: 1000/3 = 333.333..., scaled back up to 999.999... which
    // crashed with "XDR Write Error: invalid u32 value".
    const builtTx = new TransactionBuilder(source, {
      fee: "100",
      timebounds: { minTime: 0, maxTime: 0 },
      networkPassphrase,
    })
      .addOperation(op)
      .addOperation(op)
      .addOperation(op)
      .build();

    const envelope = builtTx.toEnvelope();
    envelope.v1().tx().fee(1000); // 1000 is not divisible by 3
    const tx = new Transaction(envelope, networkPassphrase);

    let cloneTx: Transaction;
    expect(() => {
      cloneTx = TransactionBuilder.cloneFrom(tx).build();
    }).not.toThrow();

    cloneTx = TransactionBuilder.cloneFrom(tx).build();
    // Math.floor(1000/3) = 333 per-op -> 333 * 3 = 999
    expect(cloneTx).toBeDefined();
    expect(expectDefined(cloneTx).fee).toBe("999");
  });

  it("throws when cloning a zero-operation transaction", () => {
    const zeroOpTx = new TransactionBuilder(source, {
      fee: "100",
      timebounds: { minTime: 0, maxTime: 0 },
      networkPassphrase,
    }).build();

    expect(() => TransactionBuilder.cloneFrom(zeroOpTx)).toThrow(
      /cannot clone a transaction with no operations/,
    );
  });

  it("preserves extraSigners", () => {
    const extraSigner =
      "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ";
    const tx = new TransactionBuilder(source, {
      fee: "100",
      timebounds: { minTime: 0, maxTime: 0 },
      networkPassphrase,
    })
      .addOperation(op)
      .setExtraSigners([extraSigner])
      .build();

    let cloneTx: Transaction | undefined;

    expect(() => {
      cloneTx = TransactionBuilder.cloneFrom(tx).build();
    }).not.toThrow();

    if (!cloneTx) throw new Error("expected cloneTx");
    if (!cloneTx.extraSigners) throw new Error("expected extraSigners");

    expect(cloneTx.extraSigners.map(SignerKey.encodeSignerKey)).toEqual([
      extraSigner,
    ]);
  });
});

// Additional coverage for setter methods and validation

describe("constructor timebounds/ledgerbounds validation", () => {
  const networkPassphrase = Networks.TESTNET;
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );

  describe("timebounds", () => {
    it("rejects inverted timebounds (minTime > non-zero maxTime)", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: 9999999999, maxTime: 500 },
        });
      }).toThrow("min_time cannot be greater than max_time");
    });

    it("rejects inverted Date timebounds", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: {
            minTime: new Date("2030-01-01"),
            maxTime: new Date("2020-01-01"),
          },
        });
      }).toThrow("min_time cannot be greater than max_time");
    });

    it("allows maxTime=0 (indefinite) with non-zero minTime", () => {
      const builder = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 1000, maxTime: 0 },
      });
      expect(builder.timebounds?.minTime).toBe(1000);
      expect(builder.timebounds?.maxTime).toBe(0);
    });

    it("allows equal minTime and maxTime", () => {
      const builder = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 1000, maxTime: 1000 },
      });
      expect(builder.timebounds?.minTime).toBe(1000);
      expect(builder.timebounds?.maxTime).toBe(1000);
    });

    it("rejects negative minTime", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: -1, maxTime: 500 },
        });
      }).toThrow("min_time cannot be negative");
    });

    it("rejects negative maxTime", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: 0, maxTime: -1 },
        });
      }).toThrow("max_time cannot be negative");
    });

    it("rejects non-numeric string minTime", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: "abc" as unknown as number, maxTime: 500 },
        });
      }).toThrow("timebounds value must be a finite integer or Date");
    });

    it("rejects invalid Date maxTime", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: 0, maxTime: new Date("invalid") },
        });
      }).toThrow("timebounds value must be a finite integer or Date");
    });

    it("rejects Infinity as a timebounds value", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: 0, maxTime: Infinity },
        });
      }).toThrow("timebounds value must be a finite integer or Date");
    });

    it("rejects non-integer float as a timebounds value", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: 1.5, maxTime: 500 },
        });
      }).toThrow("timebounds value must be a finite integer or Date");
    });
  });

  describe("ledgerbounds", () => {
    it("rejects inverted ledgerbounds (minLedger > non-zero maxLedger)", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: 0, maxTime: 0 },
          ledgerbounds: { minLedger: 5000, maxLedger: 100 },
        });
      }).toThrow("min_ledger cannot be greater than max_ledger");
    });

    it("allows maxLedger=0 (indefinite) with non-zero minLedger", () => {
      const builder = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
        ledgerbounds: { minLedger: 1000, maxLedger: 0 },
      });
      expect(builder.ledgerbounds?.minLedger).toBe(1000);
      expect(builder.ledgerbounds?.maxLedger).toBe(0);
    });

    it("rejects negative minLedger", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: 0, maxTime: 0 },
          ledgerbounds: { minLedger: -1, maxLedger: 100 },
        });
      }).toThrow("min_ledger cannot be negative");
    });

    it("rejects negative maxLedger", () => {
      expect(() => {
        new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
          timebounds: { minTime: 0, maxTime: 0 },
          ledgerbounds: { minLedger: 0, maxLedger: -1 },
        });
      }).toThrow("max_ledger cannot be negative");
    });
  });
});

describe("setTimebounds", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;

  it("accepts number parameters", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
    }).setTimebounds(0, 1000);

    expect(builder).toBeInstanceOf(TransactionBuilder);
  });

  it("accepts Date parameters", () => {
    const min = new Date("2020-01-01T00:00:00Z");
    const max = new Date("2030-01-01T00:00:00Z");
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
    }).setTimebounds(min, max);

    expect(builder).toBeInstanceOf(TransactionBuilder);
  });

  it("throws when already set", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      }).setTimebounds(0, 100);
    }).toThrow("TimeBounds has been already set");
  });

  it("throws for negative min_time", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
      }).setTimebounds(-1, 100);
    }).toThrow("min_time cannot be negative");
  });

  it("throws for negative max_time", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
      }).setTimebounds(0, -1);
    }).toThrow("max_time cannot be negative");
  });

  it("throws when min_time > max_time and max_time > 0", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
      }).setTimebounds(200, 100);
    }).toThrow("min_time cannot be greater than max_time");
  });
});

describe("setLedgerbounds", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;
  const op = Operation.payment({
    destination: "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
    asset: Asset.native(),
    amount: "100",
  });

  it("sets ledgerbounds successfully", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setLedgerbounds(0, 1000);

    expect(builder).toBeInstanceOf(TransactionBuilder);
  });

  it("throws when already set", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setLedgerbounds(0, 1000)
        .setLedgerbounds(0, 2000);
    }).toThrow("LedgerBounds has been already set");
  });

  it("throws for negative min_ledger", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setLedgerbounds(-1, 100);
    }).toThrow("min_ledger cannot be negative");
  });

  it("throws for negative max_ledger", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setLedgerbounds(0, -1);
    }).toThrow("max_ledger cannot be negative");
  });

  it("throws when min_ledger > max_ledger and max_ledger > 0", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setLedgerbounds(200, 100);
    }).toThrow("min_ledger cannot be greater than max_ledger");
  });
});

describe("setMinAccountSequence", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;
  const op = Operation.payment({
    destination: "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
    asset: Asset.native(),
    amount: "100",
  });

  it("sets min account sequence successfully", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setMinAccountSequence("5");

    expect(builder).toBeInstanceOf(TransactionBuilder);
  });

  it("throws when already set", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setMinAccountSequence("5")
        .setMinAccountSequence("10");
    }).toThrow("min_account_sequence has been already set");
  });
});

describe("setMinAccountSequenceAge", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;
  const op = Operation.payment({
    destination: "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
    asset: Asset.native(),
    amount: "100",
  });

  it("sets min account sequence age successfully", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setMinAccountSequenceAge(BigInt(100));

    expect(builder).toBeInstanceOf(TransactionBuilder);
  });

  it("throws for non-number value", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        // @ts-expect-error: intentionally passing string to test runtime validation
        .setMinAccountSequenceAge("100");
    }).toThrow("min_account_sequence_age must be a bigint");
  });

  it("throws when already set", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setMinAccountSequenceAge(BigInt(100))
        .setMinAccountSequenceAge(BigInt(200));
    }).toThrow("min_account_sequence_age has been already set");
  });

  it("throws for negative value", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setMinAccountSequenceAge(BigInt(-1));
    }).toThrow("min_account_sequence_age cannot be negative");
  });

  it("roundtrips with 0", () => {
    const transactionBuilder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setMinAccountSequenceAge(BigInt(0));
    console.log(transactionBuilder.build().minAccountSequenceAge);
    expect(
      TransactionBuilder.cloneFrom(transactionBuilder.build())
        .minAccountSequenceAge,
    ).toBe(BigInt(0));
  });
});

describe("setMinAccountSequenceLedgerGap", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;
  const op = Operation.payment({
    destination: "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
    asset: Asset.native(),
    amount: "100",
  });

  it("sets min account sequence ledger gap successfully", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setMinAccountSequenceLedgerGap(10);

    expect(builder).toBeInstanceOf(TransactionBuilder);
  });

  it("throws when already set", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setMinAccountSequenceLedgerGap(10)
        .setMinAccountSequenceLedgerGap(20);
    }).toThrow("min_account_sequence_ledger_gap has been already set");
  });

  it("throws for negative value", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setMinAccountSequenceLedgerGap(-1);
    }).toThrow("min_account_sequence_ledger_gap cannot be negative");
  });
  it("roundtrips with 0", () => {
    const transactionBuilder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setMinAccountSequenceLedgerGap(0);
    expect(
      TransactionBuilder.cloneFrom(transactionBuilder.build())
        .minAccountSequenceLedgerGap,
    ).toBe(0);
  });
});

describe("setExtraSigners", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;
  const op = Operation.payment({
    destination: "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
    asset: Asset.native(),
    amount: "100",
  });

  it("sets extra signers successfully", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setExtraSigners([
        "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
      ]);

    expect(builder).toBeInstanceOf(TransactionBuilder);
  });

  it("throws when not an array", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        // @ts-expect-error: intentionally passing string to test runtime validation
        .setExtraSigners("not-an-array");
    }).toThrow("extra_signers must be an array of strings.");
  });

  it("throws when already set", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setExtraSigners([
          "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
        ])
        .setExtraSigners([
          "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
        ]);
    }).toThrow("extra_signers has been already set");
  });

  it("throws when more than 2 elements", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .setExtraSigners([
          "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
          "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
          "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        ]);
    }).toThrow("extra_signers cannot be longer than 2 elements.");
  });
});

describe("hasV2Preconditions", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;
  const op = Operation.payment({
    destination: "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
    asset: Asset.native(),
    amount: "100",
  });

  it("returns false when no v2 preconditions are set", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    }).addOperation(op);

    expect(builder.hasV2Preconditions()).toBe(false);
  });

  it("returns true when ledgerbounds are set", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setLedgerbounds(0, 1000);

    expect(builder.hasV2Preconditions()).toBe(true);
  });

  it("returns true when minAccountSequence is set", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setMinAccountSequence("5");

    expect(builder.hasV2Preconditions()).toBe(true);
  });

  it("returns true when extraSigners are set", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: 0 },
    })
      .addOperation(op)
      .setExtraSigners([
        "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
      ]);

    expect(builder.hasV2Preconditions()).toBe(true);
  });
});

describe("setNetworkPassphrase", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );

  it("sets the network passphrase", () => {
    const builder = new TransactionBuilder(source, {
      fee: "100",
    }).setNetworkPassphrase(Networks.TESTNET);

    expect(builder).toBeInstanceOf(TransactionBuilder);
    expect(builder.networkPassphrase).toBe(Networks.TESTNET);
  });
});

describe("build with null networkPassphrase", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const op = Operation.payment({
    destination: "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
    asset: Asset.native(),
    amount: "100",
  });

  it("throws when networkPassphrase is not set", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(op)
        .build();
    }).toThrow("networkPassphrase must be set to build a transaction");
  });
});

describe("addSacTransferOperation with invalid destination", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;

  it("throws for invalid destination address", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      }).addSacTransferOperation("INVALID_ADDRESS", Asset.native(), "1000000");
    }).toThrow(
      "Invalid destination address. Must be a valid Stellar address or contract ID.",
    );
  });

  it("throws when destination is the same as source", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      }).addSacTransferOperation(
        "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
        Asset.native(),
        "1000000",
      );
    }).toThrow("Destination cannot be the same as the source account.");
  });

  it("throws when networkPassphrase is not set", () => {
    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        timebounds: { minTime: 0, maxTime: 0 },
      }).addSacTransferOperation(
        "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
        Asset.native(),
        "1000000",
      );
    }).toThrow("networkPassphrase must be set to add a SAC transfer operation");
  });

  it("succeeds with a muxed (M...) destination for native asset transfer", () => {
    const destKp = Keypair.random();
    const muxedDest = StrKey.encodeMed25519PublicKey(
      Buffer.concat([
        StrKey.decodeEd25519PublicKey(destKp.publicKey()),
        Buffer.alloc(8),
      ]),
    );

    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addSacTransferOperation(muxedDest, Asset.native(), "10000000")
        .setTimeout(TimeoutInfinite)
        .build();
    }).not.toThrow();
  });

  it("succeeds with a muxed (M...) destination for non-native asset transfer", () => {
    const destKp = Keypair.random();
    const muxedDest = StrKey.encodeMed25519PublicKey(
      Buffer.concat([
        StrKey.decodeEd25519PublicKey(destKp.publicKey()),
        Buffer.alloc(8),
      ]),
    );
    const asset = new Asset(
      "USDC",
      "GDJJRRMBK4IWLEPJGIE6SXD2LP7REGZODU7WDC3I2D6MR37F4XSHBKX2",
    );

    expect(() => {
      new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addSacTransferOperation(muxedDest, asset, "10000000")
        .setTimeout(TimeoutInfinite)
        .build();
    }).not.toThrow();
  });

  it("succeeds with a MuxedAccount source for native asset transfer", () => {
    const muxedSource = MuxedAccount.fromAddress(
      StrKey.encodeMed25519PublicKey(
        Buffer.concat([
          StrKey.decodeEd25519PublicKey(source.accountId()),
          Buffer.alloc(8),
        ]),
      ),
      source.sequenceNumber(),
    );
    const destKp = Keypair.random();

    expect(() => {
      new TransactionBuilder(muxedSource, {
        fee: "100",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addSacTransferOperation(destKp.publicKey(), Asset.native(), "10000000")
        .setTimeout(TimeoutInfinite)
        .build();
    }).not.toThrow();
  });
});

describe("fee overflow protection", () => {
  const source = new Account(
    "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ",
    "0",
  );
  const networkPassphrase = Networks.TESTNET;

  it("throws when baseFee * operations exceeds uint32 max", () => {
    // fee = 4294967295 * 2 = 8589934590 > uint32 max
    expect(() => {
      new TransactionBuilder(source, {
        fee: "4294967295",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(Operation.inflation({}))
        .addOperation(Operation.inflation({}))
        .build();
    }).toThrow(/fee/i);
  });

  it("allows fee exactly at uint32 max", () => {
    // fee = 4294967295 * 1 = 4294967295 = uint32 max (valid)
    expect(() => {
      new TransactionBuilder(source, {
        fee: "4294967295",
        networkPassphrase,
        timebounds: { minTime: 0, maxTime: 0 },
      })
        .addOperation(Operation.inflation({}))
        .build();
    }).not.toThrow();
  });
});
