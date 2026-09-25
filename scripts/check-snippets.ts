/**
 * Validates the docs snippet markers (see config/snippets.ts for the
 * mechanism). Walks all of docs/ — the same scope the expander mirrors — and
 * fails when:
 *
 *  - a marker references a snippet file or #region that does not exist
 *  - a marker is malformed (near-miss lint, shared with the expander)
 *  - a marker is followed by an inline fenced code block (code for tested
 *    examples must live only in examples/guides/, injected at build
 *    time — an inline copy would silently go stale)
 *  - a code block in docs/guides/ is neither a marker nor opted out with
 *    the word `untested` in its fence line
 *
 * It also prints a tested/untested count for each guide, so a partly
 * converted guide is visible.
 *
 * The rules live in checkDoc, and all line classification comes from
 * scanMarkdown, both in config/snippets.ts, so this script and the expander
 * cannot disagree about fences or markers.
 *
 * Run via `pnpm docs:snippets:check`, which also typechecks the snippet
 * files themselves. This is the hermetic tier: it proves the markers and
 * types, not runtime behavior. Snippets execute on every PR against a local
 * network (guides_pr.yml) and against real testnet at release time
 * (`preversion` runs `pnpm test:guides`); see examples/guides/README.md.
 */

import { readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { checkDoc, walkMarkdown } from "../config/snippets.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_DIR = join(REPO_ROOT, "docs");
// Only guides must be fully tested: reference/ is generated, migration/ shows
// old APIs on purpose, and index.md is synced from the README.
const GUIDES_DIR = join(DOCS_DIR, "guides");

const problems: string[] = [];
const counts: string[] = [];
let markers = 0;

for (const path of walkMarkdown(DOCS_DIR).sort()) {
  const doc = relative(DOCS_DIR, path);
  const isGuide = path.startsWith(GUIDES_DIR + sep);
  const result = checkDoc(doc, readFileSync(path, "utf8"), isGuide);
  problems.push(...result.problems);
  markers += result.tested;
  if (isGuide) {
    counts.push(`${doc}: ${result.tested} tested, ${result.untested} untested`);
  }
}

console.log(counts.join("\n"));

// Set exitCode rather than calling process.exit: stderr to a pipe is async
// on POSIX, and exiting mid-write truncates a long problem list in CI.
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `${markers} snippet marker(s) OK (hermetic check — snippets also execute ` +
      `on every PR against a local network via guides_pr.yml, and against ` +
      `real testnet at release)`,
  );
}
