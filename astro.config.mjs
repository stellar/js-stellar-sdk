import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://stellar.github.io",
  base: "/js-stellar-sdk",
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
      sidebar: [
        {
          label: "Guides",
          items: [{ autogenerate: { directory: "guides" } }],
        },
        {
          label: "Reference",
          items: [{ autogenerate: { directory: "reference" } }],
        },
      ],
    }),
    sitemap(),
  ],
});
