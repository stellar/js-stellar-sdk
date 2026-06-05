/**
 * Shared internal-link logic for the docs pipeline.
 *
 * The authoring convention for links between docs pages is a root-absolute,
 * base-agnostic path: `/reference/<slug>/#<anchor>`, `/guides/<slug>/#<anchor>`,
 * or `/` for the home page. Same-page links stay as `#<anchor>`.
 *
 * Authors never write the deploy base (`/js-stellar-sdk`) or `.md` extensions.
 * The base is added at build time from the single source in config/site.ts:
 *   - the rendered site: a rehype plugin in astro.config.mjs (Astro does NOT
 *     rewrite cross-page links itself — only images),
 *   - the llms-full.txt bundle: build-llms.ts,
 * and build-llms.ts validates every internal link (page + anchor exists),
 * failing the build on dead links so a typo'd `#anchor` can't ship.
 *
 * Anchor slugs must match the ids Astro assigns to headings, which it does via
 * `new GithubSlugger().slug(text)` (rehype-collect-headings). `headingIds`
 * below replicates github-slugger@2.0.0 for the ASCII headings these docs use
 * (typedoc identifiers + English titles).
 */

import { BASE_PATH } from "../config/site.js";

// === heading-id slugs (github-slugger@2.0.0-compatible) ===

// github-slugger lowercases, strips punctuation/symbols (keeping letters,
// numbers, spaces, `-`, and `_`), then turns each space into a hyphen. It does
// not collapse runs, matching github-slugger (e.g. "a . b" -> "a--b"). Crucially
// it KEEPS underscores, so snake_case ids like `result_meta_xdr` survive.
//
// For the ASCII headings in these docs (typedoc identifiers + English titles)
// this matches github-slugger exactly. The one known divergence is exotic
// Unicode that github-slugger strips but \p{L}/\p{N} keep (superscripts like
// ², fullwidth forms, math alphanumerics); none appear in these docs, and the
// link validator fails the build on any mismatch, so a divergence cannot ship
// silently.
function baseSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]+/gu, "")
    .replace(/ /g, "-");
}

// Heading text as rehype-collect-headings sees it before slugging: links and
// images reduced to their text, inline-code markers removed. Emphasis markers
// are intentionally left for baseSlug, which drops `*` as punctuation and KEEPS
// `_`. Do NOT strip `_` here: it is not emphasis in snake_case identifiers
// (e.g. `result_meta_xdr`), and github-slugger keeps it in the rendered id.
function headingText(raw: string): string {
  return raw
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`+/g, "")
    .trim();
}

function* headingTexts(body: string): Generator<string> {
  let fence: string | null = null;
  for (const line of body.split("\n")) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (marker === fence) fence = null;
      continue;
    }
    if (fence !== null) continue;
    const heading = line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (heading) yield headingText(heading[1]);
  }
}

// All heading anchor ids for a markdown body, replicating github-slugger's
// duplicate handling (`foo`, `foo-1`, `foo-2`, ...).
export function headingIds(body: string): Set<string> {
  const ids = new Set<string>();
  const occurrences: Record<string, number> = Object.create(null);
  for (const text of headingTexts(body)) {
    let result = baseSlug(text);
    const original = result;
    while (occurrences[result] !== undefined) {
      occurrences[original] += 1;
      result = `${original}-${occurrences[original]}`;
    }
    occurrences[result] = 0;
    ids.add(result);
  }
  return ids;
}

// === link classification and resolution ===

export function isExternal(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//");
}

export function isInternalAbsolute(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

export function splitAnchor(href: string): { path: string; anchor: string } {
  const i = href.indexOf("#");
  return i === -1
    ? { path: href, anchor: "" }
    : { path: href.slice(0, i), anchor: href.slice(i + 1) };
}

// Maps a root-absolute site path to the docs/-relative source file it renders
// from, or null if the path is not one of our doc pages (e.g. /llms.txt).
export function hrefToDocsRelPath(path: string): string | null {
  const p = path.replace(/^\/+/, "").replace(/\/+$/, "");
  if (p === "") return "index.md";
  if (p === "agents") return "agents.md";
  if (p.startsWith("guides/") || p.startsWith("reference/")) return `${p}.md`;
  return null;
}

export function routeForDocsRelPath(docsRelPath: string): string {
  const s = docsRelPath.replace(/\.md$/, "");
  return s === "index" ? "/" : `/${s}`;
}

// Prefixes the deploy base to a root-absolute internal link. Idempotent and a
// no-op for external, protocol-relative, or already-prefixed hrefs.
export function withBase(href: string): string {
  if (!isInternalAbsolute(href)) return href;
  if (href === BASE_PATH || href.startsWith(`${BASE_PATH}/`)) return href;
  return `${BASE_PATH}${href}`;
}

// === markdown link traversal (skips fenced code) ===

// One pass per non-fenced line. Each match is EITHER an inline code span (left
// untouched, so link-like text inside `...` is never rewritten or validated) OR
// a markdown link. Images (`![alt](src)`) are matched but skipped. The `\1`
// backref makes a code span close on a backtick run of the same length.
const TOKEN_RE =
  /(`+)[\s\S]*?\1|(!?)(\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;

function isFenceToggle(
  line: string,
  fence: string | null,
): {
  next: string | null;
  toggled: boolean;
} {
  const m = line.match(/^\s*(`{3,}|~{3,})/);
  if (!m) return { next: fence, toggled: false };
  const marker = m[1][0];
  if (fence === null) return { next: marker, toggled: true };
  if (marker === fence) return { next: null, toggled: true };
  return { next: fence, toggled: true };
}

// Rewrites every inline-link href outside fenced code blocks and inline code
// spans. `transform` returns a replacement href, or null to leave it unchanged.
export function rewriteLinks(
  body: string,
  transform: (href: string) => string | null,
): string {
  let fence: string | null = null;
  return body
    .split("\n")
    .map((line) => {
      const { next, toggled } = isFenceToggle(line, fence);
      fence = next;
      if (toggled || fence !== null) return line;
      return line.replace(
        TOKEN_RE,
        (whole, codeTicks, bang, open, href, close) => {
          if (codeTicks !== undefined) return whole; // inline code span
          if (bang === "!") return whole; // image, not a link
          const replacement = transform(href);
          return replacement === null ? whole : `${open}${replacement}${close}`;
        },
      );
    })
    .join("\n");
}

export function collectLinks(body: string): string[] {
  const hrefs: string[] = [];
  rewriteLinks(body, (href) => {
    hrefs.push(href);
    return null;
  });
  return hrefs;
}
