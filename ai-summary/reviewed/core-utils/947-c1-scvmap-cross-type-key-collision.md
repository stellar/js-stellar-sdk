# R9471: Cross-type ScVal map keys silently collapse in standalone scValToNative

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/947-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The standalone `scValToNative` (`src/base/scval.ts:375`) decodes an `scvMap`
arm (`scval.ts:403-409`) as:

```
Object.fromEntries(
  (scv.map() ?? []).map(entry => [
    scValToNative(entry.key()),
    scValToNative(entry.val()),
  ]),
)
```

Source-confirmed key-coercion facts:
- `scval.ts:412-416` — `scvU32` and `scvI32` both return `scv.value()` as a JS
  `number`; both produce the same property string (e.g. `1` -> `"1"`).
- `scval.ts:384-386` — `scvU64`/`scvI64` return a JS `bigint`; `scval.ts:391-395`
  — `scvU128`/`scvI128`/`scvU256`/`scvI256` return a `bigint` via
  `scValToBigInt`. A `bigint` `1n` and a `number` `1` both coerce to the
  property string `"1"`, so distinct integer ScVal types collide.
- `scval.ts:427-440` (`scvSymbol`) and `scval.ts:441-454` (`scvString`) both
  return a JS `string`; `scvSymbol("amount")` and `scvString("amount")` produce
  the identical property `"amount"`.

`Object.fromEntries` assigns each `[k, v]` as an own property after
`ToPropertyKey`; there is **no** dedup, collision-throw, canonicalization, and
(unlike the encode side at `scval.ts:242`, which `.sort()`s map entries) **no**
sort on decode. For two entries whose decoded native keys coerce to the same
property string, the later entry in raw map order overwrites the earlier, which
is silently dropped. Raw map order is attacker-controlled in a remote response.

Remote reachability of the standalone function with attacker-controlled ScVal
is source-confirmed:
- `src/base/events.ts:29,31` — `extractEvent` calls `scValToNative` on every
  event topic and on event `data`; reached via the exported
  `humanizeEvents` (`events.ts:48`) over `xdr.ContractEvent`/
  `xdr.DiagnosticEvent` from RPC/Horizon responses or untrusted contract events.
- `src/rpc/server.ts:1476` — `scValToNative(val.contractData().val())` on a
  ledger-entry value returned by `getLedgerEntries` (remote response).

## Findings

This is a result-decode ambiguity (remote-response trust confusion). Two
distinct, individually-legal Soroban map entries (distinct ScVal keys of
different type/encoding) decode to a single JS object property; the SDK keeps
only the attacker-ordered last entry and silently discards the other. An
application that reads `decoded["amount"]` or enumerates the decoded map
receives the attacker-chosen value and cannot observe that a second legal entry
existed.

Severity is Medium, not High: the decoded object is returned to the application
and no SDK-internal signing/auth decision is shown consuming a colliding key on
this path. On the `rpc/server.ts:1476` SAC-balance path the consumed keys
(`amount`/`authorized`/`clawback`) do not collide with each other, so collision
adds no new capability there; the material impact is on the
`humanizeEvents`/general-`scValToNative` decode path returned to callers. This
clears the Medium floor for "remote response decoded into a materially wrong
event/return value" and "parsing ambiguity that changes user-visible security
decisions."

The expected behavior — preserve both distinct on-chain entries, or at minimum
not silently substitute one accepted value for another — is genuinely violated
in source; the JSDoc does not warn that map decode is lossy for colliding keys.

## PoC Guidance

- **Test file**: append to `test/unit/scval_test.js` (or the existing scval
  unit test) and/or an events decode test under `test/unit`.
- **Setup**: build two `xdr.ScMapEntry` values whose keys are distinct ScVals
  that decode to the same JS property, e.g. `xdr.ScVal.scvSymbol("amount")` and
  `xdr.ScVal.scvString("amount")`, or `xdr.ScVal.scvU32(1)` and an
  `xdr.ScVal.scvU64` of `1n`; give them different values.
- **Steps**: assemble `xdr.ScVal.scvMap([entryA, entryB])` and call
  `scValToNative(map)`. Repeat with the entry order reversed.
- **Assertion**: assert the decoded object has only one property for the
  colliding key and that its value equals whichever entry came last — i.e. the
  earlier entry was silently dropped and the result flips with input order. No
  network calls required.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-63809a71507c05b9211d309d"
weakness = "result_decode_ambiguity"
record_kind = "single_path"
path = ["humanizeEvents", "scValToNative.scvMap"]
sink = "Object.fromEntries"
sink_role = "scval_map_decode"
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
negative_claim.rules_out_codes = ["candidate_not_blocked_by_prior_prototype_pollution_record"]
rules_out = ["source trace confirms prior record [1] only ruled out prototype pollution and the encode-side caller-configured path; the decode-side cross-type key collision in scValToNative scvMap is unguarded and not disposed of by that record"]
does_not_rule_out = ["Spec.scValToNative typed map decode in src/contract/spec.ts remains a separate unassessed path", "downstream application security decisions keyed on the decoded object are not enumerated here"]
assumptions = ["a malicious/compromised contract or RPC server can return an scvMap with two entries whose distinct ScVal keys coerce to the same JS property, which is within the remote-response trust boundary"]
mechanism_brief = "scValToNative scvMap decode uses Object.fromEntries with no dedup/collision/sort guard; distinct cross-type primitive ScVal keys (scvU32/scvI32 number, scvU64/scvU128 bigint, scvSymbol/scvString string) coerce to the same JS property and the attacker-ordered later entry silently overwrites the earlier"
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/scval.ts:scValToNative"
guarantee = "Object.fromEntries defines own properties rather than mutating the prototype (blocks prototype pollution) but does NOT prevent same-name key overwrite of distinct cross-type ScVal keys"

[[blockers]]
kind = "not_found"
source = "src/base/scval.ts:scValToNative"
guarantee = "no dedup, collision-throw, canonicalization, or decode-side sort prevents distinct primitive ScVal keys from collapsing to one JS property"
```
