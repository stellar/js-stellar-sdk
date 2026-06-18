# R937: fromWasmHash does not verify fetched WASM against the caller-pinned hash before spec decode

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/937-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: High
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Source trace confirms the candidate end to end on current source:

- `Client.fromWasmHash(wasmHash, options, format)` (`src/contract/client.ts:148-166`)
  validates only `options.rpcUrl`, constructs/reuses a `Server`, then calls
  `server.getContractWasmByHash(wasmHash, format)` and passes the result verbatim
  into `Client.fromWasm(wasm, options)` (`client.ts:163-165`). No integrity check
  is performed on the returned buffer.
- `getContractWasmByHash` (`src/rpc/server.ts:596-621`) coerces the caller hash to
  `wasmHashBuffer` (600-603), builds `LedgerKeyContractCode{ hash: wasmHashBuffer }`
  (605-609), calls `this.getLedgerEntries(ledgerKeyWasmHash)` (611), checks only
  presence of `entries[0].val` (612-617), then returns
  `responseWasm.entries[0].val.contractCode().code()` directly (618-620). There is
  **no `sha256(wasmBuffer) === wasmHashBuffer` comparison** anywhere in the function;
  the requested hash is used solely as the RPC lookup key.
- `Client.fromWasm` (`client.ts:176-179`) → `Spec.fromWasm` (`src/contract/spec.ts:504-507`)
  → `specFromWasm` (`src/contract/wasm_spec_parser.ts:8-17`) → `parseWasmCustomSections`
  extracts the `contractspecv0` custom section; the decoded entries become `Spec.entries`
  (`spec.ts:495`) and drive the generated method set, `funcArgsToScVals` (arg encoding),
  and `funcResToNative` (result decoding).

The caller of `fromWasmHash` supplies the WASM hash as an out-of-band integrity anchor
(a published/release/build hash). The API name and signature imply content-addressed
retrieval, but the SDK never enforces that the returned bytes hash to the requested
value. A malicious, compromised, or MITM'd RPC answering `getLedgerEntries` with a
`contractCode` entry whose `code()` is arbitrary attacker WASM is accepted and decoded.

## Findings

This is a genuine SDK-level trust gap, not documented caller responsibility: the
`getContractWasmByHash` docstring (`server.ts:580-595`) promises only that it returns
"the WASM bytecode" or throws if not found — it does not state that the bytes are
unverified against the supplied hash. `fromWasmHash` is the clean attacker-reachable
case precisely because the *caller* (not the RPC) chose the hash, so the absence of a
client-side `sha256` check breaks the integrity guarantee the API's existence implies.

Materiality of an attacker-chosen spec is already source-established by prior VIABLE
records on downstream construction: attacker-controlled spec entries control method
names (`sanitizeIdentifier` shadowing, `js-sdk-310bbe7b42cb719afc52c1fd`) and result
field mapping (`structToNative` positional reorder, `js-sdk-26a2c419baf9cb084b019288`).
A substituted spec therefore misrepresents the generated contract interface — changing
how arguments are encoded into ScVals and how results are decoded — which can cause
unsafe transaction construction/signing and materially wrong decoded return values.
Per the objective impact table, "contract bindings generated from attacker-controlled
spec data ... misrepresent the contract interface" carries a High floor.

The attacker (malicious/compromised/MITM RPC answering `getLedgerEntries`) is explicitly
in dispatch scope (`trust_boundary = application_input_or_remote_rpc_server`,
`attacker_control = contract_spec_wasm_json_and_rpc_response`).

## PoC Guidance

- **Test file**: a focused Vitest unit under `test/unit` (mirroring existing
  `rpc`/`contract` client tests; do not contact public infrastructure).
- **Setup**: build a real WASM-with-`contractspecv0` buffer `wasmA` and compute its
  sha256 `hashA`. Build a *different* attacker WASM `wasmB` whose `contractspecv0`
  encodes a divergent spec (e.g., a renamed/extra method or a struct with reordered
  fields). Stub `Server.getLedgerEntries` (or the underlying `_jsonrpc`/fetch) so that a
  `LedgerKeyContractCode{ hash: hashA }` query resolves to a `contractCode` entry whose
  `code()` returns `wasmB`.
- **Steps**: call `Client.fromWasmHash(hashA, { rpcUrl, server: stubbedServer })`.
- **Assertion**: the returned `Client`'s interface reflects `wasmB`'s spec, not `wasmA`'s
  (e.g., assert the method set / a decoded result differs from `wasmA`'s spec), proving no
  hash verification gates the decode. Optionally assert that
  `server.getContractWasmByHash(hashA)` resolves to `wasmB` bytes whose sha256 !== `hashA`.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-d6ede4f50f471c78ff302843"
weakness = "Contract WASM fetched by caller-pinned hash is not verified against that hash before spec decode drives client interface construction"
record_kind = "single_path"
path = ["Client.fromWasmHash", "getContractWasmByHash", "Client.fromWasm"]
sink = "Client.fromWasm"
sink_role = "contract_wasm_parse"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "contract_wasm_parse"
target_functions = ["src/rpc/server.ts:getContractWasmByHash", "src/contract/client.ts:fromWasmHash", "src/contract/client.ts:fromWasm", "src/contract/spec.ts:fromWasm"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace of getContractWasmByHash (src/rpc/server.ts:596-621) confirms only a presence check on entries[0].val and a direct return of contractCode().code() with no sha256(wasm)==requested-hash comparison, and fromWasmHash (client.ts:163-165) forwards the buffer unverified into fromWasm, so no integrity guard blocks an RPC-substituted spec on this exact caller-pinned-hash path"]
does_not_rule_out = ["getContractWasmByContractId/from path where the hash itself is resolved from the same RPC (no independent caller anchor)", "downstream construction mechanisms already covered by prior VIABLE records (sanitizeIdentifier shadowing js-sdk-310bbe7b42cb719afc52c1fd, structToNative reorder js-sdk-26a2c419baf9cb084b019288)"]
assumptions = ["a malicious, compromised, or MITM'd RPC server can answer getLedgerEntries with attacker-chosen contractCode bytes; this attacker is explicitly in dispatch scope", "an application uses fromWasmHash with a hash obtained out-of-band as an integrity anchor and treats the resulting client interface as trustworthy"]
mechanism_brief = "fromWasmHash uses the caller-pinned wasmHash only as a ledger lookup key; getContractWasmByHash returns contractCode().code() with no sha256(wasm)==wasmHash check, so a malicious RPC substitutes a forged contractspecv0 spec that fromWasm decodes into the client method/arg/result interface."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/utils.ts:parseWasmCustomSections"
guarantee = "parseWasmCustomSections bounds-checks every read and caps LEB128 at 32 bits, but performs no content-hash verification of the WASM bytes, so it does not block a substituted-but-well-formed spec"

[[blockers]]
kind = "not_found"
source = "src/rpc/server.ts:getContractWasmByHash"
guarantee = "no sha256(wasm)==requested wasmHash verification exists in getContractWasmByHash (src/rpc/server.ts:596-621) or in the fromWasm family (client.ts:176-179, spec.ts:504-507) before spec decode"
```
