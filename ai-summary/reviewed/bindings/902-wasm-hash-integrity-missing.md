# R902: WASM fetched by hash is never verified to hash to the requested value

**Date**: 2026-06-17
**Subsystem**: bindings
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/bindings/901-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full fetch-by-hash path in current source:

- `fetchFromWasmHash(wasmHash, rpcServer)` (`src/bindings/wasm_fetcher.ts:118-141`)
  decodes the caller-supplied hex hash and validates only that the *requested*
  hash is 32 bytes (`wasm_fetcher.ts:124-129`), then calls
  `getRemoteWasmFromHash(rpcServer, hashBuffer)`.
- `getRemoteWasmFromHash` (`wasm_fetcher.ts:29-61`) builds a
  `LedgerKeyContractCode` from the requested hash (line 35-39), issues
  `server.getLedgerEntries(contractCodeKey)` (line 42), checks the entry type is
  `contractCode` (line 49-51), then **returns `Buffer.from(contractCode.code())`
  directly** (line 53-54). There is no recomputation of `sha256(code)` and no
  comparison against `hashBuffer`.
- A scoped grep of `src/bindings/` and `src/contract/wasm_spec_parser.ts` for
  `sha256|createHash|verify|hash(` returns no match — confirming no integrity
  check anywhere on this path.
- The returned bytes flow into `BindingGenerator.fromWasmHash` (`generator.ts:151-160`)
  → `BindingGenerator.fromWasm` → `new Spec(specFromWasm(wasm.wasmBytes))`
  (`generator.ts:125-128`), so the substituted spec becomes authoritative for the
  generated client (embedded base64) and for argument encoding.

The `fromWasmHash` path is the strongest form: the caller supplies a hash they
obtained out-of-band (a trusted content address), and the SDK has cryptographic
ground truth (`hashBuffer`) available to verify the returned code but never does.

## Findings

The whole point of fetching *by hash* is content-addressability: the returned
bytes are supposed to be exactly the bytes that hash to the requested value. A
malicious or MITM RPC server can answer the `getLedgerEntries(contractCode)`
query with arbitrary WASM whose `contractspecv0` custom section the SDK then
accepts as the authoritative spec for the requested hash. The generated bindings
(and the embedded `Spec`) then correspond to attacker-chosen code rather than the
requested contract.

This is distinct from prior record [1] (route_id
js-sdk-0283c3cad484b8dcb342fe0f, NOT_VIABLE), which only ruled out the narrow
hash-*length-shape* question at `xdr.Hash.fromXDR`. That record blocks malformed
hash inputs; it does not touch the integrity of the returned *code bytes*, which
is the mechanism here.

The reviewer-blocking logic used in prior RPC-trust records [3]/[4] ("no SDK-side
ground truth exists, so the value cannot be validated") does **not** apply: in
`fromWasmHash` the requested hash IS ground truth, the check is cheap
(`sha256(returnedCode) === hashBuffer`), and it would never reject a legitimate
RPC response (Soroban content-addresses WASM by exactly this hash). This is a
genuine missing integrity check, not working-as-designed.

Severity Medium: remote-response trust confusion / materially wrong ledger-entry
decode (matches the Medium severity scale and IMPACT_CATEGORIES "Remote
RPC/Horizon response decoded into a materially wrong ... ledger entry"). Not
raised to High here because the binding-generation sink itself is a build-time
artifact and the runtime fund-moving teeth are downstream in
`Spec.funcArgsToScVals` (recorded in `does_not_rule_out`).

Note the `fromContractId` variant (`fetchWasmFromContract`, `wasm_fetcher.ts:77-113`)
is weaker: the wasm hash there comes from `instance.executable().wasmHash()`,
itself an RPC value, so the attacker controls both hash and code and a
self-consistency check adds nothing. The viable claim is the `fromWasmHash`
caller-supplied-hash path.

## PoC Guidance

- **Test file**: add a focused Vitest under `test/unit/` (e.g.
  `test/unit/bindings/wasm_fetcher_integrity_test.ts`), following existing
  binding/rpc unit-test mocking patterns.
- **Setup**: construct a stub `RpcServer` whose `getLedgerEntries` returns a
  `contractCode` ledger entry whose `code()` bytes are a *different* valid WASM
  (with its own `contractspecv0` section) than the one matching `wasmHash`.
- **Steps**: call `fetchFromWasmHash(knownHash, stubServer)` (or
  `BindingGenerator.fromWasmHash`).
- **Assertion**: it resolves successfully and returns the substituted bytes /
  generates bindings from the substituted spec, demonstrating no
  `sha256(code) === knownHash` enforcement. A fix would make this call reject.
- Do not contact public infrastructure; mock the RPC response.

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
rules_out = ["source trace of wasm_fetcher.ts:53-54 and grep of src/bindings confirm no sha256/hash-equality verification of returned WASM bytes against the requested hash; prior record [1] only ruled out hash-length-shape at xdr.Hash.fromXDR, a different blocker"]
does_not_rule_out = ["downstream Spec.funcArgsToScVals argument encoding from the substituted spec leading to wrong contract arguments at runtime (potential High, separate contract subsystem not traced here)", "the fromContractId variant where the wasm hash is itself RPC-supplied and a self-consistency check would not help"]
assumptions = ["caller of fromWasmHash supplies a hash obtained out-of-band/trusted", "RPC/Horizon response is attacker-influenceable (malicious endpoint or MITM), consistent with the objective trust boundary"]
mechanism_brief = "WASM bytes fetched by hash are returned directly from the RPC ledger entry with no sha256(code)===requestedHash check; a malicious RPC substitutes arbitrary WASM whose spec becomes authoritative for the requested hash"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/bindings/utils.ts:sanitizeIdentifier"
guarantee = "generated-string sanitizers (sanitizeIdentifier/escapeStringLiteral/escapeJSDocContent) only neutralize code injection; they do not detect or block spec/byte substitution"

[[blockers]]
kind = "not_found"
source = "src/bindings/wasm_fetcher.ts:getRemoteWasmFromHash"
guarantee = "no sha256/hash-equality verification of returned WASM bytes on the fetch path (confirmed by source read of lines 53-54 and grep of src/bindings)"
```
