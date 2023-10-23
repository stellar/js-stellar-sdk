const { Server, AxiosClient } = StellarSdk.SorobanRpc;

describe("Server.constructor", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  let insecureServerUrl = serverUrl.replace("https://", "http://");

  it("throws error for insecure server", function () {
    expect(() => new Server(insecureServerUrl)).to.throw(
      /Cannot connect to insecure Soroban RPC server/i,
    );
  });

  it("allow insecure server when opts.allowHttp flag is set", function () {
    expect(
      () => new Server(insecureServerUrl, { allowHttp: true }),
    ).to.not.throw();
  });
});
