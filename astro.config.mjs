import { defineConfig, fontProviders } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

import { SITE_URL, BASE_PATH } from "./config/site.js";

// Base-prefixes root-absolute internal links (e.g. `/reference/core-keys/`)
// with the deploy base. Astro rewrites relative image refs but NOT cross-page
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

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  outDir: "./dist/site",
  markdown: {
    rehypePlugins: [rehypeBaseInternalLinks],
  },
  prefetch: { prefetchAll: true },
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
