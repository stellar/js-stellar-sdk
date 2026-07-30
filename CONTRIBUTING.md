# Contributing

## How to contribute

Please read the
[Contribution Guide](https://github.com/stellar/docs/blob/main/CONTRIBUTING.md).

## Releasing

Releases publish to npm via the
[`npm publish`](.github/workflows/npm_publish.yml) GitHub Actions workflow,
which fires on `release.published`. The workflow runs `pnpm run preversion`
(clean, format, build, test) and publishes with OIDC trusted publishing — no
manual npm token needed.

To cut a release:

1. **Update [CHANGELOG.md](CHANGELOG.md):** move entries under `## Unreleased`
   into a new versioned section. Heading format:
   `## [vX.Y.Z](https://github.com/stellar/js-stellar-sdk/compare/v<previous>...v<new>)`.
2. **Bump `"version"` in [package.json](package.json)** per
   [semver](https://semver.org/): patch for fixes, minor for additions, major
   for breaking changes.
3. **Run `pnpm install`** so [pnpm-lock.yaml](pnpm-lock.yaml) picks up the new
   version.
4. **Open a release PR** with the changelog and version bump.
5. **After it merges,** draft a GitHub release at
   <https://github.com/stellar/js-stellar-sdk/releases/new> with tag `vX.Y.Z`
   targeting `main`. Paste the new changelog section into the release notes.
   Publishing the release triggers
   [`npm_publish.yml`](.github/workflows/npm_publish.yml).

If the publish workflow fails, fix the issue and re-run via `workflow_dispatch`
from the Actions tab — no need to cut a new tag.

## Documentation

The docs system has four parts:

1. **TSDoc comments in `src/`** — the source of truth for API reference. Edited
   inline alongside code.
2. **Markdown guides in `docs/guides/`** — task-oriented prose, hand-written.
   Guides contain no code blocks for tested examples; they reference snippets
   with `<!-- snippet: file.ts#region -->` markers.
3. **Guide snippets in `examples/guides/`** — runnable TypeScript scripts that
   are the single source for every code block in the guides. They are
   typechecked against `src/` and executed in CI, so an SDK change that breaks a
   documented example fails the build. See `examples/guides/README.md` for the
   authoring workflow.
4. **Generated reference and LLM bundles** — produced by build scripts; never
   edited by hand.

Authored and generated content are strictly separated: every file is either
fully authored or fully generated. They never mix. (Guide sources stay fully
authored; the code-injected copies exist only in build output — the gitignored
`.docs-build/` mirror, the LLM bundles, and the published site.)

### Renderer portability

The generated markdown under `docs/` targets no specific docs platform.
Starlight is the current renderer (chosen for its content collection, sidebar
autogeneration, and search), but the same `docs/` files should render under
Mintlify, Docusaurus, GitBook, Hugo, Jekyll, or any plain-markdown viewer
(including raw GitHub view) without modification. That portability is a hard
rule — when authoring TSDoc comments, guide markdown, or extending the build
pipeline, do not introduce platform-specific syntax in the generated output:

- No MDX components (`<Tabs>`, `<Card>`, `<TabItem>`, etc.).
- No Starlight-specific directives or admonitions (`:::note`, `:::tip`,
  `:::caution`).
- Frontmatter limited to the universal `title` / `description` convention. Avoid
  platform-private fields.
- Cross-references between pages emitted as relative markdown links
  (`./other-bucket.md#anchor`), never absolute URLs that bake in any one
  platform's routing.

Renderer-specific configuration belongs in `astro.config.mjs` and
`src/content.config.ts`, not in the markdown.

Snippet markers keep this portability: they are inert HTML comments in any
renderer, and every emitted artifact (the site, the `.md` siblings, the LLM
bundles) carries the injected code, not the marker. The only surface that shows
markers instead of code is the raw `docs/guides/` source itself; the code lives
one hop away in `examples/guides/`.

### Layout

- `src/**/*.ts` — TSDoc comments here drive the API reference.
- `docs/guides/*.md` — task-oriented guides (authored; code via snippet
  markers).
- `examples/guides/*.ts` — tested guide snippets (authored; single source for
  guide code blocks).
- `.docs-build/` — snippet-expanded mirror of `docs/` that the site builds from
  (generated; gitignored; do not edit).
- `docs/reference/*.md` — API reference (generated; do not edit).
- `public/llms.txt`, `public/llms-full.txt` — LLM-targeted bundles generated for
  the website; ignored by git.
- `docs/index.md`, `docs/agents.md` — landing pages (authored).

### Frontmatter

Every authored guide markdown file starts with Starlight frontmatter:

```yaml
---
title: <page title>
description: <one-line summary>
---
```

Reference files under `docs/reference/` carry generator-emitted frontmatter.
Don't add new TSDoc tags to influence frontmatter — the generator handles it.

### Build commands

| Command                    | Purpose                                             |
| -------------------------- | --------------------------------------------------- |
| `pnpm docs:snippets:check` | Validate snippet markers, typecheck guide snippets. |
| `pnpm docs:reference`      | Regenerate API reference markdown from TSDoc.       |
| `pnpm docs:llms`           | Regenerate site-root `llms.txt` bundles.            |
| `pnpm docs:site`           | Build the static Starlight site to `dist/site/`.    |
| `pnpm docs`                | Run all of the above in order.                      |

### Local preview

- `pnpm docs:dev` — Astro dev server with hot-module reload. Use while authoring
  guides; changes appear live.
- `pnpm docs:preview` — production-mode preview (run after `pnpm docs:site`).
  Use for visual and responsive checks before merging or releasing.

### Adding a new exported symbol

1. Add or update the TSDoc comment in `src/`.
2. Tag the export with `@category` so it appears in the right reference section.
3. Run `pnpm docs:reference`.
4. Commit the regenerated files in `docs/reference/` alongside the source
   change.

### Adding a new guide

1. Create `docs/guides/<slug>.md` with the frontmatter shown above.
2. Put code examples in a tested snippet file, not inline — follow
   [examples/guides/README.md](examples/guides/README.md).
3. The sidebar picks up the new file automatically — no config change needed.

### Images

- Astro's `<Image>` component for raster images. It emits WebP/AVIF and a
  responsive `srcset` automatically.
- Inline SVG for vector diagrams.
- Avoid unbounded raw `<img>` tags.

### `llms.txt` and `llms-full.txt`

- `llms.txt` is the LLM sitemap: project H1, blockquote tagline, version
  metadata, and per-area `## Guides` / `## Reference` / `## Other` sections with
  link lists to every published doc page.
- `llms-full.txt` concatenates the full content of every doc page into one
  bundle for AI-agent ingestion.

Both are produced by `pnpm docs:llms` from the contents of `docs/`. They are
written to `public/` for Astro to publish at the site root and are not committed
to the repo. Never edit them by hand.

### CI rule

Pull requests fail if the committed generated docs are stale. Before pushing:

```sh
pnpm docs:reference
pnpm docs:llms
git diff docs/index.md docs/reference/   # should be empty
```

If that diff shows changes, commit them. The LLM bundles are regenerated during
the website build and should not be committed.

### Source-link ref

Per-symbol "Source:" links in the generated reference and the `Source ref:`
field in `llms.txt` are pinned to a configurable ref so local builds, PR-check
builds, and release deploys can each produce the right URLs without churning
each other:

- **Default**: trunk branch (`main`). Set in
  [scripts/docs-source-ref.ts](scripts/docs-source-ref.ts) — update there if the
  trunk branch is renamed.
- **Override** via the `DOCS_SOURCE_REF` env var. Release deploys set it to the
  release tag (e.g. `v15.0.1`) so the deployed snapshot links to the exact
  release source. Locally: `DOCS_SOURCE_REF=v15.0.1 pnpm docs:reference`.

Because the default is evergreen, repeated `pnpm docs:reference` runs are
byte-idempotent — no per-commit SHA churn in `docs/`.
