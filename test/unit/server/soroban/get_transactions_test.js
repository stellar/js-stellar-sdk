const {
  xdr,
  Keypair,
  Account,
  TransactionBuilder,
  nativeToScVal,
  XdrLargeInt,
} = StellarSdk;
const { Server, AxiosClient } = StellarSdk.rpc;

describe("Server#getTransactions", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    this.prepareAxios = (result) => {
      this.axiosMock
        .expects("post")
        .withArgs(serverUrl, {
          jsonrpc: "2.0",
          id: 1,
          method: "getTransactions",
          params: {
            startLedger: 1234,
            limit: 10,
          },
        })
        .returns(Promise.resolve({ data: { id: 1, result } }));
    };
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("fetches transactions successfully", function (done) {
    const rawResult = makeGetTransactionsResult();
    this.prepareAxios(rawResult);

    let expected = JSON.parse(JSON.stringify(rawResult));
    expected.transactions = expected.transactions.map((tx) => {
      let parsedTx = { ...tx };
      [
        ["envelopeXdr", xdr.TransactionEnvelope],
        ["resultXdr", xdr.TransactionResult],
        ["resultMetaXdr", xdr.TransactionMeta],
      ].forEach(([field, struct]) => {
        parsedTx[field] = struct.fromXDR(tx[field], "base64");
      });
      if (tx.status === "SUCCESS") {
        parsedTx.returnValue = parsedTx.resultMetaXdr
          .v3()
          .sorobanMeta()
          .returnValue();
      }
      return parsedTx;
    });

    this.server
      .getTransactions({ startLedger: 1234, limit: 10 })
      .then((resp) => {
        expect(Object.keys(resp)).to.eql(Object.keys(expected));
        expect(resp.transactions.length).to.equal(expected.transactions.length);
        expect(resp).to.eql(expected);
        expect(resp.transactions[0].returnValue).to.eql(
          new XdrLargeInt("u64", 1234).toScVal(),
        );
        expect(resp.transactions[1].returnValue).to.eql(
          new XdrLargeInt("u64", 1235).toScVal(),
        );
        done();
      })
      .catch((err) => done(err));
  });

  it("empty transaction list", function (done) {
    const result = {
      transactions: [],
      latestLedger: 100,
      oldestLedger: 1,
      oldestLedgerCloseTimestamp: 123456789,
      latestLedgerCloseTimestamp: 987654321,
      cursor: "123456",
    };
    this.prepareAxios(result);

    this.server
      .getTransactions({ startLedger: 1234, limit: 10 })
      .then((resp) => {
        expect(resp).to.deep.equal(result);
        expect(resp.transactions).to.be.an("array").that.is.empty;
        done();
      })
      .catch((err) => done(err));
  });

  it("handles errors", function (done) {
    const errorResponse = {
      code: -32600,
      message: "Invalid request",
      data: {
        extras: {
          reason: "Invalid startLedger",
        },
      },
    };

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransactions",
        params: { startLedger: -1, limit: 10 },
      })
      .returns(Promise.reject({ response: { data: errorResponse } }));

    this.server
      .getTransactions({ startLedger: -1, limit: 10 })
      .then(() => {
        done(new Error("Expected method to reject."));
      })
      .catch((err) => {
        expect(err.response.data).to.eql(errorResponse);
        done();
      });
  });
});

function makeGetTransactionsResult(count = 2) {
  const transactions = [];
  for (let i = 0; i < count; i++) {
    transactions.push(makeTxResult(1234 + i, i + 1, "SUCCESS"));
  }
  return {
    transactions,
    latestLedger: 100,
    latestLedgerCloseTimestamp: 987654321,
    oldestLedger: 1,
    oldestLedgerCloseTimestamp: 123456789,
    cursor: "123456",
  };
}

function makeTxResult(ledger, applicationOrder, status) {
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
        returnValue: nativeToScVal(ledger),
      }),
    }),
  );

  return {
    status: status,
    ledger: ledger,
    txHash: "ae9f315c048d87a5f853bc15bf284a2c3c89eb0e1cb38c10409b77a877b830a8",
    createdAt: ledger * 25 + 100,
    applicationOrder: applicationOrder,
    feeBump: false,
    envelopeXdr:
      "AAAAAgAAAAAT/LQZdYz0FcQ4Xwyg8IM17rkUx3pPCCWLu+SowQ/T+gBLB24poiQa9iwAngAAAAEAAAAAAAAAAAAAAABkwdeeAAAAAAAAAAEAAAABAAAAAC/9E8hDhnktyufVBS5tqA734Yz5XrLX2XNgBgH/YEkiAAAADQAAAAAAAAAAAAA1/gAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA1/gAAAAQAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AAAACUEFMTEFESVVNAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAAAAAAAACwQ/T+gAAAEA+ztVEKWlqHXNnqy6FXJeHr7TltHzZE6YZm5yZfzPIfLaqpp+5cyKotVkj3d89uZCQNsKsZI48uoyERLne+VwL/2BJIgAAAEA7323gPSaezVSa7Vi0J4PqsnklDH1oHLqNBLwi5EWo5W7ohLGObRVQZ0K0+ufnm4hcm9J4Cuj64gEtpjq5j5cM",
    resultXdr:
      "AAAAAAAAAGQAAAAAAAAAAQAAAAAAAAANAAAAAAAAAAUAAAACZ4W6fmN63uhVqYRcHET+D2NEtJvhCIYflFh9GqtY+AwAAAACU0lMVkVSAAAAAAAAAAAAAFDutWuu6S6UPJBrotNSgfmXa27M++63OT7TYn1qjgy+AAAYW0toL2gAAAAAAAAAAAAANf4AAAACcgyAkXD5kObNTeRYciLh7R6ES/zzKp0n+cIK3Y6TjBkAAAABU0dYAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGlGnIJrXAAAAAlNJTFZFUgAAAAAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAGFtLaC9oAAAAApmc7UgUBInrDvij8HMSridx2n1w3I8TVEn4sLr1LSpmAAAAAlBBTExBRElVTQAAAAAAAABQ7rVrrukulDyQa6LTUoH5l2tuzPvutzk+02J9ao4MvgAAIUz88EqYAAAAAVNHWAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABpRpyCa1wAAAAKYUsaaCZ233xB1p+lG7YksShJWfrjsmItbokiR3ifa0gAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAJQQUxMQURJVU0AAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AACFM/PBKmAAAAAJnhbp+Y3re6FWphFwcRP4PY0S0m+EIhh+UWH0aq1j4DAAAAAAAAAAAAAA9pAAAAAJTSUxWRVIAAAAAAAAAAAAAUO61a67pLpQ8kGui01KB+Zdrbsz77rc5PtNifWqODL4AABv52PPa5wAAAAAv/RPIQ4Z5Lcrn1QUubagO9+GM+V6y19lzYAYB/2BJIgAAAAAAAAAAAAA9pAAAAAA=",
    resultMetaXdr: metaV3.toXDR("base64"),
    events: {
      diagnosticEventsXdr: [],
      contractEventsXdr: [],
      transactionEventsXdr: [],
    },
  };
}
