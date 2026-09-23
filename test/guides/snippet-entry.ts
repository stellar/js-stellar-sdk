import { pathToFileURL } from "node:url";

const GRACE_MS = 5_000;

const file = process.argv[2];
if (!file) {
  throw new Error("usage: snippet-entry.ts <snippet file>");
}

await import(pathToFileURL(file).href);

// Unref'd, so it fires only if something else keeps the process alive.
setTimeout(() => {
  console.error(
    `${file} left open handles (a stream, timer or socket) ` +
      `${GRACE_MS / 1000}s after it finished. Close them in hidden teardown.`,
  );
  process.exit(1);
}, GRACE_MS).unref();
