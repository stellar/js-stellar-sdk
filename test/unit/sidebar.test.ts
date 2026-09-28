import { describe, expect, it } from "vitest";

import { checkSidebar } from "../../config/sidebar.js";

// Unit tests for the sidebar group check (config/sidebar.ts). The fixtures follow the Starlight markup of a built page, reduced to the elements the rule reads.

const link = (href: string) =>
  `<li><a href="${href}"><span>${href}</span></a></li>`;

const groupOf = (label: string, inner: string) =>
  `<li><details open><summary><span class="group-label"><span class="large">${label}</span></span><svg aria-hidden="true"></svg></summary><sl-sidebar-restore data-index="0"></sl-sidebar-restore><ul>${inner}</ul></details></li>`;

const group = (label: string, hrefs: string[]) =>
  groupOf(label, hrefs.map(link).join(""));

// The page also has an "On this page" toggle, which is a details element with links but not a sidebar group.
const page = (groups: string) =>
  `<html><body><nav aria-label="Main"><sl-sidebar-state-persist><ul>${groups}</ul></sl-sidebar-state-persist></nav><details><summary><span class="toggle">On this page<svg aria-hidden="true"></svg></span></summary><ul><li><a href="#top"><span>Top</span></a></li></ul></details></body></html>`;

const GROUPS = ["Guides", "Migration", "Reference"];

describe("checkSidebar", () => {
  it("counts the links of each expected group", () => {
    const html = page(
      group("Guides", ["/guides/01/", "/guides/02/"]) +
        group("Migration", ["/migration/00/"]) +
        group("Reference", ["/reference/core-keys/"]),
    );
    expect(checkSidebar(html, GROUPS)).toEqual({
      problems: [],
      links: new Map([
        ["Guides", 2],
        ["Migration", 1],
        ["Reference", 1],
      ]),
    });
  });

  it("reports a group that renders with no links", () => {
    const html = page(
      group("Guides", []) +
        group("Migration", ["/migration/00/"]) +
        group("Reference", ["/reference/core-keys/"]),
    );
    expect(checkSidebar(html, GROUPS)).toEqual({
      problems: [
        'sidebar group "Guides" has no links — check its directory in config/sidebar.ts and the .docs-build/ prefix in astro.config.mjs',
      ],
      links: new Map([
        ["Guides", 0],
        ["Migration", 1],
        ["Reference", 1],
      ]),
    });
  });

  it("reports a group that is missing from the page", () => {
    const html = page(
      group("Guides", ["/guides/01/"]) + group("Migration", ["/migration/00/"]),
    );
    expect(checkSidebar(html, GROUPS)).toEqual({
      problems: ['sidebar group "Reference" is missing'],
      links: new Map([
        ["Guides", 1],
        ["Migration", 1],
      ]),
    });
  });

  // Starlight renders a subdirectory as a nested group inside its parent.
  it("counts links inside nested groups", () => {
    const cases: [string, string, number][] = [
      ["only nested", group("Sub", ["/guides/sub/1/", "/guides/sub/2/"]), 2],
      [
        "nested then direct",
        group("Sub", ["/guides/sub/1/"]) + link("/guides/2/"),
        2,
      ],
      ["two levels deep", groupOf("A", group("B", ["/guides/a/b/1/"])), 1],
    ];
    for (const [name, inner, count] of cases) {
      const html = page(
        groupOf("Guides", inner) +
          group("Migration", ["/migration/00/"]) +
          group("Reference", ["/reference/core-keys/"]),
      );
      expect(checkSidebar(html, GROUPS), name).toEqual({
        problems: [],
        links: new Map([
          ["Guides", count],
          ["Migration", 1],
          ["Reference", 1],
        ]),
      });
    }
  });

  it("reports every group when the page has no sidebar", () => {
    expect(checkSidebar("<html><body></body></html>", GROUPS).problems).toEqual(
      [
        'sidebar group "Guides" is missing',
        'sidebar group "Migration" is missing',
        'sidebar group "Reference" is missing',
      ],
    );
  });
});
