# Contributing

## How to contribute

Please read the [Contribution Guide](https://github.com/stellar/docs/blob/master/CONTRIBUTING.md).

## Releasing

Releases publish to npm via the [`npm publish`](.github/workflows/npm_publish.yml)
GitHub Actions workflow, which fires on `release.published`. The
workflow runs `pnpm run preversion` (clean, format, build, test) and
publishes with OIDC trusted publishing — no manual npm token needed.

To cut a release:

1. **Update [CHANGELOG.md](CHANGELOG.md):** move entries under
   `## Unreleased` into a new versioned section. Heading format:
   `## [vX.Y.Z](https://github.com/stellar/js-stellar-sdk/compare/v<previous>...v<new>)`.
2. **Bump `"version"` in [package.json](package.json)** per
   [semver](https://semver.org/): patch for fixes, minor for additions,
   major for breaking changes.
3. **Run `pnpm install`** so [pnpm-lock.yaml](pnpm-lock.yaml) picks up
   the new version.
4. **Open a release PR** with the changelog and version bump.
5. **After it merges,** draft a GitHub release at
   <https://github.com/stellar/js-stellar-sdk/releases/new> with tag
   `vX.Y.Z` targeting `master`. Paste the new changelog section into
   the release notes. Publishing the release triggers
   [`npm_publish.yml`](.github/workflows/npm_publish.yml).

If the publish workflow fails, fix the issue and re-run via
`workflow_dispatch` from the Actions tab — no need to cut a new tag.

## Documentation

The docs system has three parts:

1. **TSDoc comments in `src/`** — the source of truth for API
   reference. Edited inline alongside code.
2. **Markdown guides in `docs/guides/`** — task-oriented prose,
   hand-written.
3. **Generated reference and LLM bundles** — produced by build
   scripts; never edited by hand.

Authored and generated content are strictly separated: every file
is either fully authored or fully generated. They never mix.

### Renderer portability

The generated markdown under `docs/` targets no specific docs platform.
Starlight is the current renderer (chosen for its content collection,
sidebar autogeneration, and search), but the same `docs/` files should
render under Mintlify, Docusaurus, GitBook, Hugo, Jekyll, or any
plain-markdown viewer (including raw GitHub view) without modification.
That portability is a hard rule — when authoring TSDoc comments, guide
markdown, or extending the build pipeline, do not introduce
platform-specific syntax in the generated output:

- No MDX components (`<Tabs>`, `<Card>`, `<TabItem>`, etc.).
- No Starlight-specific directives or admonitions (`:::note`, `:::tip`,
  `:::caution`).
- Frontmatter limited to the universal `title` / `description`
  convention. Avoid platform-private fields.
- Cross-references between pages emitted as relative markdown links
  (`./other-bucket.md#anchor`), never absolute URLs that bake in any
  one platform's routing.

Renderer-specific configuration belongs in `astro.config.mjs` and
`src/content.config.ts`, not in the markdown.

### Layout

- `src/**/*.ts` — TSDoc comments here drive the API reference.
- `docs/guides/*.md` — task-oriented guides (authored).
- `docs/reference/*.md` — API reference (generated; do not edit).
- `docs/llms.txt`, `docs/llms-full.txt` — LLM-targeted bundles
  (generated; do not edit).
- `docs/index.md`, `docs/agents.md` — landing pages (authored).

### Frontmatter

Every authored guide markdown file starts with Starlight
frontmatter:

```yaml
---
title: <page title>
description: <one-line summary>
---
```

Reference files under `docs/reference/` carry generator-emitted
frontmatter. Don't add new TSDoc tags to influence frontmatter —
the generator handles it.

### Build commands

| Command               | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `pnpm docs:reference` | Regenerate API reference markdown from TSDoc.    |
| `pnpm docs:llms`      | Regenerate `llms.txt` and `llms-full.txt`.       |
| `pnpm docs:site`      | Build the static Starlight site to `dist/site/`. |
| `pnpm docs`           | Run all three in order.                          |

### Local preview

- `pnpm docs:dev` — Astro dev server with hot-module reload.
  Use while authoring guides; changes appear live.
- `pnpm docs:preview` — production-mode preview (run after
  `pnpm docs:site`). Use for visual and responsive checks before
  merging or releasing.

### Adding a new exported symbol

1. Add or update the TSDoc comment in `src/`.
2. Tag the export with `@category` so it appears in the right
   reference section.
3. Run `pnpm docs:reference`.
4. Commit the regenerated files in `docs/reference/` alongside
   the source change.

### Adding a new guide

1. Create `docs/guides/<slug>.md` with the frontmatter shown
   above.
2. The sidebar picks up the new file automatically — no config
   change needed.

### Images

- Astro's `<Image>` component for raster images. It emits
  WebP/AVIF and a responsive `srcset` automatically.
- Inline SVG for vector diagrams.
- Avoid unbounded raw `<img>` tags.

### `llms.txt` and `llms-full.txt`

- `llms.txt` is the LLM sitemap: project H1, blockquote tagline,
  version metadata, and per-area `## Guides` / `## Reference` /
  `## Other` sections with link lists to every published doc page.
- `llms-full.txt` concatenates the full content of every doc page
  into one bundle for AI-agent ingestion.

Both are produced by `pnpm docs:llms` from the contents of `docs/`.
Never edit them by hand.

### CI rule

Pull requests fail if the generated reference docs or LLM bundles
are stale. Before pushing:

```sh
pnpm docs:reference
pnpm docs:llms
git diff docs/   # should be empty
```

If `git diff docs/` shows changes, commit them.

### Source-link ref

Per-symbol "Source:" links in the generated reference and the
`Source ref:` field in `llms.txt` are pinned to a configurable
ref so local builds, PR-check builds, and release deploys can
each produce the right URLs without churning each other:

- **Default**: trunk branch (`master`). Set in
  [scripts/docs-source-ref.ts](scripts/docs-source-ref.ts) — update
  there if the trunk branch is renamed.
- **Override** via the `DOCS_SOURCE_REF` env var. Release deploys
  set it to the release tag (e.g. `v15.0.1`) so the deployed
  snapshot links to the exact release source. Locally:
  `DOCS_SOURCE_REF=v15.0.1 pnpm docs:reference`.

Because the default is evergreen, repeated `pnpm docs:reference`
or `pnpm docs:llms` runs are byte-idempotent — no per-commit SHA
churn in `docs/`.
