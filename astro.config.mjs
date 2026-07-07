import { defineConfig, fontProviders } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import GithubSlugger from "github-slugger";

import { SITE_URL, BASE_PATH } from "./config/site.js";
import { snippetsIntegration } from "./config/snippets.js";

const headingText = (node) =>
  node.type === "text"
    ? node.value
    : (node.children ?? []).map(headingText).join("");

// Base-prefixes root-absolute internal links (e.g. `/reference/core-keys/`)
// with the deploy base. Astro rewrites relative image refs but not cross-page
// links, so without this an authored `/reference/...` link would 404 on a
// based deploy. Authors write base-agnostic paths; the base lives only in
// config/site.ts. Mirrors the bundle rewriting in scripts/build-llms.ts.
function rehypeBaseInternalLinks() {
  const prefix = (href) => {
    if (typeof href !== "string") return href;
    if (!href.startsWith("/") || href.startsWith("//")) return href;
    if (href === BASE_PATH || href.startsWith(`${BASE_PATH}/`)) return href;
    return `${BASE_PATH}${href}`;
  };
  const walk = (node) => {
    if (
      node.type === "element" &&
      node.tagName === "a" &&
      node.properties &&
      typeof node.properties.href === "string"
    ) {
      node.properties.href = prefix(node.properties.href);
    }
    for (const child of node.children ?? []) walk(child);
  };
  return (tree) => {
    walk(tree);
  };
}

/**
 * Assign each content heading (h2–h6) a slug id and append a clickable
 * anchor link so readers can copy a deep link to any section.
 *
 * This runs before Astro's heading-id collector, which defers to any id
 * already set (see @astrojs/markdown-remark's rehype-collect-headings:
 * `if (typeof node.properties.id !== "string")`). So the id we set here
 * wins and is reused by the on-this-page TOC. We slug with `github-slugger`
 * — the same library that collector uses, and the same one
 * scripts/build-docs.ts uses for `{@link}` anchors — making it the single
 * source of truth for every heading id. A fresh slugger per page, fed
 * headings in document order, reproduces the `-1`/`-2` suffixes that
 * disambiguate repeated headings.
 */
function rehypeHeadingAnchors() {
  return (tree) => {
    const slugger = new GithubSlugger();
    const visit = (node) => {
      if (node.type === "element" && /^h[2-6]$/.test(node.tagName)) {
        const id = slugger.slug(headingText(node));
        node.properties = node.properties ?? {};
        node.properties.id = id;
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
    rehypePlugins: [rehypeBaseInternalLinks, rehypeHeadingAnchors],
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
    snippetsIntegration(),
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
          // The `.docs-build/` prefix is required because Starlight's
          // autogenerate filter strips a hardcoded `src/content/docs/`
          // prefix from each route's `filePath` before matching
          // `directory`. With our content collection rooted at
          // `./.docs-build/` (the snippet-expanded mirror of docs/, see
          // config/snippets.ts), that strip is a no-op, so paths still
          // start with `.docs-build/` at filter time.
          items: [{ autogenerate: { directory: ".docs-build/guides" } }],
        },
        {
          label: "Reference",
          items: [{ autogenerate: { directory: ".docs-build/reference" } }],
        },
        { slug: "agents" },
      ],
    }),
    sitemap(),
  ],
});
