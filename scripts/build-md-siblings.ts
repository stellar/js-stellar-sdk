/**
 * Copies every docs/**\/*.md source file into dist/site/ at the same URL
 * the rendered HTML lives at, with a `.md` extension. Lets agents fetch
 * raw markdown by appending `.md` to any docs URL — a partial substitute
 * for true `Accept: text/markdown` content negotiation, which requires a
 * dynamic server we don't have on static hosting.
 *
 * Mapping:
 *   docs/index.md                        -> dist/site/index.md
 *   docs/agents.md                       -> dist/site/agents.md
 *   docs/guides/01-getting-started.md    -> dist/site/guides/01-getting-started.md
 *   docs/reference/core-keys.md          -> dist/site/reference/core-keys.md
 *
 * Frontmatter is preserved as-is. Must run after `pnpm docs:site` because
 * it writes into the Astro build output directory.
 */

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const REPO_ROOT = process.cwd();
const DOCS_DIR = join(REPO_ROOT, "docs");
const DIST_DIR = join(REPO_ROOT, "dist", "site");

function walkMarkdown(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkMarkdown(full));
    } else if (st.isFile() && entry.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function main(): void {
  if (!existsSync(DIST_DIR)) {
    console.error(
      `Missing ${DIST_DIR}. Run \`pnpm docs:site\` before this script.`,
    );
    process.exit(1);
  }

  const sources = walkMarkdown(DOCS_DIR);
  let written = 0;
  for (const src of sources) {
    const rel = relative(DOCS_DIR, src);
    const dst = join(DIST_DIR, rel);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    written += 1;
  }

  console.log(`Copied ${written} .md sibling(s) into ${DIST_DIR}.`);
}

main();
