const {
  xdr,
  Keypair,
  Account,
  TransactionBuilder,
  nativeToScVal,
  XdrLargeInt,
} = StellarSdk;
const { Server, AxiosClient } = StellarSdk.rpc;

describe("Server#getTransaction", function () {
  let keypair = Keypair.random();
  let account = new StellarSdk.Account(keypair.publicKey(), "56199647068161");

  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    let transaction = new TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: StellarSdk.Networks.TESTNET,
      v1: true,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination:
            "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
          asset: StellarSdk.Asset.native(),
          amount: "100.50",
        }),
      )
      .setTimeout(StellarSdk.TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.blob = transaction.toEnvelope().toXDR().toString("base64");
    this.prepareAxios = (result) => {
      this.axiosMock
        .expects("post")
        .withArgs(serverUrl, {
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: { hash: result.txHash },
        })
        .returns(Promise.resolve({ data: { id: 1, result } }));
    };
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("transaction not found", function (done) {
    const result = makeTxResult("NOT_FOUND");
    this.prepareAxios(result);

    this.server
      .getTransaction(result.txHash)
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch((err) => done(err));
  });

  it("transaction success", function (done) {
    const result = makeTxResult("SUCCESS", true);
    this.prepareAxios(result);

    let expected = JSON.parse(JSON.stringify(result));
    [
      ["envelopeXdr", xdr.TransactionEnvelope],
      ["resultXdr", xdr.TransactionResult],
      ["resultMetaXdr", xdr.TransactionMeta],
    ].forEach(([field, struct]) => {
      expected[field] = struct.fromXDR(result[field], "base64");
    });
    expected.returnValue = expected.resultMetaXdr
      .v3()
      .sorobanMeta()
      .returnValue();

    this.server
      .getTransaction(result.txHash)
      .then((resp) => {
        expect(Object.keys(resp)).to.eql(Object.keys(expected));
        expect(resp).to.eql(expected);
        expect(resp.returnValue).to.eql(new XdrLargeInt("u64", 1234).toScVal());
        done();
      })
      .catch((err) => done(err));
  });

  xit("non-Soroban transaction success", function (done) {
    const result = makeTxResult("SUCCESS", false);
    this.prepareAxios(result);

    this.server
      .getTransaction(result.txHash)
      .then((resp) => {
        expect(resp).to.be.deep.equal(result);
        done();
      })
      .catch((err) => done(err));
  });

  xit("transaction pending", function (done) {});
  xit("transaction error", function (done) {});
});

