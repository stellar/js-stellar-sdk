import http from "http";

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

    it("fails when response exceeds the limit", function (done) {
      // Unable to create temp server in a browser
      if (typeof window != 'undefined') {
        return done();
      }
      var response = Array(StellarSdk.STELLAR_TOML_MAX_SIZE+10).join('a');
      let tempServer = http.createServer((req, res) => {
        res.setHeader('Content-Type', 'text/x-toml; charset=UTF-8');
        res.end(response);
      }).listen(4444, () => {
        StellarSdk.StellarTomlResolver.resolve("localhost:4444", {allowHttp: true})
          .should.be.rejectedWith(/maxContentLength size of [0-9]+ exceeded/)
          .notify(done)
          .then(() => tempServer.close());
      });
    });
  });
});
