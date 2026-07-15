# Testable guide snippets

Every code example in `docs/guides/*.md` lives in exactly one place: a runnable
TypeScript file in `examples/guides/`. Guides never contain code, only markers.
The docs build injects the code at build time, and the test suite typechecks and
executes it. If an SDK change breaks a guide example, CI fails.

## How it works

1. A snippet file (for example `send-a-payment.ts`) is a real script that
   imports `@stellar/stellar-sdk` and runs top to bottom. `// #region name` and
   `// #endregion` comments mark the parts that appear in the guide. Everything
   outside a region (account funding, assertions) runs in tests but never
   appears in docs.
2. The guide references a region with an HTML comment marker, and nothing else:

   ```markdown
   <!-- snippet: send-a-payment.ts#build -->
   ```

3. At docs build time, `snippetsIntegration` (in `config/snippets.ts`,
   registered in `astro.config.mjs`) mirrors `docs/` into the gitignored
   `.docs-build/` directory with each marker replaced by a fenced code block.
   The site's content collection (`src/content.config.ts`) loads from
   `.docs-build/`, so Astro's cache invalidation covers snippet edits in both
   `astro dev` and builds. `scripts/build-llms.ts` (llms.txt) and
   `scripts/build-md-siblings.ts` (raw `.md` siblings) expand the same markers
   when they read `docs/`.
4. Three verification tiers, split by what they depend on:
   - **Hermetic PR gate** `pnpm docs:snippets:check` (runs in `pnpm test`,
     `pnpm docs`, and the tests and docs-build workflows on every PR): every
     marker resolves to a real file and region, no inline code block follows a
     marker, malformed markers (typos, indented markers) are hard errors, and
     snippets typecheck against `src/` with the same strictness as the SDK
     build.
   - **Local-network execution PR gate** `pnpm test:guides:local` (runs in
     `guides_pr.yml` on every PR against a stellar/quickstart service
     container): `test/guides/snippets.test.ts` auto-discovers every file in
     `examples/guides/` and executes it. Snippets keep their real testnet URLs
     and passphrase; `config/guides-local-setup.ts` redirects them to the local
     network at the transport layer. To run locally, start quickstart first:
     `docker run --rm -p 8000:8000 -e NETWORK=local -e ENABLE_SOROBAN_RPC=true stellar/quickstart:testing`
   - **Real-testnet execution** `pnpm test:guides` (run by `preversion` at
     release time, or manually): the same tests with no redirection. This tier
     catches drift a local network cannot: Horizon deployments, friendbot API
     changes, protocol upgrades. It is not a PR gate because testnet outages
     would fail PRs for reasons unrelated to the code. Since it only runs at
     release, bump `guides_pr.yml`'s quickstart image pin periodically so the
     local network tracks what testnet actually runs.

## Adding a guide with tested code

1. **Write the snippet file** in `examples/guides/`. Name it after the topic,
   not the guide's number (`issue-an-asset.ts`, not `03-issue-an-asset.ts`).
   Structure it as one script in the same order the guide tells the story. Wrap
   each displayed block in a region:

   ```ts
   // #region create-keypair
   const keypair = Keypair.random();
   // #endregion create-keypair
   ```

   Rules that make this work:
   - Import `@stellar/stellar-sdk` by its package name. The test and typecheck
     configs resolve it to `src/`, so examples read like user code but run
     against the current source.
   - Put setup the guide assumes (funded accounts, existing trustlines) before
     the first region, outside any region.
   - Add assertions outside regions so execution proves the flow worked, not
     just that it did not crash.
   - A region name can appear multiple times. The parts are joined with a blank
     line in the rendered block, or seamlessly when the next part continues an
     indented expression (a builder-chain fragment). Use this to show a fragment
     while the full chain still compiles.
   - Regions can overlap: a line belongs to every region open at that point.
     `#endregion` must be named (`// #endregion build`) whenever more than one
     region is open.
   - For a "Put it together" recap block, do not write a second program. Open a
     `full` region spanning the display-worthy code and let the step regions
     overlap inside it — the recap is then a view of the same lines, and nothing
     is duplicated. Lines only the steps show (bare annotation expressions) sit
     outside `full`; lines only the recap shows (`console.log`s) sit outside the
     step regions.
   - Prefer regions at module scope. A region carved from inside a block (a
     try/catch body, a function) renders dedented to the left margin. A region
     mixing column-0 lines with indented ones keeps its indentation as authored.
   - The file must be a valid ES module. Top level await is fine.