function makeTxResult(status, addSoroban = true) {
  const metaV3 = new xdr.TransactionMeta(
    3,
    new xdr.TransactionMetaV3({
      ext: new xdr.ExtensionPoint(0),
      txChangesBefore: [],
      operations: [],
      txChangesAfter: [],
      sorobanMeta: new xdr.SorobanTransactionMeta({
        ext: new xdr.SorobanTransactionMetaExt(0),
        events: [],
        diagnosticEvents: [],
        returnValue: nativeToScVal(1234),
      }),
    }),
  );

  // only injected in the success case
  //
  // this data was picked from a random transaction in horizon:
  // aa6a8e198abe53c7e852e4870413b29fe9ef04da1415a97a5de1a4ae489e11e2
  const successInfo = {
    ledger: 1234,
    createdAt: 123456789010,
    applicationOrder: 2,
    feeBump: false,
    envelopeXdr:
      "AAAAAgAAAAAT/LQZdYz0FcQ4Xwyg8IM17rkUx3pPCCWLu+SowQ/T+gBLB24poiQa9iwAngAAAAEAAAAAAAAAAAAAAABkwdeeAAAAAAAAAAEAAAABAAAAAC/9E8hDhnktyufVBS5tqA734Yz5XrLX2XNgBgH/YEkiAAAADQAAAAAAAAAAAAA1/gAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA1/gAAAAQAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AAAACUEFMTEFESVVNAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAAAAAAAACwQ/T+gAAAEA+ztVEKWlqHXNnqy6FXJeHr7TltHzZE6YZm5yZfzPIfLaqpp+5cyKotVkj3d89uZCQNsKsZI48uoyERLne+VwL/2BJIgAAAEA7323gPSaezVSa7Vi0J4PqsnklDH1oHLqNBLwi5EWo5W7ohLGObRVQZ0K0+ufnm4hcm9J4Cuj64gEtpjq5j5cM",
    resultXdr:
      "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAANAAAAAAAAAAUAAAACZ4W6fmN63uhVqYRcHET+D2NEtJvhCIYflFh9GqtY+AwAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAYW0toL2gAAAAAAAAAAAAANf4AAAACcgyAkXD5kObNTeRYciLh7R6ES/zzKp0n+cIK3Y6TjBkAAAABU0dYAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGlGnIJrXAAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGFtLaC9oAAAAApmc7UgUBInrDvij8HMSridx2n1w3I8TVEn4sLr1LSpmAAAAAlBBTExBRElVTQAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAIUz88EqYAAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABpRpyCa1wAAAAKYUsaaCZ233xB1p+lG7YksShJWfrjsmItbokiR3ifa0gAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAJQQUxMQURJVU0AAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AACFM/PBKmAAAAAJnhbp+Y3re6FWphFwcRP4PY0S0m+EIhh+UWH0aq1j4DAAAAAAAAAAAAAA9pAAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA9pAAAAAA=",
    resultMetaXdr: metaV3.toXDR("base64"),
  };

  if (!addSoroban) {
    // replace the V3 Soroban meta with a "classic" V2 version
    successInfo.resultMetaXdr =
      "AAAAAgAAAAIAAAADAtL5awAAAAAAAAAAS0CFMhOtWUKJWerx66zxkxORaiH6/3RUq7L8zspD5RoAAAAAAcm9QAKVkpMAAHpMAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAwAAAAAC0vi5AAAAAGTB02oAAAAAAAAAAQLS+WsAAAAAAAAAAEtAhTITrVlCiVnq8eus8ZMTkWoh+v90VKuy/M7KQ+UaAAAAAAHJvUAClZKTAAB6TQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAtL5awAAAABkwdd1AAAAAAAAAAEAAAAGAAAAAwLS+VQAAAACAAAAAG4cwu71zHNXx3jHCzRGOIthcnfwRgfN2f/AoHFLLMclAAAAAEySDkgAAAAAAAAAAkJVU0lORVNTAAAAAAAAAAC3JfDeo9vreItKNPoe74EkFIqWybeUQNFvLvURhHtskAAAAAAeQtHTL5f6TAAAXH0AAAAAAAAAAAAAAAAAAAABAtL5awAAAAIAAAAAbhzC7vXMc1fHeMcLNEY4i2Fyd/BGB83Z/8CgcUssxyUAAAAATJIOSAAAAAAAAAACQlVTSU5FU1MAAAAAAAAAALcl8N6j2+t4i0o0+h7vgSQUipbJt5RA0W8u9RGEe2yQAAAAAB5C0dNHf4CAAACLCQAAAAAAAAAAAAAAAAAAAAMC0vlUAAAAAQAAAABuHMLu9cxzV8d4xws0RjiLYXJ38EYHzdn/wKBxSyzHJQAAAAJCVVNJTkVTUwAAAAAAAAAAtyXw3qPb63iLSjT6Hu+BJBSKlsm3lEDRby71EYR7bJAAAAAAAABAL3//////////AAAAAQAAAAEAE3H3TnhnuQAAAAAAAAAAAAAAAAAAAAAAAAABAtL5awAAAAEAAAAAbhzC7vXMc1fHeMcLNEY4i2Fyd/BGB83Z/8CgcUssxyUAAAACQlVTSU5FU1MAAAAAAAAAALcl8N6j2+t4i0o0+h7vgSQUipbJt5RA0W8u9RGEe2yQAAAAAAAAQC9//////////wAAAAEAAAABABNx9J6Z4RkAAAAAAAAAAAAAAAAAAAAAAAAAAwLS+WsAAAAAAAAAAG4cwu71zHNXx3jHCzRGOIthcnfwRgfN2f/AoHFLLMclAAAAH37+zXQCXdRTAAASZAAAApIAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAEAAABbBXKIigAAABhZWyiOAAAAAgAAAAAAAAAAAAAAAAAAAAMAAAAAAtL0awAAAABkwbqrAAAAAAAAAAEC0vlrAAAAAAAAAABuHMLu9cxzV8d4xws0RjiLYXJ38EYHzdn/wKBxSyzHJQAAAB9+/s10Al3UUwAAEmQAAAKSAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAWwVyiIoAAAAYWVsojgAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAALS9GsAAAAAZMG6qwAAAAAAAAAA";
  }

  return {
    status,
    txHash: "ae9f315c048d87a5f853bc15bf284a2c3c89eb0e1cb38c10409b77a877b830a8",
    latestLedger: 100,
    latestLedgerCloseTime: 12345,
    oldestLedger: 50,
    oldestLedgerCloseTime: 500,
    ...(status === "SUCCESS" && successInfo),
  };
}
