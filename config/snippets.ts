/**
 * Guide code snippets: single-source expansion of snippet markers.
 *
 * Guide markdown never contains code for a tested example — only a marker:
 *
 *   <!-- snippet: send-a-payment.ts#build -->
 *
 * The code lives once, in examples/guides/<file>, between
 * `// #region <name>` and `// #endregion` comments, where it is typechecked
 * and executed by the test/guides/ suite. At build time the marker is
 * replaced with a fenced code block holding the region's contents:
 *
 *  - snippetsIntegration: Astro integration that mirrors docs/ into the
 *    gitignored .docs-build/ dir with markers expanded. The docs content
 *    collection loads from that dir (see src/content.config.ts), so Astro's
 *    content-layer digests cover the snippet code — a snippet edit
 *    invalidates exactly the pages that embed it, in dev and in builds.
 *    (Expanding via a remark plugin instead does NOT work: the content
 *    layer caches rendered pages by the raw .md digest, so snippet edits
 *    would leave stale pages in the persisted .astro/ cache.)
 *  - expandSnippetMarkers: string-level expansion for the raw-markdown
 *    consumers (scripts/build-llms.ts, scripts/build-md-siblings.ts)
 *  - scripts/check-snippets.ts validates that every marker resolves
 *
 * A region name may appear multiple times in one snippet file; its parts are
 * joined with a blank line, which lets a displayed fragment (an import plus
 * one line of a builder chain, say) be carved out of a larger compiling
 * program. Code outside any region is setup/assertion context that never
 * appears in the docs.
 */

import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SNIPPETS_DIR = join(REPO_ROOT, "examples", "guides");
const DOCS_DIR = join(REPO_ROOT, "docs");
export const DOCS_BUILD_DIR = join(REPO_ROOT, ".docs-build");

export const MARKER = /^<!--\s*snippet:\s*([\w./-]+)#([\w-]+)\s*-->\s*$/;

// Anything that mentions "snippet" in an HTML comment but is not an exact
// marker (missing colon, indented inside a list item, typo in the region
// reference) would otherwise be an invisible no-op: the guide ships with a
// hole where the code should be and CI stays green. Treat near-misses as
// hard errors instead.
const MARKER_NEAR_MISS = /<!--[^>]*\bsnippets?\b/i;

const REGION_START = /^\s*\/\/\s*#region\s+([\w-]+)\s*$/;
const REGION_END = /^\s*\/\/\s*#endregion(?:\s+([\w-]+))?\s*$/;

// Keyed by file, invalidated on mtime change so a long-lived `astro dev`
// process picks up snippet edits.
const regionCache = new Map<
  string,
  { mtimeMs: number; regions: Map<string, string> }
>();

/**
 * Parses every `#region` in a snippet file into name → joined content.
 *
 * Regions may overlap: a line belongs to every region open at that point,
 * which lets a `full` region span a whole program while step regions carve
 * views out of the same lines (this is what makes a guide's "Put it
 * together" block a view of the one program instead of a duplicated second
 * file). `#endregion` must be named whenever more than one region is open.
 * Region marker lines themselves never appear in any region's content.
 */
function regionsOf(file: string): Map<string, string> {
  const fullPath = resolve(SNIPPETS_DIR, file);
  // Markers may contain `/` and `.` for readability, but guide code must
  // live in examples/guides/ — reject a reference that escapes it.
  if (relative(SNIPPETS_DIR, fullPath).startsWith("..")) {
    throw new Error(
      `snippet reference "${file}" resolves outside examples/guides/`,
    );
  }
  const { mtimeMs } = statSync(fullPath);
  const cached = regionCache.get(file);
  if (cached && cached.mtimeMs === mtimeMs) return cached.regions;

  const regions = parseRegions(readFileSync(fullPath, "utf8"), file);
  regionCache.set(file, { mtimeMs, regions });
  return regions;
}

/**
 * Parses `#region` markers out of a snippet file's source. Pure — separated
 * from regionsOf's fs/cache concerns so it is unit-testable. `file` only
 * labels error messages.
 */
