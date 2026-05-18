import { describe, it, expect } from "vitest";
import * as StellarSdk from "../../src/index.js";
import { expectVariant } from "./base/support/xdr.js";

const {
  xdr,
  rpc,
  Address,
  Account,
  Asset,
  Networks,
  Operation,
  SorobanDataBuilder,
  StrKey,
  TimeoutInfinite,
  TransactionBuilder,
} = StellarSdk;

describe("assembleTransaction", () => {
  it("works with keybump transactions");

  const scAddress = new Address(
    "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
  ).toScAddress();

  const fnAuth = new xdr.SorobanAuthorizationEntry({
    // Include a credentials w/ a nonce to trigger this
    credentials: xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: scAddress,
        nonce: 0n,
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
  }).toXdr("base64");

  const sorobanTransactionData = new SorobanDataBuilder()
    .setResources(0, 5, 0)
    .setResourceFee("115")
    .build();

  const simulationResponse = {
    id: "test-simulation-id",
    transactionData: sorobanTransactionData.toXdr("base64"),
    events: [],
    minResourceFee: "115",
    results: [
      {
        auth: [fnAuth],
        xdr: xdr.ScVal.scvU32(0).toXdr("base64"),
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
      const v1 = expectVariant(result.toEnvelope(), "envelopeTypeTx").v1;
      expect(Number(v1.tx.fee)).toBe(215);

      // validate it updated sorobantransactiondata block in the tx ext
      const ext = expectVariant(v1.tx.ext, "sorobanData");
      expect(ext.sorobanData.toXdr("base64")).toEqual(
        sorobanTransactionData.toXdr("base64"),
      );
    });

    it("simulate adds the auth to the host function in tx operation", () => {
      const txn = singleContractFnTransaction(undefined);
      const result = rpc.assembleTransaction(txn, simulationResponse).build();

      const v1 = expectVariant(result.toEnvelope(), "envelopeTypeTx").v1;
      const opBody = v1.tx.operations[0]!.body;
      const invokeOp = expectVariant(
        opBody,
        "invokeHostFunction",
      ).invokeHostFunctionOp;
      const fn = expectVariant(
        invokeOp.auth[0]!.rootInvocation.function,
        "sorobanAuthorizedFunctionTypeContractFn",
      ).contractFn;
      expect(fn.functionName).toBe("fn");

      const credAddr = expectVariant(
        invokeOp.auth[0]!.credentials,
        "sorobanCredentialsAddress",
      ).address;
      const accountKey = expectVariant(
        credAddr.address,
        "scAddressTypeAccount",
      ).accountId;
      expect(StrKey.encodeEd25519PublicKey(Buffer.from(accountKey.value))).toBe(
        "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      );
    });

    it("simulate ignores non auth from simulation", () => {
      const txn = singleContractFnTransaction(undefined);
      const simulateResp = JSON.parse(JSON.stringify(simulationResponse));
      simulateResp.results[0].auth = null;
      const result = rpc.assembleTransaction(txn, simulateResp).build();

      const v1 = expectVariant(result.toEnvelope(), "envelopeTypeTx").v1;
      const invokeOp = expectVariant(
        v1.tx.operations[0]!.body,
        "invokeHostFunction",
      ).invokeHostFunctionOp;
      expect(invokeOp.auth).toHaveLength(0);
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
        xdr.SorobanAuthorizationEntry.fromXdr(fnAuth, "base64"),
        xdr.SorobanAuthorizationEntry.fromXdr(fnAuth, "base64"),
        xdr.SorobanAuthorizationEntry.fromXdr(fnAuth, "base64"),
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
        const finalFee = Number(
          expectVariant(result.toEnvelope(), "envelopeTypeTx").v1.tx.fee,
        );

        // assembleTransaction should strip old resourceFee from tx.fee (600 - 500 = 100),
        // then build() adds the new resourceFee (100 + 115 = 215)
        expect(finalFee).toBe(100 + newResourceFee);
      });

      it("handles re-assembly with a higher classic fee", () => {
        const txn = txWithPreExistingSorobanData("300");
        // tx.fee = 300 + oldResourceFee = 800
        expect(parseInt(txn.fee)).toBe(300 + oldResourceFee);

        const result = rpc.assembleTransaction(txn, simulationResponse).build();
        const finalFee = Number(
          expectVariant(result.toEnvelope(), "envelopeTypeTx").v1.tx.fee,
        );

        // 800 - 500 = 300 classic, then build() adds 115 = 415
        expect(finalFee).toBe(300 + newResourceFee);
      });

      it("assembling twice produces the same fee as assembling once", () => {
        // First assembly: no pre-existing soroban data
        const freshTxn = singleContractFnTransaction(undefined);
        const firstAssembly = rpc
          .assembleTransaction(freshTxn, simulationResponse)
          .build();
        const feeAfterFirst = Number(
          expectVariant(firstAssembly.toEnvelope(), "envelopeTypeTx").v1.tx.fee,
        );

        // Second assembly: re-assemble the already-assembled transaction
        const secondAssembly = rpc
          .assembleTransaction(firstAssembly, simulationResponse)
          .build();
        const feeAfterSecond = Number(
          expectVariant(secondAssembly.toEnvelope(), "envelopeTypeTx").v1.tx
            .fee,
        );

        // Should be identical — no double-counting
        expect(feeAfterSecond).toBe(feeAfterFirst);
      });
    });
  });
});
