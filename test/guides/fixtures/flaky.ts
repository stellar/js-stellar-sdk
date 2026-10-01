import { existsSync, writeFileSync } from "node:fs";

const marker = process.env.GUIDE_FIXTURE_MARKER;
if (!marker) {
  throw new Error("GUIDE_FIXTURE_MARKER is not set");
}
if (!existsSync(marker)) {
  writeFileSync(marker, "");
  throw new Error("fixture fails on its first run");
}
