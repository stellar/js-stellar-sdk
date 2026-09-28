/**
 * The sidebar group check (see scripts/check-sidebar.ts). Reads the rendered Starlight sidebar from one built page: each group is a `<details>` whose `<summary>` holds the label and whose body holds one `<a>` per page.
 */

// Mirrors the group labels in astro.config.mjs.
export const SIDEBAR_GROUPS = ["Guides", "Migration", "Reference"];

const DETAILS_RE =
  /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g;
const LABEL_RE = /<span[^>]*>([^<]+)<\/span>/;

/**
 * `problems` names each expected group that is missing from the page or renders with no links. `links` holds the link count of each group found.
 */
export function checkSidebar(
  html: string,
  groups: readonly string[],
): { problems: string[]; links: Map<string, number> } {
  const found = new Map<string, number>();
  for (const [, summary, body] of html.matchAll(DETAILS_RE)) {
    const label = LABEL_RE.exec(summary)?.[1].trim();
    if (label !== undefined) {
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
        `sidebar group "${label}" has no links — check its autogenerate ` +
          `directory in astro.config.mjs (it must be prefixed .docs-build/)`,
      );
    }
  }
  return { problems, links };
}
