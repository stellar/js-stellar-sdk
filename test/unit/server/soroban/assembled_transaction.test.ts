import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import { serverUrl } from "../../../constants.js";
import * as StellarSdk from "../../../../src/index.js";
import * as xdr from "../../../../src/xdr/index.js";
import { expectDefined } from "../../base/support/expect_defined.js";
import { expectVariant } from "../../base/support/xdr.js";

const {
  Account,
  Keypair,
  Operation,
  TransactionBuilder,
  TimeoutInfinite,
  rpc,
  contract,
  SorobanDataBuilder,
  Address,
} = StellarSdk;
const { Server } = rpc;

const restoreTxnData = SorobanDataBuilder.fromXdr(
  "AAAAAAAAAAAAAAAEAAAABgAAAAHZ4Y4l0GNoS97QH0fa5Jbbm61Ou3t9McQ09l7wREKJYwAAAA8AAAAJUEVSU19DTlQxAAAAAAAAAQAAAAYAAAAB2eGOJdBjaEve0B9H2uSW25utTrt7fTHENPZe8ERCiWMAAAAPAAAACVBFUlNfQ05UMgAAAAAAAAEAAAAGAAAAAdnhjiXQY2hL3tAfR9rkltubrU67e30xxDT2XvBEQoljAAAAFAAAAAEAAAAH+BoQswzzGTKRzrdC6axxKaM4qnyDP8wgQv8Id3S4pbsAAAAAAAAGNAAABjQAAAAAAADNoQ==",
);

