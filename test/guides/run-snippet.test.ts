import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { runSnippet } from "./run-snippet.js";

const fixture = (name: string) =>
  fileURLToPath(new URL(`fixtures/${name}.ts`, import.meta.url));

describe("runSnippet isolates each snippet", { timeout: 30_000 }, () => {
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
    process.env.GUIDE_FIXTURE_MARKER = join(dir, "ran");
    try {
      await expect(runSnippet(fixture("flaky"), signal)).rejects.toThrow(
        "fixture fails on its first run",
      );
      await expect(
        runSnippet(fixture("flaky"), signal),
      ).resolves.toBeUndefined();
    } finally {
      delete process.env.GUIDE_FIXTURE_MARKER;
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fails a snippet that leaves open handles", async ({ signal }) => {
    await expect(runSnippet(fixture("open-handle"), signal)).rejects.toThrow(
      "left open handles",
    );
  });

  it("kills the snippet and prints its output when the signal aborts", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const started = Date.now();
    try {
      await expect(
        runSnippet(fixture("hang"), AbortSignal.timeout(5_000)),
      ).rejects.toThrow();
      expect(Date.now() - started).toBeLessThan(15_000);
      expect(consoleError).toHaveBeenCalledWith(
        expect.stringContaining("hang fixture started"),
      );
    } finally {
      consoleError.mockRestore();
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
      [
        "--import",
        "tsx",
        "--import",
        new URL("../../config/guides-snippet-preload.ts", import.meta.url).href,
        fixture("set-global"),
      ],
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
    await new Promise<void>((resolve) => stalled.listen(0, resolve));
    const address = stalled.address();
    if (address === null || typeof address === "string") {
      throw new Error("test server has no TCP port");
    }
    const previous = {
      GUIDES_TARGET: process.env.GUIDES_TARGET,
      QUICKSTART_URL: process.env.QUICKSTART_URL,
    };
    process.env.GUIDES_TARGET = "local";
    process.env.QUICKSTART_URL = `http://localhost:${address.port}`;
    try {
      await expect(runSnippet(fixture("set-global"), signal)).rejects.toThrow(
        "redirect canary could not read the local Horizon root",
      );
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
      stalled.close();
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
