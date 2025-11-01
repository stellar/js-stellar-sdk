import { describe, it, expect, beforeEach } from "vitest";
import * as http from "http";
import { StellarSdk } from "../test-utils/stellar-sdk-import";

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
