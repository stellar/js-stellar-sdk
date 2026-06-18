# R901: WASM fetched by hash is not verified to hash to the requested value

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/901-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the content-addressed fetch path in source:

- `getRemoteWasmFromHash` (`src/bindings/wasm_fetcher.ts:29-61`) builds a
  `LedgerKeyContractCode` from the caller-supplied 32-byte `hashBuffer`
  (`xdr.Hash.fromXDR(hashBuffer, "raw")`, line 37), calls
  `server.getLedgerEntries(contractCodeKey)` (line 42), and on success returns
  `Buffer.from(contractCode.code())` (lines 53-54).
- The only validation on the response is `entry.key.switch() !==
  xdr.LedgerEntryType.contractCode()` (line 49), which checks the ledger entry
  *type* only. There is no check that the returned entry's key hash, or
  `sha256(code)`, equals the requested `hashBuffer`. No `createHash`/`sha256`
  appears anywhere on this path.
- `fetchFromWasmHash` (`wasm_fetcher.ts:118-140`) validates only the *requested*
  hash length (`hashBuffer.length !== 32`, lines 125-129), never the returned
  bytes.
- The returned bytes flow unverified into `BindingGenerator.fromWasmHash`
  (`src/bindings/generator.ts:151-160`) → `BindingGenerator.fromWasm` →
  `new Spec(specFromWasm(wasmBuffer))` (line 126), where the attacker-supplied
  `contractspecv0` section becomes the authoritative spec for the requested hash
  and is embedded base64 into the generated client.

The prior NOT_VIABLE record (route_id js-sdk-0283c3cad484b8dcb342fe0f) closes
only the narrow shape question — `xdr.Hash.fromXDR` decoding a non-32-byte
buffer — at the *requested-hash* decode. That blocker (`negative_scope =
hash_length_shape_validation_bypass_at_xdr_Hash_fromXDR`) does not touch the
*returned-bytes* integrity gap, which is a distinct sink and weakness. This
candidate is therefore not a duplicate and not subsumed.

## Findings

A WASM blob fetched **by hash** is content-addressed: the requesting caller's
entire security expectation is that the returned bytes are the code whose
sha256 is the requested hash. The SDK does not enforce this invariant — it
trusts the RPC server to honor it. A malicious or man-in-the-middle RPC endpoint
can answer the `getLedgerEntries(contractCode)` query with substituted WASM
whose `contractspecv0` section the SDK then accepts as authoritative for the
requested hash.

Impact: remote-response trust confusion. The generated bindings, and the
embedded base64 `Spec` that governs client-side argument encoding, correspond to
attacker-chosen code rather than the requested hash. The generated-string
sanitizers (`sanitizeIdentifier`, `escapeStringLiteral`, `escapeJSDocContent`)
do not defend against this — they only neutralize code injection into the
emitted strings, not spec substitution. Severity held at Medium (trust
confusion / missing integrity check), consistent with the "remote-response
trust confusion" and "missing integrity check" Medium criteria. Escalation to
High would require confirming the downstream `Spec.funcArgsToScVals` argument
encoding produces materially wrong on-chain calls, which is a separate subsystem
and is recorded in `does_not_rule_out`.

## PoC Guidance

- **Test file**: add a focused Vitest test under `test/unit` near existing
  binding/wasm-fetcher tests.
- **Setup**: construct a mock RPC `Server` whose `getLedgerEntries` returns a
  `contractCode` ledger entry whose `code()` is an arbitrary WASM buffer that
  does **not** hash to the requested hash (embed a valid `contractspecv0`
  section so spec parsing succeeds).
- **Steps**: call `BindingGenerator.fromWasmHash(<someHash>, mockServer)`.
- **Assertion**: the call succeeds and produces bindings derived from the
  substituted spec, i.e. no error is thrown despite `sha256(returnedBytes) !==
  requestedHash`. Assert that no integrity verification rejects the mismatched
  bytes. (A fixed SDK would throw a `WasmFetchError` on hash mismatch.)

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
negative_claim.rules_out_codes = ["candidate_not_blocked_by_prior_hash_length_shape_record"]
rules_out = ["source trace confirms no sha256/hash-equality verification on the returned contractCode.code() bytes; the prior NOT_VIABLE record only closes the requested-hash length-shape decode at xdr.Hash.fromXDR, a distinct sink that does not block this integrity gap"]
does_not_rule_out = ["downstream Spec.funcArgsToScVals argument encoding from the substituted spec leading to materially wrong on-chain contract args (potential High, separate subsystem not traced here)"]
assumptions = ["RPC/Horizon response is a partially-trusted boundary an attacker can substitute or MITM", "caller invokes fromWasmHash/fromContractId against the attacker-influenced endpoint"]
mechanism_brief = "WASM bytes fetched by hash are returned without verifying sha256(code) == requestedHash; a malicious RPC substitutes spec accepted by binding generation as authoritative for the requested hash"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "generated-string sanitizers (sanitizeIdentifier/escapeStringLiteral/escapeJSDocContent) do not block spec substitution; they only neutralize code injection into emitted strings"

[[blockers]]
kind = "not_found"
source = "src/bindings/wasm_fetcher.ts:getRemoteWasmFromHash"
guarantee = "no sha256/hash-equality verification of returned WASM bytes; only entry.key.switch() type is checked at wasm_fetcher.ts:49"
```
