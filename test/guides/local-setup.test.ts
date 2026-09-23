import { createServer as createHttpServer } from "node:http";
import { createServer, type Server } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import setup from "../../config/guides-local-setup.js";

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("test server has no TCP port");
  }
  return address.port;
}

async function withQuickstartUrl<T>(
  url: string,
  run: () => Promise<T>,
): Promise<T> {
  const previous = process.env.QUICKSTART_URL;
  process.env.QUICKSTART_URL = url;
  try {
    return await run();
  } finally {
    if (previous === undefined) {
      delete process.env.QUICKSTART_URL;
    } else {
      process.env.QUICKSTART_URL = previous;
    }
  }
}

async function setupError(url: string): Promise<string> {
  const error = await withQuickstartUrl(url, () =>
    setup().then(
      () => undefined,
      (e: unknown) => e,
    ),
  );
  if (!(error instanceof Error)) {
    throw new Error("setup() did not reject");
  }
  return error.message;
}

describe("guides-local-setup", { timeout: 15_000 }, () => {
  // Accepts the connection and never answers.
  const stalled = createServer(() => {});
  const failing = createHttpServer((_, res) => {
    res.statusCode = 500;
    res.end();
  });
  const healthy = createHttpServer((_, res) => {
    res.end("{}");
  });
  let stalledPort = 0;
  let failingPort = 0;
  let healthyPort = 0;

  beforeAll(async () => {
    stalledPort = await listen(stalled);
    failingPort = await listen(failing);
    healthyPort = await listen(healthy);
  });

  afterAll(() => {
    stalled.close();
    failing.close();
    healthy.close();
  });

  it("gives up on a quickstart that accepts but never answers", async () => {
    const message = await setupError(`http://localhost:${stalledPort}`);
    expect(message).toContain(
      `quickstart is not reachable at http://localhost:${stalledPort}`,
    );
    expect(message).toContain("timeout");
  });

  it("rejects a server that is not a Horizon root", async () => {
    const message = await setupError(`http://localhost:${failingPort}`);
    expect(message).toContain(`http://localhost:${failingPort}`);
    expect(message).toContain("HTTP 500");
  });

  it.each([
    ["a healthy quickstart", () => healthyPort],
    ["a server that answers HTTP 500", () => failingPort],
  ])("releases every response body from %s", async (_, port) => {
    // An unread body keeps its socket open for the rest of the suite.
    const realFetch = globalThis.fetch;
    const responses: Response[] = [];
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async (input: string | URL | Request, init?: RequestInit) => {
          const res = await realFetch(input, init);
          responses.push(res);
          return res;
        },
      );
    try {
      await withQuickstartUrl(`http://localhost:${port()}`, () =>
        setup().catch(() => undefined),
      );
    } finally {
      spy.mockRestore();
    }
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.every((res) => res.bodyUsed)).toBe(true);
  });
});
