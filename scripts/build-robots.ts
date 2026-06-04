/**
 * Generates public/robots.txt from config/site.ts. Outputs:
 *   - Wildcard policy with Cloudflare Content Signals (AI_POLICY)
 *   - Per-bot Allow blocks for every entry in ALLOWED_AI_BOTS
 *   - One Sitemap directive pointing at the XML sitemap-index
 *
 * Sibling to scripts/build-llms.ts; both write into the gitignored
 * public/ tree so Astro picks them up at site-root paths.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { AI_POLICY, ALLOWED_AI_BOTS, SITE_BASE_URL } from "../config/site.js";

const REPO_ROOT = process.cwd();
const PUBLIC_DIR = join(REPO_ROOT, "public");
const ROBOTS_OUT = join(PUBLIC_DIR, "robots.txt");

function renderContentSignal(): string {
  return `search=${AI_POLICY.search}, ai-input=${AI_POLICY.aiInput}, ai-train=${AI_POLICY.aiTrain}`;
}

function renderRobotsTxt(): string {
  const lines: string[] = [];

  lines.push(
    "# Stellar SDK docs are open for indexing, AI assistance, and AI training.",
  );
  lines.push(
    "# Source of truth: config/site.ts. Regenerate via `pnpm docs:robots`.",
  );
  lines.push("");
  lines.push("User-agent: *");
  lines.push(`Content-Signal: ${renderContentSignal()}`);
  lines.push("Allow: /");
  lines.push("");
  lines.push(
    "# Major AI crawlers — redundant with the wildcard above, but makes intent",
  );
  lines.push("# auditable to humans and visible to per-bot scanners.");
  for (const bot of ALLOWED_AI_BOTS) {
    lines.push(`User-agent: ${bot}`);
    lines.push("Allow: /");
  }
  lines.push("");
  lines.push(`Sitemap: ${SITE_BASE_URL}/sitemap-index.xml`);

  return `${lines.join("\n")}\n`;
}

function main(): void {
  const robotsTxt = renderRobotsTxt();
  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(ROBOTS_OUT, robotsTxt, "utf8");
  console.log(`Wrote ${ROBOTS_OUT} (${robotsTxt.length}B).`);
}

main();
