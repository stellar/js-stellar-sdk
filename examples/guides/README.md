# Testable guide snippets

Every code example in `docs/guides/*.md` lives in exactly one place: a runnable
TypeScript file in `examples/guides/`. Guides contain only markers, except for
code blocks marked `untested` (see
[Intentionally unverified code](#intentionally-unverified-code)). The docs build
injects the code at build time, and the test suite typechecks and executes it.
If an SDK change breaks a guide example, CI fails.

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
     marker, malformed markers (typos, indented markers) are hard errors, every
     fenced code block in a guide is a marker or is marked `untested`, and
     snippets typecheck against `src/` with the same strictness as the SDK
     build. It also prints a tested/untested count for each guide.
   - **Local-network execution PR gate** `pnpm test:guides:local` (runs in
     `guides_pr.yml` on every PR against a stellar/quickstart service
     container): `test/guides/snippets.test.ts` auto-discovers every file in
     `examples/guides/` and executes each one in its own node process. Snippets
     keep their real testnet URLs and passphrase;
     `config/guides-snippet-preload.ts` redirects them to the local network at
     the transport layer, inside each snippet's process. To run locally, start
     quickstart first:
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
   // #region define-asset
   const astro = new Asset("ASTRO", issuer.publicKey());
   // #endregion define-asset
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
   <!-- snippet: issue-an-asset.ts#define-asset -->
   ```

   Do not put a code fence after the marker. `check-snippets` rejects it,
   because an inline copy would go stale silently.

3. **Verify**: `pnpm docs:snippets:check` for fast validation and typecheck,
   `pnpm test:guides:local` to execute against a local quickstart container (the
   day-to-day loop, a few seconds per run), `pnpm docs:snippets:show <doc>` to
   print one file's expanded markdown, and `pnpm docs:dev` to see the
   rendered guide. In dev, editing a snippet hot reloads the pages that embed
   it. No Docker? Run the check locally and let the `guides_pr.yml` workflow
   execute the snippets on your PR. There is no test wiring step:
   `test/guides/snippets.test.ts` auto-discovers every snippet file, so a
   snippet that typechecks but never runs cannot happen.

## Reviewing a snippet change

A marker hides the code from the diff, so a reviewer cannot see what the page
will render. Print one file's expanded markdown:

```sh
pnpm docs:snippets:show guides/03-issue-an-asset.md
```

Paths resolve from the repo root, either as typed or relative to `docs/`, so
the `docs/` prefix is optional. The output is what the build writes into
`.docs-build/`, byte for byte. To capture it, silence pnpm's banner — it goes
to stdout, ahead of the markdown:

```sh
pnpm --silent docs:snippets:show guides/03-issue-an-asset.md > rendered.md
```

## Intentionally unverified code

In `docs/guides/`, every fenced code block must be a marker. `check-snippets`
fails on a plain fenced block there. To keep a block that is not tested (a
"before" example, pseudocode, or a guide not yet converted), add the word
`untested` to its fence line, after the language:

````markdown
```ts untested
```
````

The first word is always the language, so ` ```untested ` does not count. The
site ignores the word after the language, but it stays in the raw `.md`
siblings and `llms-full.txt`. Prefer markers for anything a reader might copy.

Outside `docs/guides/`, plain fenced blocks are allowed: `docs/reference/` is
generated, `docs/migration/` shows old APIs on purpose, and `docs/index.md` is
synced from the root README. The marker rules still apply there.

## Gotchas

- Snippet file names are shared across guides in a flat directory. Keep them
  topic based and unique.
- Two blocks that redeclare the same variables cannot live in one module scope.
  A nested `{ }` block usually solves it (see the rebuild-keypair region in
  `connect-and-fund.ts`); a second snippet file is the last resort, only for
  genuinely incompatible alternative programs.
- Snippets that need contract infrastructure can deploy their own contract (from
  a checked-in wasm fixture in `wasm/`) in hidden setup, the same way the
  payment snippet funds its own accounts. The quickstart tier runs Soroban RPC,
  so this works on every PR. Upload the wasm with
  `Operation.uploadContractWasm`, and wait for the result. Then call
  `contract.Client.deploy`. It reads the wasm back from the network by its hash.
  From a snippet, read the fixture with
  `readFileSync(new URL("wasm/increment.wasm", import.meta.url))`.
  `test/guides/fixtures/deploy-increment.ts` shows the full pattern.
- Never reassign `globalThis.fetch` or mutate `Networks` inside a snippet. The
  local-network tier redirects transport by patching exactly those, before the
  snippet starts; a snippet that touches them can send itself to real testnet.
- A snippet must let its process exit. If a stream, timer or socket is still
  open 5 seconds after the snippet's last line, the run fails with "left open
  handles". Close streams in hidden teardown.
- A snippet's console output appears only when it fails: in the error when it
  exits non-zero, or as a stderr block when it times out.
- If the site sidebar ever loses its groups, check the `autogenerate`
  directories in `astro.config.mjs`. They must be prefixed `.docs-build/`,
  matching the collection root.

## Backlog

Deferred hardening from the design reviews, each with the trigger that makes it
due. Do the item when its trigger arrives, not before.

| Item                                                                                                                          | Trigger                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| One-time GitHub setup: add `guides-local` to the protect-main ruleset as a required check                                     | When this system first lands on the remote                                        |
| Fence metadata passthrough in markers (for `title=` and `del=`/`ins=` annotations)                                            | Before converting the before/after guides (contract-auth, protocol-27, migration) |
| Reviewer preview as a CI artifact of the expanded `.docs-build/guides/` output (the local command half is done: `pnpm docs:snippets:show`) | If reviewers find checking out the branch too slow                                |
| Sidebar canary: post-build assertion that the Guides and Reference groups render                                              | Any time; value grows with guide count                                            |
