import { defineConfig, fontProviders } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

import { SITE_URL, BASE_PATH } from "./config/site.js";

/**
 * Append a clickable anchor link to every content heading (h2–h6) so
 * readers can copy a deep link to any section. Inline (no dependency) to
 * keep the docs pipeline self-contained.
 *
 * Astro injects heading `id`s downstream of user rehype plugins, so the
 * id isn't available here yet. Instead we derive the slug from the
 * heading text using the same rule Astro/Starlight applies (lowercase,
 * spaces → `-`, drop everything else), so the generated href matches the
 * `id` Astro sets and the anchors in the on-this-page TOC. This rule
 * mirrors `slugifyHeading` in scripts/build-docs.ts (which produces the
 * `{@link}` anchors) — keep the two in sync.
 */
function rehypeHeadingAnchors() {
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  const textOf = (node) => {
    if (node.type === "text") return node.value;
    return (node.children ?? []).map(textOf).join("");
  };
  return (tree) => {
    const visit = (node) => {
      if (node.type === "element" && /^h[2-6]$/.test(node.tagName)) {
        const id = slugify(textOf(node));
        if (id.length > 0) {
          // The visible `#` is rendered via CSS (`.heading-anchor::after`),
          // not as a text node, so it does not leak into the heading text
          // that Starlight extracts for the on-this-page TOC.
          node.children.push({
            type: "element",
            tagName: "a",
            properties: {
              href: `#${id}`,
              className: ["heading-anchor"],
              "aria-label": "Link to this section",
            },
            children: [],
          });
        }
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
}

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  outDir: "./dist/site",
  prefetch: { prefetchAll: true },
  markdown: {
    rehypePlugins: [rehypeHeadingAnchors],
  },
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      name: "Inconsolata",
      cssVariable: "--font-inconsolata",
      provider: fontProviders.google(),
      weights: [400, 700],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
  integrations: [
    starlight({
      title: "@stellar/stellar-sdk",
      components: {
        PageTitle: "./src/starlightComponents/PageTitle.astro",
        Head: "./src/starlightComponents/Head.astro",
      },
      customCss: ["./src/styles/overrides.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/stellar/js-stellar-sdk",
        },
      ],
      // P17: per-page <link rel="alternate"> pointing at the LLMs
      // sitemap so AI agents can discover the bundle from any rendered
      // page. Hardcoded with the base prefix because Starlight emits
      // `head` entries verbatim — Astro doesn't auto-prefix arbitrary
      // attributes.
      head: [
        {
          tag: "link",
          attrs: {
            rel: "alternate",
            type: "text/plain",
            title: "LLMs sitemap",
            href: `${BASE_PATH}/llms.txt`,
          },
        },
      ],
      sidebar: [
        {
          label: "Guides",
          // The `docs/` prefix is required because Starlight's autogenerate
          // filter strips a hardcoded `src/content/docs/` prefix from each
          // route's `filePath` before matching `directory`. With our custom
          // content collection rooted at `./docs/`, that strip is a no-op,
          // so paths still start with `docs/` at filter time.
          items: [{ autogenerate: { directory: "docs/guides" } }],
        },
        {
          label: "Reference",
          items: [{ autogenerate: { directory: "docs/reference" } }],
        },
        { slug: "agents" },
      ],
    }),
    sitemap(),
  ],
});
