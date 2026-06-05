import { describe, it, expect } from "vitest";
import * as StellarSdk from "../../src/index.js";

const { xdr, rpc } = StellarSdk;

describe("assembleTransaction", () => {
  it("works with keybump transactions");

  const scAddress = new StellarSdk.Address(
    "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
  ).toScAddress();

  const fnAuth = new xdr.SorobanAuthorizationEntry({
    // Include a credentials w/ a nonce to trigger this
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: scAddress,
        nonce: new xdr.Int64(0),
        signatureExpirationLedger: 1,
        signature: xdr.ScVal.scvVoid(),
      }),
    ),
    // And a basic invocation
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new xdr.InvokeContractArgs({
            contractAddress: scAddress,
            functionName: "fn",
            args: [],
          }),
        ),
      subInvocations: [],
    }),
  }).toXDR("base64");

  const sorobanTransactionData = new StellarSdk.SorobanDataBuilder()
    .setResources(0, 5, 0)
    .setResourceFee("115")
    .build();

  const simulationResponse = {
    id: "test-simulation-id",
    transactionData: sorobanTransactionData.toXDR("base64"),
    events: [],
    minResourceFee: "115",
    results: [
      {
        auth: [fnAuth],
        xdr: xdr.ScVal.scvU32(0).toXDR("base64"),
      },
    ],
    latestLedger: 3,
    cost: {
      cpuInsns: "0",
      memBytes: "0",
    },
  };

  describe("Transaction", () => {
    const networkPassphrase = StellarSdk.Networks.TESTNET;
    const source = new StellarSdk.Account(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      "1",
    );

    function singleContractFnTransaction(auth: any) {
      return new StellarSdk.TransactionBuilder(source, { fee: "100" })
        .setNetworkPassphrase(networkPassphrase)
        .setTimeout(StellarSdk.TimeoutInfinite)
        .addOperation(
          StellarSdk.Operation.invokeHostFunction({
            func: xdr.HostFunction.hostFunctionTypeInvokeContract(
              new xdr.InvokeContractArgs({
                contractAddress: scAddress,
                functionName: "hello",
                args: [xdr.ScVal.scvString("hello")],
              }),
            ),
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
      expect(result.toEnvelope().v1().tx().fee()).toBe(215);

      // validate it updated sorobantransactiondata block in the tx ext
      expect(result.toEnvelope().v1().tx().ext().sorobanData()).toEqual(
        sorobanTransactionData,
      );
    });

    it("simulate adds the auth to the host function in tx operation", () => {
      const txn = singleContractFnTransaction(undefined);
      const result = rpc.assembleTransaction(txn, simulationResponse).build();

      expect(
        result
          .toEnvelope()
          .v1()
          .tx()
          .operations()[0]!
          .body()
          .invokeHostFunctionOp()
          .auth()[0]!
          .rootInvocation()
          .function()
          .contractFn()
          .functionName()
          .toString(),
      ).toBe("fn");

      expect(
        StellarSdk.StrKey.encodeEd25519PublicKey(
          result
            .toEnvelope()
            .v1()
            .tx()
            .operations()[0]!
            .body()
            .invokeHostFunctionOp()
            .auth()[0]!
            .credentials()
            .address()
            .address()
            .accountId()
            .ed25519(),
        ),
      ).toBe("GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI");
    });

    it("simulate ignores non auth from simulation", () => {
      const txn = singleContractFnTransaction(undefined);
      const simulateResp = JSON.parse(JSON.stringify(simulationResponse));
      simulateResp.results[0].auth = null;
      const result = rpc.assembleTransaction(txn, simulateResp).build();

      expect(
        result
          .toEnvelope()
          .v1()
          .tx()
          .operations()[0]!
          .body()
          .invokeHostFunctionOp()
          .auth(),
      ).toHaveLength(0);
    });

    it("throws for non-Soroban ops", () => {
      const txn = new StellarSdk.TransactionBuilder(source, {
        fee: "100",
        networkPassphrase,
      })
        .addOperation(
          StellarSdk.Operation.changeTrust({
            asset: StellarSdk.Asset.native(),
          }),
        )
        .setTimeout(StellarSdk.TimeoutInfinite)
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
        StellarSdk.Operation.invokeContractFunction({
          contract: StellarSdk.Asset.native().contractId(
            StellarSdk.Networks.TESTNET,
          ),
          function: "hello",
          args: [],
        }),
        StellarSdk.Operation.extendFootprintTtl({ extendTo: 27 }),
        StellarSdk.Operation.restoreFootprint({}),
      ].forEach((op) => {
        const txn = new StellarSdk.TransactionBuilder(source, {
          fee: "100",
          networkPassphrase,
        })
          .setTimeout(StellarSdk.TimeoutInfinite)
          .addOperation(op)
          .build();

        const tx = rpc.assembleTransaction(txn, simulationResponse).build();
        expect(tx.operations[0]!.type).toEqual(op.body().switch().name);
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
      const preExistingSorobanData = new StellarSdk.SorobanDataBuilder()
        .setResources(0, 5, 0)
        .setResourceFee(oldResourceFee)
        .build();

      function txWithPreExistingSorobanData(fee: string) {
        return new StellarSdk.TransactionBuilder(source, {
          fee,
          networkPassphrase,
        })
          .setTimeout(StellarSdk.TimeoutInfinite)
          .setSorobanData(preExistingSorobanData)
          .addOperation(
            StellarSdk.Operation.invokeHostFunction({
              func: xdr.HostFunction.hostFunctionTypeInvokeContract(
                new xdr.InvokeContractArgs({
                  contractAddress: scAddress,
                  functionName: "hello",
                  args: [xdr.ScVal.scvString("hello")],
                }),
              ),
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
        const finalFee = result.toEnvelope().v1().tx().fee();

        // assembleTransaction should strip old resourceFee from tx.fee (600 - 500 = 100),
        // then build() adds the new resourceFee (100 + 115 = 215)
        expect(finalFee).toBe(100 + newResourceFee);
      });

      it("handles re-assembly with a higher classic fee", () => {
        const txn = txWithPreExistingSorobanData("300");
        // tx.fee = 300 + oldResourceFee = 800
        expect(parseInt(txn.fee)).toBe(300 + oldResourceFee);

        const result = rpc.assembleTransaction(txn, simulationResponse).build();
        const finalFee = result.toEnvelope().v1().tx().fee();

        // 800 - 500 = 300 classic, then build() adds 115 = 415
        expect(finalFee).toBe(300 + newResourceFee);
      });

      it("assembling twice produces the same fee as assembling once", () => {
        // First assembly: no pre-existing soroban data
        const freshTxn = singleContractFnTransaction(undefined);
        const firstAssembly = rpc
          .assembleTransaction(freshTxn, simulationResponse)
          .build();
        const feeAfterFirst = firstAssembly.toEnvelope().v1().tx().fee();

        // Second assembly: re-assemble the already-assembled transaction
        const secondAssembly = rpc
          .assembleTransaction(firstAssembly, simulationResponse)
          .build();
        const feeAfterSecond = secondAssembly.toEnvelope().v1().tx().fee();

        // Should be identical — no double-counting
        expect(feeAfterSecond).toBe(feeAfterFirst);
      });
    });
  });
});
