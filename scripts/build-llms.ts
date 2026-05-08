/**
 * Reads `docs/`, emits `docs/llms.txt` (compact index) and
 * `docs/llms-full.txt` (full corpus + appended CHANGELOG.md). The
 * llms.txt schema is locked in `.claude/notes/docs-plan.md` →
 * "`llms.txt` schema" subsection. Sibling to scripts/build-docs.ts;
 * both feed the docs pipeline (`pnpm docs`).
 */

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPO_ROOT = process.cwd();
const DOCS_DIR = join(REPO_ROOT, "docs");
const PUBLIC_DIR = join(REPO_ROOT, "public");
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

function urlForDocsRelPath(docsRelPath: string): string {
  const stripped = docsRelPath.replace(/\.md$/, "");
  if (stripped === "index") return "/";
  return `/${stripped}`;
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
  sha: string;
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
  lines.push(`- Generated: ${opts.sha}`);
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
    "- [Full bundle](/llms-full.txt): All guide and reference content plus CHANGELOG, in one file.",
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

// === main ===

function main(): void {
  const sha = execSync("git rev-parse HEAD", { cwd: REPO_ROOT })
    .toString()
    .trim();
  const pkg = JSON.parse(readFileSync(PKG_PATH, "utf8")) as {
    version: string;
    description: string;
  };
  console.log(
    `Building llms bundles: SDK v${pkg.version} at ${sha.substring(0, 8)}`,
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
    sha,
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
