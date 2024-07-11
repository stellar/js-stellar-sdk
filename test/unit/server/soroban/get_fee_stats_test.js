const { Server, AxiosClient } = StellarSdk.rpc;

describe("Server#getFeeStats", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("requests the correct endpoint", function (done) {
    const innerFeeStat = {
        max: "100000000000000000000", // just > uint32
        min: "100",
        mode: "100",
        p10: "100",
        p20: "100",
        p30: "100",
        p40: "100",
        p50: "100",
        p60: "100",
        p70: "100",
        p80: "100",
        p90: "100",
        p95: "100",
        p99: "100",
        transactionCount: "200",
        ledgerCount: "300",
    }
    const result = {
      sorobanInclusionFee: innerFeeStat,
      inclusionFee: innerFeeStat,
      latestLedger: "12345678",
    };

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getFeeStats",
        params: null,
      })
      .returns(Promise.resolve({ data: { result } }));

    this.server
      .getFeeStats()
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch((err) => done(err));
  });
});
