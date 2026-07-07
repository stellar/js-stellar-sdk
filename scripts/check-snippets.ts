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
 *
 * All line classification comes from scanMarkdown in config/snippets.ts, so
 * this script and the expander cannot disagree about fences or markers.
 *
 * Run via `pnpm docs:snippets:check`, which also typechecks the snippet
 * files themselves. This is the hermetic tier: it proves the markers and
 * types, not runtime behavior. Snippets execute on every PR against a local
 * network (guides_pr.yml) and against real testnet at release time
 * (`preversion` runs `pnpm test:guides`); see examples/guides/README.md.
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  nearMissError,
  scanMarkdown,
  snippetRegion,
} from "../config/snippets.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_DIR = join(REPO_ROOT, "docs");

function walkMarkdown(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

const problems: string[] = [];
let markers = 0;

for (const path of walkMarkdown(DOCS_DIR)) {
  const doc = relative(DOCS_DIR, path);
  const scanned = scanMarkdown(readFileSync(path, "utf8"));

  for (let i = 0; i < scanned.length; i += 1) {
    const { line, kind, file, region } = scanned[i];

    if (kind === "near-miss") {
      problems.push(`${doc}: ${nearMissError(i + 1, line).message}`);
      continue;
    }
    if (kind !== "marker") continue;
    markers += 1;

    // The reference must resolve to a real snippet file and region.
    try {
      snippetRegion(file!, region!);
    } catch (e) {
      problems.push(`${doc}:${i + 1}: ${(e as Error).message}`);
    }

    // No inline code copy after the marker.
    let j = i + 1;
    while (j < scanned.length && scanned[j].line.trim() === "") j += 1;
    if (j < scanned.length && scanned[j].kind === "fence-open") {
      problems.push(
        `${doc}:${j + 1}: inline code block after snippet marker ` +
          `"${line.trim()}" — remove it; the snippet is injected at ` +
          `build time`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(
  `${markers} snippet marker(s) OK (hermetic check — snippets also execute ` +
    `on every PR against a local network via guides_pr.yml, and against ` +
    `real testnet at release)`,
);
