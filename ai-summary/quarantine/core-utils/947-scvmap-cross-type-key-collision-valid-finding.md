# R947-1: Standalone scValToNative scvMap decode silently drops entries on cross-type JS-property key collision

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/947-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the standalone `scValToNative` (`src/base/scval.ts:375-409`). The `scvMap`
arm (scval.ts:403-409) decodes a Soroban map via:

```
Object.fromEntries(
  (scv.map() ?? []).map((entry) => [
    scValToNative(entry.key()),
    scValToNative(entry.val()),
  ]),
)
```

There is no dedup, no collision/throw guard, no canonicalization, and — unlike
the encode side — no sort. `Object.fromEntries` assigns each `[k, v]` pair as an
own property and coerces `k` via `ToPropertyKey` (string for non-symbol). For two
entries whose native keys coerce to the same property string, the later entry in
raw map order overwrites the earlier; the earlier is silently dropped.

Cross-type key collisions are source-confirmed:
- `scvU32`/`scvI32` both return `scv.value()` as a JS `number` (scval.ts:412-416),
  so `scvU32(1)` and `scvI32(1)` both yield property `"1"`.
- `scvU64`/`scvI64` both `.toBigInt()` (scval.ts:384-386); `scvU128`/`scvI128`/
  `scvU256`/`scvI256` via `scValToBigInt` (scval.ts:391-395) — all yield a
  `bigint` whose property string is the decimal value, colliding with the
  numeric cases above (e.g. `scvU32(1)` → `"1"` and `scvU64(1n)` → `"1"`).
- `scvSymbol` (scval.ts:427-440) and `scvString` (scval.ts:441-454) both decode
  to a JS `string`, so `scvSymbol("amount")` and `scvString("amount")` both
  yield property `"amount"`.

Remote reachability of the standalone function with attacker-controlled ScVal is
source-confirmed:
- `src/base/events.ts:29,31` — `extractEvent` calls `scValToNative` on every
  event topic and on event `data`; reached by the exported `humanizeEvents`
  (events.ts:48-60) over `xdr.ContractEvent`/`xdr.DiagnosticEvent` decoded from
  RPC/Horizon responses or an untrusted contract's emitted events.
- `src/rpc/server.ts:1476` — `scValToNative(val.contractData().val())` on a
  ledger-entry value returned by `getLedgerEntries` (remote response); the SDK
  then reads `entry.amount`/`entry.authorized`/`entry.clawback` (server.ts:1486-1488).

No guard on any of these paths re-checks the decoded map for collapsed keys.

## Findings

**Security impact (Medium — remote-response trust confusion / result-decode
ambiguity).** A malicious or compromised contract (emitting events) or a
malicious/compromised RPC/Horizon server (events, `getLedgerEntries`) can return
a legal Soroban `scvMap` whose distinct, individually-valid ScVal keys collapse
to one JS property. Map order is attacker-controlled, so the attacker chooses
which value survives. An application that reads `decoded["amount"]` (or any key)
from a humanized event or decoded contract data receives the attacker-selected
value rather than the true on-chain value, with no error surfaced.

This is a genuine deviation from the reasonable expectation that decoding two
distinct on-chain map entries preserves both (or fails loudly), and the JSDoc
(scval.ts:355-368) documents `map → key-value object` without warning that the
mapping is lossy for colliding keys.

Severity is Medium, not High: the decoded object is returned to the application,
and no SDK-internal signing/auth decision is shown consuming a collided key on
this path (the `getSACBalance` consumer keys on fixed names but a malicious RPC
server could already return any amount directly, so the collision adds no power
there). Impact realization depends on the application trusting/enumerating the
decoded map. Distinct from prior [1] (route `js-sdk-63809a71507c05b9211d309d`),
which ruled out prototype pollution and the encode-side caller-configured path;
this is decode-side silent same-name overwrite, an undisposed residual.

## PoC Guidance

- **Test file**: `test/unit/scval_test.js` (or the existing scval unit test).
- **Setup**: Build two `xdr.ScMapEntry` pairs sharing a colliding native key,
  e.g. `[scvString("amount"), scvI128(100n)]` then `[scvSymbol("amount"),
  scvI128(1n)]`, wrap in `xdr.ScVal.scvMap([...])`. Also test the numeric case:
  `[scvU32(1), ...]` and `[scvU64(1n), ...]`.
- **Steps**: Call standalone `scValToNative(map)`.
- **Assertion**: Assert `Object.keys(result).length === 1` (both entries
  collapsed) and that `result["amount"]` equals the value of the *later* entry,
  demonstrating the earlier entry was silently dropped. Optionally show the same
  via `humanizeEvents` on a synthesized `xdr.DiagnosticEvent` whose `data` is the
  colliding map.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-63809a71507c05b9211d309d"
weakness = "scvmap_decode_key_collision"
record_kind = "single_path"
path = ["humanizeEvents/getLedgerEntries", "scValToNative.scvMap"]
sink = "scValToNative.scvMap"
sink_role = "remote_response_decode"
impact_class = "remote_response_trust_confusion"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/scval.ts:scValToNative", "src/base/events.ts:extractEvent", "src/rpc/server.ts:scValToNative"]
scope.trust_boundary = "remote_rpc_or_contract_response"
scope.protocol_phase = "response_decode"
scope.auth_state = "unauthenticated_remote"
scope.attacker_control = "remote_scval_map_keys_and_order"
scope.parser_state = "scval_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace of scValToNative scvMap arm (scval.ts:403-409) confirms no dedup, collision-throw, canonicalization, or decode-side sort blocks distinct cross-type primitive ScVal keys (string/symbol, u32/i32, bigint variants) from collapsing to one JS property; prior [1] prototype-pollution and encode-side blockers do not cover this decode-side overwrite"]
does_not_rule_out = ["Spec.scValToNative typed map decode in src/contract/spec.ts remains unassessed on this exact path", "downstream application security decisions keyed on the decoded object are application-specific and unassessed", "structured-key collapse variant tracked separately as C2"]
assumptions = ["humanizeEvents and getLedgerEntries deliver attacker-controlled ScVal from remote/untrusted sources as source-confirmed at events.ts:29,31 and rpc/server.ts:1476", "a malicious contract or RPC/Horizon server is an in-scope remote attacker per the objective impact categories"]
mechanism_brief = "scValToNative scvMap arm uses Object.fromEntries with no dedup/collision/sort guard; distinct legal cross-type primitive ScVal keys (scvString vs scvSymbol same text; scvU32/scvI32/bigint variants same value) coerce to one JS property string, so the attacker-ordered later entry silently overwrites the earlier, decoding a remote event/return value with a materially wrong value"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/scval.ts:scValToNative"
guarantee = "Object.fromEntries defines own __proto__ rather than mutating the prototype (prior [1]); this blocks prototype pollution only and does NOT prevent same-name cross-type key overwrite"

[[blockers]]
kind = "not_found"
source = "src/base/scval.ts:scValToNative"
guarantee = "no source-proven dedup, collision-throw, canonicalization, or decode-side sort prevents distinct cross-type ScVal keys from collapsing to one JS property in scvMap decode"
```
