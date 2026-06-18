# R961C1: CLI generate --contract-id trusts unanchored RPC contractData entry for codegen

**Date**: 2026-06-18
**Subsystem**: cli
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/cli/961-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Entry path: `runCli` -> `program.parse` (`src/cli/index.ts:182`) -> `generate`
action -> `createGenerator` (`src/cli/util.ts:61-128`) ->
`BindingGenerator.fromContractId` (`src/bindings/generator.ts:182-193`) ->
`fetchFromContractId` (`src/bindings/wasm_fetcher.ts:146-165`) ->
`fetchWasmFromContract` (`src/bindings/wasm_fetcher.ts:77-113`).

Source trace of `fetchWasmFromContract`:

- Line 84: `const response = await server.getLedgerEntries(contract.getFootprint())`.
  The footprint is sent in the *request*, but the *response* is not re-validated
  against it.
- Lines 89-92: the only check on the returned `entry` is
  `entry.key.switch() !== xdr.LedgerEntryType.contractData()` — an entry **type**
  check. The code never compares `entry.key.contractData().contract()` (the
  contract address embedded in the returned ledger key) to the requested
  `contractAddress`/footprint. A malicious or MITM RPC server may therefore
  return a `contractData` entry for any contract/value it chooses.
- Lines 94-102: `instance = contractData.val().instance()` and
  `wasmHash = instance.executable().wasmHash()` are read straight from that
  unauthenticated entry, then `getRemoteWasmFromHash(server, wasmHash)` fetches
  code for that attacker-supplied hash. On this path the user supplies **no**
  hash anchor — the `wasmHash` itself originates from the unverified response.
- `generator.ts:186-188`: the WASM bytes flow into `BindingGenerator.fromWasm`
  -> `specFromWasm` (`src/contract/wasm_spec_parser.ts`) so the attacker WASM's
  contract spec becomes the emitted client, written to disk by
  `generateAndWrite` (`src/cli/index.ts:155`).

Anti-evidence checked and rejected as blockers:

- `verifyNetwork` (`src/cli/util.ts:46-56`) compares only the network
  passphrase, which the same server returns; it cannot authenticate response
  contents.
- `StrKey.isValidContract` (`src/bindings/wasm_fetcher.ts:151`) validates the
  *format* of the user-supplied contract ID, not the authenticity of the
  response.

## Findings

A developer running `stellar-cli generate --contract-id C... --rpc-url <url>
--network <net>` against a malicious public RPC provider, or any RPC reachable
over a MITM channel (e.g. `--allow-http` or TLS stripping), receives TypeScript
bindings whose method names, argument types, and return types are chosen by the
attacker rather than by the genuine on-chain contract the developer named. When
the developer then builds an application against those bindings, calls can be
shaped to submit transactions with contract arguments different from what the
application intended. This matches the High impact category "Contract bindings
generated from attacker-controlled spec data ... misrepresent the contract
interface" and can cascade into "transaction submitted with different contract
arguments than the application intended."

Distinctness from the already-VIABLE content-hash finding (route
`js-sdk-f7107932d67c6535c2ca097a`, prior record [4]): that finding is the
absence of a sha256(code)-vs-requested-hash re-check inside
`getRemoteWasmFromHash`. On the `--contract-id` path the requested `hashBuffer`
is itself sourced from the unauthenticated `contractData` entry, so even with a
content-hash re-check applied, the attacker simply returns a `contractCode`
entry whose code hashes to the `wasmHash` it placed in the spoofed
`contractData` entry — the content-hash check passes and bindings remain
attacker-controlled. The missing guard here is the **entry-key-to-footprint
binding** in `fetchWasmFromContract`, an independent fix from the content-hash
re-check. The two guards are mutually non-closing, so this is a distinct typed
mechanism, not a duplicate.

## PoC Guidance

- **Test file**: `test/unit/spec/bindings_wasm_fetcher_test.ts` (or a new file
  under `test/unit/` near existing bindings tests).
- **Setup**: Construct a mock `RpcServer` whose `getNetwork` returns the
  expected passphrase and whose `getLedgerEntries` returns a `contractData`
  ledger entry whose embedded key contract address differs from the requested
  contract ID (or carries an executable `wasmHash` of the tester's choosing),
  plus a `contractCode` entry for that hash containing attacker WASM with a
  recognizable spec.
- **Steps**: Call `fetchFromContractId(requestedContractId, mockServer)` (or
  `BindingGenerator.fromContractId`).
- **Assertion**: Assert it resolves successfully and returns WASM/spec derived
  from the attacker entry even though the returned entry's key does not
  correspond to `requestedContractId` — demonstrating no footprint anchoring.
  Optionally assert the generated client exposes the attacker-chosen method
  names.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "cli"
route_id = "js-sdk-72f37f0d96b57c1b8c918538"
weakness = "remote_response_trust_confusion"
record_kind = "single_path"
path = ["program.parse", "createGenerator", "fetchFromContractId", "fetchWasmFromContract"]
sink = "fetchWasmFromContract"
sink_role = "remote_response_to_codegen"
impact_class = "binding_type_confusion"
route_family = "remote_response_trust"
material_effect = "bindings generated from attacker WASM not anchored to requested contract id"
target_functions = ["src/bindings/wasm_fetcher.ts:fetchWasmFromContract", "src/bindings/wasm_fetcher.ts:fetchFromContractId", "src/bindings/generator.ts:fromContractId"]
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
rules_out = ["source trace of fetchWasmFromContract (wasm_fetcher.ts:84-102) confirms the returned contractData entry is checked only by entry type (line 90) and is never anchored to the requested contract footprint, ruling out a hidden footprint-binding guard", "the already-VIABLE content-hash re-check on getRemoteWasmFromHash does not close this path because the wasmHash anchor itself is sourced from the unverified entry"]
does_not_rule_out = ["nearby variant via the executable-type discriminant (candidate C2) reaching the SAC_SPEC branch is a separate sink not covered by this WASM-branch record", "unbounded WASM response size resource exhaustion in specFromWasm remains unassessed"]
assumptions = ["RPC response is attacker-controlled under a malicious public RPC provider or MITM channel, consistent with the objective trust-boundary scope", "getLedgerEntries returns server-supplied entries without SDK-side cryptographic anchoring to the request footprint"]
mechanism_brief = "contract-id path trusts RPC contractData entry without anchoring entry key to requested footprint; attacker wasmHash and code -> bindings"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/wasm_fetcher.ts:fetchWasmFromContract"
guarantee = "only entry-type (line 90) and user contract-id string format (StrKey.isValidContract, line 151) are checked; entry-key-to-footprint binding is not"

[[blockers]]
kind = "not_found"
source = "src/bindings/wasm_fetcher.ts:fetchWasmFromContract"
guarantee = "no source-proven verification that the returned contractData entry or fetched WASM corresponds to the requested contract id"
```
