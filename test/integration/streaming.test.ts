import { describe, it, expect, beforeEach } from "vitest";
import * as http from "http";
import * as StellarSdk from "../../src/index.js";

const { Horizon } = StellarSdk;

// Use different ports for each test to avoid conflicts
const getPort = () => Math.floor(Math.random() * 10000) + 3000;
let port = getPort();
beforeEach(() => {
  port = getPort();
});

describe("integration tests: streaming", () => {
  if (typeof window !== "undefined") {
    return;
  }

  it("handles onerror", async () => {
    let server: http.Server;
    let closeStream: () => void;

    const requestHandler = (
      _request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      // returning a 401 will call the onerror callback.
      response.statusCode = 401;
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

    await new Promise<void>((resolve) => {
      closeStream = new Horizon.Server(`http://localhost:${port}`, {
        allowHttp: true,
      })
        .operations()
        .stream({
          onerror: () => {
            server.close();
            closeStream();
            resolve();
          },
        });
    });
  });

  it("handles close message", async () => {
    const requestHandler = (
      _request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      response.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      response.write("retry: 10\nevent: close\ndata: byebye\n\n");
    };

    const server = http.createServer(requestHandler);

    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });

    // Start the stream and immediately close it
    const closeStream = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    })
      .operations()
      .stream({
        onmessage: (m) => {
          // This should not be called since we close immediately
          throw new Error(`unexpected message ${JSON.stringify(m)}`);
        },
        onerror: () => {
          // This is expected when the connection closes
          server.close();
          closeStream();
        },
      });

    // Close the stream after a short delay
    setTimeout(() => {
      closeStream();
      server.close();
    }, 50);
  });

  it("includes the last paging_token as ?cursor on reconnect", async () => {
    let server: http.Server;
    let closeStream: () => void;
    let resolveSecondCursor: (value: string | null) => void;
    const secondRequestCursor = new Promise<string | null>((resolve) => {
      resolveSecondCursor = resolve;
    });

    let requestCount = 0;
    const requestHandler = (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      requestCount += 1;

      if (requestCount === 1) {
        // First response: emit one record carrying a paging_token, then force
        // a reconnect via `event: close`.
        response.writeHead(200, { "Content-Type": "text/event-stream" });
        response.write(
          `data: ${JSON.stringify({ id: "1", paging_token: "abc123" })}\n\n`,
        );
        response.write("event: close\ndata: byebye\n\n");
        response.end();
        return;
      }

      // Capture what cursor the client carries into the reconnect request.
      const parsed = new URL(request.url!, `http://localhost:${port}`);
      resolveSecondCursor(parsed.searchParams.get("cursor"));
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      response.end();
    };

    server = http.createServer(requestHandler);
    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });

    closeStream = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    })
      .operations()
      .stream({
        // Swallow any reconnect-after-teardown errors; this test asserts on
        // the second request's cursor, not error-path behavior.
        onerror: () => {},
      });

    const cursor = await secondRequestCursor;
    expect(cursor).toBe("abc123");

    closeStream();
    server.close();
  });

  it("reconnects when no messages arrive within reconnectTimeout", async () => {
    let server: http.Server;
    let closeStream: () => void;
    let resolveSecondRequest: () => void;
    const secondRequestArrived = new Promise<void>((resolve) => {
      resolveSecondRequest = resolve;
    });

    let requestCount = 0;
    const requestHandler = (
      _request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      requestCount += 1;
      // Open a valid event stream but stay silent. The watchdog in stream()
      // should trigger a second request once reconnectTimeout elapses.
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      if (requestCount === 2) {
        resolveSecondRequest();
      }
    };

    server = http.createServer(requestHandler);
    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const started = Date.now();
    closeStream = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    })
      .operations()
      .stream({
        reconnectTimeout: 100,
        onerror: () => {},
      });

    await secondRequestArrived;
    const elapsed = Date.now() - started;

    // Reconnect must wait at least reconnectTimeout and must not take the
    // full default watchdog interval (15s) — otherwise the option was ignored.
    expect(elapsed).toBeGreaterThanOrEqual(100);
    expect(elapsed).toBeLessThan(2000);

    closeStream();
    server.close();
  });

  it("does not send further requests after closeStream()", async () => {
    let server: http.Server;
    let closeStream: () => void;
    let resolveFirstMessage: () => void;
    const firstMessageReceived = new Promise<void>((resolve) => {
      resolveFirstMessage = resolve;
    });

    let requestCount = 0;
    const requestHandler = (
      _request: http.IncomingMessage,
      response: http.ServerResponse,
    ) => {
      requestCount += 1;
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      response.write(
        `data: ${JSON.stringify({ id: "1", paging_token: "abc" })}\n\n`,
      );
      // Deliberately leave the socket open so closeStream() is what tears it
      // down, not a server-side EOF.
    };

    server = http.createServer(requestHandler);
    await new Promise<void>((resolve, reject) => {
      server.listen(port, (err?: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });

    closeStream = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    })
      .operations()
      .stream({
        onmessage: () => {
          resolveFirstMessage();
        },
        onerror: () => {},
      });

    await firstMessageReceived;
    const requestCountAtClose = requestCount;
    closeStream();

    // Grace window for any stray reconnect to surface. 300ms is comfortably
    // longer than any reasonable post-close scheduling.
    await new Promise<void>((r) => setTimeout(r, 300));
    expect(requestCount).toBe(requestCountAtClose);

    server.close();
  });
});

describe("end-to-end tests: real streaming", () => {
  if (typeof window !== "undefined") {
    return;
  }

  // stream transactions from pubnet for a while and ensure that we cross a
  // ledger boundary (if streaming is broken, we will get stuck on a single
  // ledger's transaction batch).
  it("streams in perpetuity", () => {
    const DURATION = 30;
    const server = new Horizon.Server("https://horizon.stellar.org");

    const transactions: any[] = [];

    let closeHandler: () => void;
    let timeout: NodeJS.Timeout;

    const finishTest = (err?: any) => {
      clearTimeout(timeout);
      closeHandler();

      expect(transactions.length).toBeGreaterThan(0);
      const firstLedger = transactions[0].ledger_attr;
      const lastLedger = transactions[transactions.length - 1].ledger_attr;
      expect(lastLedger - firstLedger).toBeGreaterThanOrEqual(1);

      if (err) {
        throw err;
      }
    };

    closeHandler = server
      .transactions()
      .cursor("now")
      .stream({
        onmessage: (msg) => {
          transactions.push(msg);
        },
        onerror: finishTest,
      });

    timeout = setTimeout(finishTest, DURATION * 1000);
  }, 35000); // Set timeout for this specific test
});
