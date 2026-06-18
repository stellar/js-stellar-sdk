# Running Gesserit v2 on JS Stellar SDK

This directory contains the target-local setup that lets Gesserit v2 scan
`@stellar/stellar-sdk`. Gesserit v2 uses a static CodeQL frontier, so every run
needs a fresh `ai-summary/static-codeql.sqlite` cache in this JS SDK checkout
before the orchestrator starts.

## Repository Layout

You need two checkouts:

```text
/path/to/gesserit       # Gesserit v2 orchestrator repo
/path/to/JS-SDK         # This target repo
```

The target-local CodeQL pack lives here:

```text
projects/js-stellar-sdk/codeql/
```

The Gesserit-side project/objective config lives in the Gesserit repo:

```text
projects/js-stellar-sdk/
config.anthropic-opus48.json
```

## Prerequisites

- CodeQL CLI on `PATH`.
- Node and Yarn installed for this repo.
- Gesserit repo checked out on the v2 branch containing the `js-stellar-sdk`
  project config.
- Claude Code installed if using the `claude-code` backend.
- `ANTHROPIC_API_KEY` exported in the terminal that starts Gesserit.
- `gh` authenticated with an agent-safe GitHub token before publishing is
  enabled. Keep `--no-publish` on for normal dry runs and exploratory scans.

Install CodeQL on macOS with Homebrew if needed:

```sh
brew install codeql
```

## Build the Static Frontier Cache

Run this from the JS SDK repository root:

```sh
cd /path/to/JS-SDK
projects/js-stellar-sdk/codeql/build_static_cache.sh
```

Then check the cache is non-empty:

```sh
projects/js-stellar-sdk/codeql/harness/metrics.py summary ai-summary/static-codeql.sqlite
```

Expected shape: hundreds of routes across `contract`, `rpc`, `bindings`,
`horizon`, `webauth`, `http-client`, `stellartoml`, and `federation`. A zero-route
cache means the CodeQL extraction/query pack is broken and the scan should not
be started.

Optional determinism check:

```sh
cp ai-summary/static-codeql.sqlite /tmp/js-sdk-static-a.sqlite
projects/js-stellar-sdk/codeql/build_static_cache.sh
projects/js-stellar-sdk/codeql/harness/metrics.py determinism \
  /tmp/js-sdk-static-a.sqlite ai-summary/static-codeql.sqlite
```

## Verify Models

Run this from the Gesserit repository root:

```sh
cd /path/to/gesserit
export ANTHROPIC_API_KEY='your-key-here'

PYTHONPATH=src python3 -m gesserit \
  --project js-stellar-sdk \
  --objective security-scan \
  --repo-root /path/to/JS-SDK \
  --config config.anthropic-opus48.json \
  --ping
```

If ping fails with `Invalid API key`, replace the Anthropic key. If ping fails
with a workspace usage-limit error, raise or reset the Anthropic workspace API
limit before starting the scan.

## Dry Run

Dry run verifies Gesserit can read the project config and static cache without
spawning model agents:

```sh
PYTHONPATH=src python3 -m gesserit \
  --project js-stellar-sdk \
  --objective security-scan \
  --repo-root /path/to/JS-SDK \
  --config config.anthropic-opus48.json \
  --max-agents 2 \
  --no-publish \
  --dry-run
```

## Start the Scan

Recommended first real run:

```sh
PYTHONPATH=src python3 -m gesserit \
  --project js-stellar-sdk \
  --objective security-scan \
  --repo-root /path/to/JS-SDK \
  --config config.anthropic-opus48.json \
  --max-agents 2 \
  --no-publish \
  --session js-sdk-opus48-security-scan
```

`--max-agents 2` runs two agents concurrently. It is faster than `1`, but burns
tokens faster and can hit provider limits sooner. Do not remove `--no-publish`
until the team is ready for confirmed findings to be posted through `gh`.

## Generated Files

Do not commit scan runtime output:

```text
ai-summary/
sessions/
projects/js-stellar-sdk/codeql/out/
projects/js-stellar-sdk/codeql/db/
```

The reusable files that should stay checked in are the CodeQL pack, exporter,
metrics harness, and this runbook under `projects/js-stellar-sdk/`.