2. **Write the guide** in `docs/guides/`. Where each example goes, put a marker
   instead of a code block:

   ```markdown
   <!-- snippet: issue-an-asset.ts#create-keypair -->
   ```

   Do not put a code fence after the marker. `check-snippets` rejects it,
   because an inline copy would go stale silently.

3. **Verify**: `pnpm docs:snippets:check` for fast validation and typecheck,
   `pnpm test:guides:local` to execute against a local quickstart container (the
   day-to-day loop, a few seconds per run), and `pnpm docs:dev` to see the
   rendered guide. In dev, editing a snippet hot reloads the pages that embed
   it. No Docker? Run the check locally and let the `guides_pr.yml` workflow
   execute the snippets on your PR. There is no test wiring step:
   `test/guides/snippets.test.ts` auto-discovers every snippet file, so a
   snippet that typechecks but never runs cannot happen.

## Intentionally unverified code

Code that must not compile or run (the migration guide's before examples,
pseudocode) stays as a plain fenced block with no marker. Only marked blocks are
tested. Prefer markers for anything a reader might copy.

## Gotchas

- Snippet file names are shared across guides in a flat directory. Keep them
  topic based and unique.
- Two blocks that redeclare the same variables cannot live in one module scope.
  A nested `{ }` block usually solves it (see the rebuild-keypair region in
  `connect-and-fund.ts`); a second snippet file is the last resort, only for
  genuinely incompatible alternative programs.
- Snippets that need contract infrastructure can deploy their own contract (from
  a checked-in wasm fixture) in hidden setup, the same way the payment snippet
  funds its own accounts. The quickstart tier runs Soroban RPC, so this works on
  every PR.
- Never reassign `globalThis.fetch` or mutate `Networks` inside a snippet. The
  local-network tier redirects transport by patching exactly those, and all
  snippets share one process; a snippet that touches them breaks every snippet
  after it.
- If the site sidebar ever loses its groups, check the `autogenerate`
  directories in `astro.config.mjs`. They must be prefixed `.docs-build/`,
  matching the collection root.

## Backlog

Deferred hardening from the design reviews, each with the trigger that makes it
due. Do the item when its trigger arrives, not before.

| Item                                                                                                                          | Trigger                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| One-time GitHub setup: add `guides-local` to the protect-main ruleset as a required check                                     | When this system first lands on the remote                                        |
| Untested-fence opt-out annotation plus a tested/untested count in `check-snippets` (makes silent partial conversions visible) | Before the first partial guide conversion (invoke-a-contract is the likely first) |
| Fence metadata passthrough in markers (for `title=` and `del=`/`ins=` annotations)                                            | Before converting the before/after guides (contract-auth, protocol-27, migration) |
| Checked-in wasm fixture plus deploy-in-hidden-setup pattern                                                                   | Before converting invoke-a-contract or contract-auth                              |
| Child-process snippet execution (isolates shared-process state; dynamic import caches failures, so vitest retry is a no-op)   | Before converting the streaming or error-handling guides                          |
| Reviewer preview: a command that prints a guide's expanded markdown, or a CI artifact of the `.docs-build/` diff              | Strongly recommended before conversions start                                     |
| Sidebar canary: post-build assertion that the Guides and Reference groups render                                              | Any time; value grows with guide count                                            |
