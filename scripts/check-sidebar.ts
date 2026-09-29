/**
 * Fails the docs build when a sidebar group is missing or renders with no links.
 *
 * Starlight's `autogenerate` matches each group's `directory` against the route paths. A directory that matches no route renders the group heading over an empty list. The build still exits 0, so the empty group reaches the deploy unseen.
 *
 * The rule lives in checkSidebar (config/sidebar.ts). The sidebar is the same on every page, so one built page is enough. It reads the agents page, a fixed sidebar entry, because a `template: splash` landing page would render no sidebar. Must run after `astro build`; wired into `pnpm docs:site`.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { SIDEBAR_GROUPS, checkSidebar } from "../config/sidebar.js";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = join(REPO_ROOT, "dist", "site", "agents", "index.html");

if (!existsSync(PAGE)) {
  console.error(
    `Missing ${PAGE}: the check reads the agents page, the ` +
      `\`{ slug: "agents" }\` sidebar entry. Run \`pnpm docs:site\` first.`,
  );
  process.exit(1);
}

const { problems, links } = checkSidebar(
  readFileSync(PAGE, "utf8"),
  SIDEBAR_GROUPS.map((group) => group.label),
);

for (const [label, count] of links) {
  console.log(`sidebar group "${label}": ${count} link(s)`);
}

// Set exitCode rather than calling process.exit: stderr to a pipe is async on POSIX, and exiting mid-write truncates the problem list in CI.
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`${links.size} sidebar group(s) OK`);
}
