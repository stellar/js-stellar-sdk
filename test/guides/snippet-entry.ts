import { pathToFileURL } from "node:url";

const GRACE_MS = 5_000;

const file = process.argv[2];
if (!file) {
  throw new Error("usage: snippet-entry.ts <snippet file>");
}

await import(pathToFileURL(file).href);

// Unref'd, so it fires only if something else keeps the process alive.
setTimeout(() => {
  // Exit from the callback: stderr to a pipe is async on POSIX, so an immediate exit can drop the message.
  process.stderr.write(
    `${file} left open handles (a stream, timer or socket) ` +
      `${GRACE_MS / 1000}s after it finished. Close them in hidden teardown.\n`,
    () => process.exit(1),
  );
}, GRACE_MS).unref();
