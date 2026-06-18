# JS SDK CodeQL Static Frontier

This directory is the target-local CodeQL substrate for Gesserit v2. The Gesserit
runtime reads only `ai-summary/static-codeql.sqlite`; the CodeQL database,
decoded CSVs, and query outputs are offline build inputs.

Build the cache from the JS SDK repository root:

```sh
projects/js-stellar-sdk/codeql/build_static_cache.sh
```

Requirements:
- CodeQL CLI on `PATH`.
- Node/Yarn dependencies already installed. The JavaScript extractor uses
  `--build-mode=none`, so it does not run the package build.

Useful checks after building:

```sh
projects/js-stellar-sdk/codeql/harness/metrics.py summary ai-summary/static-codeql.sqlite
projects/js-stellar-sdk/codeql/build_static_cache.sh
cp ai-summary/static-codeql.sqlite /tmp/js-sdk-a.sqlite
projects/js-stellar-sdk/codeql/build_static_cache.sh
projects/js-stellar-sdk/codeql/harness/metrics.py determinism /tmp/js-sdk-a.sqlite ai-summary/static-codeql.sqlite
```

The pack intentionally focuses on first-party production TypeScript under `src/`
and excludes tests, generated `lib/`, bundles, `node_modules`, docs, coverage,
and previous scan artifacts.