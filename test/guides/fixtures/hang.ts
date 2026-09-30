import { writeFileSync } from "node:fs";

console.log("hang fixture started");
// Written after the log line, so a test that sees it can abort and still expect that output.
const marker = process.env.GUIDE_FIXTURE_MARKER;
if (marker) {
  writeFileSync(marker, "");
}
await new Promise((resolve) => setTimeout(resolve, 60_000));
