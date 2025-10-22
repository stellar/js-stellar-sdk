const { Address, xdr, hash, Contract } = StellarSdk;
const { Server, AxiosClient } = StellarSdk.rpc;

describe("Server#getContractWasm", () => {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(this.server.httpClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  const contractId = "CCN57TGC6EXFCYIQJ4UCD2UDZ4C3AQCHVMK74DGZ3JYCA5HD4BY7FNPC";
  const wasmHash = Buffer.from(
    "kh1dFBiUKv/lXkcD+XnVTsbzi+Lps96lfWEk3rFWNnI=",
    "base64",
  );
  const wasmBuffer = Buffer.from(
    "0061730120c0800010ab818080000b20002035503082000336232636439000",
    "hex",
  );
  const contractCodeEntryExtension = xdr.ContractCodeEntryExt.fromXDR(
    "AAAAAQAAAAAAAAAAAAAVqAAAAJwAAAADAAAAAwAAABgAAAABAAAAAQAAABEAAAAgAAABpA==",
    "base64",
  );

  const contract = new Contract(contractId);
  const contractLedgerKey = contract.getFootprint();
  const address = contract.address();

  const ledgerEntryWasmHash = xdr.LedgerEntryData.contractData(
    new xdr.ContractDataEntry({
      ext: new xdr.ExtensionPoint(0),
      contract: address.toScAddress(),
      durability: xdr.ContractDataDurability.persistent(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      val: xdr.ScVal.scvContractInstance(
        new xdr.ScContractInstance({
          executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
          storage: null,
        }),
      ),
    }),
  );
  const ledgerKeyWasmHash = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: ledgerEntryWasmHash.contractData().contract(),
      durability: ledgerEntryWasmHash.contractData().durability(),
      key: ledgerEntryWasmHash.contractData().key(),
    }),
  );
  const ledgerTtlEntryWasmHash = xdr.LedgerEntryData.ttl(
    new xdr.TtlEntry({
      keyHash: hash(ledgerKeyWasmHash.toXDR()),
      liveUntilLedgerSeq: 1000,
    }),
  );

  const wasmHashResult = {
    lastModifiedLedgerSeq: 1,
    key: ledgerKeyWasmHash,
    val: ledgerEntryWasmHash,
    liveUntilLedgerSeq: 1000,
  };

  const wasmLedgerKey = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: wasmHash,
    }),
  );
  const wasmLedgerCode = xdr.LedgerEntryData.contractCode(
    new xdr.ContractCodeEntry({
      ext: contractCodeEntryExtension,
      hash: wasmHash,
      code: wasmBuffer,
    }),
  );

  const wasmLedgerTtlEntry = xdr.LedgerEntryData.ttl(
    new xdr.TtlEntry({
      keyHash: hash(wasmLedgerKey.toXDR()),
      liveUntilLedgerSeq: 1000,
    }),
  );

  const wasmResult = {
    lastModifiedLedgerSeq: 1,
    key: wasmLedgerKey,
    val: wasmLedgerCode,
    liveUntilLedgerSeq: 1000,
  };

  it("retrieves WASM bytecode for a contract", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [contractLedgerKey.toXDR("base64")] },
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 18039,
              entries: [
                {
                  liveUntilLedgerSeq: ledgerTtlEntryWasmHash
                    .ttl()
                    .liveUntilLedgerSeq(),
                  lastModifiedLedgerSeq: wasmHashResult.lastModifiedLedgerSeq,
                  xdr: ledgerEntryWasmHash.toXDR("base64"),
                  key: contractLedgerKey.toXDR("base64"),
                },
              ],
            },
          },
        }),
      );

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [wasmLedgerKey.toXDR("base64")] },
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 18039,
              entries: [
                {
                  liveUntilLedgerSeq: wasmLedgerTtlEntry
                    .ttl()
                    .liveUntilLedgerSeq(),
                  lastModifiedLedgerSeq: wasmResult.lastModifiedLedgerSeq,
                  key: wasmLedgerKey.toXDR("base64"),
                  xdr: wasmLedgerCode.toXDR("base64"),
                },
              ],
            },
          },
        }),
      );

    this.server
      .getContractWasmByContractId(contractId)
      .then((wasmData) => {
        expect(wasmData).to.eql(wasmBuffer);
        done();
      })
      .catch((err) => done(err));
  });

  it("fails when wasmHash is not found", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [contractLedgerKey.toXDR("base64")] },
      })
      .returns(Promise.resolve({ data: { result: { entries: [] } } }));

    this.server
      .getContractWasmByContractId(contractId)
      .then(function (_response) {
        done(new Error("Expected error"));
      })
      .catch(function (err) {
        done(
          err.code == 404
            ? null
            : new Error("Expected error code 404, got: " + err.code),
        );
      });
  });

  it("fails when wasm is not found", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [contractLedgerKey.toXDR("base64")] },
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 18039,
              entries: [
                {
                  liveUntilLedgerSeq: ledgerTtlEntryWasmHash
                    .ttl()
                    .liveUntilLedgerSeq(),
                  lastModifiedLedgerSeq: wasmHashResult.lastModifiedLedgerSeq,
                  xdr: ledgerEntryWasmHash.toXDR("base64"),
                  key: contractLedgerKey.toXDR("base64"),
                },
              ],
            },
          },
        }),
      );

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: { keys: [wasmLedgerKey.toXDR("base64")] },
      })
      .returns(Promise.resolve({ data: { result: { entries: [] } } }));

    this.server
      .getContractWasmByContractId(contractId)
      .then(function (_response) {
        done(new Error("Expected error"));
      })
      .catch(function (err) {
        done(
          err.code == 404
            ? null
            : new Error("Expected error code 404, got: " + err.code),
        );
      });
  });
});
