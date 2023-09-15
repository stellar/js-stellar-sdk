const { SorobanServer } = StellarSdk;

describe("Server.constructor", function () {
  beforeEach(function () {
    this.server = new SorobanServer(serverUrl);
    this.axiosMock = sinon.mock(SorobanAxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  let insecureServerUrl = serverUrl.replace("https://", "http://");

  it("throws error for insecure server", function () {
    expect(() => new SorobanServer(insecureServerUrl)).to.throw(
      /Cannot connect to insecure Soroban RPC server/i,
    );
  });

  it("allow insecure server when opts.allowHttp flag is set", function () {
    expect(
      () => new SorobanServer(insecureServerUrl, { allowHttp: true }),
    ).to.not.throw();
  });
});
