# R907: WASM fetched by hash is never verified against the requested hash

**Date**: 2026-06-18
**Subsystem**: cli
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/cli/907-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The wasm-hash binding flow is reachable from CLI dispatch and drops the
content-integrity guarantee implied by a content-addressed fetch:

- `src/cli/util.ts:61-128` `createGenerator` forwards attacker-controllable
  `--rpc-url` and `--wasm-hash` into `BindingGenerator.fromWasmHash`
  (util.ts:104). `verifyNetwork` (util.ts:46-56) only compares the passphrase
  returned by the same untrusted server, so it provides no WASM-integrity
  protection.
- `src/bindings/generator.ts:151-160` `fromWasmHash` calls `fetchFromWasmHash`
  and pipes the returned bytes straight into `fromWasm` →
  `specFromWasm` → generated client/types files written to `--output-dir`.
- `src/bindings/wasm_fetcher.ts:118-141` `fetchFromWasmHash` validates only that
  `wasmHash` decodes to 32 bytes (line 125); it never verifies the bytes
  returned by `getRemoteWasmFromHash` against `hashBuffer`.
- `src/bindings/wasm_fetcher.ts:29-61` `getRemoteWasmFromHash` builds a ledger
  key from `hashBuffer` (35-39), fetches entries (42), checks only that entries
  exist (44) and that `entry.key.switch() === contractCode` (49), then returns
  `Buffer.from(contractCode.code())` (53-54). There is no `sha256(code)`
  recomputation or comparison to the requested hash anywhere on this path. The
  entire response — including the key it checks at line 49 — is supplied by the
  RPC server, so the check is trivially satisfiable by a hostile endpoint.

The contract-id flow (`fetchWasmFromContract`, wasm_fetcher.ts:77-113) reads the
instance `wasmHash` from the same untrusted response (line 101) and then fetches
via the identical unverified `getRemoteWasmFromHash`, so it shares the gap.

A Stellar `contractCode` ledger entry is content-addressed: the requested hash
is the `sha256` of the installed WASM. The SDK holds both the requested hash and
the returned bytes and could verify the match, but does not. This matches the
candidate's "Expected Behavior": the wasm-hash flow advertises hash-based
integrity ("you know the hash"), and that promise should be enforced
client-side. The actual behavior deviates — bytes are trusted verbatim.

## Findings

A developer running `stellar contract bindings --wasm-hash <known-good-hash>
--rpc-url <untrusted-or-MITM-RPC>` (or `--contract-id`, optionally with
`--allow-http` enabling transport tampering) receives bindings generated from
attacker-substituted WASM. The attacker returns a benign-looking but
attacker-authored binary whose `contractspecv0` section describes a
semantically valid but wrong interface (renamed methods, altered argument or
return types). The consuming application then builds and signs transactions
against that wrong interface, which can drive malformed or misdirected contract
calls.

Per the impact taxonomy this is the "contract bindings generated from
attacker-controlled spec data … misrepresent the contract interface" category,
severity floor High. The threat model treats `--rpc-url` and network options as
attacker-controlled, and the wasm-hash API contract — not documented caller
responsibility — is what implies the integrity guarantee, so this is an
SDK-level defect rather than documented caller responsibility. This does not
rely on the previously NOT_VIABLE code-injection vector
(`js-sdk-764db1ecd1a0b26cd4288e42`); a valid-but-wrong interface is sufficient.

## PoC Guidance

- **Test file**: add a focused Vitest under `test/unit` near existing
  bindings/wasm_fetcher coverage.
- **Setup**: build a real WASM-A with a known `contractspecv0` and compute its
  `sha256` (hash H). Build a different WASM-B with a divergent spec. Construct a
  mocked `RpcServer` whose `getNetwork()` returns the expected passphrase and
  whose `getLedgerEntries()` returns a `contractCode` entry whose `code()` is
  WASM-B regardless of the requested hash key.
- **Steps**: call `BindingGenerator.fromWasmHash(H_hex, mockServer)` (or
  `fetchFromWasmHash`) and generate bindings.
- **Assertion**: assert the generated interface reflects WASM-B's spec even
  though hash H was requested — demonstrating no hash verification. A fixed SDK
  would instead throw a hash-mismatch error before parsing.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "cli"
route_id = "js-sdk-f7107932d67c6535c2ca097a"
weakness = "Contract interface integrity from untrusted WASM"
record_kind = "single_path"
path = ["<anonymous>", "Binding ... romWasm"]
sink = "Binding ... romWasm"
sink_role = "contract_wasm_parse"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "contract_wasm_parse"
target_functions = ["src/bindings/wasm_fetcher.ts:getRemoteWasmFromHash", "src/bindings/wasm_fetcher.ts:fetchFromWasmHash", "src/bindings/wasm_fetcher.ts:fetchWasmFromContract", "src/bindings/generator.ts:fromWasmHash"]
scope.trust_boundary = "local_cli_user"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "arguments_paths_and_network_options"
scope.parser_state = "argv_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace of getRemoteWasmFromHash (wasm_fetcher.ts:29-61) and fetchFromWasmHash (118-141) confirms no sha256-vs-requested-hash check exists, ruling out a hidden content-hash guard that would block the candidate", "prior NOT_VIABLE records are on the JSON.parse route (js-sdk-0ffaa2a664052d27f227e6ff) and code-injection route (js-sdk-764db1ecd1a0b26cd4288e42), neither of which covers this wasm-fetch integrity gap"]
does_not_rule_out = ["nearby variants outside this exact reviewed path remain unassessed: O(N^2) repeated same-named custom-section concat in parseWasmCustomSections", "divergence when multiple contractspecv0 sections present and only xdrSections[0] is used"]
assumptions = ["--rpc-url and network options are attacker-influenceable per the CLI threat model", "a Stellar contractCode ledger entry is content-addressed by sha256 of the WASM, so client-side verification is feasible from data the SDK already holds"]
mechanism_brief = "getRemoteWasmFromHash returns RPC-supplied contractCode.code() bytes without verifying sha256 against the requested wasm hash, so a hostile/MITM RPC substitutes WASM and the generated bindings misrepresent the contract interface."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/wasm_fetcher.ts:fetchFromWasmHash"
guarantee = "fetchFromWasmHash validates only hash length (32 bytes) and getRemoteWasmFromHash checks only entry key type; neither verifies the returned code bytes against the requested hash"

[[blockers]]
kind = "not_found"
source = "src/bindings/wasm_fetcher.ts:getRemoteWasmFromHash"
guarantee = "no source-proven content-hash verification of fetched WASM exists on the wasm-hash or contract-id fetch path"
```
