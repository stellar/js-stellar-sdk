const {
  Account,
  Keypair,
  Networks,
  rpc,
  SorobanDataBuilder,
  xdr,
  contract,
} = StellarSdk;
const { Server, AxiosClient, parseRawSimulation } = StellarSdk.rpc;

const restoreTxnData = StellarSdk.SorobanDataBuilder.fromXDR("AAAAAAAAAAAAAAAEAAAABgAAAAHZ4Y4l0GNoS97QH0fa5Jbbm61Ou3t9McQ09l7wREKJYwAAAA8AAAAJUEVSU19DTlQxAAAAAAAAAQAAAAYAAAAB2eGOJdBjaEve0B9H2uSW25utTrt7fTHENPZe8ERCiWMAAAAPAAAACVBFUlNfQ05UMgAAAAAAAAEAAAAGAAAAAdnhjiXQY2hL3tAfR9rkltubrU67e30xxDT2XvBEQoljAAAAFAAAAAEAAAAH+BoQswzzGTKRzrdC6axxKaM4qnyDP8wgQv8Id3S4pbsAAAAAAAAGNAAABjQAAAAAAADNoQ==");

describe("AssembledTransaction.buildFootprintRestoreTransaction", () => {
  const keypair = Keypair.random();
  const contractId = "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM";
  const networkPassphrase = "Standalone Network ; February 2017";
  const wallet = contract.basicNodeSigner(keypair, networkPassphrase);
  const options = {
      networkPassphrase,
      contractId,
      rpcUrl: serverUrl,
      allowHttp: true,
      publicKey: keypair.publicKey(),
      ...wallet,
    }

  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });



  it("makes expected RPC calls", function (done) {
    const simulateTransactionResponse = {
      transactionData: restoreTxnData,
      minResourceFee: "52641",
      cost: { cpuInsns: "0", memBytes: "0" },
      latestLedger: 17027,
    };

    const sendTransactionResponse = {
      "status": "PENDING",
      "hash": "05870e35fc94e5424f72d125959760b5f60631d91452bde2d11126fb5044e35d",
      "latestLedger": 17034,
      "latestLedgerCloseTime": "1716483573"
    };
    const getTransactionResponse = {
      status: "SUCCESS",
      latestLedger: 17037,
      latestLedgerCloseTime: "1716483576",
      oldestLedger: 15598,
      oldestLedgerCloseTime: "1716482133",
      applicationOrder: 1,
      envelopeXdr: "AAAAAgAAAAARwpJYOq4lKj/RdtS7ds3ciGSMfZUp+7d4xgg9vsN7qQABm0IAAAvWAAAAAwAAAAEAAAAAAAAAAAAAAABmT3cbAAAAAAAAAAEAAAAAAAAAGgAAAAAAAAABAAAAAAAAAAAAAAAEAAAABgAAAAHZ4Y4l0GNoS97QH0fa5Jbbm61Ou3t9McQ09l7wREKJYwAAAA8AAAAJUEVSU19DTlQxAAAAAAAAAQAAAAYAAAAB2eGOJdBjaEve0B9H2uSW25utTrt7fTHENPZe8ERCiWMAAAAPAAAACVBFUlNfQ05UMgAAAAAAAAEAAAAGAAAAAdnhjiXQY2hL3tAfR9rkltubrU67e30xxDT2XvBEQoljAAAAFAAAAAEAAAAH+BoQswzzGTKRzrdC6axxKaM4qnyDP8wgQv8Id3S4pbsAAAAAAAAGNAAABjQAAAAAAADNoQAAAAG+w3upAAAAQGBfsx+gyi/2Dh6i+7Vbb6Ongw3HDcFDZ48eoadkUUvkq97zdPe3wYGFswZgT5/GXPqGDBi+iqHuZiYx5eSy3Qk=",
      resultXdr: "AAAAAAAAiRkAAAAAAAAAAQAAAAAAAAAaAAAAAAAAAAA=",
      resultMetaXdr: "AAAAAwAAAAAAAAACAAAAAwAAQowAAAAAAAAAABHCklg6riUqP9F21Lt2zdyIZIx9lSn7t3jGCD2+w3upAAAAF0h1Pp0AAAvWAAAAAgAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAAAMMQAAAABmTz9yAAAAAAAAAAEAAEKMAAAAAAAAAAARwpJYOq4lKj/RdtS7ds3ciGSMfZUp+7d4xgg9vsN7qQAAABdIdT6dAAAL1gAAAAMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAQowAAAAAZk919wAAAAAAAAABAAAACAAAAAMAAAwrAAAACc4pIDe7y0sRFHAghrdpB7ypfj4BVuZStvX4u0BC1S/YAAANVgAAAAAAAAABAABCjAAAAAnOKSA3u8tLERRwIIa3aQe8qX4+AVbmUrb1+LtAQtUv2AAAQ7cAAAAAAAAAAwAADCsAAAAJikpmJa7Pr3lTb+dhRP2N4TOYCqK4tL4tQhDYnNEijtgAAA1WAAAAAAAAAAEAAEKMAAAACYpKZiWuz695U2/nYUT9jeEzmAqiuLS+LUIQ2JzRIo7YAABDtwAAAAAAAAADAAAMMQAAAAlT7LdEin/CaQA3iscHqkwnEFlSh8jfTPTIhSQ5J8Ao0wAADVwAAAAAAAAAAQAAQowAAAAJU+y3RIp/wmkAN4rHB6pMJxBZUofI30z0yIUkOSfAKNMAAEO3AAAAAAAAAAMAAAwxAAAACQycyCYjh7j9CHnTm9OKCYXhgmXw6jdtoMsGHyPk8Aa+AAANXAAAAAAAAAABAABCjAAAAAkMnMgmI4e4/Qh505vTigmF4YJl8Oo3baDLBh8j5PAGvgAAQ7cAAAAAAAAAAgAAAAMAAEKMAAAAAAAAAAARwpJYOq4lKj/RdtS7ds3ciGSMfZUp+7d4xgg9vsN7qQAAABdIdT6dAAAL1gAAAAMAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAQowAAAAAZk919wAAAAAAAAABAABCjAAAAAAAAAAAEcKSWDquJSo/0XbUu3bN3IhkjH2VKfu3eMYIPb7De6kAAAAXSHWDiQAAC9YAAAADAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAwAAAAAAAEKMAAAAAGZPdfcAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAA",
      ledger: 17036,
      createdAt: "1716483575",
    };
    this.axiosMock
      .expects("post")
      .withArgs(
        serverUrl,
        sinon.match({
          jsonrpc: "2.0",
          id: 1,
          method: "simulateTransaction",
        })
      )
      .returns(Promise.resolve({ data: { result: simulateTransactionResponse } }));
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, 
        sinon.match({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
        })
      )
      .returns(Promise.resolve({ data: { result: getTransactionResponse } }));

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, 
        sinon.match({
          jsonrpc: "2.0",
          id: 1,
          method: "sendTransaction",
        })
      )
      .returns(Promise.resolve({ data: { result: sendTransactionResponse } }));

  contract.AssembledTransaction.buildFootprintRestoreTransaction(
    options,
    restoreTxnData,
    new StellarSdk.Account(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      "1",
    ),
    52641,
  )
    .then((txn) => txn.signAndSend({ ...wallet }))
    .then((result) => {
      expect(result.getTransactionResponse.status).to.equal(rpc.Api.GetTransactionStatus.SUCCESS);
      done();
    })
    .catch((error) => {
      // handle any errors that occurred during the promise chain
      done(error);
    });

  })
});
