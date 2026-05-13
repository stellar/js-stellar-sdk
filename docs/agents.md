---
title: AI Agents
description: Documentation bundles, raw-markdown access, and crawler signals for AI agents consuming this SDK's documentation.
---

# AI Agents

This SDK publishes its documentation in formats designed for AI agents.
There are three independent surfaces; pick whichever matches your workflow.

## llms.txt bundles

Structured bundles of the entire docs corpus, served at the site root:

- [`llms.txt`](../llms.txt) — index of every guide and reference page,
  one entry per page, with each entry's `description` field sourced from
  the page's frontmatter. Use this as a routing map: pick the page most
  relevant to your task, then fetch it directly.
- [`llms-full.txt`](../llms-full.txt) — the full corpus concatenated as
  one prose stream, with frontmatter blocks stripped and replaced by
  per-page `# Source: <relative-path>` headings. Ingest as a single
  document when you want the whole API surface in one shot.

Links inside `llms.txt` are bundle-relative, so they resolve correctly
no matter what host or base path the bundle is served from.

## Raw markdown siblings

Every rendered docs page has a `.md` sibling at the same URL with
`.md` appended. For example:

| HTML page | Raw markdown |
| --- | --- |
| `…/guides/01-getting-started/` | `…/guides/01-getting-started.md` |
| `…/reference/core-keys/` | `…/reference/core-keys.md` |

Agents that prefer parsing markdown directly (instead of stripping HTML
or fetching the full bundle) can fetch any page's source by appending
`.md` to its URL. Frontmatter is preserved.

## Crawler policy (robots.txt)

The site's [`robots.txt`](../robots.txt) declares an open policy via
[Cloudflare Content Signals](https://blog.cloudflare.com/content-signals-policy/):
`search`, `ai-input`, and `ai-train` are all permitted. Per-bot `Allow`
rules are emitted for every major AI crawler so the policy is auditable
on inspection.

The full bot list and the policy values are kept in
[`config/site.ts`](https://github.com/stellar/js-stellar-sdk/blob/master/config/site.ts);
edit that file and rebuild to change either.

## Refresh cadence

All three surfaces (bundles, `.md` siblings, robots.txt) are regenerated
on every release deploy. They reflect the **current SDK major** only —
older majors are not bundled (see the
[Versioning & Compatibility](./guides/00-versioning.md) page for the
rationale).

The current SDK version is **15.0.1**, sourced from
`package.json#version` at build time.
