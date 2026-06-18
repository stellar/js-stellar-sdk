# F965: Path blocked: residual wasm content-integrity confirmed-but-subsumed

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/965-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`getClaimableBalance -> from`

Escalated residual question: confirm/refute "missing sha256(returned_wasm)==requested_wasmHash content-integrity check", recorded VIABLE `js-sdk-0283c3ca`.

## Blocker

The residual question resolves to **YES from source**: `getContractWasmByHash` returns `responseWasm.entries[0].val.contractCode().code()` (server.ts:618-620) with no `sha256(wasmBuffer) === wasmHashBuffer` verification, and `getContractWasmByContractId` (server.ts:563-570) forwards a remote-supplied `wasmHash` into the same unverified path. However, this is the *exact* typed content-integrity weakness already recorded VIABLE as `js-sdk-0283c3ca` (prior brief [3], "subsumed_by_prior_viable_wasm_hash_integrity_finding"); re-reporting it would duplicate an existing confirmed finding rather than add a distinct one. The literal seed sink shape (`Buffer.from`/`fromXDR` mis-shaping of remote bytes) is independently blocked: on `getClaimableBalance` the `decodeClaimableBalance`/`fromXDR` calls (server.ts:313-328) consume only the caller-supplied `id`, and the return `entry.val.claimableBalance()` is a union accessor that throws on a wrong arm rather than mis-shaping a buffer (matches prior NOT_VIABLE js-sdk-2a92c91d0e625f07fc4bf775).

## Evidence

- `src/rpc/server.ts:618-620` - `getContractWasmByHash` returns `contractCode().code()` directly; no sha256(returned_wasm)==requested_wasmHash check exists (residual question = YES, but this is the already-VIABLE weakness js-sdk-0283c3ca).
- `src/rpc/server.ts:563-570` - `getContractWasmByContractId` extracts `wasmHash()` from the remote contractData entry and forwards it to `getContractWasmByHash`; same typed weakness, no new sink.
- `src/rpc/server.ts:312-339` - `getClaimableBalance` `Buffer.from`/`fromXDR` operate only on caller-supplied `id`; remote bytes arrive via the union accessor `entry.val.claimableBalance()` which throws on a wrong arm, not mis-shaping a buffer.

## Negative Scope

- Rules out: a *new/distinct* buffer_decode or content-integrity candidate on `getClaimableBalance`/`getContractWasmByHash`/`getContractWasmByContractId` beyond the missing-sha256 weakness already VIABLE as js-sdk-0283c3ca.
- Does not rule out: the underlying missing sha256(returned_wasm)==requested_wasmHash check itself, which is confirmed present-as-a-gap and tracked by VIABLE js-sdk-0283c3ca; and a general getLedgerEntries returned-key-vs-requested-key non-verification that may warrant its own route.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-2a92c91d0e625f07fc4bf775"
weakness = "buffer_decode"
record_kind = "residual_escalation"
path = ["getClaimableBalance", "from"]
sink = "from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/server.ts:getContractWasmByHash", "src/rpc/server.ts:getContractWasmByContractId", "src/rpc/server.ts:getClaimableBalance"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["js-sdk-0283c3ca"]
rules_out = ["a distinct new buffer_decode/content-integrity candidate on getClaimableBalance/getContractWasmByHash/getContractWasmByContractId beyond the missing-sha256 weakness already recorded VIABLE as js-sdk-0283c3ca"]
does_not_rule_out = ["the missing sha256(returned_wasm)==requested_wasmHash check itself (confirmed gap, tracked VIABLE js-sdk-0283c3ca)", "general getLedgerEntries returned-key-vs-requested-key non-verification as a separate route"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "residual question resolves YES from source (no sha256 check at getContractWasmByHash), but it is the exact weakness already recorded VIABLE js-sdk-0283c3ca; the literal seed Buffer.from/fromXDR sink on getClaimableBalance consumes only caller-supplied id and union accessors throw on wrong arm"
why_failed_brief = "confirmed-but-subsumed: residual lead is true but duplicates VIABLE js-sdk-0283c3ca; no distinct new vulnerability on this path within budget"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "getClaimableBalance Buffer.from/fromXDR operate only on caller-supplied id; return value entry.val.claimableBalance() is a union accessor that throws on wrong arm rather than mis-shaping a remote buffer"

[[blockers]]
kind = "duplicate_finding"
guarantee = "the missing sha256(returned_wasm)==requested_wasmHash content-integrity check is the same typed weakness already recorded VIABLE as js-sdk-0283c3ca; re-reporting would duplicate, not add a distinct finding"
```
