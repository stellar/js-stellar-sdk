import { describe, it, expect } from "vitest";
import * as http from "http";
import * as StellarSdk from "../../src/index.js";
import { listenOnFreePort } from "./helpers.js";

const { Horizon } = StellarSdk;

describe("integration tests: streaming", () => {
  if (typeof window !== "undefined") {
    return;
  }

  it("handles onerror", async () => {
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

    const server = http.createServer(requestHandler);

    const port = await listenOnFreePort(server);

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

    const port = await listenOnFreePort(server);

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

    const server = http.createServer(requestHandler);
    const port = await listenOnFreePort(server);

    const closeStream = new Horizon.Server(`http://localhost:${port}`, {
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

    const server = http.createServer(requestHandler);
    const port = await listenOnFreePort(server);

    const started = Date.now();
    const closeStream = new Horizon.Server(`http://localhost:${port}`, {
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

    const server = http.createServer(requestHandler);
    const port = await listenOnFreePort(server);

    const closeStream = new Horizon.Server(`http://localhost:${port}`, {
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

  it("keeps the cursor when a record has a link named paging_token", async () => {
    let resolveCursor: (cursor: string | null) => void = () => {};
    const reconnectCursor = new Promise<string | null>((resolve) => {
      resolveCursor = resolve;
    });
    let requests = 0;
    const server = http.createServer((request, response) => {
      requests += 1;
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      if (requests === 1) {
        const record = {
          id: "1",
          paging_token: "1",
          _links: { paging_token: { href: "/p" } },
        };
        response.write(`id: 1\ndata: ${JSON.stringify(record)}\n\n`);
        response.write("event: close\ndata: byebye\n\n");
        response.end();
        return;
      }
      const url = new URL(request.url ?? "", "http://localhost");
      resolveCursor(url.searchParams.get("cursor"));
    });
    const port = await listenOnFreePort(server);

    const closeStream = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    })
      .operations()
      .stream({ onerror: () => {} });

    try {
      expect(await reconnectCursor).toBe("1");
    } finally {
      closeStream();
      server.closeAllConnections();
      server.close();
    }
  });
});

describe("integration tests: stream events that cannot be parsed", () => {
  if (typeof window !== "undefined") {
    return;
  }

  const GOOD_EVENT = `data: ${JSON.stringify({ id: "2", paging_token: "2" })}\n\n`;

  // Writes `events` on each request and keeps the socket open.
  async function serveEvents(events: string[]) {
    const server = http.createServer((_request, response) => {
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      response.write(events.join(""));
    });
    const port = await listenOnFreePort(server);
    const stop = () => {
      server.closeAllConnections();
      server.close();
    };
    return { port, stop };
  }

  async function streamUntilRecord(
    port: number,
    onerror?: (event: MessageEvent) => void,
  ) {
    let closeStream = () => {};
    const record = await new Promise<{ id: string }>((resolve) => {
      closeStream = new Horizon.Server(`http://localhost:${port}`, {
        allowHttp: true,
      })
        .operations()
        .stream({ onmessage: resolve, onerror });
    });
    closeStream();
    return record;
  }

  it("passes bad JSON to onerror and keeps the stream open", async () => {
    const { port, stop } = await serveEvents([
      'data: {"id": "1", "paging_token":\n\n',
      GOOD_EVENT,
    ]);
    const errors: MessageEvent[] = [];

    const record = await streamUntilRecord(port, (event) =>
      errors.push(event),
    ).finally(stop);

    expect(record.id).toBe("2");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(MessageEvent);
    expect(errors[0].type).toBe("error");
    expect(errors[0].data).toBeInstanceOf(SyntaxError);
  });

  it("passes a null record to onerror and keeps the stream open", async () => {
    const { port, stop } = await serveEvents(["data: null\n\n", GOOD_EVENT]);
    const errors: MessageEvent[] = [];

    const record = await streamUntilRecord(port, (event) =>
      errors.push(event),
    ).finally(stop);

    expect(record.id).toBe("2");
    expect(errors).toHaveLength(1);
    expect(errors[0].data).toBeInstanceOf(TypeError);
  });

  it("skips bad JSON when onerror is not set", async () => {
    const { port, stop } = await serveEvents(["data: {\n\n", GOOD_EVENT]);

    const record = await streamUntilRecord(port).finally(stop);

    expect(record.id).toBe("2");
  });

  it("counts a bad event as activity for the reconnect timer", async () => {
    let requests = 0;
    const timers: ReturnType<typeof setInterval>[] = [];
    const server = http.createServer((_request, response) => {
      requests += 1;
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      response.write(GOOD_EVENT);
      timers.push(setInterval(() => response.write("data: {\n\n"), 200));
    });
    const port = await listenOnFreePort(server);

    const closeStream = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    })
      .operations()
      .stream({ reconnectTimeout: 1000, onerror: () => {} });

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      expect(requests).toBe(1);
    } finally {
      closeStream();
      timers.forEach(clearInterval);
      server.closeAllConnections();
      server.close();
    }
  });

  it("moves the cursor to the id of a bad event, so a reconnect skips it", async () => {
    let resolveCursor: (cursor: string | null) => void = () => {};
    const reconnectCursor = new Promise<string | null>((resolve) => {
      resolveCursor = resolve;
    });
    let requests = 0;
    const server = http.createServer((request, response) => {
      requests += 1;
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      if (requests === 1) {
        response.write(
          `id: 1\ndata: ${JSON.stringify({ id: "1", paging_token: "1" })}\n\n`,
        );
        response.write("id: 7\ndata: {\n\n");
        response.write("event: close\ndata: byebye\n\n");
        response.end();
        return;
      }
      const url = new URL(request.url ?? "", "http://localhost");
      resolveCursor(url.searchParams.get("cursor"));
    });
    const port = await listenOnFreePort(server);

    const closeStream = new Horizon.Server(`http://localhost:${port}`, {
      allowHttp: true,
    })
      .operations()
      .stream({ onerror: () => {} });

    try {
      expect(await reconnectCursor).toBe("7");
    } finally {
      closeStream();
      server.closeAllConnections();
      server.close();
    }
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

    const closeHandler = server
      .transactions()
      .cursor("now")
      .stream({
        onmessage: (msg) => {
          transactions.push(msg);
        },
        onerror: finishTest,
      });

    const timeout = setTimeout(finishTest, DURATION * 1000);
  }, 35000); // Set timeout for this specific test
});
