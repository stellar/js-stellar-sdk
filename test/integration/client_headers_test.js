const http = require('http');
const url = require('url');
const port = 3000;

describe('integration tests', function() {
  it("sends client via headers", function(done) {
    if (typeof window !== "undefined") {
      done();
      return;
    }

    var server;

    const requestHandler = (request, response) => {
      expect(request.headers['x-client-name']).to.be.equal('js-stellar-sdk');
      expect(request.headers['x-client-version']).to.match(/^[0-9]+\.[0-9]+\.[0-9]+$/);
      response.end();
      server.close(() => done());
    }

    server = http.createServer(requestHandler);
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return
      }

      new StellarSdk.Server(`http://localhost:${port}`, {allowHttp: true}).operations().call();
    })
  });

  it("sends client data via get params when streaming", function(done) {
    if (typeof window !== "undefined") {
      done();
      return;
    }

    var server;

    const requestHandler = (request, response) => {
      var query = url.parse(request.url, true).query;
      expect(query['X-Client-Name']).to.be.equal('js-stellar-sdk');
      expect(query['X-Client-Version']).to.match(/^[0-9]+\.[0-9]+\.[0-9]+$/);
      response.end();
      server.close(() => done());
    }

    server = http.createServer(requestHandler);
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return
      }

      new StellarSdk.Server(`http://localhost:${port}`, {allowHttp: true}).operations().stream();
    })
  });
});
