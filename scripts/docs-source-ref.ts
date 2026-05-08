// Branch / tag / commit ref embedded into rendered source links and
// the `Generated:` field of LLM bundles. Local builds, PR-check builds,
// and any normal `pnpm docs:reference` / `pnpm docs:llms` invocation
// use the default below — kept evergreen so regeneration produces no
// diff churn (the same ref gets baked in every time, regardless of
// HEAD). Release deploys override via the `DOCS_SOURCE_REF` env var
// (set to the release tag, e.g. `v15.0.1`) so the deployed snapshot
// links to the exact source at release time.
//
// Update `DEFAULT_DOCS_REF` here when the trunk branch is renamed
// (e.g. `master` → `main`). Do not hardcode the branch name in
// scripts/build-docs.ts or scripts/build-llms.ts.
export const DEFAULT_DOCS_REF = "master";

export const DOCS_SOURCE_REF = process.env.DOCS_SOURCE_REF ?? DEFAULT_DOCS_REF;
