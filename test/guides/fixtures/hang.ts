import { writeFileSync } from "node:fs";

// The marker is written once the line reaches the OS, so a test that sees it can abort and still expect that output.
const marker = process.env.GUIDE_FIXTURE_MARKER;
process.stdout.write("hang fixture started\n", () => {
  if (marker) {
    writeFileSync(marker, "");
  }
});
await new Promise((resolve) => setTimeout(resolve, 60_000));