export function parseRegions(
  source: string,
  file: string,
): Map<string, string> {
  const parts = new Map<string, string[]>();
  const open = new Map<string, string[]>();

  for (const line of source.split("\n")) {
    const start = line.match(REGION_START);
    if (start) {
      const name = start[1];
      if (open.has(name)) {
        throw new Error(`${file}: #region ${name} reopened before closing`);
      }
      open.set(name, []);
      continue;
    }
    const end = line.match(REGION_END);
    if (end) {
      if (open.size === 0) {
        throw new Error(
          `${file}: #endregion${end[1] ? ` ${end[1]}` : ""} without an ` +
            `open #region`,
        );
      }
      const name = end[1] ?? (open.size === 1 ? [...open.keys()][0] : null);
      if (name === null) {
        throw new Error(
          `${file}: bare #endregion is ambiguous with ${open.size} regions ` +
            `open (${[...open.keys()].join(", ")}) — name it, e.g. ` +
            `\`// #endregion ${[...open.keys()][0]}\``,
        );
      }
      const buf = open.get(name);
      if (buf === undefined) {
        throw new Error(`${file}: #endregion ${name} without open #region`);
      }
      const existing = parts.get(name) ?? [];
      existing.push(buf.join("\n").replace(/^\n+|\n+$/g, ""));
      parts.set(name, existing);
      open.delete(name);
      continue;
    }
    for (const buf of open.values()) buf.push(line);
  }
  if (open.size > 0) {
    throw new Error(
      `${file}: #region ${[...open.keys()].join(", ")} never closed`,
    );
  }

  const regions = new Map<string, string>();
  for (const [name, chunks] of parts) {
    regions.set(name, dedent(joinParts(chunks)));
  }
  return regions;
}

/**
 * Joins a region's parts. Parts are separated by a blank line, except when
 * the next part continues an indented expression (a builder-chain fragment
 * whose middle lines belong to another region), which joins seamlessly.
 */
function joinParts(chunks: string[]): string {
  return chunks.reduce((joined, chunk) =>
    /^[ \t]/.test(chunk) ? `${joined}\n${chunk}` : `${joined}\n\n${chunk}`,
  );
}

/**
 * Strips the longest whitespace prefix shared by every non-empty line, so a
 * region carved from inside a block (a try/catch body, say) renders at the
 * left margin. A region with any column-0 line (imports, top-level consts)
 * is returned unchanged, which preserves deliberate relative indentation
 * like a builder-chain continuation fragment.
 */
function dedent(code: string): string {
  let common: string | null = null;
  for (const line of code.split("\n")) {
    if (line.trim() === "") continue;
    const indent = /^[ \t]*/.exec(line)![0];
    if (common === null || indent.startsWith(common)) {
      common =
        common === null || indent.length < common.length ? indent : common;
    } else if (!common.startsWith(indent)) {
      return code; // mixed tabs/spaces prefixes; leave as authored
    } else {
      common = indent;
    }
  }
  if (!common) return code;
  return code
    .split("\n")
    .map((line) => (line.trim() === "" ? line : line.slice(common.length)))
    .join("\n");
}

/** Resolves one `file#region` reference to its code, or throws. */
export function snippetRegion(file: string, name: string): string {
  const region = regionsOf(file).get(name);
  if (region === undefined) {
    throw new Error(
      `no #region ${name} in ${join(SNIPPETS_DIR, file)} ` +
        `(is the marker's file#region reference right?)`,
    );
  }
  return region;
}

function langOf(file: string): string {
  return file.split(".").pop() ?? "ts";
}

/** One markdown line, classified by the shared fence-aware scanner. */
export interface ScannedLine {
  line: string;
  kind: "text" | "marker" | "near-miss" | "fence-open" | "fence-close" | "code";
  // Set when kind is "marker".
  file?: string;
  region?: string;
}

/**
 * Classifies markdown lines with CommonMark-style fence tracking, so every
 * consumer (the expander and check-snippets) agrees on what is a marker and
 * what is display text. A fence opens with 3+ backticks or tildes and
 * closes only with a bare run of the same character at least as long, so
 * nested fences (a 4-backtick block displaying a 3-backtick block) and
 * tilde fences are handled. Lines inside fences are never markers — a docs
 * page may legitimately show the marker syntax as an example.
 */
