const http = require("http");

const { Resolver, STELLAR_TOML_MAX_SIZE } = StellarSdk.StellarToml;

describe("stellar_toml_resolver.js tests", function () {
  beforeEach(function () {
    this.axiosMock = sinon.mock(axios);
    StellarSdk.Config.setDefault();
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe("Resolver.resolve", function () {
    afterEach(function () {
      StellarSdk.Config.setDefault();
    });

    it("returns stellar.toml object for valid request and stellar.toml file", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("https://acme.com/.well-known/stellar.toml"))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`,
          }),
        );

      Resolver.resolve("acme.com").then((stellarToml) => {
        expect(stellarToml.FEDERATION_SERVER).equals(
          "https://api.stellar.org/federation",
        );
        done();
      });
    });

    it("returns stellar.toml object for valid request and stellar.toml file when allowHttp is `true`", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("http://acme.com/.well-known/stellar.toml"))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`,
          }),
        );

      Resolver.resolve("acme.com", {
        allowHttp: true,
      }).then((stellarToml) => {
        expect(stellarToml.FEDERATION_SERVER).equals(
          "http://api.stellar.org/federation",
        );
        done();
      });
    });

    it("returns stellar.toml object for valid request and stellar.toml file when global Config.allowHttp flag is set", function (done) {
      StellarSdk.Config.setAllowHttp(true);

      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("http://acme.com/.well-known/stellar.toml"))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`,
          }),
        );

      Resolver.resolve("acme.com").then((stellarToml) => {
        expect(stellarToml.FEDERATION_SERVER).equals(
          "http://api.stellar.org/federation",
        );
        done();
      });
    });

    it("rejects when stellar.toml file is invalid", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("https://acme.com/.well-known/stellar.toml"))
        .returns(
          Promise.resolve({
            data: `
/#   The endpoint which clients should query to resolve stellar addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`,
          }),
        );

      Resolver.resolve("acme.com")
        .should.be.rejectedWith(/Parsing error on line/)
        .and.notify(done);
    });

    it("rejects when there was a connection error", function (done) {
      this.axiosMock
        .expects("get")
        .withArgs(sinon.match("https://acme.com/.well-known/stellar.toml"))
        .returns(Promise.reject());

      Resolver.resolve("acme.com").should.be.rejected.and.notify(done);
    });

    it("fails when response exceeds the limit", function (done) {
      // Unable to create temp server in a browser
      if (typeof window != "undefined") {
        return done();
      }
      var response = Array(STELLAR_TOML_MAX_SIZE + 10).join("a");
      let tempServer = http
        .createServer((req, res) => {
          res.setHeader("Content-Type", "text/x-toml; charset=UTF-8");
          res.end(response);
        })
        .listen(4444, () => {
          Resolver.resolve("localhost:4444", {
            allowHttp: true,
          })
            .should.be.rejectedWith(
              /stellar.toml file exceeds allowed size of [0-9]+/,
            )
            .notify(done)
            .then(() => tempServer.close());
        });
    });

    it("rejects after given timeout when global Config.timeout flag is set", function (done) {
      StellarSdk.Config.setTimeout(1000);

      // Unable to create temp server in a browser
      if (typeof window != "undefined") {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444, () => {
          Resolver.resolve("localhost:4444", {
            allowHttp: true,
          })
            .should.be.rejectedWith(/timeout of 1000ms exceeded/)
            .notify(done)
            .then(() => {
              StellarSdk.Config.setDefault();
              tempServer.close();
            });
        });
    });

    it("rejects after given timeout when timeout specified in Resolver opts param", function (done) {
      // Unable to create temp server in a browser
      if (typeof window != "undefined") {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444, () => {
          Resolver.resolve("localhost:4444", {
            allowHttp: true,
            timeout: 1000,
          })
            .should.be.rejectedWith(/timeout of 1000ms exceeded/)
            .notify(done)
            .then(() => tempServer.close());
        });
    });

    it("rejects redirect response when allowedRedirects is not specified", function (done) {
      // Unable to create temp server in a browser
      if (typeof window != "undefined") {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          res.writeHead(302, { location: "/redirect" });
          return res.end();
        })
        .listen(4444, () => {
          Resolver.resolve("localhost:4444", {
            allowHttp: true,
          })
            .then((response) => {
              should.fail();
            })
            .catch((e) => {
              expect(e).to.match(/Maximum number of redirects exceeded/);
            })
            .finally(() => {
              tempServer.close();
              done();
            });
        });
    });

    it("returns handled redirect when allowedRedirects is specified", function (done) {
      if (typeof window != "undefined") {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          if (req.url !== "/redirect") {
            res.writeHead(302, { location: "/redirect" });
            return res.end();
          }
          res.setHeader("Content-Type", "text/x-toml; charset=UTF-8");
          res.writeHead(200);
          res.end(`
          FEDERATION_SERVER="https://api.stellar.org/federation"
          `);
        })
        .listen(4444, () => {
          Resolver.resolve("localhost:4444", {
            allowHttp: true,
            allowedRedirects: 1,
          })
            .then((response) => {
              expect(response.FEDERATION_SERVER).equals(
                "https://api.stellar.org/federation",
              );
            })
            .finally(() => {
              tempServer.close();
              done();
            });
        });
    });
  });
});
