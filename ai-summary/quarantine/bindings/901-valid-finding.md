# R901: Missing sha256 integrity check on WASM fetched by hash in binding generation

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/901-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full fetch-by-hash data flow in current source:

- `src/bindings/wasm_fetcher.ts:29-61` `getRemoteWasmFromHash(server, hashBuffer)`
  builds a `contractCode` ledger key from `hashBuffer`, calls
  `server.getLedgerEntries(contractCodeKey)`, and at lines 53-54 returns
  `Buffer.from(contractCode.code())` — the raw bytes from the RPC ledger-entry
  response. There is **no** `sha256(code) === hashBuffer` comparison. The only
  validations are presence (`entries.length === 0`, line 44) and entry-type
  (`entry.key.switch() !== xdr.LedgerEntryType.contractCode()`, line 49).
- `src/bindings/wasm_fetcher.ts:118-140` `fetchFromWasmHash` validates only the
  *requested* hash hex length (`hashBuffer.length !== 32`, lines 125-129) and
  never the returned code.
- `src/bindings/generator.ts:151-160` `fromWasmHash` passes the fetched bytes
  straight to `BindingGenerator.fromWasm(wasm.wasmBytes)`.
- `src/bindings/generator.ts:125-128` `fromWasm` calls
  `new Spec(specFromWasm(wasmBuffer))`; `src/contract/wasm_spec_parser.ts:8-17`
  pulls the `contractspecv0` custom section and trusts it as the contract spec.
- A scoped search (`rg "sha256|createHash|verify|digest"`) over `src/bindings/`
  and `src/contract/wasm_spec_parser.ts` returns **no hits** — confirming no
  integrity check exists anywhere on this path.

The "Expected Behavior" in the hypothesis is correct: a content-addressed fetch
(by hash) carries an inherent integrity contract — the caller already holds the
authoritative `hashBuffer`, so the SDK can and should verify
`sha256(code) === hashBuffer` before trusting the embedded spec. The code
genuinely deviates: it trusts the RPC-returned bytes unconditionally.

This is distinct from the narrow prior record [1]
(`hash_length_shape_validation_bypass_at_xdr_Hash_fromXDR`,
route_id js-sdk-0283c3cad484b8dcb342fe0f), which only addressed the *shape* of
the requested hash buffer at `xdr.Hash.fromXDR`. The integrity of the *returned
code* is a different, unassessed mechanism on the same route. It is also
materially different from prior records [2]/[3] (simulation resource fee / auth
adoption), which were NOT_VIABLE precisely because the SDK has *no ground truth*
to validate the RPC value against. Here the ground truth exists: the
caller-supplied hash.

## Findings

Material impact is strongest for `BindingGenerator.fromWasmHash(hash, rpc)` when
the `hash` originates from a trusted source (a known/published wasm hash) but
the RPC endpoint is malicious or MITM'd. Content addressing is precisely the
property that should make the RPC's trust level irrelevant for integrity; the
missing check forfeits that guarantee. A malicious/intercepting RPC answers the
`getLedgerEntries(contractCode)` query with arbitrary WASM whose
`contractspecv0` section the SDK accepts as authoritative for the requested
hash. The resulting `Spec` is embedded (base64) into the generated Client and
governs client-side argument encoding.

Severity Medium: remote-response trust confusion without direct fund loss at
this sink. The downstream escalation — the substituted `Spec` driving
`Spec.funcArgsToScVals` to encode contract call arguments against the wrong
interface (potential High) — lives in a separate subsystem and is recorded in
`does_not_rule_out` rather than claimed here. For `fromContractId` the wasmHash
is itself sourced from the same RPC, so a self-consistent hash+code pair defeats
even a verification check; the meaningful protection is for caller-supplied
trusted hashes.

## PoC Guidance

- **Test file**: add to `test/unit/bindings/` (mirror existing
  `wasm_fetcher`/`generator` unit tests; mock the RPC server).
- **Setup**: construct a known wasm hash `H`. Mock `RpcServer.getLedgerEntries`
  to return a `contractCode` ledger entry whose `code()` is a *different*,
  attacker-authored WASM (with its own `contractspecv0`) that does **not** hash
  to `H`.
- **Steps**: call `BindingGenerator.fromWasmHash(H_hex, mockedServer)` and then
  `generate({ contractName })`.
- **Assertion**: the call succeeds and the generated client embeds the
  attacker's spec — demonstrating no `sha256(code) === H` rejection. Contrast
  with the desired behavior (a thrown `WasmFetchError` on hash mismatch).

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "bindings"
route_id = "js-sdk-0283c3cad484b8dcb342fe0f"
weakness = "missing_integrity_check"
record_kind = "single_path"
path = ["getRemoteWasmFromHash", "specFromWasm", "BindingGenerator.fromWasm"]
sink = "BindingGenerator.fromWasm"
sink_role = "spec_ingest"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/bindings/wasm_fetcher.ts:getRemoteWasmFromHash", "src/bindings/generator.ts:fromWasmHash"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms no sha256/createHash/verify on the fetch path (rg over src/bindings + wasm_spec_parser returns no hits); prior record [1] only closed the requested-hash length-shape question at xdr.Hash.fromXDR, not returned-code integrity"]
does_not_rule_out = ["downstream Spec.funcArgsToScVals argument encoding from the substituted spec leading to wrong contract args (potential High, separate subsystem)", "fromContractId path where the wasmHash is itself RPC-sourced, so a self-consistent hash+code pair would defeat even a verification check"]
assumptions = ["caller may hold an authoritative wasm hash from a trusted source while talking to an untrusted/MITM RPC, so sha256(code)==hash is a meaningful integrity contract for fromWasmHash"]
mechanism_brief = "WASM bytes fetched by hash are returned without verifying sha256(code)==requestedHash; a malicious/MITM RPC substitutes a spec that binding generation accepts as authoritative for the requested hash"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "generated-string sanitizers (sanitizeIdentifier/escapeStringLiteral/escapeJSDocContent) only neutralize code injection in emitted strings; they do not detect or block spec substitution"

[[blockers]]
kind = "not_found"
source = "src/bindings/wasm_fetcher.ts:getRemoteWasmFromHash"
guarantee = "no sha256/hash-equality verification of the returned WASM bytes against the requested hash exists on the fetch path"
```
