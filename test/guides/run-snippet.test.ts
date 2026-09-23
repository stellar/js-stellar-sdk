import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
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

  it("kills the snippet when the signal aborts", async () => {
    const started = Date.now();
    await expect(
      runSnippet(fixture("hang"), AbortSignal.timeout(1_000)),
    ).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(10_000);
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
      { env, encoding: "utf8" },
    );
    expect(child.status).not.toBe(0);
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
