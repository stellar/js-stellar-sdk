# Releasing

How maintainers cut a release of `@stellar/stellar-sdk`. For which version
number to pick and which lines get which changes, see
[RELEASE_POLICY.md](RELEASE_POLICY.md).

## How publishing works

Publishing a GitHub release runs the
[`npm publish`](.github/workflows/npm_publish.yml) workflow. It checks out the
tag, runs `pnpm run preversion` (clean, format, build, unit, integration,
browser and guide tests) and runs `npm publish` with OIDC trusted publishing. No
npm token is needed. The e2e suite is not part of this gate, so check the E2E
workflow before you release.

A release event runs the workflow file **from the tagged commit**, so the
`npm publish` line on the branch you release from decides the npm dist-tag:

| Release                         | Branch       | Workflow publish line                      | npm dist-tag |
| :------------------------------ | :----------- | :----------------------------------------- | :----------- |
| Stable, Active line             | `main`       | `npm publish --access public --provenance` | `latest`     |
| Stable, Maintenance line        | `release/vN` | `... --tag lts`                            | `lts`        |
| Prerelease (`-rc.N`, `-beta.N`) | `main`       | `... --tag rc`                             | `rc`         |

Get this wrong and users get the wrong version from `npm install`. A 16.x or rc
build published without `--tag` becomes `latest`.

## Stable release from `main`

1. Check that `main` is green in the Tests and E2E workflows.
2. On a branch named `release/vX.Y.Z`, update [CHANGELOG.md](CHANGELOG.md):
   - Move the entries under `## Unreleased` into a new section below it, and
     leave `## Unreleased` empty.
   - Use the heading
     `## [vX.Y.Z](https://github.com/stellar/js-stellar-sdk/compare/vPREV...vX.Y.Z)`,
     where `vPREV` is the last stable release on this line.
   - After a series of prereleases, add one stable section that combines them on
     top, and compare from the last stable release (for example
     `v16.2.0...v17.0.0`). Keep the rc sections below it.
3. Set `"version"` in [package.json](package.json) to `X.Y.Z`.
4. Run `pnpm run preversion` to catch failures before the PR. The lockfile does
   not record the root version, so it does not change.
5. Open a PR titled `chore(release): prepare vX.Y.Z`. In the description, say
   why this is a patch, minor or major bump. For a minor, note any edge cases
   that could break strict consumers. Merge it.
6. Draft a release at <https://github.com/stellar/js-stellar-sdk/releases/new>:
   - Tag: `vX.Y.Z` (lowercase `v`), created on publish, target `main`.
   - Title: `vX.Y.Z`.
   - Notes: paste the new changelog section.
   - Check "Set as the latest release".
7. Publish the release, then watch the `npm publish` run in the Actions tab.
8. [Verify](#verify) the result.

For a new major, also update the support table in
[RELEASE_POLICY.md](RELEASE_POLICY.md): the new line is Active, the previous
line moves to Maintenance with its end date, and a `release/vN` branch is cut
for the previous line (see below).

## Prerelease from `main`

Same as a stable release, with these changes:

- Version is `X.Y.Z-rc.N` (or `-beta.N`). The changelog section compares from
  the previous rc, or from the last stable release for `rc.1`.
- In the release PR, change the publish line in
  [npm_publish.yml](.github/workflows/npm_publish.yml) to
  `npm publish --access public --provenance --tag "rc"`.
- In the GitHub release, check "Set as a pre-release" and leave "Set as the
  latest release" unchecked.
- After the publish succeeds, open a PR that removes `--tag "rc"` again. Until
  it merges, a stable release from `main` would publish under `rc`.

## Maintenance release from `release/vN`

The Maintenance line lives on `release/vN` (today: `release/v16`). Its workflow
already has `--tag lts`. Do not merge that change into `main`. A dist-tag cannot
be `vN` because npm rejects names that parse as a semver range.

1. Land the fix on `main` first when it applies there, then backport it with a
   PR into `release/vN`. Branch names like `backport/vN-<topic>` work. Never
   merge `release/vN` back into `main`.
2. The changelog lives on the `release/vN` branch. `main`'s changelog does not
   record maintenance releases after the line split.
3. Follow the stable steps, reading `release/vN` wherever they say `main`:
   - Step 1: check that `release/vN` is green.
   - Step 2: move the entries from `release/vN`'s `## Unreleased`, and compare
     from the last release on the N line.
   - Steps 5 and 6: use `release/vN` as the PR base and the release target.
   - Step 6: leave "Set as the latest release" **unchecked**.

When cutting a new `release/vN` branch at a major release, add `--tag lts` to
its `npm_publish.yml` in the first commit on that branch. `lts` always points at
the newest Maintenance line, so if an older line is still supported, change its
workflow to `--tag lts-N` at the same time. Otherwise its next release moves
`lts` back to the older line.

## If the publish fails

A re-run always builds the tagged commit, so it only helps when the cause is
outside the repo: a flaky test, or npm or OIDC configuration. Fix that, then
either "Re-run jobs" on the failed run, or run `npm publish` from the Actions
tab with "Run workflow" and pick the tag (`vX.Y.Z`) as the ref. Do not cut a new
tag or reuse a version number: npm never accepts the same version twice.

If the fix changes code, the tag must move to include it. Delete the GitHub
release and the tag, merge the fix, and release again with the same version, as
long as npm never got that version.

## Verify

```sh
npm view @stellar/stellar-sdk dist-tags
npm view @stellar/stellar-sdk@X.Y.Z dist.attestations --json   # provenance
```

`latest` must point to the newest stable Active release. If a dist-tag is wrong,
a maintainer with npm access can fix it:

```sh
npm dist-tag add @stellar/stellar-sdk@<right-version> latest
```

Docs deploy from `main` on every push, so a stable release from `main` needs no
extra docs step.
