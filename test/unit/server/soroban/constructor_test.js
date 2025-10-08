const { Server } = StellarSdk.rpc;

describe("Server.constructor", function () {
  beforeEach(function () {
    this.server = new Server(serverUrl);
    this.axiosMock = sinon.mock(this.server.httpClient);
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

  it("creates HttpClient instance with provided headers", function () {
    const headersA = { "Custom-Header-A": "CustomValue" };
    const headersB = { "Custom-Header-B": "CustomValue" };
    const serverA = new Server(serverUrl, { headers: headersA });
    const serverB = new Server(serverUrl, { headers: headersB });

    expect(serverA.httpClient.defaults.headers["Custom-Header-A"]).to.equal(
      "CustomValue",
    );
    expect(serverB.httpClient.defaults.headers["Custom-Header-B"]).to.equal(
      "CustomValue",
    );

    serverA.httpClient.defaults.headers["Custom-A"] = "modified-value";
    expect(serverA.httpClient.defaults.headers["Custom-A"]).to.equal(
      "modified-value",
    );
    serverA.httpClient.defaults.headers["Additional-A"] = "added-value";
    expect(serverA.httpClient.defaults.headers["Additional-A"]).to.equal(
      "added-value",
    );

    expect(serverA.httpClient.defaults.headers["Custom-Header-B"]).to.be
      .undefined;
    expect(serverB.httpClient.defaults.headers["Custom-Header-A"]).to.be
      .undefined;
  });
});
