import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ENTRY = fileURLToPath(new URL("snippet-entry.ts", import.meta.url));
const PRELOAD = new URL(
  "../../config/guides-snippet-preload.ts",
  import.meta.url,
).href;
const TSCONFIG = fileURLToPath(new URL("tsconfig.json", import.meta.url));

/**
 * Runs one snippet file in its own node process, so its globals, module cache and open handles cannot reach another snippet. Rejects with the child's output when it exits non-zero. Pass the vitest test context's `signal`: it aborts on a test timeout or a cancelled run, and aborting kills the child.
 */
export function runSnippet(file: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", "--import", PRELOAD, ENTRY, file],
      {
        env: { ...process.env, TSX_TSCONFIG_PATH: TSCONFIG },
        stdio: ["ignore", "pipe", "pipe"],
        signal,
      },
    );
    // Decode per stream, so a character split across two chunks survives.
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    let output = "";
    child.stdout.on("data", (chunk: string) => (output += chunk));
    child.stderr.on("data", (chunk: string) => (output += chunk));
    child.on("error", reject);
    child.on("close", (code, killSignal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${file} exited with ${killSignal ?? `code ${code}`}\n${output}`,
        ),
      );
    });
  });
}
