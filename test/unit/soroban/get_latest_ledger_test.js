const MockAdapter = require("axios-mock-adapter");

describe("Server#getLatestLedger", function () {
  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("requests the correct method", function (done) {
    const result = {
      id: "hashed_id",
      sequence: 123,
      protocolVersion: 20,
    };
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLatestLedger",
        params: null,
      })
      .returns(Promise.resolve({ data: { result } }));

    this.server
      .getLatestLedger()
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
});
