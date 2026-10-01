import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PRELOAD_ARGV, runSnippet } from "./run-snippet.js";
import { listen } from "./test-server.js";

const fixture = (name: string) =>
  fileURLToPath(new URL(`fixtures/${name}.ts`, import.meta.url));

describe("runSnippet isolates each snippet", { timeout: 30_000 }, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not leak global state into the next snippet", async ({ signal }) => {
    await runSnippet(fixture("set-global"), signal);
    await expect(
      runSnippet(fixture("read-global"), signal),
    ).resolves.toBeUndefined();
  });

  it("rejects with the snippet's error message", async ({ signal }) => {
    await expect(runSnippet(fixture("throws"), signal)).rejects.toThrow(
      "fixture failure",
    );
  });

  it("reruns a failed snippet instead of replaying the cached failure", async ({
    signal,
  }) => {
    const dir = mkdtempSync(join(tmpdir(), "guide-fixture-"));
    vi.stubEnv("GUIDE_FIXTURE_MARKER", join(dir, "ran"));
    try {
      await expect(runSnippet(fixture("flaky"), signal)).rejects.toThrow(
        "fixture fails on its first run",
      );
      await expect(
        runSnippet(fixture("flaky"), signal),
      ).resolves.toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fails a snippet that leaves open handles", async ({ signal }) => {
    await expect(runSnippet(fixture("open-handle"), signal)).rejects.toThrow(
      "left open handles",
    );
  });

  it("kills the snippet and prints its output when the signal aborts", async ({
    signal,
  }) => {
    const dir = mkdtempSync(join(tmpdir(), "guide-fixture-"));
    const started = join(dir, "started");
    vi.stubEnv("GUIDE_FIXTURE_MARKER", started);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const controller = new AbortController();
    try {
      // The test signal also kills the child if vitest times the test out.
      const run = runSnippet(
        fixture("hang"),
        AbortSignal.any([signal, controller.signal]),
      );
      let settled = false;
      run.then(
        () => (settled = true),
        () => (settled = true),
      );
      // Abort only once the child runs, so its start-up is not in the budget.
      while (!settled && !existsSync(started)) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      // A child that died before the marker shows its own error here.
      if (settled) await run;
      // One I/O turn, so the parent reads the line the child printed first.
      await new Promise((resolve) => setImmediate(resolve));
      const aborted = Date.now();
      controller.abort();
      await expect(run).rejects.toThrow();
      expect(Date.now() - aborted).toBeLessThan(5_000);
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("hang fixture started"),
      );
    } finally {
      consoleError.mockRestore();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("prints nothing when the signal aborts after the snippet finished", async () => {
    const controller = new AbortController();
    await runSnippet(fixture("set-global"), controller.signal);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      controller.abort();
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });

  it("refuses to run when the SDK does not resolve to src/", () => {
    const { TSX_TSCONFIG_PATH: _, ...env } = process.env;
    const child = spawnSync(
      process.execPath,
      [...PRELOAD_ARGV, fixture("set-global")],
      { env, encoding: "utf8", timeout: 10_000 },
    );
    expect(child.status).not.toBe(0);
    expect(child.stderr).toContain(
      "guides-snippet-preload: @stellar/stellar-sdk resolves to",
    );
  });

  it("fails fast when the canary cannot read the Horizon root", async ({
    signal,
  }) => {
    // Accepts the connection and never answers.
    const stalled = createServer(() => {});
    const port = await listen(stalled);
    vi.stubEnv("GUIDES_TARGET", "local");
    vi.stubEnv("QUICKSTART_URL", `http://localhost:${port}`);
    try {
      await expect(runSnippet(fixture("set-global"), signal)).rejects.toThrow(
        "redirect canary could not read the local Horizon root",
      );
    } finally {
      stalled.close();
    }
  });

  it("reports the status when the canary gets a non-2xx root", async ({
    signal,
  }) => {
    const starting = createHttpServer((_, res) => {
      res.statusCode = 503;
      res.end("{}");
    });
    const port = await listen(starting);
    vi.stubEnv("GUIDES_TARGET", "local");
    vi.stubEnv("QUICKSTART_URL", `http://localhost:${port}`);
    try {
      await expect(runSnippet(fixture("set-global"), signal)).rejects.toThrow(
        "answered HTTP 503, so it may still be starting",
      );
    } finally {
      starting.close();
    }
  });

  it.runIf(process.env.GUIDES_TARGET === "local")(
    "applies the local-network redirect inside the snippet",
    async ({ signal }) => {
      await expect(
        runSnippet(fixture("network"), signal),
      ).resolves.toBeUndefined();
    },
  );
});