export function scanMarkdown(markdown: string): ScannedLine[] {
  const out: ScannedLine[] = [];
  let fence: { char: string; len: number } | null = null;

  for (const line of markdown.split("\n")) {
    const run = /^\s*(`{3,}|~{3,})/.exec(line);
    if (run) {
      const char = run[1][0];
      const len = run[1].length;
      if (fence === null) {
        fence = { char, len };
        out.push({ line, kind: "fence-open" });
        continue;
      }
      // A closing fence is a bare same-char run at least as long as the
      // opener (no info string).
      const bare = /^\s*(`{3,}|~{3,})\s*$/.test(line);
      if (bare && char === fence.char && len >= fence.len) {
        fence = null;
        out.push({ line, kind: "fence-close" });
      } else {
        out.push({ line, kind: "code" });
      }
      continue;
    }
    if (fence !== null) {
      out.push({ line, kind: "code" });
      continue;
    }
    const m = line.match(MARKER);
    if (m) {
      out.push({ line, kind: "marker", file: m[1], region: m[2] });
      continue;
    }
    if (MARKER_NEAR_MISS.test(line)) {
      out.push({ line, kind: "near-miss" });
      continue;
    }
    out.push({ line, kind: "text" });
  }
  return out;
}

export function nearMissError(lineNumber: number, line: string): Error {
  return new Error(
    `line ${lineNumber}: malformed snippet marker "${line.trim()}". ` +
      `A snippet reference must be exactly ` +
      `\`<!-- snippet: file.ts#region -->\` at the start of its own ` +
      `line. If this comment is prose and not a marker, avoid the ` +
      `word "snippet" in docs HTML comments (or put the example in a ` +
      `code fence, which is skipped).`,
  );
}

/**
 * Replaces every snippet marker line in a markdown string with a fenced
 * code block. For consumers that work on raw markdown text.
 */
export function expandSnippetMarkers(markdown: string): string {
  return scanMarkdown(markdown)
    .map((scanned, i) => {
      if (scanned.kind === "marker") {
        const { file, region } = scanned as Required<ScannedLine>;
        return `\`\`\`${langOf(file)}\n${snippetRegion(file, region)}\n\`\`\``;
      }
      if (scanned.kind === "near-miss") {
        throw nearMissError(i + 1, scanned.line);
      }
      return scanned.line;
    })
    .join("\n");
}

/** All .md files under root, recursively (shared with check-snippets). */
export function walkMarkdown(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = join(root, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

/**
 * Mirrors docs/**\/*.md into .docs-build/ with snippet markers expanded.
 * Content-identical files are left untouched so the dev server only
 * hot-reloads pages that actually changed; orphans (deleted sources) are
 * removed.
 */
export function generateExpandedDocs(): void {
  const expected = new Set<string>();
  for (const src of walkMarkdown(DOCS_DIR)) {
    const rel = relative(DOCS_DIR, src);
    expected.add(rel);
    const dst = join(DOCS_BUILD_DIR, rel);
    let content: string;
    try {
      content = expandSnippetMarkers(readFileSync(src, "utf8"));
    } catch (e) {
      throw new Error(`${rel}: ${(e as Error).message}`);
    }
    let current: string | null = null;
    try {
      current = readFileSync(dst, "utf8");
    } catch {
      mkdirSync(dirname(dst), { recursive: true });
    }
    if (current !== content) writeFileSync(dst, content);
  }
  let stale: string[] = [];
  try {
    stale = walkMarkdown(DOCS_BUILD_DIR);
  } catch {
    // Nothing generated yet.
  }
  for (const built of stale) {
    if (!expected.has(relative(DOCS_BUILD_DIR, built))) {
      rmSync(built);
    }
  }
}

/**
 * Astro integration: regenerates .docs-build/ when the config loads (dev,
 * build, and sync all pass through here before content loads), and in dev
 * watches docs/ and the snippets dir so edits to either re-expand and
 * hot-reload the affected pages.
 */
export function snippetsIntegration() {
  return {
    name: "guide-snippets",
    hooks: {
      "astro:config:setup"() {
        generateExpandedDocs();
      },
      "astro:server:setup"({ server }: { server: any }) {
        server.watcher.add([DOCS_DIR, SNIPPETS_DIR]);
        const regenerate = (path: string) => {
          if (!path.startsWith(DOCS_DIR) && !path.startsWith(SNIPPETS_DIR)) {
            return;
          }
          try {
            generateExpandedDocs();
          } catch (e) {
            // e.g. a marker referencing a not-yet-saved region; keep the
            // previous expansion and let the author finish typing.
            console.error(`[guide-snippets] ${(e as Error).message}`);
          }
        };
        server.watcher.on("change", regenerate);
        server.watcher.on("add", regenerate);
        server.watcher.on("unlink", regenerate);
      },
    },
  };
}
