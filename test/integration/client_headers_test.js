const { Horizon } = StellarSdk;

const http = require("http");
const url = require("url");
const port = 3100;

const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/;

describe("integration tests: client headers", function (done) {
  if (typeof window !== "undefined") {
    done();
    return;
  }

  it("sends client via headers", function (done) {
    let server;

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("js-stellar-sdk");
      expect(request.headers["x-client-version"]).to.match(versionPattern);
      response.end();
      server.close(() => done());
    };

    server = http.createServer(requestHandler);
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return;
      }

      new Horizon.Server(`http://localhost:${port}`, { allowHttp: true })
        .operations()
        .call();
    });
  });

  it("sends client data via get params when streaming", function (done) {
    let server;
    let closeStream;

    const requestHandler = (request, response) => {
      // eslint-disable-next-line node/no-deprecated-api
      let query = url.parse(request.url, true).query;
      expect(query["X-Client-Name"]).to.be.equal("js-stellar-sdk");
      expect(query["X-Client-Version"]).to.match(versionPattern);

      // write a valid event stream so that we don't error prematurely
      response.writeHead(200, {
        "Content-Type": "text/event-stream",
      });
      response.write("retry: 10\nevent: close\ndata: byebye\n\n");
      response.end();

      server.close(() => {
        closeStream();
        done();
      });
    };

    server = http.createServer(requestHandler);
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return;
      }

      closeStream = new Horizon.Server(`http://localhost:${port}`, {
        allowHttp: true,
      })
        .operations()
        .stream({ onerror: (err) => done(err) });
    });
  });

  it("sends client via custom headers", function (done) {
    let server;

    const requestHandler = (request, response) => {
      expect(request.headers["authorization"]).to.be.equal("123456789");
      response.end();
      server.close(() => done());
    };

    server = http.createServer(requestHandler);
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return;
      }

      new Horizon.Server(`http://localhost:${port}`, { headers: { "authorization": "123456789" }, allowHttp: true })
        .operations()
        .call();
    });
  });
});
