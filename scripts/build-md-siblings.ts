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
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
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

/**
 * Adjusts a markdown link target for the `.md` sibling URL space.
 *
 * Source markdown is authored against the HTML render: each page lives at
 * a directory URL with a trailing slash (e.g. `/js-stellar-sdk/agents/`),
 * so a link like `../llms.txt` correctly resolves to the base root. The
 * raw `.md` sibling lives at `<route>.md` (one fewer directory level),
 * so the same link would resolve one level too high. Compensating is
 * a deterministic single-step rewrite: drop one leading `../`.
 *
 * Skip cases (returned unchanged):
 *  - Absolute URLs and protocol-relative (`http://`, `https://`, `//`)
 *  - Absolute paths (`/foo`)
 *  - Anchors only (`#section`)
 *  - Intra-docs `.md` links — Starlight rewrites them for HTML and the
 *    same source form works between sibling `.md` files at matching depths.
 */
function transformTarget(target: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return target;
  if (target.startsWith("//")) return target;
  if (target.startsWith("/")) return target;
  if (target.startsWith("#")) return target;

  // .md link (with optional #anchor or ?query) — pass through.
  const pathPart = target.split(/[#?]/)[0];
  if (pathPart.endsWith(".md")) return target;

  if (target.startsWith("../")) return target.slice(3);
  return target;
}

// Inline links `[text](url)` and image links `![alt](url)`. URL is the
// first whitespace-or-`)`-delimited token; any trailing `"title"` (or
// equivalent) is preserved verbatim.
const INLINE_LINK_RE = /(!?\[[^\]]*\])\(\s*([^)\s]+)((?:\s+[^)]*)?)\)/g;

function rewriteLinks(content: string): string {
  return content.replace(
    INLINE_LINK_RE,
    (_match, prefix: string, target: string, trailer: string) =>
      `${prefix}(${transformTarget(target)}${trailer})`,
  );
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
    const content = readFileSync(src, "utf8");
    writeFileSync(dst, rewriteLinks(content), "utf8");
    written += 1;
  }

  console.log(`Copied ${written} .md sibling(s) into ${DIST_DIR}.`);
}

main();