describe("AssembledTransaction", () => {
  let mockPost: any;
  let server: any;
  const keypair = Keypair.random();
  const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
  const networkPassphrase = "Standalone Network ; February 2017";
  const wallet = contract.basicNodeSigner(keypair, networkPassphrase);
  let options: any; // Declare but don't initialize

  beforeEach(() => {
    server = new Server(serverUrl);
    mockPost = vi.spyOn(server.httpClient, "post");
    options = {
      networkPassphrase,
      contractId,
      rpcUrl: serverUrl,
      allowHttp: true,
      publicKey: keypair.publicKey(),
      server,
      ...wallet,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("buildFootprintRestoreTransaction makes expected RPC calls", async () => {
    const simulateTransactionResponse = {
      transactionData: restoreTxnData,
      minResourceFee: "52641",
      cost: { cpuInsns: "0", memBytes: "0" },
      latestLedger: 17027,
    };

    const sendTransactionResponse = {
      status: "PENDING",
      hash: "05870e35fc94e5424f72d125959760b5f60631d91452bde2d11126fb5044e35d",
      latestLedger: 17034,
      latestLedgerCloseTime: "1716483573",
    };
    const getTransactionResponse = {
      status: "SUCCESS",
      latestLedger: 17037,
      latestLedgerCloseTime: "1716483576",
      oldestLedger: 15598,
      oldestLedgerCloseTime: "1716482133",
      applicationOrder: 1,
      envelopeXdr:
        "AAAAAgAAAAARwpJYOq4lKj/RdtS7ds3ciGSMfZUp+7d4xgg9vsN7qQABm0IAAAvWAAAAAwAAAAEAAAAAAAAAAAAAAABmT3cbAAAAAAAAAAEAAAAAAAAAGgAAAAAAAAABAAAAAAAAAAAAAAAEAAAABgAAAAHZ4Y4l0GNoS97QH0fa5Jbbm61Ou3t9McQ09l7wREKJYwAAAA8AAAAJUEVSU19DTlQxAAAAAAAAAQAAAAYAAAAB2eGOJdBjaEve0B9H2uSW25utTrt7fTHENPZe8ERCiWMAAAAPAAAACVBFUlNfQ05UMgAAAAAAAAEAAAAGAAAAAdnhjiXQY2hL3tAfR9rkltubrU67e30xxDT2XvBEQoljAAAAFAAAAAEAAAAH+BoQswzzGTKRzrdC6axxKaM4qnyDP8wgQv8Id3S4pbsAAAAAAAAGNAAABjQAAAAAAADNoQAAAAG+w3upAAAAQGBfsx+gyi/2Dh6i+7Vbb6Ongw3HDcFDZ48eoadkUUvkq97zdPe3wYGFswZgT5/GXPqGDBi+iqHuZiYx5eSy3Qk=",
      resultXdr: "AAAAAAAAiRkAAAAAAAAAAQAAAAAAAAAaAAAAAAAAAAA=",
      resultMetaXdr:
        "AAAAAwAAAAAAAAACAAAAAwAAQowAAAAAAAAAABHCklg6riUqP9F21Lt2zdyIZIx9lSn7t3jGCD2+w3upAAAAF0h1Pp0AAAvWAAAAAgAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAAAMMQAAAABmTz9yAAAAAAAAAAEAAEKMAAAAAAAAAAARwpJYOq4lKj/RdtS7ds3ciGSMfZUp+7d4xgg9vsN7qQAAABdIdT6dAAAL1gAAAAMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAQowAAAAAZk919wAAAAAAAAABAAAACAAAAAMAAAwrAAAACc4pIDe7y0sRFHAghrdpB7ypfj4BVuZStvX4u0BC1S/YAAANVgAAAAAAAAABAABCjAAAAAnOKSA3u8tLERRwIIa3aQe8qX4+AVbmUrb1+LtAQtUv2AAAQ7cAAAAAAAAAAwAADCsAAAAJikpmJa7Pr3lTb+dhRP2N4TOYCqK4tL4tQhDYnNEijtgAAA1WAAAAAAAAAAEAAEKMAAAACYpKZiWuz695U2/nYUT9jeEzmAqiuLS+LUIQ2JzRIo7YAABDtwAAAAAAAAADAAAMMQAAAAlT7LdEin/CaQA3iscHqkwnEFlSh8jfTPTIhSQ5J8Ao0wAADVwAAAAAAAAAAQAAQowAAAAJU+y3RIp/wmkAN4rHB6pMJxBZUofI30z0yIUkOSfAKNMAAEO3AAAAAAAAAAMAAAwxAAAACQycyCYjh7j9CHnTm9OKCYXhgmXw6jdtoMsGHyPk8Aa+AAANXAAAAAAAAAABAABCjAAAAAkMnMgmI4e4/Qh505vTigmF4YJl8Oo3baDLBh8j5PAGvgAAQ7cAAAAAAAAAAgAAAAMAAEKMAAAAAAAAAAARwpJYOq4lKj/RdtS7ds3ciGSMfZUp+7d4xgg9vsN7qQAAABdIdT6dAAAL1gAAAAMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAQowAAAAAZk919wAAAAAAAAABAABCjAAAAAAAAAAAEcKSWDquJSo/0XbUu3bN3IhkjH2VKfu3eMYIPb7De6kAAAAXSHWDiQAAC9YAAAADAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAwAAAAAAAEKMAAAAAGZPdfcAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAA",
      ledger: 17036,
      createdAt: "1716483575",
    };

    // Mock the sequence of calls
    mockPost
      .mockResolvedValueOnce({ data: { result: simulateTransactionResponse } }) // simulateTransaction
      .mockResolvedValueOnce({ data: { result: sendTransactionResponse } }) // sendTransaction
      .mockResolvedValueOnce({ data: { result: getTransactionResponse } }); // getTransaction

    const txn = await contract.AssembledTransaction[
      "buildFootprintRestoreTransaction"
    ](
      options,
      restoreTxnData,
      new Account(
        "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
        "1",
      ),
      "52641",
    );
    const result = await txn.signAndSend({ ...wallet });
    expect(expectDefined(result.getTransactionResponse).status).toBe(
      rpc.Api.GetTransactionStatus.SUCCESS,
    );

    // Verify the calls were made with correct parameters
    expect(mockPost).toHaveBeenCalledWith(
      serverUrl,
      expect.objectContaining({
        jsonrpc: "2.0",
        id: 1,
        method: "simulateTransaction",
      }),
    );
    expect(mockPost).toHaveBeenCalledWith(
      serverUrl,
      expect.objectContaining({
        jsonrpc: "2.0",
        id: 1,
        method: "sendTransaction",
      }),
    );
    expect(mockPost).toHaveBeenCalledWith(
      serverUrl,
      expect.objectContaining({
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
      }),
    );
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it("passes useUpgradedAuth through to simulateTransaction", async () => {
    const simulateTransactionResponse = {
      transactionData: restoreTxnData,
      minResourceFee: "52641",
      cost: { cpuInsns: "0", memBytes: "0" },
      latestLedger: 17027,
    };
    mockPost.mockResolvedValue({
      data: { result: simulateTransactionResponse },
    });

    // set via options: flows through to every simulation
    options.useUpgradedAuth = true;
    const txn = await contract.AssembledTransaction[
      "buildFootprintRestoreTransaction"
    ](
      options,
      restoreTxnData,
      new Account(
        "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
        "1",
      ),
      "52641",
    );
    expect(mockPost).toHaveBeenLastCalledWith(
      serverUrl,
      expect.objectContaining({
        method: "simulateTransaction",
        params: expect.objectContaining({ useUpgradedAuth: true }),
      }),
    );

    // per-call value overrides the option
    await txn.simulate({ restore: false, useUpgradedAuth: false });
    expect(mockPost).toHaveBeenLastCalledWith(
      serverUrl,
      expect.objectContaining({
        method: "simulateTransaction",
        params: expect.objectContaining({ useUpgradedAuth: false }),
      }),
    );
  });

  it("throws an error if signing transaction without providing a public key", async () => {
    const simulateTransactionResponse = {
      id: "1",
      events: [],
      latestLedger: 3,
      minResourceFee: "15",
      transactionData: new SorobanDataBuilder()
        .setReadWrite([
          xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
              contract: Address.fromString(contractId).toScAddress(),
              key: xdr.ScVal.scvU32(0),
              durability: xdr.ContractDataDurability.persistent,
            }),
          ),
        ])
        .build(),
      results: [{ auth: [], xdr: xdr.ScVal.scvU32(0).toXdr("base64") }],
      stateChanges: [],
    };

    // Mock the sequence of calls
    mockPost.mockResolvedValueOnce({
      data: { result: simulateTransactionResponse },
    }); // simulateTransaction

    delete options.publicKey;
    options.method = "test";
    options.args = [];
    options.contractId = contractId;
    const txn = await contract.AssembledTransaction.build(options);
    expect(txn.sign({ ...wallet })).rejects.toThrow(
      contract.AssembledTransaction.Errors.FakeAccount,
    );
  });

  it("sign accepts a Keypair, a Signer, or a raw callback interchangeably", async () => {
    const simulateTransactionResponse = {
      id: "1",
      events: [],
      latestLedger: 3,
      minResourceFee: "15",
      transactionData: new SorobanDataBuilder()
        .setReadWrite([
          xdr.LedgerKey.contractData(
            new xdr.LedgerKeyContractData({
              contract: Address.fromString(contractId).toScAddress(),
              key: xdr.ScVal.scvU32(0),
              durability: xdr.ContractDataDurability.persistent,
            }),
          ),
        ])
        .build(),
      results: [{ auth: [], xdr: xdr.ScVal.scvU32(0).toXdr("base64") }],
      stateChanges: [],
    };
    mockPost.mockResolvedValue({
      data: { result: simulateTransactionResponse },
    });
    // The source account lookup isn't what's under test here, and each shape
    // rebuilds, so stub it rather than interleaving ledger-entry responses.
    vi.spyOn(server, "getAccount").mockResolvedValue(
      new Account(keypair.publicKey(), "1"),
    );

    options.method = "test";
    options.args = [];

    // Each shape rebuilds, so the timebounds (and therefore the signature)
    // differ between runs; assert each envelope is validly signed by the
    // keypair rather than comparing the envelopes to each other.
    const expectSignedByKeypair = async (signTransaction: any) => {
      const txn = await contract.AssembledTransaction.build(options);
      await txn.sign({ force: true, signTransaction });

      const signed = txn.signed;
      if (!signed) throw new Error("expected the transaction to be signed");
      expect(signed.signatures).toHaveLength(1);
      expect(
        keypair.verify(signed.hash(), signed.signatures[0].signature.value),
      ).toBe(true);
    };

    await expectSignedByKeypair(keypair);
    await expectSignedByKeypair(
      new contract.KeypairSigner(keypair, networkPassphrase),
    );
    await expectSignedByKeypair(wallet.signTransaction);
  });
});

describe("Contract ID validation on deserialization", () => {
  const networkPassphrase = "Standalone Network ; February 2017";
  const keypair = Keypair.random();
  const source = new Account(keypair.publicKey(), "0");

  const victimContractId =
    "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
  const attackerContractId =
    "CC53XO53XO53XO53XO53XO53XO53XO53XO53XO53XO53XO53XO53WQD5";

  const createSpec = (methodName: string) => {
    const funcSpec = xdr.ScSpecEntry.scSpecEntryFunctionV0(
      new xdr.ScSpecFunctionV0({
        doc: "",
        name: methodName,
        inputs: [],
        outputs: [xdr.ScSpecTypeDef.scSpecTypeU32()],
      }),
    );
    return new contract.Spec([funcSpec.toXdr("base64")]);
  };

  function buildInvokeTx(targetContractId: string, methodName: string) {
    return new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
    })
      .setTimeout(TimeoutInfinite)
      .addOperation(
        Operation.invokeContractFunction({
          contract: targetContractId,
          function: methodName,
          args: [],
        }),
      )
      .build();
  }

  it("fromXdr() accepts a transaction targeting the configured contract", () => {
    const tx = buildInvokeTx(victimContractId, "test");
    const xdrBase64 = tx.toEnvelope().toXdr("base64");
    const spec = createSpec("test");

    const assembled = contract.AssembledTransaction.fromXdr(
      {
        contractId: victimContractId,
        networkPassphrase,
        rpcUrl: "https://example.com",
      },
      xdrBase64,
      spec,
    );
    expect(assembled.built).toBeDefined();
  });

  it("fromXdr() rejects a transaction targeting a different contract", () => {
    const tx = buildInvokeTx(attackerContractId, "drain");
    const xdrBase64 = tx.toEnvelope().toXdr("base64");
    const spec = createSpec("drain");

    expect(() =>
      contract.AssembledTransaction.fromXdr(
        {
          contractId: victimContractId,
          networkPassphrase,
          rpcUrl: "https://example.com",
        },
        xdrBase64,
        spec,
      ),
    ).toThrow(
      `Transaction envelope targets contract ${attackerContractId}, but this Client is configured for ${victimContractId}.`,
    );
  });

  it("fromJson() accepts a transaction targeting the configured contract", () => {
    const tx = buildInvokeTx(victimContractId, "test");
    const spec = createSpec("test");
    const simulationResult = {
      auth: [],
      retval: xdr.ScVal.scvU32(0).toXdr("base64"),
    };
    const simulationTransactionData = new SorobanDataBuilder()
      .build()
      .toXdr("base64");

    const json = JSON.stringify({
      method: "test",
      tx: tx.toEnvelope().toXdr("base64"),
      simulationResult,
      simulationTransactionData,
    });

    const { method, ...txData } = JSON.parse(json);
    const assembled = contract.AssembledTransaction.fromJson(
      {
        contractId: victimContractId,
        networkPassphrase,
        rpcUrl: "https://example.com",
        method,
        parseResultXdr: (result: any) => spec.funcResToNative(method, result),
      },
      txData,
    );
    expect(assembled.built).toBeDefined();
  });

  it("fromJson() rejects a transaction targeting a different contract", () => {
    const tx = buildInvokeTx(attackerContractId, "drain");
    const simulationResult = {
      auth: [],
      retval: xdr.ScVal.scvU32(0).toXdr("base64"),
    };
    const simulationTransactionData = new SorobanDataBuilder()
      .build()
      .toXdr("base64");

    const json = JSON.stringify({
      method: "drain",
      tx: tx.toEnvelope().toXdr("base64"),
      simulationResult,
      simulationTransactionData,
    });

    const { method, ...txData } = JSON.parse(json);

    expect(() =>
      contract.AssembledTransaction.fromJson(
        {
          contractId: victimContractId,
          networkPassphrase,
          rpcUrl: "https://example.com",
          method,
          parseResultXdr: () => {},
        },
        txData,
      ),
    ).toThrow(
      `Transaction envelope targets contract ${attackerContractId}, but this Client is configured for ${victimContractId}.`,
    );
  });

  it("fromJson() rejects a transaction with a spoofed method name", () => {
    const tx = buildInvokeTx(victimContractId, "transfer");
    const simulationResult = {
      auth: [],
      retval: xdr.ScVal.scvU32(0).toXdr("base64"),
    };
    const simulationTransactionData = new SorobanDataBuilder()
      .build()
      .toXdr("base64");

    const json = JSON.stringify({
      method: "safe_operation",
      tx: tx.toEnvelope().toXdr("base64"),
      simulationResult,
      simulationTransactionData,
    });

    const { method, ...txData } = JSON.parse(json);

    expect(() =>
      contract.AssembledTransaction.fromJson(
        {
          contractId: victimContractId,
          networkPassphrase,
          rpcUrl: "https://example.com",
          method,
          parseResultXdr: () => {},
        },
        txData,
      ),
    ).toThrow(
      "Transaction envelope calls method 'transfer', but the provided method is 'safe_operation'.",
    );
  });
});

