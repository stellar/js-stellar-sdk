# F923: Missing content-integrity check on getContractWasmByHash returned bytes

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/923-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's source claims are accurate and were verified in current source:

- `src/rpc/server.ts:596-621` (`getContractWasmByHash`): builds
  `ledgerKeyWasmHash` from `wasmHashBuffer`, calls `getLedgerEntries`, and at
  line 618 returns `responseWasm.entries[0].val.contractCode().code()`
  verbatim. There is no `sha256(wasmBuffer)` recomputation or comparison
  against `wasmHashBuffer` (defined at 600-603). Only presence checks exist
  (612-617).
- `src/rpc/parsers.ts:135-157` (`parseRawLedgerEntries`): XDR-decodes `key` and
  `val` per entry but never verifies the returned `key` matches the requested
  key, so a server may return an entry for a different key with no detection.
- `src/rpc/server.ts:551-571` (`getContractWasmByContractId`): derives
  `wasmHash` from a first (also unverified) remote response and forwards to
  `getContractWasmByHash`, inheriting the same gap.

So the mechanism — server-supplied wasm bytes returned without sha256
verification against the requested content-addressed hash — is real in source.

## Why It Failed

The candidate is subsumed by existing VIABLE findings. The prior-investigations
index contains two VIABLE records describing the identical typed weakness on the
same returned `contractCode().code()` bytes:

- **id=11**, route_id `js-sdk-0283c3cad484b8dcb342fe0f` (VIABLE, bindings,
  weakness `missing_integrity_check`): "WASM bytes fetched by hash are returned
  without verifying sha256(code) == requestedHash; a malicious RPC substitutes
  spec accepted by binding generation as authoritative for the requested hash."
  Its trust boundary `contract_spec_or_rpc_server` already encompasses the
  malicious/MITM RPC server case.
- **id=70**, route_id `js-sdk-f7107932d67c6535c2ca097a` (VIABLE, cli):
  "getRemoteWasmFromHash returns RPC-supplied contractCode.code() bytes without
  verifying sha256 against the requested wasm hash, so a hostile/MITM RPC
  substitutes WASM and the generated bindings misrepresent the contract
  interface."

The candidate identifies the same single missing guard (no
`sha256(returned)==requestedHash`) on the same bytes, observed one layer
upstream at the rpc `Server.getContractWasmByHash` method rather than at its
bindings consumer. The defect is one missing check with one fix. The only
material security escalation the candidate offers — wasm bytes feeding
contract-spec / bindings generation — is explicitly recorded in the candidate's
own `does_not_rule_out` as "outside this file and not traced within budget,"
and that consumer is exactly what id=11 and id=70 already capture and rate.

Stripped of the bindings consumer, the residual claim is "an untrusted rpc
server returns wrong wasm bytes to a generic caller." That is the inherent
untrusted-server property (the subsystem summary states remote RPC responses
are attacker-controlled when the server is untrusted), and on its own — with no
concrete in-scope downstream consumer traced — it does not establish a distinct
material effect above the Medium floor beyond the already-documented findings.

This is true typed subsumption, not a sibling route distinguished by a genuinely
new trust boundary: id=11's `contract_spec_or_rpc_server` boundary and its
"malicious RPC substitutes" mechanism already cover the remote-server case the
candidate raises.

## What This Rules Out

The missing `sha256(returned_wasm)==requested_wasmHash` content-integrity check
on the `getContractWasmByHash`/`getContractWasmByContractId` returned
`contractCode().code()` bytes is not a distinct new finding: it is the same
typed weakness already recorded VIABLE as `js-sdk-0283c3cad484b8dcb342fe0f`
(id=11) and `js-sdk-f7107932d67c6535c2ca097a` (id=70), and adds no material
effect over them at the rpc layer.

## What This Does Not Rule Out

- A concrete, in-scope downstream consumer of the rpc-layer
  `getContractWasmByHash` bytes (other than bindings generation) that converts
  the substitution into a distinct material effect would be a separate route
  not covered here or by id=11/id=70.
- `parseRawLedgerEntries` accepting a returned ledger `key` that mismatches the
  requested key, for ledger-entry types other than contract-code wasm, remains
  unassessed and is a distinct typed route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-07f16dc9add83b62527fdaf9"
weakness = "missing_content_integrity_check"
record_kind = "single_path"
path = ["getContractWasmByContractId", "getContractWasmByHash", "getLedgerEntries", "contractCode().code()"]
sink = "getContractWasmByHash return"
sink_role = "wasm_bytes_return"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/server.ts:getContractWasmByHash", "src/rpc/server.ts:getContractWasmByContractId"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "subsumed_by_prior_viable_finding"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["subsumed_by_prior_viable_wasm_hash_integrity_finding"]
rules_out = ["the missing sha256(returned_wasm)==requested_wasmHash check on getContractWasmByHash/getContractWasmByContractId returned contractCode().code() bytes is the same typed weakness already recorded VIABLE as js-sdk-0283c3cad484b8dcb342fe0f (id=11) and js-sdk-f7107932d67c6535c2ca097a (id=70), adding no distinct material effect at the rpc layer"]
does_not_rule_out = ["a concrete in-scope downstream consumer of the rpc-layer returned bytes other than bindings generation that yields a distinct material effect", "returned-ledger-key mismatch acceptance in parseRawLedgerEntries for ledger-entry types other than contract-code wasm"]
assumptions = ["subsystem summary trust model: remote RPC responses are attacker-controlled when the server is untrusted", "the only material escalation the candidate offers (bindings/spec generation) is the consumer already covered by id=11 and id=70"]
mechanism_brief = "getContractWasmByHash returns server-supplied contractCode().code() bytes without verifying sha256(bytes)==requested wasmHash; source-confirmed but the same missing-content-integrity weakness is already documented VIABLE (id=11, id=70) and the candidate's only escalation (bindings) is the already-reported consumer"
why_failed_brief = "true typed subsumption: identical missing-sha256-verification weakness on the same returned wasm-by-hash bytes already recorded VIABLE; candidate adds no distinct material effect over priors at the rpc layer"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/server.ts:getContractWasmByHash"
guarantee = "only presence checks (entries.length / val at server.ts:612-617) exist; no sha256 verification of returned wasm against requested hash — confirmed in source, matching the already-VIABLE id=11/id=70 mechanism"

[[blockers]]
kind = "duplicate"
source = "ai-summary index id=11 (js-sdk-0283c3cad484b8dcb342fe0f), id=70 (js-sdk-f7107932d67c6535c2ca097a)"
guarantee = "the same typed missing-content-integrity weakness on returned wasm-by-hash bytes is already recorded VIABLE; this candidate is subsumed"
```
