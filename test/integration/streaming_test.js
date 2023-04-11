const http = require("http");
const url = require("url");
const port = 3100;

describe("integration tests: streaming", function (done) {
  if (typeof window !== "undefined") {
    done();
    return;
  }

  it("handles onerror", function (done) {
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

  it("handles close message", function (done) {
    let server;
    let closeStream;

    const requestHandler = (request, response) => {
      // the streamer will retry indefinitely (by design), so we want to ensure
      // that the test is only completed once
      if (!server.listening) {
        return;
      }

      request.once("close", (e) => {
        closeStream();
        server.close();
        done();
      });

      response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      response.write("retry: 10\nevent: close\ndata: byebye\n\n");
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
          onmessage: (m) => {
            done("unexpected message " + JSON.stringify(m));
          },
          onerror: (err) => {
            done(err);
          },
        });
    });
  });
});

describe("end-to-end tests: real streaming", function (done) {
  if (typeof window !== "undefined") {
    done();
    return;
  }

  // stream transactions from pubnet for a while and ensure that we cross a
  // ledger boundary (if streaming is broken, we will get stuck on a single
  // ledger's transaction batch).
  it("streams in perpetuity", function (done) {
    const DURATION = 30;
    const server = new StellarSdk.Server("https://horizon.stellar.org");
    this.timeout((DURATION + 5) * 1000); // pad timeout

    let transactions = [];

    const finishTest = (err) => {
      clearTimeout(timeout);
      closeHandler();

      expect(transactions.length).to.be.gt(0);
      let firstLedger = transactions[0].ledger_attr;
      let lastLedger = transactions[transactions.length - 1].ledger_attr;
      expect(lastLedger - firstLedger).to.be.gte(1);

      done(err);
    };

    let closeHandler = server
      .transactions()
      .cursor("now")
      .stream({
        onmessage: (msg) => {
          transactions.push(msg);
        },
        onerror: finishTest,
      });

    let timeout = setTimeout(finishTest, DURATION * 1000);
  });
});
