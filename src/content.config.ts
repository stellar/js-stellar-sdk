import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

export const collections = {
  // Defined with an empty i18n/en.json only to stop Astro 7.4 warning that
  // Starlight's i18n collection is missing; Starlight can no longer mute it.
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  docs: defineCollection({
    // .docs-build is docs/ with guide snippet markers expanded to their
    // tested code (written by snippetsIntegration in config/snippets.ts).
    // Loading the expanded mirror — instead of docs/ plus a remark plugin —
    // makes the content-layer digest cover snippet code, so snippet edits
    // correctly invalidate cached pages in dev and in builds.
    loader: glob({ base: "./.docs-build", pattern: "**/*.md" }),
    schema: docsSchema(),
  }),
};
