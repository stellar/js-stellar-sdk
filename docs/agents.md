---
title: AI Agents
description: Documentation bundles for LLM consumption, regenerated on every release deploy.
---

# AI Agents

This SDK publishes structured documentation bundles so AI agents can
consume the API surface without scraping individual pages.

## Available bundles

- [`/llms.txt`](/llms.txt) — index of every guide and reference
  category, one entry per page, with each entry's `description` field
  sourced from the page's frontmatter. Use this as a routing map: pick
  the page most relevant to your task, then fetch it directly.
- [`/llms-full.txt`](/llms-full.txt) — the full corpus concatenated as
  one prose stream, with frontmatter blocks stripped and replaced by
  per-page `# Source: <relative-path>` headings. Ingest this as a
  single document when you want the whole API surface in one shot.

## Refresh cadence

Both bundles are regenerated on every release deploy. They reflect the
**current SDK major** only — older majors are not bundled (see the
[Versioning & Compatibility](./guides/00-versioning.md) page for the
rationale).

The current SDK version is **15.0.1**, sourced from
`package.json#version` at build time.

> Note: `llms.txt` and `llms-full.txt` are produced by the
> `scripts/build-llms.ts` step of the docs pipeline, which is not yet
> implemented. This page describes the eventual UX so the entry point
> is in place ahead of that pipeline step landing.
