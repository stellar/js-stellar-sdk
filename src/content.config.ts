import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

export const collections = {
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