describe("AssembledTransaction auth entry credential types (CAP-71)", () => {
  const networkPassphrase = "Standalone Network ; February 2017";
  const source = new Account(Keypair.random().publicKey(), "0");
  const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";

  const kpA = Keypair.random();
  const kpB = Keypair.random();
  const kpC = Keypair.random();

  const spec = new contract.Spec([
    xdr.ScSpecEntry.scSpecEntryFunctionV0(
      new xdr.ScSpecFunctionV0({
        doc: "",
        name: "test",
        inputs: [],
        outputs: [xdr.ScSpecTypeDef.scSpecTypeU32()],
      }),
    ).toXdr("base64"),
  ]);

  // unsigned auth entries carry an scvVoid (or empty scvVec) signature; a
  // non-empty scvVec signature marks an entry as already signed
  function addrCreds(
    pk: string,
    signed = false,
  ): xdr.SorobanAddressCredentials {
    return new xdr.SorobanAddressCredentials({
      address: new Address(pk).toScAddress(),
      nonce: 1n,
      signatureExpirationLedger: 0,
      signature: signed
        ? xdr.ScVal.scvVec([xdr.ScVal.scvBytes(new Uint8Array(64))])
        : xdr.ScVal.scvVoid(),
    });
  }

  const addressCred = (pk: string, signed = false) =>
    xdr.SorobanCredentials.sorobanCredentialsAddress(addrCreds(pk, signed));
  const addressV2Cred = (pk: string, signed = false) =>
    xdr.SorobanCredentials.sorobanCredentialsAddressV2(addrCreds(pk, signed));
  const withDelegatesCred = (pk: string, signed = false) =>
    xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
      new xdr.SorobanAddressCredentialsWithDelegates({
        addressCredentials: addrCreds(pk, signed),
        delegates: [],
      }),
    );
  const sourceCred = () =>
    xdr.SorobanCredentials.sorobanCredentialsSourceAccount();

  function authEntry(
    credentials: xdr.SorobanCredentials,
  ): xdr.SorobanAuthorizationEntry {
    return new xdr.SorobanAuthorizationEntry({
      rootInvocation: new xdr.SorobanAuthorizedInvocation({
        function:
          xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
            new xdr.InvokeContractArgs({
              contractAddress: new Address(contractId).toScAddress(),
              functionName: "test",
              args: [],
            }),
          ),
        subInvocations: [],
      }),
      credentials,
    });
  }

  function assembledWith(
    auth: xdr.SorobanAuthorizationEntry[],
    extraOptions: any = {},
  ) {
    const tx = new TransactionBuilder(source, {
      fee: "100",
      networkPassphrase,
    })
      .setTimeout(TimeoutInfinite)
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: "test",
          args: [],
          auth,
        }),
      )
      .build();

    return contract.AssembledTransaction.fromXdr(
      {
        contractId,
        networkPassphrase,
        rpcUrl: "https://example.com",
        ...extraOptions,
      },
      tx.toEnvelope().toXdr("base64"),
      spec,
    );
  }

  // independent extractor (does not reuse the SDK's getAddressCredentials)
  function credAddress(entry: xdr.SorobanAuthorizationEntry): string {
    const c = entry.credentials;
    const inner =
      c.type === "sorobanCredentialsAddressWithDelegates"
        ? c.addressWithDelegates.addressCredentials
        : c.type === "sorobanCredentialsAddressV2"
          ? c.addressV2
          : expectVariant(c, "sorobanCredentialsAddress").address;
    return Address.fromScAddress(inner.address).toString();
  }

  describe("needsNonInvokerSigningBy", () => {
    it("includes ADDRESS, ADDRESS_V2 and ADDRESS_WITH_DELEGATES entries; excludes source account", () => {
      const assembled = assembledWith([
        authEntry(addressCred(kpA.publicKey())),
        authEntry(addressV2Cred(kpB.publicKey())),
        authEntry(withDelegatesCred(kpC.publicKey())),
        authEntry(sourceCred()),
      ]);

      expect(assembled.needsNonInvokerSigningBy().sort()).toEqual(
        [kpA.publicKey(), kpB.publicKey(), kpC.publicKey()].sort(),
      );
    });

    it("excludes already-signed entries unless includeAlreadySigned is set", () => {
      const assembled = assembledWith([
        authEntry(addressV2Cred(kpA.publicKey(), false)), // unsigned
        authEntry(withDelegatesCred(kpB.publicKey(), true)), // already signed
      ]);

      expect(assembled.needsNonInvokerSigningBy()).toEqual([kpA.publicKey()]);
      expect(
        assembled
          .needsNonInvokerSigningBy({ includeAlreadySigned: true })
          .sort(),
      ).toEqual([kpA.publicKey(), kpB.publicKey()].sort());
    });

    it("treats an empty scvVec signature (authorizeInvocation's placeholder) as unsigned", () => {
      // class-XDR values are immutable, so the empty-scvVec placeholder is
      // built in rather than assigned after the fact.
      const creds = new xdr.SorobanAddressCredentials({
        address: new Address(kpA.publicKey()).toScAddress(),
        nonce: 1n,
        signatureExpirationLedger: 0,
        signature: xdr.ScVal.scvVec([]),
      });
      const assembled = assembledWith([
        authEntry(xdr.SorobanCredentials.sorobanCredentialsAddress(creds)),
      ]);

      expect(assembled.needsNonInvokerSigningBy()).toEqual([kpA.publicKey()]);
    });

    // Regression coverage for
    // https://github.com/stellar/js-stellar-sdk/issues/1655: this method
    // used to inspect only info.signers[0] (the top-level node), so an
    // unsigned delegate on an otherwise-signed top level was silently
    // dropped from the result, both real cases from the original report.
    // Built directly via hand-constructed
    // SorobanAddressCredentialsWithDelegates XDR (addrCreds / authEntry
    // above), with a placeholder scvBytes(new Uint8Array(64))/scvVoid()
    // standing in for a real signature, not via
    // buildWithDelegatesEntry / authorizeEntry.
    it("reports an unsigned delegate even when the top level is already signed (#1655 case 2)", () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(kpB.publicKey(), true), // signed
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(kpC.publicKey()).toScAddress(),
                signature: xdr.ScVal.scvVoid(), // unsigned delegate
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith([entry]);

      // The top level is already signed, so only the delegate is
      // outstanding: the caller following the documented
      // needsNonInvokerSigningBy -> sign -> repeat workflow must see it,
      // not an empty array implying nothing is left to sign.
      expect(assembled.needsNonInvokerSigningBy()).toEqual([kpC.publicKey()]);
    });

    it("reports an unsigned delegate alongside an unsigned-by-design top level (#1655 case 1)", () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            // Unsigned by design (CAP-71-01: an account whose policy
            // authorizes purely via delegated signers), not merely
            // "not yet signed".
            addressCredentials: addrCreds(kpB.publicKey(), false),
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(kpC.publicKey()).toScAddress(),
                signature: xdr.ScVal.scvVoid(), // unsigned delegate
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith([entry]);

      // Both nodes are unsigned; both must be reported. Previously this
      // reported only the top-level address (kpB), which per this
      // account's own policy may never need a signature at all, while
      // the delegate that actually needs to sign (kpC) never appeared.
      expect(assembled.needsNonInvokerSigningBy().sort()).toEqual(
        [kpB.publicKey(), kpC.publicKey()].sort(),
      );
    });

    it("does not report an already-signed delegate on an unsigned top level, unless includeAlreadySigned is set", () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(kpB.publicKey(), false), // unsigned
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(kpC.publicKey()).toScAddress(),
                signature: xdr.ScVal.scvVec([
                  xdr.ScVal.scvBytes(new Uint8Array(64)),
                ]), // already signed
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith([entry]);

      expect(assembled.needsNonInvokerSigningBy()).toEqual([kpB.publicKey()]);
      expect(
        assembled
          .needsNonInvokerSigningBy({ includeAlreadySigned: true })
          .sort(),
      ).toEqual([kpB.publicKey(), kpC.publicKey()].sort());
    });

    it("walks nested delegates, not just the first level", () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(kpA.publicKey(), true),
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(kpB.publicKey()).toScAddress(),
                signature: xdr.ScVal.scvVec([
                  xdr.ScVal.scvBytes(new Uint8Array(64)),
                ]), // signed
                nestedDelegates: [
                  new xdr.SorobanDelegateSignature({
                    address: new Address(kpC.publicKey()).toScAddress(),
                    signature: xdr.ScVal.scvVoid(), // unsigned, one level deeper
                    nestedDelegates: [],
                  }),
                ],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith([entry]);

      expect(assembled.needsNonInvokerSigningBy()).toEqual([kpC.publicKey()]);
    });

    it("deduplicates repeated addresses across credential types", () => {
      const assembled = assembledWith([
        authEntry(addressV2Cred(kpA.publicKey())),
        authEntry(withDelegatesCred(kpA.publicKey())),
      ]);

      expect(assembled.needsNonInvokerSigningBy()).toEqual([kpA.publicKey()]);
    });
  });

  describe("signAuthEntries", () => {
    it("authorizes ADDRESS_V2 and ADDRESS_WITH_DELEGATES entries for the target address, skipping source account and other addresses", async () => {
      const assembled = assembledWith([
        authEntry(addressV2Cred(kpA.publicKey())), // matches -> authorized
        authEntry(withDelegatesCred(kpA.publicKey())), // matches -> authorized
        authEntry(addressV2Cred(kpB.publicKey())), // other address -> skipped
        authEntry(sourceCred()), // source account -> skipped
      ]);

      const authorizeEntry = vi.fn((entry: any) => Promise.resolve(entry));

      await assembled.signAuthEntries({
        expiration: 1000,
        address: kpA.publicKey(),
        authorizeEntry,
      });

      expect(authorizeEntry).toHaveBeenCalledTimes(2);
      const authorized = authorizeEntry.mock.calls.map(([entry]) =>
        credAddress(entry),
      );
      expect(authorized).toEqual([kpA.publicKey(), kpA.publicKey()]);
    });

    // Regression coverage for
    // https://github.com/stellar/js-stellar-sdk/issues/1655: previously
    // this method resolved an entry's signer via getAddressCredentials(),
    // which only ever exposes the top-level address, so a delegate never
    // matched `address` and the entry was silently skipped, whatever the
    // delegate's own address was.
    it("authorizes a delegate node, not just the top level, when address targets a delegate", async () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(kpB.publicKey(), true), // already signed
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(kpC.publicKey()).toScAddress(),
                signature: xdr.ScVal.scvVoid(), // unsigned
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith([entry]);

      // Writes the delegate's own node, not just any node — a custom
      // authorizeEntry that ignored `forAddress` (always passed as the
      // 5th argument) and left the delegate unsigned would now be caught
      // by signAuthEntries's own post-call check; see the dedicated test
      // below for that case.
      const authorizeEntry = vi.fn(
        (
          e: xdr.SorobanAuthorizationEntry,
          _signer: any,
          _validUntil: number,
          _passphrase: string,
          forAddress?: string,
        ) => {
          const withDelegates = expectVariant(
            e.credentials,
            "sorobanCredentialsAddressWithDelegates",
          ).addressWithDelegates;
          const delegates = withDelegates.delegates.map((delegate) =>
            Address.fromScAddress(delegate.address).toString() === forAddress
              ? new xdr.SorobanDelegateSignature({
                  address: delegate.address,
                  signature: xdr.ScVal.scvVec([
                    xdr.ScVal.scvBytes(new Uint8Array(64)),
                  ]),
                  nestedDelegates: delegate.nestedDelegates,
                })
              : delegate,
          );
          return Promise.resolve(
            new xdr.SorobanAuthorizationEntry({
              rootInvocation: e.rootInvocation,
              credentials:
                xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
                  new xdr.SorobanAddressCredentialsWithDelegates({
                    addressCredentials: withDelegates.addressCredentials,
                    delegates,
                  }),
                ),
            }),
          );
        },
      );

      await assembled.signAuthEntries({
        expiration: 1000,
        address: kpC.publicKey(), // the delegate, not the top-level kpB
        authorizeEntry,
      });

      // The entry has a matching signer node (the delegate), so it must
      // be handed to authorizeEntry, previously it was skipped entirely
      // because kpC never matched the top-level-only address check.
      expect(authorizeEntry).toHaveBeenCalledTimes(1);
    });

    it("end-to-end signs a delegate node via the default authorizeEntry + basicNodeSigner", async () => {
      const topSigner = Keypair.random();
      const delegateSigner = Keypair.random();
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(topSigner.publicKey(), false),
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(delegateSigner.publicKey()).toScAddress(),
                signature: xdr.ScVal.scvVoid(),
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith(
        [entry],
        contract.basicNodeSigner(delegateSigner, networkPassphrase),
      );

      await assembled.signAuthEntries({
        expiration: 1000,
        address: delegateSigner.publicKey(),
      });

      const credentials = (assembled.built as any).operations[0].auth[0]
        .credentials.addressWithDelegates;
      // The delegate node received a real signature.
      const delegateSig = credentials.delegates[0].signature;
      expect(delegateSig.type).toBe("scvVec");
      expect(delegateSig.vec).toHaveLength(1);
      // The top-level node, unsigned by design (CAP-71-01), was left
      // untouched: signAuthEntries must write only to the node(s) that
      // actually match `address`, not blanket-sign the whole entry.
      expect(credentials.addressCredentials.signature.type).toBe("scvVoid");
    });

    it.each([
      ["ADDRESS", addressCred],
      ["ADDRESS_V2", addressV2Cred],
    ] as const)(
      "uses the wallet's returned signing key for a different %s account",
      async (_name, makeCredentials) => {
        const entry = authEntry(makeCredentials(kpA.publicKey()));
        const signAuthEntry = vi.fn(
          contract.basicNodeSigner(kpB, networkPassphrase).signAuthEntry,
        );
        const assembled = assembledWith([entry], { signAuthEntry });

        await assembled.signAuthEntries({
          expiration: 1000,
          address: kpA.publicKey(),
        });

        expect(signAuthEntry).toHaveBeenCalledExactlyOnceWith(
          expect.any(String),
          { address: kpA.publicKey() },
        );
        const operation = expectDefined(assembled.built).operations[0];
        if (operation.type !== "invokeHostFunction") {
          throw new Error("Expected an invokeHostFunction operation");
        }
        const signed = expectDefined(operation.auth)[0];
        const info = StellarSdk.inspectAuthEntry(signed);
        expect(info.address).toBe(kpA.publicKey());
        expect(info.nonce).toBe(1n);
        expect(info.signatureExpirationLedger).toBe(1000);
        expect(signed.rootInvocation.toXdr()).toEqual(
          entry.rootInvocation.toXdr(),
        );
        const signature = StellarSdk.scValToNative(
          info.signers[0].rawSignature,
        )[0] as { public_key: Uint8Array; signature: Uint8Array };
        expect(
          StellarSdk.StrKey.encodeEd25519PublicKey(signature.public_key),
        ).toBe(kpB.publicKey());
        const preimage = StellarSdk.buildAuthorizationEntryPreimage(
          signed,
          1000,
          networkPassphrase,
        );
        expect(
          kpB.verify(StellarSdk.hash(preimage.toXdr()), signature.signature),
        ).toBe(true);
      },
    );

    it("rejects a signature that does not match the wallet's returned signing key", async () => {
      const wallet = contract.basicNodeSigner(kpB, networkPassphrase);
      const assembled = assembledWith(
        [authEntry(addressCred(kpA.publicKey()))],
        {
          signAuthEntry: async (preimage: string) => ({
            ...(await wallet.signAuthEntry(preimage)),
            signerAddress: kpC.publicKey(),
          }),
        },
      );

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: kpA.publicKey(),
        }),
      ).rejects.toThrow(/signature doesn't match payload/);
    });

    it("preserves the source-address default and fallback when the wallet omits signerAddress", async () => {
      const entry = authEntry(addressCred(kpA.publicKey()));
      const wallet = contract.basicNodeSigner(kpA, networkPassphrase);
      const assembled = assembledWith([entry], {
        publicKey: kpA.publicKey(),
        signAuthEntry: async (preimage: string) => ({
          signedAuthEntry: (await wallet.signAuthEntry(preimage))
            .signedAuthEntry,
        }),
      });

      await assembled.signAuthEntries({
        expiration: 1000,
        address: kpA.publicKey(),
      });

      const operation = expectDefined(assembled.built).operations[0];
      if (operation.type !== "invokeHostFunction") {
        throw new Error("Expected an invokeHostFunction operation");
      }
      const expected = await StellarSdk.authorizeEntry(
        entry,
        kpA,
        1000,
        networkPassphrase,
      );
      expect(expectDefined(operation.auth)[0].toXdr()).toEqual(
        expected.toXdr(),
      );
    });

    it("preserves raw callback bytes for custom authorizers of contract accounts", async () => {
      const entry = authEntry(addressCred(contractId));
      const assembled = assembledWith(
        [entry],
        contract.basicNodeSigner(kpB, networkPassphrase),
      );
      let callbackResult: unknown;
      const authorizeEntry: typeof StellarSdk.authorizeEntry = async (
        original,
        signer,
        expiration,
        network,
      ) => {
        if (typeof signer !== "function") {
          throw new Error("Expected a signing callback");
        }
        const preimage = StellarSdk.buildAuthorizationEntryPreimage(
          original,
          expiration,
          network,
        );
        callbackResult = await signer(
          preimage,
          StellarSdk.hash(preimage.toXdr()),
        );
        return original;
      };

      await assembled.signAuthEntries({
        expiration: 1000,
        address: contractId,
        authorizeEntry,
      });

      expect(callbackResult).toBeInstanceOf(Uint8Array);
      const preimage = StellarSdk.buildAuthorizationEntryPreimage(
        entry,
        1000,
        networkPassphrase,
      );
      expect(
        kpB.verify(
          StellarSdk.hash(preimage.toXdr()),
          callbackResult as Uint8Array,
        ),
      ).toBe(true);
    });

    it.each([null, ""])(
      "treats a wallet signerAddress of %j as omitted",
      async (signerAddress) => {
        // Plain-JS wallets are not held to the types; before the field was
        // read at all, these signed fine against the entry's own address.
        const entry = authEntry(addressCred(kpA.publicKey()));
        const wallet = contract.basicNodeSigner(kpA, networkPassphrase);
        const assembled = assembledWith([entry], {
          signAuthEntry: async (preimage: string) => ({
            signedAuthEntry: (await wallet.signAuthEntry(preimage))
              .signedAuthEntry,
            signerAddress: signerAddress as unknown as string,
          }),
        });

        await assembled.signAuthEntries({
          expiration: 1000,
          address: kpA.publicKey(),
        });

        const operation = expectDefined(assembled.built).operations[0];
        if (operation.type !== "invokeHostFunction") {
          throw new Error("Expected an invokeHostFunction operation");
        }
        const expected = await StellarSdk.authorizeEntry(
          entry,
          kpA,
          1000,
          networkPassphrase,
        );
        expect(expectDefined(operation.auth)[0].toXdr()).toEqual(
          expected.toXdr(),
        );
      },
    );

    it("resolves a muxed signerAddress to its base account", async () => {
      const entry = authEntry(addressCred(kpA.publicKey()));
      const wallet = contract.basicNodeSigner(kpB, networkPassphrase);
      const muxed = new StellarSdk.MuxedAccount(
        new Account(kpB.publicKey(), "0"),
        "7",
      ).accountId();
      expect(muxed.startsWith("M")).toBe(true);
      const assembled = assembledWith([entry], {
        signAuthEntry: async (preimage: string) => ({
          ...(await wallet.signAuthEntry(preimage)),
          signerAddress: muxed,
        }),
      });

      await assembled.signAuthEntries({
        expiration: 1000,
        address: kpA.publicKey(),
      });

      const operation = expectDefined(assembled.built).operations[0];
      if (operation.type !== "invokeHostFunction") {
        throw new Error("Expected an invokeHostFunction operation");
      }
      const info = StellarSdk.inspectAuthEntry(
        expectDefined(operation.auth)[0],
      );
      expect(info.address).toBe(kpA.publicKey());
      const signature = StellarSdk.scValToNative(
        info.signers[0].rawSignature,
      )[0] as { public_key: Uint8Array; signature: Uint8Array };
      expect(
        StellarSdk.StrKey.encodeEd25519PublicKey(signature.public_key),
      ).toBe(kpB.publicKey());
    });

    it("rejects a wallet signerAddress that is not an account address, naming it", async () => {
      // A typo'd key must not fall back to the entry address and surface as
      // "signature doesn't match payload" (#1681).
      const entry = authEntry(addressCred(kpA.publicKey()));
      const wallet = contract.basicNodeSigner(kpA, networkPassphrase);
      const good = kpB.publicKey();
      const bad = `${good.slice(0, -1)}${good.endsWith("A") ? "B" : "A"}`;
      const assembled = assembledWith([entry], {
        signAuthEntry: async (preimage: string) => ({
          ...(await wallet.signAuthEntry(preimage)),
          signerAddress: bad,
        }),
      });

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: kpA.publicKey(),
        }),
      ).rejects.toThrow(
        new TypeError(
          "expected the wallet's signerAddress to be an account address (G... " +
            `or M...), got ${JSON.stringify(bad)}`,
        ),
      );
    });

    it("rejects a contract signerAddress and points at a custom authorizeEntry", async () => {
      const entry = authEntry(addressCred(kpA.publicKey()));
      const wallet = contract.basicNodeSigner(kpA, networkPassphrase);
      const contractId = StellarSdk.StrKey.encodeContract(
        new Uint8Array(32).fill(7),
      );
      const assembled = assembledWith([entry], {
        signAuthEntry: async (preimage: string) => ({
          ...(await wallet.signAuthEntry(preimage)),
          signerAddress: contractId,
        }),
      });

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: kpA.publicKey(),
        }),
      ).rejects.toThrow(
        new TypeError(
          `the wallet's signerAddress names contract ${contractId}, but the ` +
            "default authorizer verifies Ed25519 signatures only; sign for a " +
            "contract account with a custom `authorizeEntry`",
        ),
      );
    });

    it("reports a custom authorizer that signed nothing, naming the address default", async () => {
      // A custom authorizer skips the `needsNonInvokerSigningBy` pre-flight, so
      // a wrong `address` used to leave the loop having matched no entry and
      // return as if it had signed.
      const assembled = assembledWith(
        [authEntry(addressCred(kpB.publicKey()))],
        { publicKey: kpA.publicKey() },
      );
      let authorizerRan = false;

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          signAuthEntry: contract.basicNodeSigner(kpB, networkPassphrase)
            .signAuthEntry,
          authorizeEntry: (entry) => {
            authorizerRan = true;
            return Promise.resolve(entry);
          },
        }),
      ).rejects.toThrow(/defaulted to the account that built this transaction/);
      expect(authorizerRan).toBe(false);
    });

    it("names the address default in the pre-flight for the default authorizer", async () => {
      // The common shape from #1681: a plain `signAuthEntry` function for
      // another account, `address` left to default.
      const assembled = assembledWith(
        [authEntry(addressCred(kpB.publicKey()))],
        {
          publicKey: kpA.publicKey(),
          signAuthEntry: contract.basicNodeSigner(kpB, networkPassphrase)
            .signAuthEntry,
        },
      );

      await expect(
        assembled.signAuthEntries({ expiration: 1000 }),
      ).rejects.toThrow(
        new contract.AssembledTransaction.Errors.NoSignatureNeeded(
          `No auth entries for public key "${kpA.publicKey()}"; \`address\` ` +
            "was not given and `signAuthEntry` does not name one, so it " +
            "defaulted to the account that built this transaction. Pass " +
            "`address` to say who is signing.",
        ),
      );
    });

    it("treats an explicit null address as not given", async () => {
      // `address` is chosen with `??`, so a JS caller's `null` defaults to
      // `publicKey`; the hint has to agree that it defaulted.
      const assembled = assembledWith(
        [authEntry(addressCred(kpB.publicKey()))],
        { publicKey: kpA.publicKey() },
      );

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: null as unknown as undefined,
          signAuthEntry: contract.basicNodeSigner(kpB, networkPassphrase)
            .signAuthEntry,
          authorizeEntry: (entry) => Promise.resolve(entry),
        }),
      ).rejects.toThrow(/defaulted to the account that built this transaction/);
    });

    it("does not claim the address defaulted when it was passed explicitly", async () => {
      const assembled = assembledWith(
        [authEntry(addressCred(kpB.publicKey()))],
        { publicKey: kpA.publicKey() },
      );

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: kpA.publicKey(),
          signAuthEntry: contract.basicNodeSigner(kpB, networkPassphrase)
            .signAuthEntry,
          authorizeEntry: (entry) => Promise.resolve(entry),
        }),
      ).rejects.toThrow(
        new contract.AssembledTransaction.Errors.NoSignatureNeeded(
          `No auth entries for public key "${kpA.publicKey()}"`,
        ),
      );
    });

    it("reports a missing address when the Client has no publicKey", async () => {
      const assembled = assembledWith([
        authEntry(addressCred(kpB.publicKey())),
      ]);

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          signAuthEntry: contract.basicNodeSigner(kpB, networkPassphrase)
            .signAuthEntry,
          authorizeEntry: (entry) => Promise.resolve(entry),
        }),
      ).rejects.toThrow(
        new contract.AssembledTransaction.Errors.NoSignatureNeeded(
          "No account to sign for: `address` was not given and `signAuthEntry` " +
            "does not name one. Pass `address` to say who is signing.",
        ),
      );
    });

    it("signs through a call-site signAuthEntry function without an address", async () => {
      // The signer is overridden per call, `address` is not, and the wallet
      // signs for the account that built the transaction: this must work.
      const entry = authEntry(addressCred(kpA.publicKey()));
      const assembled = assembledWith([entry], { publicKey: kpA.publicKey() });

      await assembled.signAuthEntries({
        expiration: 1000,
        signAuthEntry: contract.basicNodeSigner(kpA, networkPassphrase)
          .signAuthEntry,
      });

      const operation = expectDefined(assembled.built).operations[0];
      if (operation.type !== "invokeHostFunction") {
        throw new Error("Expected an invokeHostFunction operation");
      }
      const expected = await StellarSdk.authorizeEntry(
        entry,
        kpA,
        1000,
        networkPassphrase,
      );
      expect(expectDefined(operation.auth)[0].toXdr()).toEqual(
        expected.toXdr(),
      );
    });

    it("keeps the publicKey default for the client's own signer", async () => {
      const entry = authEntry(addressCred(kpB.publicKey()));
      const assembled = assembledWith([entry], {
        publicKey: kpB.publicKey(),
        signAuthEntry: contract.basicNodeSigner(kpB, networkPassphrase)
          .signAuthEntry,
      });

      await assembled.signAuthEntries({ expiration: 1000 });

      const operation = expectDefined(assembled.built).operations[0];
      if (operation.type !== "invokeHostFunction") {
        throw new Error("Expected an invokeHostFunction operation");
      }
      const expected = await StellarSdk.authorizeEntry(
        entry,
        kpB,
        1000,
        networkPassphrase,
      );
      expect(expectDefined(operation.auth)[0].toXdr()).toEqual(
        expected.toXdr(),
      );
    });

    it("end-to-end signs an ADDRESS_V2 entry via the default authorizeEntry + basicNodeSigner", async () => {
      const signer = Keypair.random();
      const assembled = assembledWith(
        [authEntry(addressV2Cred(signer.publicKey()))],
        contract.basicNodeSigner(signer, networkPassphrase),
      );

      await assembled.signAuthEntries({
        expiration: 1000,
        address: signer.publicKey(),
      });

      const signed = (assembled.built as any).operations[0].auth[0].credentials
        .addressV2;
      expect(signed.signatureExpirationLedger).toBe(1000);
      // signature was filled in (no longer the scvVoid placeholder)
      expect(signed.signature.type).toBe("scvVec");
      expect(signed.signature.vec).toHaveLength(1);
    });

    it("accepts a Keypair, a Signer, or a raw callback interchangeably", async () => {
      const signer = Keypair.random();

      // Fixed nonce and expiration, and no rebuilt timebounds on this path, so
      // Ed25519 determinism makes the three entries byte-identical.
      const signedEntryWith = async (signAuthEntry: any) => {
        const assembled = assembledWith(
          [authEntry(addressV2Cred(signer.publicKey()))],
          { signAuthEntry },
        );
        await assembled.signAuthEntries({
          expiration: 1000,
          address: signer.publicKey(),
        });
        return (assembled.built as any).operations[0].auth[0].toXdr("base64");
      };

      const viaKeypair = await signedEntryWith(signer);
      const viaSigner = await signedEntryWith(
        new contract.KeypairSigner(signer, networkPassphrase),
      );
      const viaCallback = await signedEntryWith(
        contract.basicNodeSigner(signer, networkPassphrase).signAuthEntry,
      );

      expect(viaSigner).toEqual(viaKeypair);
      expect(viaCallback).toEqual(viaKeypair);
    });

    it("infers the target address from a Signer or Keypair", async () => {
      const signer = Keypair.random();

      for (const signAuthEntry of [
        signer,
        new contract.KeypairSigner(signer, networkPassphrase),
      ]) {
        const assembled = assembledWith(
          [authEntry(addressV2Cred(signer.publicKey()))],
          { signAuthEntry },
        );
        await assembled.signAuthEntries({ expiration: 1000 });

        const signed = (assembled.built as any).operations[0].auth[0]
          .credentials.addressV2;
        expect(signed.signature.type).toBe("scvVec");
      }
    });

    it("rejects a Signer that omits the optional signAuthEntry", async () => {
      const signer = Keypair.random();
      const assembled = assembledWith(
        [authEntry(addressV2Cred(signer.publicKey()))],
        { signAuthEntry: { address: signer.publicKey() } },
      );

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: signer.publicKey(),
        }),
      ).rejects.toThrow(contract.AssembledTransaction.Errors.NoSigner);
    });

    // Regression coverage for
    // https://github.com/stellar/js-stellar-sdk/issues/1672: the default
    // authorizeEntry callback used to hand it { signature, publicKey: target }
    // unconditionally, ignoring a `signerAddress` the signing callback
    // reported back. `target` is only who was ASKED to sign; a delegate
    // whose real signer differs from the delegate node's own address (e.g.
    // a smart-account delegate proxying to an underlying Ed25519 key) must
    // still verify, which needs the signer's own reported address, not the
    // requested one.
    it("verifies against the signer's own reported address, not the requested one, when they differ", async () => {
      const requestedSigner = Keypair.random(); // who `address` asks to sign
      const actualSigner = Keypair.random(); // who really signs

      const assembled = assembledWith(
        [authEntry(addressV2Cred(requestedSigner.publicKey()))],
        {
          signAuthEntry: new contract.KeypairSigner(
            actualSigner,
            networkPassphrase,
          ).signAuthEntry,
        },
      );

      // Previously this verified the signature against
      // requestedSigner.publicKey() (== target) regardless of who actually
      // produced it, so a signer honestly reporting a different
      // signerAddress made the default authorizeEntry's
      // Keypair.fromPublicKey(target).verify(...) check fail even though
      // the signature is genuinely valid for actualSigner.
      await assembled.signAuthEntries({
        expiration: 1000,
        address: requestedSigner.publicKey(),
      });

      const signed = (assembled.built as any).operations[0].auth[0].credentials
        .addressV2;
      expect(signed.signature.type).toBe("scvVec");
      expect(signed.signature.vec).toHaveLength(1);
    });

    // Regression coverage for the sequential multi-party signing bug found
    // in review of #1672: every signature on an entry commits to the same
    // shared signatureExpirationLedger, so a second signer picking a fresh
    // default silently invalidated the first signer's already-produced
    // signature, e2e-verified as a real Error(Auth, InvalidAction) with no
    // client-side error beforehand.
    it("reuses the entry's already-stored expiration for a later signer, instead of a fresh default", async () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(kpB.publicKey(), false),
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(kpC.publicKey()).toScAddress(),
                signature: xdr.ScVal.scvVoid(),
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith([entry]);

      // Real signing (not a passthrough mock) for both calls: the fix
      // being tested depends on the entry actually carrying a real
      // signature + expiration after the first call, which a mock that
      // just returns its input unchanged would never produce.
      await assembled.signAuthEntries({
        expiration: 1000,
        address: kpC.publicKey(),
        signAuthEntry: contract.basicNodeSigner(kpC, networkPassphrase)
          .signAuthEntry,
      });

      const afterFirst = (assembled.built as any).operations[0].auth[0]
        .credentials.addressWithDelegates;
      expect(afterFirst.delegates[0].signature.type).toBe("scvVec");
      expect(afterFirst.addressCredentials.signatureExpirationLedger).toBe(
        1000,
      );

      // Second signer: the top level, requesting a different expiration.
      // Since the delegate already signed against 1000, the fix must reuse
      // 1000 instead of silently invalidating that signature with 2000.
      await assembled.signAuthEntries({
        expiration: 2000,
        address: kpB.publicKey(),
        signAuthEntry: contract.basicNodeSigner(kpB, networkPassphrase)
          .signAuthEntry,
      });

      const afterSecond = (assembled.built as any).operations[0].auth[0]
        .credentials.addressWithDelegates;
      expect(afterSecond.addressCredentials.signature.type).toBe("scvVec");
      expect(afterSecond.addressCredentials.signatureExpirationLedger).toBe(
        1000,
      );
      // The delegate's earlier signature must still be present, not
      // clobbered by the second signAuthEntries() call.
      expect(afterSecond.delegates[0].signature.type).toBe("scvVec");
    });

    // Regression coverage for the same review round: matching an
    // already-signed node re-signs it needlessly and, without the
    // expiration-reuse fix above, through a second door. Rejects with
    // `NoSignatureNeeded` rather than resolving silently, per the
    // no-match-at-all check `signAuthEntries` now applies even for a
    // custom authorizer (landed separately, see the `#1681`-referencing
    // tests above).
    it("does not re-authorize a node that's already signed", async () => {
      const entry = authEntry(
        withDelegatesCred(kpB.publicKey(), true), // already signed
      );
      const assembled = assembledWith([entry]);
      const authorizeEntry = vi.fn((e: any) => Promise.resolve(e));

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: kpB.publicKey(),
          authorizeEntry,
        }),
      ).rejects.toThrow(contract.AssembledTransaction.Errors.NoSignatureNeeded);

      expect(authorizeEntry).not.toHaveBeenCalled();
    });

    // Regression coverage: the SDK's default authorizer can't sign for a
    // contract-address (Signer::Delegated-style) delegate — it needs a
    // signatureScVal from its own account contract's __check_auth, not an
    // Ed25519 signature — and previously failed deep inside verification
    // with an opaque strkey error instead of a clear one up front. Scoped
    // to the default authorizer only: see the next test for a custom one.
    it("throws a clear error instead of signing for a contract-address delegate via the default authorizer", async () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(kpB.publicKey(), false),
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(contractId).toScAddress(),
                signature: xdr.ScVal.scvVoid(),
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith(
        [entry],
        contract.basicNodeSigner(kpB, networkPassphrase),
      );

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: contractId,
        }),
      ).rejects.toThrow(
        contract.AssembledTransaction.Errors.UnsupportedDelegateSigner,
      );
    });

    // A custom authorizeEntry is not held to the default authorizer's
    // Ed25519-only limitation: it owns `entry` directly and can build
    // whatever `signatureScVal` the contract delegate's own __check_auth
    // expects, so signAuthEntries must not reject it pre-emptively.
    it("lets a custom authorizeEntry sign for a contract-address delegate", async () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(kpB.publicKey(), false),
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(contractId).toScAddress(),
                signature: xdr.ScVal.scvVoid(),
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith([entry]);

      const authorizeEntry = vi.fn(
        (
          e: xdr.SorobanAuthorizationEntry,
          _signer: any,
          _validUntil: number,
          _passphrase: string,
          forAddress?: string,
        ) => {
          const withDelegates = expectVariant(
            e.credentials,
            "sorobanCredentialsAddressWithDelegates",
          ).addressWithDelegates;
          const delegates = withDelegates.delegates.map((delegate) =>
            Address.fromScAddress(delegate.address).toString() === forAddress
              ? new xdr.SorobanDelegateSignature({
                  address: delegate.address,
                  // whatever this contract's __check_auth expects — an
                  // arbitrary ScVal is fine, the default authorizer never
                  // touches it
                  signature: xdr.ScVal.scvSymbol("approved"),
                  nestedDelegates: delegate.nestedDelegates,
                })
              : delegate,
          );
          return Promise.resolve(
            new xdr.SorobanAuthorizationEntry({
              rootInvocation: e.rootInvocation,
              credentials:
                xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
                  new xdr.SorobanAddressCredentialsWithDelegates({
                    addressCredentials: withDelegates.addressCredentials,
                    delegates,
                  }),
                ),
            }),
          );
        },
      );

      await assembled.signAuthEntries({
        expiration: 1000,
        address: contractId,
        authorizeEntry,
      });

      expect(authorizeEntry).toHaveBeenCalledTimes(1);
    });

    // Regression coverage: `forAddress` is always passed as the 5th
    // argument to a custom authorizeEntry (even a legacy one written
    // before that parameter existed simply ignores an extra argument it
    // never declared), so signAuthEntries can't tell ahead of time from
    // arity alone whether a custom authorizeEntry will actually honor it
    // — Function.length lies for default/rest parameters either way, and
    // a delegate can coincidentally share the top-level address. It
    // verifies the *result* instead: if the delegate node this iteration
    // was signing for still isn't signed afterward, the custom
    // authorizeEntry silently wrote elsewhere (or nowhere), which
    // previously left the delegate unsigned with no error until the
    // network rejected it.
    it("throws a clear error when a custom authorizeEntry leaves a delegate target unsigned", async () => {
      const entry = authEntry(
        xdr.SorobanCredentials.sorobanCredentialsAddressWithDelegates(
          new xdr.SorobanAddressCredentialsWithDelegates({
            addressCredentials: addrCreds(kpB.publicKey(), false),
            delegates: [
              new xdr.SorobanDelegateSignature({
                address: new Address(kpC.publicKey()).toScAddress(),
                signature: xdr.ScVal.scvVoid(),
                nestedDelegates: [],
              }),
            ],
          }),
        ),
      );
      const assembled = assembledWith([entry]);
      // A pre-forAddress custom authorizeEntry: declares 4 parameters,
      // ignores the 5th it's actually called with, and returns the entry
      // unchanged — the delegate stays unsigned.
      const legacyAuthorizeEntry = vi.fn(
        (
          e: xdr.SorobanAuthorizationEntry,
          _signer: any,
          _validUntil: number,
          _passphrase: string,
        ) => Promise.resolve(e),
      );
      expect(legacyAuthorizeEntry.length).toBe(4);

      await expect(
        assembled.signAuthEntries({
          expiration: 1000,
          address: kpC.publicKey(), // the delegate, not the top level
          authorizeEntry: legacyAuthorizeEntry as any,
        }),
      ).rejects.toThrow(
        contract.AssembledTransaction.Errors.AuthorizeEntryMissingForAddress,
      );

      // The same legacy authorizeEntry is fine for a top-level target: it
      // never needs forAddress, so the guard must not fire for it.
      const topLevelEntry = authEntry(addressV2Cred(kpA.publicKey(), false));
      const assembledTopLevel = assembledWith([topLevelEntry]);
      await assembledTopLevel.signAuthEntries({
        expiration: 1000,
        address: kpA.publicKey(),
        authorizeEntry: legacyAuthorizeEntry as any,
      });
      expect(legacyAuthorizeEntry).toHaveBeenCalled();
    });
  });
});
