import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

const BASE = "/js-stellar-sdk";

export default defineConfig({
  site: "https://stellar.github.io",
  base: BASE,
  outDir: "./dist/site",
  prefetch: { prefetchAll: true },
  integrations: [
    starlight({
      title: "@stellar/stellar-sdk",
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
            href: `${BASE}/llms.txt`,
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
      ],
    }),
    sitemap(),
  ],
});
