/**
 * Prints one doc's markdown with its snippet markers expanded, exactly as the
 * docs build renders it (see config/snippets.ts for the mechanism).
 *
 * Markers hide a guide's code from a PR diff, so a reviewer cannot see what
 * the page will actually render. This prints that expansion for a single
 * file, with no docs build and no Docker.
 *
 * Run via `pnpm docs:snippets:show <doc>`, where <doc> is a markdown file
 * under docs/. Paths resolve from the repo root, because pnpm runs the script
 * there, either as typed or relative to docs/:
 *
 *   pnpm docs:snippets:show docs/guides/03-issue-an-asset.md
 *   pnpm docs:snippets:show guides/03-issue-an-asset.md
 *
 * Output is byte-identical to the file the build writes into .docs-build/.
 * Redirect it with `pnpm --silent`, or pnpm's own banner lands on stdout
 * ahead of the markdown.
 */

import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { expandSnippetMarkers } from "../config/snippets.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_DIR = join(REPO_ROOT, "docs");

const USAGE =
  "usage: pnpm docs:snippets:show <doc>\n" +
  "  <doc> is a markdown file under docs/, for example:\n" +
  "    pnpm docs:snippets:show docs/guides/03-issue-an-asset.md\n" +
  "    pnpm docs:snippets:show guides/03-issue-an-asset.md";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const arg = process.argv[2];
if (arg === "-h" || arg === "--help") {
  console.log(USAGE);
  process.exit(0);
}
if (arg === undefined || arg === "") {
  fail(USAGE);
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

// Accept the path as typed (shell completion from the repo root) or relative
// to docs/, so the docs/ prefix is optional.
const candidates = [resolve(arg), resolve(DOCS_DIR, arg)];
const path = candidates.find(isFile);
if (path === undefined) {
  fail(`no such file, tried:\n  ${candidates.join("\n  ")}\n\n${USAGE}`);
}

let expanded: string;
try {
  expanded = expandSnippetMarkers(readFileSync(path, "utf8"));
} catch (e) {
  fail(`${arg}: ${(e as Error).message}`);
}
process.stdout.write(expanded);
