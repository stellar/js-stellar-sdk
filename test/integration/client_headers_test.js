const http = require("http");
const url = require("url");
const port = 3100;

describe("integration tests: client headers", function (done) {
  if (typeof window !== "undefined") {
    done();
    return;
  }

  it("sends client via headers", function (done) {
    let server;

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("js-soroban-client");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );
      response.end();
      server.close(() => done());
    };

    server = http.createServer(requestHandler);
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return;
      }

      new SorobanClient.Server(`http://localhost:${port}`, {
        allowHttp: true,
      }).getHealth();
    });
  });
});
