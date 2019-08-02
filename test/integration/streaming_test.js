const http = require("http");
const url = require("url");
const port = 3100;

describe("integration tests: streaming", function(done) {
  if (typeof window !== "undefined") {
    done();
    return;
  }

  it("handles onerror", function(done) {
    let server;
    let closeStream;

    const requestHandler = (request, response) => {
      // returning a 401 will call the onerror callback.
      response.statusCode = 401;
      response.end();
      server.close();
    };

    server = http.createServer(requestHandler);
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return;
      }

      closeStream = new StellarSdk.Server(`http://localhost:${port}`, {
        allowHttp: true,
      })
        .operations()
        .stream({
          onerror: (err) => {
            server.close();
            closeStream();
            done();
          },
        });
    });
  });
});
