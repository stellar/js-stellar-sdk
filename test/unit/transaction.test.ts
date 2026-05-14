import { describe, it, expect } from "vitest";
import {
  xdr,
  rpc,
  Account,
  Address,
  Asset,
  Networks,
  Operation,
  SorobanDataBuilder,
  StrKey,
  TimeoutInfinite,
  TransactionBuilder,
} from "../../src/index.js";

describe("assembleTransaction", () => {
  it("works with keybump transactions");

  const scAddress = new Address(
    "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
  ).toScAddress();

  const fnAuth = xdr.SorobanAuthorizationEntry.toXDR(
    {
      // Include a credentials w/ a nonce to trigger this
      credentials: xdr.SorobanCredentials.sorobanCredentialsAddress({
        address: scAddress,
        nonce: BigInt(0),
        signatureExpirationLedger: 1,
        signature: xdr.ScVal.scvVoid(),
      }),
      // And a basic invocation
      rootInvocation: {
        function:
          xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
            {
              contractAddress: scAddress,
              functionName: "fn",
              args: [],
            },
          ),
        subInvocations: [],
      },
    },
    "base64",
  );

  const sorobanTransactionData = new SorobanDataBuilder()
    .setResources(0, 5, 0)
    .setResourceFee("115")
    .build();

  const simulationResponse = {
    id: "test-simulation-id",
    transactionData: xdr.SorobanTransactionData.toXDR(
      sorobanTransactionData,
      "base64",
    ),
    events: [],
    minResourceFee: "115",
    results: [
      {
        auth: [fnAuth],
        xdr: xdr.ScVal.toXDR(xdr.ScVal.scvU32(0), "base64"),
      },
    ],
    latestLedger: 3,
    cost: {
      cpuInsns: "0",
      memBytes: "0",
    },
  };

  describe("Transaction", () => {
    const networkPassphrase = Networks.TESTNET;
    const source = new Account(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      "1",
    );

    function singleContractFnTransaction(auth: any) {
      return new TransactionBuilder(source, { fee: "100" })
        .setNetworkPassphrase(networkPassphrase)
        .setTimeout(TimeoutInfinite)
        .addOperation(
          Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract({
              contractAddress: scAddress,
              functionName: "hello",
              args: [xdr.ScVal.scvString("hello")],
            }),
            auth: auth ?? [],
          }),
        )
        .build();
    }

    it("simulate updates the tx data from simulation response", () => {
      const txn = singleContractFnTransaction(undefined);
      const result = rpc.assembleTransaction(txn, simulationResponse).build();

      // validate it auto updated the tx fees from sim response fees
      // since it was greater than tx.fee
      const envelope = result.toEnvelope();
      if (envelope.type !== "envelopeTypeTx") {
        throw new Error("Expected v1 envelope");
      }
      expect(envelope.v1.tx.fee).toBe(215);

      // validate it updated sorobantransactiondata block in the tx ext
      if (envelope.v1.tx.ext.type !== "sorobanData") {
        throw new Error("Expected sorobanData in tx ext");
      }
      expect(envelope.v1.tx.ext.sorobanData).toEqual(sorobanTransactionData);
    });

    it("simulate adds the auth to the host function in tx operation", () => {
      const txn = singleContractFnTransaction(undefined);
      const result = rpc.assembleTransaction(txn, simulationResponse).build();
      const envelope = result.toEnvelope();
      if (envelope.type !== "envelopeTypeTx") {
        throw new Error("Expected v1 envelope");
      }
      const op = envelope.v1.tx.operations[0];
      if (op.body.type !== "invokeHostFunction") {
        throw new Error("Expected invokeHostFunction operation");
      }
      const auth = op.body.invokeHostFunctionOp.auth[0];

      const rootInvocation = auth.rootInvocation;
      if (
        rootInvocation.function.type !==
        "sorobanAuthorizedFunctionTypeContractFn"
      ) {
        throw new Error("Expected auth entry in operation");
      }
      expect(rootInvocation.function.contractFn.functionName).toBe("fn");

      const credentials = auth.credentials;
      if (credentials.type !== "sorobanCredentialsAddress") {
        throw new Error("Expected address credentials");
      }
      if (credentials.address.address.type !== "scAddressTypeAccount") {
        throw new Error("Expected accountId address in credentials");
      }
      expect(
        StrKey.encodeEd25519PublicKey(
          Buffer.from(credentials.address.address.accountId.ed25519),
        ),
      ).toBe("GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI");
    });

    it("simulate ignores non auth from simulation", () => {
      const txn = singleContractFnTransaction(undefined);
      const simulateResp = JSON.parse(JSON.stringify(simulationResponse));
      simulateResp.results[0].auth = null;
      const result = rpc.assembleTransaction(txn, simulateResp).build();
      const envelope = result.toEnvelope();
      if (envelope.type !== "envelopeTypeTx") {
        throw new Error("Expected v1 envelope");
      }
      const txBody = envelope.v1.tx;
      if (txBody.operations[0].body.type !== "invokeHostFunction") {
        throw new Error("Expected invokeHostFunction operation");
      }
      expect(txBody.operations[0]!.body.invokeHostFunctionOp.auth).toHaveLength(
        0,
      );
    });

    it("throws for non-Soroban ops", () => {
      const txn = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
      })
        .addOperation(
          Operation.changeTrust({
            asset: Asset.native(),
          }),
        )
        .setTimeout(TimeoutInfinite)
        .build();

      expect(() => {
        rpc
          .assembleTransaction(txn, {
            id: "test-id",
            transactionData: "",
            events: [],
            minResourceFee: "0",
            results: [],
            latestLedger: 3,
          })
          .build();
        expect.fail();
      }).toThrow(/unsupported transaction/i);
    });

    it("works for all Soroban ops", () => {
      [
        Operation.invokeContractFunction({
          contract: Asset.native().contractId(Networks.TESTNET),
          function: "hello",
          args: [],
        }),
        Operation.extendFootprintTtl({ extendTo: 27 }),
        Operation.restoreFootprint({}),
      ].forEach((op) => {
        const txn = new TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
        })
          .setTimeout(TimeoutInfinite)
          .addOperation(op)
          .build();

        const tx = rpc.assembleTransaction(txn, simulationResponse).build();
        expect(tx.operations[0]!.type).toEqual(op.body.type);
      });
    });

    it("doesn't overwrite auth if it's present", () => {
      const authEntries = [
        xdr.SorobanAuthorizationEntry.fromXDR(fnAuth, "base64"),
        xdr.SorobanAuthorizationEntry.fromXDR(fnAuth, "base64"),
        xdr.SorobanAuthorizationEntry.fromXDR(fnAuth, "base64"),
      ];
      const txn = singleContractFnTransaction(authEntries);
      const tx = rpc.assembleTransaction(txn, simulationResponse).build();

      expect(
        (tx.operations[0] as any).auth.length,
        `auths aren't preserved after simulation: ${simulationResponse}, ${tx}`,
      ).toEqual(3);
    });

    describe("fee handling with pre-existing soroban data", () => {
      const oldResourceFee = 500;
      const newResourceFee = 115; // from simulationResponse.minResourceFee

      // Build soroban data with a non-zero resourceFee to simulate
      // a transaction that was previously assembled/simulated
      const preExistingSorobanData = new SorobanDataBuilder()
        .setResources(0, 5, 0)
        .setResourceFee(oldResourceFee)
        .build();

      function txWithPreExistingSorobanData(fee: string) {
        return new TransactionBuilder(source, {
          fee,
          networkPassphrase,
        })
          .setTimeout(TimeoutInfinite)
          .setSorobanData(preExistingSorobanData)
          .addOperation(
            Operation.invokeHostFunction({
              func: xdr.HostFunction.hostFunctionTypeInvokeContract({
                contractAddress: scAddress,
                functionName: "hello",
                args: [xdr.ScVal.scvString("hello")],
              }),
              auth: [],
            }),
          )
          .build();
      }

      it("subtracts old resourceFee from raw.fee to avoid double-counting", () => {
        // Build with fee=100. After build(), the tx.fee = 100 + oldResourceFee = 600.
        const txn = txWithPreExistingSorobanData("100");
        expect(parseInt(txn.fee)).toBe(100 + oldResourceFee);

        const result = rpc.assembleTransaction(txn, simulationResponse).build();
        const envelope = result.toEnvelope();
        if (envelope.type !== "envelopeTypeTx") {
          throw new Error("Expected v1 envelope");
        }
        const finalFee = envelope.v1.tx.fee;

        // assembleTransaction should strip old resourceFee from tx.fee (600 - 500 = 100),
        // then build() adds the new resourceFee (100 + 115 = 215)
        expect(finalFee).toBe(100 + newResourceFee);
      });

      it("handles re-assembly with a higher classic fee", () => {
        const txn = txWithPreExistingSorobanData("300");
        // tx.fee = 300 + oldResourceFee = 800
        expect(parseInt(txn.fee)).toBe(300 + oldResourceFee);

        const result = rpc.assembleTransaction(txn, simulationResponse).build();
        const envelope = result.toEnvelope();
        if (envelope.type !== "envelopeTypeTx") {
          throw new Error("Expected v1 envelope");
        }
        const finalFee = envelope.v1.tx.fee;

        // 800 - 500 = 300 classic, then build() adds 115 = 415
        expect(finalFee).toBe(300 + newResourceFee);
      });

      it("assembling twice produces the same fee as assembling once", () => {
        // First assembly: no pre-existing soroban data
        const freshTxn = singleContractFnTransaction(undefined);
        const firstAssembly = rpc
          .assembleTransaction(freshTxn, simulationResponse)
          .build();
        const firstEnvelope = firstAssembly.toEnvelope();
        if (firstEnvelope.type !== "envelopeTypeTx") {
          throw new Error("Expected v1 envelope");
        }
        const feeAfterFirst = firstEnvelope.v1.tx.fee;

        // Second assembly: re-assemble the already-assembled transaction
        const secondAssembly = rpc
          .assembleTransaction(firstAssembly, simulationResponse)
          .build();
        const secondEnvelope = secondAssembly.toEnvelope();
        if (secondEnvelope.type !== "envelopeTypeTx") {
          throw new Error("Expected v1 envelope");
        }
        const feeAfterSecond = secondEnvelope.v1.tx.fee;

        // Should be identical — no double-counting
        expect(feeAfterSecond).toBe(feeAfterFirst);
      });
    });
  });
});
