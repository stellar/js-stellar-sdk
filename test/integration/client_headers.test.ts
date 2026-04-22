import { describe, it, expect, beforeEach } from "vitest";
import * as http from "http";
import * as url from "url";
import { StellarSdk } from "../test-utils/stellar-sdk-import";

const { Horizon } = StellarSdk;
const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/;

// Use different ports for each test to avoid conflicts
const getPort = () => Math.floor(Math.random() * 10000) + 3000;
let port = getPort();
beforeEach(() => {
  port = getPort();
});

describe("integration tests: client headers", () => {
  if (typeof window !== "undefined") {
    return;
  }

  it("sends client via headers", async () => {
    let server: http.Server;

    const requestHandler = (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      expect(request.headers["x-client-name"]).toBe("js-stellar-sdk");
      expect(request.headers["x-client-version"]).toMatch(versionPattern);
      response.end();
      server.close();
    };

    server = http.createServer(requestHandler);

    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    await new Horizon.Server(`http://localhost:${port}`, { allowHttp: true })
      .operations()
      .call();
  });

  it("sends client data via get params when streaming", async () => {
    let server: http.Server;
    let closeStream: () => void;

    const requestHandler = (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      const query = url.parse(request.url!, true).query;
      expect(query["X-Client-Name"]).toBe("js-stellar-sdk");
      expect(query["X-Client-Version"]).toMatch(versionPattern);

      // write a valid event stream so that we don't error prematurely
      response.writeHead(200, {
        "Content-Type": "text/event-stream",
      });
      response.write("retry: 10\nevent: close\ndata: byebye\n\n");
      response.end();

      server.close(() => {
        closeStream();
      });
    };

    server = http.createServer(requestHandler);

    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    closeStream = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    })
      .operations()
      .stream({
        // Server sends `event: close` and tears down. The SDK reconnects per
        // Horizon protocol; that reconnect races with server.close() and will
        // surface as ECONNREFUSED. Close the stream on error so the reconnect
        // loop terminates instead of throwing into the uncaught-exception handler.
        onerror: () => {
          closeStream();
        },
      });
  });

  it("sends client via custom headers", async () => {
    let server: http.Server;

    const requestHandler = (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      expect(request.headers.authorization).toBe("123456789");
      response.end();
      server.close();
    };

    server = http.createServer(requestHandler);

    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    await new Horizon.Server(`http://localhost:${port}`, {
      headers: { authorization: "123456789" },
      allowHttp: true,
    })
      .operations()
      .call();
  });

  it("uses configured server URL for pagination links (reverse proxy support)", async () => {
    let server: http.Server;
    let requestCount = 0;

    const requestHandler = (
      _request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      requestCount++;

      if (requestCount === 1) {
        // First request: return a response with _links pointing to a DIFFERENT host
        // This simulates what Horizon does - it returns its own hostname in links
        response.setHeader("Content-Type", "application/json");
        response.end(
          JSON.stringify({
            _embedded: {
              records: [{ id: "1", paging_token: "token1" }],
            },
            _links: {
              // These links point to a different host (horizon.stellar.org)
              // The SDK should rewrite these to use localhost:${port}
              next: {
                href: `https://horizon.stellar.org/operations?cursor=token1`,
              },
              prev: {
                href: `https://horizon.stellar.org/operations?cursor=token0`,
              },
            },
          }),
        );
      } else if (requestCount === 2) {
        // Second request (pagination): verify it came to our server, not horizon.stellar.org
        response.setHeader("Content-Type", "application/json");
        response.end(
          JSON.stringify({
            _embedded: {
              records: [{ id: "2", paging_token: "token2" }],
            },
            _links: {
              next: {
                href: `https://horizon.stellar.org/operations?cursor=token2`,
              },
              prev: {
                href: `https://horizon.stellar.org/operations?cursor=token1`,
              },
            },
          }),
        );
        server.close();
      }
    };

    server = http.createServer(requestHandler);

    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    const horizonServer = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    });

    // First request
    const firstPage = await horizonServer.operations().call();
    expect(firstPage.records).toHaveLength(1);
    expect(firstPage.records[0]!.id).toBe("1");

    // Second request via .next() - this should go to localhost, not horizon.stellar.org
    // If the fix works, requestCount will be 2. If not, this will timeout/fail
    // because the request would go to horizon.stellar.org instead of our mock server
    const secondPage = await firstPage.next();
    expect(secondPage.records).toHaveLength(1);
    expect(secondPage.records[0]!.id).toBe("2");

    // Verify both requests came to our server
    expect(requestCount).toBe(2);
  });

  it("sends appName and appVersion via headers for HTTP requests", async () => {
    let server: http.Server;

    const requestHandler = (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      expect(request.headers["x-app-name"]).toBe("my-app");
      expect(request.headers["x-app-version"]).toBe("1.0.0");
      response.end();
      server.close();
    };

    server = http.createServer(requestHandler);

    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    await new Horizon.Server(`http://localhost:${port}`, {
      appName: "my-app",
      appVersion: "1.0.0",
      allowHttp: true,
    })
      .operations()
      .call();
  });

  it("sends appName and appVersion via query params when streaming", async () => {
    let server: http.Server;
    let closeStream: () => void;

    const requestHandler = (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      const query = url.parse(request.url!, true).query;
      expect(query["X-App-Name"]).toBe("my-app");
      expect(query["X-App-Version"]).toBe("1.0.0");

      response.writeHead(200, {
        "Content-Type": "text/event-stream",
      });
      response.write("retry: 10\nevent: close\ndata: byebye\n\n");
      response.end();

      server.close(() => {
        closeStream();
      });
    };

    server = http.createServer(requestHandler);

    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    closeStream = new Horizon.Server(`http://localhost:${port}`, {
      appName: "my-app",
      appVersion: "1.0.0",
      allowHttp: true,
    })
      .operations()
      .stream({
        onerror: () => {
          closeStream();
        },
      });
  });
});
