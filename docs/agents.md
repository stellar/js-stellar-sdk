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

## Intentionally not implemented

A few emerging agent-readiness conventions don't apply to a JavaScript SDK
documentation site and are deliberately not published here. This list is
explicit so an agent (or an automated audit tool) can distinguish
"deliberately absent" from "forgotten":

- **API Catalog ([RFC 9727](https://www.rfc-editor.org/rfc/rfc9727))** is
  for domains that host HTTP APIs. This site documents a JS library; the
  underlying Stellar network APIs (Horizon, Soroban RPC) are owned by the
  Stellar Development Foundation and live at
  [developers.stellar.org](https://developers.stellar.org).
- **MCP Server Card, WebMCP, and Agent Skills** are for sites that expose
  Model Context Protocol servers or agent-callable skills. We don't host
  either — the SDK is consumed via `npm install`.
- **OAuth discovery endpoints** ([RFC 8414](https://www.rfc-editor.org/rfc/rfc8414),
  [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728)) — no auth surface
  to advertise.
- **Agent Card / A2A** — no agent-to-agent protocol exposed.
- **Commerce protocols (x402, MPP, UCP, ACP)** — not a commerce site.

If the SDK ever ships an MCP server, agent skill bundle, or HTTP API of
its own, the relevant entries here would change.
