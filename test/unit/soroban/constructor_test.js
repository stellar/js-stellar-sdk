const MockAdapter = require("axios-mock-adapter");

describe("Server.constructor", function () {
  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  let insecureServerUrl = serverUrl.replace("https://", "http://");

  it("throws error for insecure server", function () {
    expect(() => new SorobanClient.Server(insecureServerUrl)).to.throw(
      /Cannot connect to insecure soroban-rpc server/
    );
  });

  it("allow insecure server when opts.allowHttp flag is set", function () {
    expect(
      () => new SorobanClient.Server(insecureServerUrl, { allowHttp: true })
    ).to.not.throw();
  });
});
