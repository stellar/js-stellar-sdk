import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";

import { serverUrl } from "../../../constants";
import { StellarSdk } from "../../../test-utils/stellar-sdk-import";

const { Account, Keypair, rpc, contract, SorobanDataBuilder, xdr, Address } =
  StellarSdk;
const { Server } = StellarSdk.rpc;

const restoreTxnData = StellarSdk.SorobanDataBuilder.fromXDR(
  "AAAAAAAAAAAAAAAEAAAABgAAAAHZ4Y4l0GNoS97QH0fa5Jbbm61Ou3t9McQ09l7wREKJYwAAAA8AAAAJUEVSU19DTlQxAAAAAAAAAQAAAAYAAAAB2eGOJdBjaEve0B9H2uSW25utTrt7fTHENPZe8ERCiWMAAAAPAAAACVBFUlNfQ05UMgAAAAAAAAEAAAAGAAAAAdnhjiXQY2hL3tAfR9rkltubrU67e30xxDT2XvBEQoljAAAAFAAAAAEAAAAH+BoQswzzGTKRzrdC6axxKaM4qnyDP8wgQv8Id3S4pbsAAAAAAAAGNAAABjQAAAAAAADNoQ==",
);

describe("AssembledTransaction.buildFootprintRestoreTransaction", () => {
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

  it("makes expected RPC calls", async () => {
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
      // eslint-disable-next-line @typescript-eslint/dot-notation
      "buildFootprintRestoreTransaction"
    ](
      options,
      restoreTxnData,
      new Account(
        "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
        "1",
      ),
      52641,
    );
    const result = await txn.signAndSend({ ...wallet });
    expect(result.getTransactionResponse.status).toBe(
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
});

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
              durability: xdr.ContractDataDurability.persistent(),
            }),
          ),
        ])
        .build(),
      results: [{ auth: [], xdr: xdr.ScVal.scvU32(0).toXDR("base64") }],
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
});
