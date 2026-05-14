/**
 * Two responsibilities for the docs pipeline:
 *
 *   1. Syncs README.md → docs/index.md (the canonical homepage). The
 *      docs/index.md file is README contents prefixed with a Starlight
 *      frontmatter block. Title is derived from README's first H1;
 *      description is hardcoded below.
 *
 *   2. Reads `docs/`, emits `docs/llms.txt` (compact index) and
 *      `docs/llms-full.txt` (full corpus + appended CHANGELOG.md). The
 *      llms.txt schema is locked in `.claude/notes/docs-plan.md` →
 *      "`llms.txt` schema" subsection.
 *
 * Both outputs are committed in `docs/`; CI's `git diff --exit-code -- docs/`
 * step catches drift. Sibling to scripts/build-docs.ts; both feed the docs
 * pipeline (`pnpm docs`).
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DOCS_SOURCE_REF } from "./docs-source-ref.js";

const REPO_ROOT = process.cwd();
const DOCS_DIR = join(REPO_ROOT, "docs");
const PUBLIC_DIR = join(REPO_ROOT, "public");
const README_PATH = join(REPO_ROOT, "README.md");
const INDEX_OUT = join(DOCS_DIR, "index.md");
const LLMS_OUT = join(DOCS_DIR, "llms.txt");
const LLMS_FULL_OUT = join(DOCS_DIR, "llms-full.txt");
// Mirrored copies under public/ so Astro publishes them at the site
// root (`<site>/llms.txt`, `<site>/llms-full.txt`). The canonical
// committed copy lives at docs/; public/ is gitignored and rebuilt.
const PUBLIC_LLMS_OUT = join(PUBLIC_DIR, "llms.txt");
const PUBLIC_LLMS_FULL_OUT = join(PUBLIC_DIR, "llms-full.txt");
const CHANGELOG_PATH = join(REPO_ROOT, "CHANGELOG.md");
const PKG_PATH = join(REPO_ROOT, "package.json");

const PROJECT_NAME = "@stellar/stellar-sdk";

// Docs site homepage frontmatter description. Kept here rather than
// pulled from package.json#description because the docs site's tagline
// is tuned for human readers, not npm registry surfacing.
const INDEX_DESCRIPTION =
  "A JavaScript library for communicating with a Stellar Horizon server and Stellar RPC.";

// Reference-page slug order. Mirrors BUCKET_TO_SLUG insertion order
// in scripts/build-docs.ts; keep in sync if either side changes. (If
// a third script ever needs this list, refactor to a shared module
// under scripts/lib/ — until then, the duplication is the lighter
// option.)
const REFERENCE_SLUG_ORDER: readonly string[] = [
  "core-keys",
  "core-assets",
  "core-transactions",
  "core-xdr",
  "core-soroban-primitives",
  "network-horizon",
  "network-rpc",
  "network-friendbot",
  "network-http",
  "contracts-client",
  "contracts-bindings",
  "seps-toml",
  "seps-federation",
  "seps-webauth",
  "errors",
  "cross-cutting",
];

interface Frontmatter {
  title?: string;
  description?: string;
}

interface DocPage {
  // Path relative to docs/, e.g., "index.md", "guides/00-versioning.md".
  docsRelPath: string;
  // Path relative to repo root, e.g., "docs/index.md".
  repoRelPath: string;
  // Site URL, e.g., "/", "/agents", "/guides/00-versioning".
  url: string;
  frontmatter: Frontmatter;
  // Body with frontmatter stripped and leading/trailing newlines trimmed.
  body: string;
}

// Single-line `key: value` parser. Sufficient for our frontmatter
// shape (title + description; no nested keys, no multiline values, no
// quoted strings).
function parseFrontmatter(content: string): { fm: Frontmatter; body: string } {
  if (!content.startsWith("---\n")) {
    return { fm: {}, body: content };
  }
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    return { fm: {}, body: content };
  }
  const block = content.substring(4, end);
  const body = content.substring(end + 5);
  const fm: Frontmatter = {};
  for (const line of block.split("\n")) {
    const match = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.+)$/);
    if (match === null) continue;
    const key = match[1];
    const value = match[2].trim();
    if (key === "title") fm.title = value;
    else if (key === "description") fm.description = value;
  }
  return { fm, body };
}

// Bundle-relative paths (no leading slash) so links resolve against the
// bundle's own URL per RFC 3986. Keeps llms.txt portable across hosts and
// base paths: served from `https://any-host/any-base/llms.txt`, a link
// like `guides/00-versioning` resolves to
// `https://any-host/any-base/guides/00-versioning`.
function urlForDocsRelPath(docsRelPath: string): string {
  const stripped = docsRelPath.replace(/\.md$/, "");
  if (stripped === "index") return ".";
  return stripped;
}

function readDoc(docsRelPath: string): DocPage {
  const fullPath = join(DOCS_DIR, docsRelPath);
  const raw = readFileSync(fullPath, "utf8");
  const { fm, body: rawBody } = parseFrontmatter(raw);
  const body = rawBody.replace(/^\n+/, "").replace(/\n+$/, "");
  return {
    docsRelPath,
    repoRelPath: `docs/${docsRelPath}`,
    url: urlForDocsRelPath(docsRelPath),
    frontmatter: fm,
    body,
  };
}

function listGuideFiles(): string[] {
  const dir = join(DOCS_DIR, "guides");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => `guides/${f}`);
}

function listReferenceFiles(): string[] {
  return REFERENCE_SLUG_ORDER.map((slug) => `reference/${slug}.md`);
}

// === llms.txt rendering ===

function renderEntryWithDescription(p: DocPage): string {
  const title = p.frontmatter.title ?? p.docsRelPath;
  const description = p.frontmatter.description ?? "";
  return description.length > 0
    ? `- [${title}](${p.url}): ${description}`
    : `- [${title}](${p.url})`;
}

function renderEntryTitleOnly(p: DocPage): string {
  const title = p.frontmatter.title ?? p.docsRelPath;
  return `- [${title}](${p.url})`;
}

function renderLlmsTxt(opts: {
  description: string;
  version: string;
  sourceRef: string;
  guides: DocPage[];
  reference: DocPage[];
  agents: DocPage;
}): string {
  const lines: string[] = [];
  lines.push(`# ${PROJECT_NAME}`);
  lines.push("");
  lines.push(`> ${opts.description}`);
  lines.push("");
  lines.push(`- Version: ${opts.version}`);
  lines.push(`- Source ref: ${opts.sourceRef}`);
  lines.push("");
  lines.push("## Guides");
  lines.push("");
  for (const g of opts.guides) lines.push(renderEntryWithDescription(g));
  lines.push("");
  lines.push("## Reference");
  lines.push("");
  for (const r of opts.reference) lines.push(renderEntryTitleOnly(r));
  lines.push("");
  lines.push("## Other");
  lines.push("");
  lines.push(renderEntryWithDescription(opts.agents));
  lines.push(
    "- [Full bundle](llms-full.txt): All guide and reference content plus CHANGELOG, in one file.",
  );
  return `${lines.join("\n")}\n`;
}

// === llms-full.txt rendering ===

function renderSection(repoRelPath: string, body: string): string {
  return `# Source: ${repoRelPath}\n\n${body}`;
}

function renderLlmsFullTxt(opts: {
  index: DocPage;
  guides: DocPage[];
  reference: DocPage[];
  agents: DocPage;
  changelog: string;
}): string {
  const sections: string[] = [];
  sections.push(renderSection(opts.index.repoRelPath, opts.index.body));
  for (const g of opts.guides)
    sections.push(renderSection(g.repoRelPath, g.body));
  for (const r of opts.reference)
    sections.push(renderSection(r.repoRelPath, r.body));
  sections.push(renderSection(opts.agents.repoRelPath, opts.agents.body));
  sections.push(renderSection("CHANGELOG.md", opts.changelog));
  return `${sections.join("\n\n")}\n`;
}

// === README → docs/index.md sync ===

// Writes docs/index.md as Starlight frontmatter + README contents. Title
// is derived from README's first H1; description is hardcoded above.
// Must run before any subsequent step that reads docs/index.md.
function syncIndexFromReadme(): void {
  const readme = readFileSync(README_PATH, "utf8");
  const h1Match = readme.match(/^#\s+(.+)$/m);
  if (h1Match === null) {
    throw new Error(
      "README.md has no '# ' heading — required to derive docs/index.md title.",
    );
  }
  const title = h1Match[1].trim();
  const frontmatter = `---\ntitle: ${title}\ndescription: ${INDEX_DESCRIPTION}\n---\n\n`;
  writeFileSync(INDEX_OUT, frontmatter + readme, "utf8");
  console.log(
    `Synced README.md → ${INDEX_OUT} (${frontmatter.length + readme.length}B).`,
  );
}

// === main ===

function main(): void {
  syncIndexFromReadme();

  const pkg = JSON.parse(readFileSync(PKG_PATH, "utf8")) as {
    version: string;
    description: string;
  };
  console.log(
    `Building llms bundles: SDK v${pkg.version} with source ref '${DOCS_SOURCE_REF}'`,
  );

  const indexPage = readDoc("index.md");
  const agentsPage = readDoc("agents.md");
  const guidesPages = listGuideFiles().map(readDoc);
  const referencePages = listReferenceFiles().map(readDoc);

  const changelog = readFileSync(CHANGELOG_PATH, "utf8")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");

  const llmsTxt = renderLlmsTxt({
    description: pkg.description,
    version: pkg.version,
    sourceRef: DOCS_SOURCE_REF,
    guides: guidesPages,
    reference: referencePages,
    agents: agentsPage,
  });

  const llmsFullTxt = renderLlmsFullTxt({
    index: indexPage,
    guides: guidesPages,
    reference: referencePages,
    agents: agentsPage,
    changelog,
  });

  writeFileSync(LLMS_OUT, llmsTxt, "utf8");
  writeFileSync(LLMS_FULL_OUT, llmsFullTxt, "utf8");

  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(PUBLIC_LLMS_OUT, llmsTxt, "utf8");
  writeFileSync(PUBLIC_LLMS_FULL_OUT, llmsFullTxt, "utf8");

  console.log(`Wrote ${LLMS_OUT} (${llmsTxt.length}B).`);
  console.log(`Wrote ${LLMS_FULL_OUT} (${llmsFullTxt.length}B).`);
  console.log(`Mirrored to ${PUBLIC_DIR} for Astro site-root serving.`);
}

main();
