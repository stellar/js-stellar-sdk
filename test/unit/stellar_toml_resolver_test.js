describe("stellar_toml_resolver.js tests", function () {
  beforeEach(function () {
    this.axiosMock = sinon.mock(axios);
    StellarSdk.Config.setDefault();
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe('StellarTomlResolver.resolve', function () {
    it("returns stellar.toml object for valid request and stellar.toml file", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/stellar.toml'))
        .returns(Promise.resolve({
          data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`
        }));

      StellarSdk.StellarTomlResolver.resolve('acme.com')
        .then(stellarToml => {
          expect(stellarToml.FEDERATION_SERVER).equals('https://api.stellar.org/federation');
          done();
        });
    });

    it("returns stellar.toml object for valid request and stellar.toml file when allowHttp is `true`", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('http://acme.com/.well-known/stellar.toml'))
        .returns(Promise.resolve({
          data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`
        }));

      StellarSdk.StellarTomlResolver.resolve('acme.com', {allowHttp: true})
        .then(stellarToml => {
          expect(stellarToml.FEDERATION_SERVER).equals('http://api.stellar.org/federation');
          done();
        });
    });

    it("returns stellar.toml object for valid request and stellar.toml file when global Config.allowHttp flag is set", function (done) {
      StellarSdk.Config.setAllowHttp(true);

      this.axiosMock.expects('get')
        .withArgs(sinon.match('http://acme.com/.well-known/stellar.toml'))
        .returns(Promise.resolve({
          data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`
        }));

      StellarSdk.StellarTomlResolver.resolve('acme.com')
        .then(stellarToml => {
          expect(stellarToml.FEDERATION_SERVER).equals('http://api.stellar.org/federation');
          done();
        });
    });

    it("rejects when stellar.toml file is invalid", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/stellar.toml'))
        .returns(Promise.resolve({
          data: `
/#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`
        }));

      StellarSdk.StellarTomlResolver.resolve('acme.com').should.be.rejectedWith(/Parsing error on line/).and.notify(done);
    });

    it("rejects when there was a connection error", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/stellar.toml'))
        .returns(Promise.reject());

      StellarSdk.StellarTomlResolver.resolve('acme.com').should.be.rejected.and.notify(done);
    });
  });
});
