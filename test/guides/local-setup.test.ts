import { createServer as createHttpServer } from "node:http";
import { createServer, type Server } from "node:net";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import setup, { waitForQuickstart } from "../../config/guides-local-setup.js";

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("test server has no TCP port");
  }
  return address.port;
}

async function setupError(
  url: string,
  readyTimeoutMs: number,
  refusedGraceMs?: number,
): Promise<string> {
  const error = await waitForQuickstart(
    url,
    readyTimeoutMs,
    refusedGraceMs,
  ).then(
    () => undefined,
    (e: unknown) => e,
  );
  if (!(error instanceof Error)) {
    throw new Error("waitForQuickstart() did not reject");
  }
  return error.message;
}

describe("guides-local-setup", { timeout: 15_000 }, () => {
  // Accepts the connection and never answers.
  const stalled = createServer(() => {});
  const notHorizon = createHttpServer((_, res) => {
    res.statusCode = 404;
    res.end();
  });
  const starting = createHttpServer((_, res) => {
    res.statusCode = 503;
    res.end();
  });
  // A ready friendbot answers 400 when the request has no addr.
  const friendbotReady = (url: string | undefined) => url === "/friendbot";
  // Answers 503 twice, as quickstart does while it starts, then serves.
  let startingRequests = 0;
  const slowStart = createHttpServer((req, res) => {
    startingRequests += 1;
    if (startingRequests <= 2) res.statusCode = 503;
    else if (friendbotReady(req.url)) res.statusCode = 400;
    res.end("{}");
  });
  const healthy = createHttpServer((req, res) => {
    if (friendbotReady(req.url)) res.statusCode = 400;
    res.end("{}");
  });
  // Serves Horizon, but friendbot answers 502 twice before it is ready.
  let friendbotRequests = 0;
  const slowFriendbot = createHttpServer((req, res) => {
    if (req.url === "/friendbot") {
      friendbotRequests += 1;
      res.statusCode = friendbotRequests <= 2 ? 502 : 400;
    }
    res.end("{}");
  });
  const deadFriendbot = createHttpServer((req, res) => {
    if (req.url === "/friendbot") res.statusCode = 502;
    res.end("{}");
  });
  // Serves Horizon but has no /friendbot route.
  const noFriendbot = createHttpServer((req, res) => {
    if (req.url === "/friendbot") res.statusCode = 404;
    res.end("{}");
  });
  let stalledPort = 0;
  let notHorizonPort = 0;
  let startingPort = 0;
  let slowStartPort = 0;
  let healthyPort = 0;
  let slowFriendbotPort = 0;
  let deadFriendbotPort = 0;
  let noFriendbotPort = 0;
  // A port with nothing listening, so a connection to it is refused.
  let refusedPort = 0;

  beforeAll(async () => {
    stalledPort = await listen(stalled);
    notHorizonPort = await listen(notHorizon);
    startingPort = await listen(starting);
    slowStartPort = await listen(slowStart);
    healthyPort = await listen(healthy);
    slowFriendbotPort = await listen(slowFriendbot);
    deadFriendbotPort = await listen(deadFriendbot);
    noFriendbotPort = await listen(noFriendbot);
    const closed = createServer();
    refusedPort = await listen(closed);
    await new Promise((resolve) => closed.close(resolve));
  });

  afterAll(() => {
    stalled.close();
    notHorizon.close();
    starting.close();
    slowStart.close();
    healthy.close();
    slowFriendbot.close();
    deadFriendbot.close();
    noFriendbot.close();
  });

  it("gives up on a quickstart that accepts but never answers", async () => {
    const message = await setupError(`http://localhost:${stalledPort}`, 1_000);
    expect(message).toContain(
      `quickstart is not reachable at http://localhost:${stalledPort}`,
    );
    expect(message).toContain("timeout");
  });

  it("stops retrying a refused connection after the grace window", async () => {
    const started = Date.now();
    const message = await setupError(
      `http://localhost:${refusedPort}`,
      30_000,
      500,
    );
    expect(Date.now() - started).toBeLessThan(5_000);
    expect(message).toContain("ECONNREFUSED");
    expect(message).toContain("docker run");
  });

  it("rejects a server that is not a Horizon root at once", async () => {
    const started = Date.now();
    const message = await setupError(
      `http://localhost:${notHorizonPort}`,
      10_000,
    );
    expect(Date.now() - started).toBeLessThan(5_000);
    expect(message).toContain(`http://localhost:${notHorizonPort}`);
    expect(message).toContain("HTTP 404");
  });

  it("reads QUICKSTART_URL in the default setup", async () => {
    vi.stubEnv("QUICKSTART_URL", `http://localhost:${notHorizonPort}`);
    try {
      await expect(setup()).rejects.toThrow(
        `http://localhost:${notHorizonPort}/ answered HTTP 404`,
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("names the last status when the root keeps answering 5xx", async () => {
    const message = await setupError(`http://localhost:${startingPort}`, 1_000);
    expect(message).toContain("HTTP 503");
    expect(message).toContain("still starting");
  });

  it("retries the root while quickstart starts", async () => {
    await expect(
      waitForQuickstart(`http://localhost:${slowStartPort}`, 10_000),
    ).resolves.toBeUndefined();
    expect(startingRequests).toBeGreaterThan(2);
  });

  it("waits for friendbot after Horizon serves data", async () => {
    await expect(
      waitForQuickstart(`http://localhost:${slowFriendbotPort}`, 10_000),
    ).resolves.toBeUndefined();
    expect(friendbotRequests).toBeGreaterThan(2);
  });

  it("names friendbot when it never gets ready", async () => {
    const message = await setupError(
      `http://localhost:${deadFriendbotPort}`,
      1_000,
    );
    expect(message).toContain("friendbot");
    expect(message).toContain("HTTP 502");
  });

  it("rejects a missing friendbot route at once", async () => {
    const started = Date.now();
    const message = await setupError(
      `http://localhost:${noFriendbotPort}`,
      10_000,
    );
    expect(Date.now() - started).toBeLessThan(5_000);
    expect(message).toContain("HTTP 404");
    expect(message).toContain("no friendbot route");
  });

  it.each([
    ["a healthy quickstart", () => healthyPort],
    ["a server that answers HTTP 503", () => startingPort],
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
      await waitForQuickstart(`http://localhost:${port()}`, 1_000).catch(
        () => undefined,
      );
    } finally {
      spy.mockRestore();
    }
    expect(responses.length).toBeGreaterThan(0);
    expect(responses.every((res) => res.bodyUsed)).toBe(true);
  });
});
