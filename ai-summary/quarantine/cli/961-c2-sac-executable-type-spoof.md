# R961C2: CLI generate trusts RPC executable-type discriminant to choose SAC_SPEC vs WASM spec

**Date**: 2026-06-18
**Subsystem**: cli
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/cli/961-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Same entry dispatch as C1: `program.parse` (`src/cli/index.ts:182`) ->
`createGenerator` (`src/cli/util.ts:114-128`) -> `BindingGenerator.fromContractId`
(`src/bindings/generator.ts:182-193`) -> `fetchFromContractId` ->
`fetchWasmFromContract` (`src/bindings/wasm_fetcher.ts:77-113`).

Decision-point trace:

- `src/bindings/wasm_fetcher.ts:66-72`: `isStellarAssetContract(instance)`
  returns `true` solely from
  `instance.executable().switch() === xdr.ContractExecutableType.contractExecutableStellarAsset()`.
  The executable discriminant is a field of the `instance` taken from the
  unauthenticated RPC `contractData` entry (lines 94-95).
- `src/bindings/wasm_fetcher.ts:97-99`: when the discriminant says SAC, the
  function returns `{ type: "stellar-asset-contract" }` **without ever calling
  `getRemoteWasmFromHash`** — the WASM-fetch path (and any content-hash re-check
  on it) is bypassed entirely.
- `src/bindings/generator.ts:187-192`: `fromContractId` branches on
  `result.type`. The SAC result routes to `new Spec(SAC_SPEC)` (the trusted
  local spec), discarding the contract's real interface; the non-SAC result
  feeds attacker WASM to `fromWasm`. The same untrusted discriminant therefore
  selects which of two divergent specs is emitted.

Anti-evidence checked and rejected as blockers (same as C1): `verifyNetwork`
(`src/cli/util.ts:46-56`) is passphrase-only; `StrKey.isValidContract`
(`wasm_fetcher.ts:151`) validates only the user contract-id format. Neither
authenticates the executable discriminant against on-chain state.

## Findings

A malicious/MITM RPC server can mark a real custom WASM contract as a Stellar
Asset Contract: the SDK then emits the standard `SAC_SPEC` and silently discards
the contract's true interface, so the developer's generated client exposes the
SAC token interface for a contract that is not a token. Conversely the server
can mark a genuine SAC as WASM and substitute an arbitrary spec. Either way the
emitted bindings misrepresent the requested contract — High under "Contract
bindings ... misrepresent the contract interface."

Distinctness from C1 and from the content-hash finding: C1's typed mechanism is
confined to the WASM branch (attacker `wasmHash`/code -> arbitrary WASM spec).
The SAC-spoof direction of C2 reaches an outcome C1's mechanism cannot — it
emits the **trusted local `SAC_SPEC`** and never enters `getRemoteWasmFromHash`
at all, so neither C1's WASM-substitution nor the already-VIABLE content-hash
re-check (route `js-sdk-f7107932d67c6535c2ca097a`) describes or closes it. The
decision point is a distinct sink (`isStellarAssetContract`, lines 66-72) from
C1's `wasmHash`/code read (lines 101-102). C2 and C1 do share the same root
precondition — an unauthenticated `contractData` entry — so a single
footprint-anchoring guard in `fetchWasmFromContract` would close both; that
shared remediation is recorded in `does_not_rule_out` and does not make C2 a
typed subsumption of C1, since the SAC-branch outcome is not reachable through
C1.

## PoC Guidance

- **Test file**: `test/unit/spec/bindings_wasm_fetcher_test.ts` (or a new file
  near existing bindings tests).
- **Setup**: Mock `RpcServer.getNetwork` to return the expected passphrase and
  `getLedgerEntries` to return a `contractData` entry whose `instance`
  executable switch is `contractExecutableStellarAsset()` while the requested
  contract id corresponds to a real custom WASM contract (and a converse case:
  a WASM executable for a contract the test treats as a SAC).
- **Steps**: Call `BindingGenerator.fromContractId(requestedId, mockServer)`
  then `generate({ contractName })`.
- **Assertion**: For the SAC-spoof case assert the generator returns the
  SAC_SPEC-based client (token interface) for a non-token contract id; for the
  converse assert it emits the attacker WASM spec. Demonstrates the SAC/WASM
  selection is driven by the untrusted discriminant.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "cli"
route_id = "js-sdk-72f37f0d96b57c1b8c918538"
weakness = "remote_response_trust_confusion"
record_kind = "single_path"
path = ["program.parse", "createGenerator", "fetchWasmFromContract", "isStellarAssetContract"]
sink = "isStellarAssetContract"
sink_role = "remote_response_to_codegen"
impact_class = "binding_type_confusion"
route_family = "remote_response_trust"
material_effect = "attacker executable-type discriminant chooses SAC_SPEC vs arbitrary WASM spec for requested contract id"
target_functions = ["src/bindings/wasm_fetcher.ts:isStellarAssetContract", "src/bindings/wasm_fetcher.ts:fetchWasmFromContract", "src/bindings/generator.ts:fromContractId"]
scope.trust_boundary = "remote_rpc_response"
scope.protocol_phase = "cli_command_dispatch"
scope.auth_state = "local_user"
scope.attacker_control = "malicious_or_mitm_rpc_server"
scope.parser_state = "argv_parsed"
scope.size_class = "bounded_by_local_files_and_args"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace of isStellarAssetContract (wasm_fetcher.ts:66-72) confirms the SAC/WASM verdict is read from instance.executable().switch() of the unauthenticated entry with no on-chain anchoring, ruling out a hidden guard on the discriminant", "the SAC branch returns at lines 97-99 before getRemoteWasmFromHash, ruling out the content-hash re-check (route js-sdk-f7107932d67c6535c2ca097a) as a closing guard for this branch"]
does_not_rule_out = ["the WASM-branch substitution path (candidate C1) is a separate sink with its own record", "a single entry-key-to-footprint anchoring guard in fetchWasmFromContract would remediate both C1 and C2; that shared fix is not yet present in source"]
assumptions = ["RPC response is attacker-controlled under a malicious public RPC provider or MITM channel, consistent with the objective trust-boundary scope", "SAC_SPEC is the standard token interface and is materially divergent from a real custom contract's interface"]
mechanism_brief = "SAC-vs-WASM chosen from attacker executable discriminant in unauthenticated entry; SAC branch emits trusted SAC_SPEC bypassing wasm fetch, WASM branch emits arbitrary spec"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/wasm_fetcher.ts:isStellarAssetContract"
guarantee = "executable discriminant is read (lines 66-72) but never authenticated against on-chain state for the requested contract id"

[[blockers]]
kind = "not_found"
source = "src/bindings/wasm_fetcher.ts:fetchWasmFromContract"
guarantee = "no source-proven binding of the returned executable type to the requested contract id"
```
