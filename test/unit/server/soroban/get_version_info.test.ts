const { Server, AxiosClient } = StellarSdk.rpc;

describe("Server#getVersionInfo", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(this.server.httpClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("requests the correct endpoint", function (done) {
    let result = {
      version: "21.4.0-dbb390c6bb99024122fccb12c8219af67d50db04",
      commit_hash: "dbb390c6bb99024122fccb12c8219af67d50db04",
      build_time_stamp: "2024-07-10T14:50:09",
      captive_core_version:
        "stellar-core 21.1.1 (b3aeb14cc798f6d11deb2be913041be916f3b0cc)",
      protocol_version: 21,
    };

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getVersionInfo",
        params: null,
      })
      .returns(Promise.resolve({ data: { result } }));

    this.server
      .getVersionInfo()
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
});
