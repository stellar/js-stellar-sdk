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
      // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        onerror: (err) => {
          throw err;
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
});
