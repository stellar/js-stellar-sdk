/**
 * The sidebar group check (see scripts/check-sidebar.ts). It reads the rendered Starlight sidebar from one built page. Each group is a `<details>` element. Its `<summary>` holds the label, and its body holds one `<a>` per page. A subdirectory renders as a nested group, and its links count toward the parent group.
 */

// The sidebar groups in nav order. astro.config.mjs builds its autogenerate entries from this list, so the check and the config cannot drift. `directory` is relative to docs/.
export const SIDEBAR_GROUPS = [
  { label: "Guides", directory: "guides" },
  { label: "Migration", directory: "migration" },
  { label: "Reference", directory: "reference" },
];

const DETAILS_TAG_RE = /<(\/?)details\b[^>]*>/g;
const SUMMARY_RE = /^<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>/;
const LABEL_RE = /<span[^>]*>([^<]+)<\/span>/;

// Tracks depth because a regex cannot pair each `<details>` with its own closing tag once groups nest.
function outermostDetails(html: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (const tag of html.matchAll(DETAILS_TAG_RE)) {
    if (tag[1] === "") {
      if (depth === 0) start = tag.index;
      depth += 1;
    } else if (depth > 0) {
      depth -= 1;
      if (depth === 0) out.push(html.slice(start, tag.index));
    }
  }
  return out;
}

/**
 * `problems` names each expected group that is missing from the page or renders with no links. `links` holds the link count of each group found.
 */
export function checkSidebar(
  html: string,
  groups: readonly string[],
): { problems: string[]; links: Map<string, number> } {
  const found = new Map<string, number>();
  for (const details of outermostDetails(html)) {
    const summary = SUMMARY_RE.exec(details);
    if (summary === null) continue;
    const label = LABEL_RE.exec(summary[1])?.[1].trim();
    if (label !== undefined) {
      const body = details.slice(summary[0].length);
      found.set(label, (body.match(/<a\s/g) ?? []).length);
    }
  }

  const problems: string[] = [];
  const links = new Map<string, number>();
  for (const label of groups) {
    const count = found.get(label);
    if (count === undefined) {
      problems.push(`sidebar group "${label}" is missing`);
      continue;
    }
    links.set(label, count);
    if (count === 0) {
      problems.push(
        `sidebar group "${label}" has no links — check its directory in ` +
          `config/sidebar.ts and the .docs-build/ prefix in astro.config.mjs`,
      );
    }
  }
  return { problems, links };
}
