# F948: scvMap structured/non-string key collapse in standalone scValToNative

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/947-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The structured-key coercion claimed by the candidate is confirmed in current
source. In `scValToNative` (`src/base/scval.ts:375`):

- `scvVec` decodes to a JS `Array` (scval.ts:397-398).
- `scvMap` decodes to a plain object (scval.ts:403-409).
- `scvBytes` returns `scv.value()`, a `Uint8Array` (scval.ts:413-416).
- `scvAddress` decodes to a `string` (scval.ts:400-401).

When such a decoded value is used as a `scvMap` key in the same
`Object.fromEntries` call (scval.ts:404-408), JS `ToPropertyKey` coerces it:
objects/maps become `"[object Object]"`, arrays and typed arrays become their
comma-joined string. So distinct structured keys (e.g. two different `scvMap`
keys, or `scvVec([1])` vs `scvBytes([1])`) collapse to one JS property, with
raw map order deciding the surviving entry. There is no branch in scval.ts:403-409
that detects or rejects a non-primitive decoded key. Confirmed.

Reachability for the named sinks is identical to C1: `extractEvent`
(`src/base/events.ts:29,31`) via the exported `humanizeEvents`, and
`getSACBalance` (`src/rpc/server.ts:1476`).

## Why It Failed

The same disposition as C1 applies, and the structured-key variant is in fact a
weaker case (real-world Soroban maps and SAC balance structs use symbol keys,
not structured keys).

1. **No confused deputy.** A structured-key collision is only dangerous when an
   honest party commits the full map and a second party acts on the collapsed
   map. On both named sinks the injecting party is the party whose value the
   victim consumes: a malicious contract fully controls its own emitted event
   data (events.ts:31), and a malicious/compromised RPC server fully controls the
   `getLedgerEntries` response (server.ts:1476). The SDK does not verify decoded
   `humanizeEvents` output against any contract-authenticated hash, so the
   collapse grants no capability beyond the attacker's existing full control.

2. **No SDK security decision on the collapsed map.** `humanizeEvents` is an
   explicit presentation helper (events.ts:35-47); `getSACBalance` returns
   caller-requested data from a caller-trusted server. Neither signs or hashes
   the raw ScVal map and then acts on the collapsed native version.

3. **Severity floor.** Impact is at most an undocumented lossy-decode /
   data-fidelity issue (the scval.ts JSDoc does not warn that structured/colliding
   map keys are lossy) — Low/informational, which is below the Medium minimum and
   explicitly out of scope.

Prior memory [1] (same `route_id`) ruled out prototype pollution and the
encode-side path; this trace disposes of the decode-side structured-key mode on
the merits rather than as a typed duplicate.

## What This Rules Out

The structured/non-string key collapse mode (`scvMap`/`scvVec`/`scvBytes`/
`scvAddress` keys coerced to `"[object Object]"` or joined strings) in standalone
`scValToNative` `scvMap` decode, reached via `humanizeEvents` and
`getSACBalance`, as a Medium-or-higher finding: ruled out because the injecting
party already controls the decoded value and no SDK security decision diverges.

## What This Does Not Rule Out

- The same structured-key collapse reaching a sink with an honest map constructor
  and a separate SDK security decision on the collapsed map (e.g.
  `buildInvocationTree` auth-entry display in `src/base/invocation.ts:120` vs raw
  signed XDR) — not assessed under this candidate's named sinks.
- `Spec.scValToNative` typed map decode (`src/contract/spec.ts:985,1050`).
- Application-layer decisions keyed on the decoded object.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-63809a71507c05b9211d309d"
weakness = "remote_scval_map_decode_structured_key_collapse"
record_kind = "single_path"
path = ["humanizeEvents", "scValToNative"]
sink = "scValToNative"
sink_role = "remote_response_decode"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/scval.ts:scValToNative", "src/base/events.ts:extractEvent", "src/rpc/server.ts:getSACBalance"]
scope.trust_boundary = "remote_rpc_or_contract_response"
scope.protocol_phase = "response_decode"
scope.auth_state = "unauthenticated_remote"
scope.attacker_control = "remote_scval_map_keys_and_order"
scope.parser_state = "scval_decoded"
scope.size_class = "small"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["no_privilege_escalation_injector_already_controls_decoded_value", "below_medium_severity_floor_informational_lossy_decode"]
rules_out = ["structured/non-string scvMap key collapse in standalone scValToNative via humanizeEvents and getSACBalance as a Medium+ finding: structured keys coerce to '[object Object]'/joined strings but the only injecting party on these paths already fully controls the decoded value, so the collapse grants no escalation and no SDK security decision consumes the collapsed map"]
does_not_rule_out = ["same collapse reaching a sink with an honest map constructor and a separate SDK security decision on the collapsed map (e.g. buildInvocationTree auth-entry display vs raw signed XDR in src/base/invocation.ts:120)", "Spec.scValToNative typed map decode in src/contract/spec.ts:985", "application-layer decisions keyed on the decoded object"]
assumptions = ["events.ts and rpc/server.ts decode attacker-controlled remote ScVal as source-confirmed", "the SDK does not verify decoded humanizeEvents output against a contract-authenticated hash on this path", "a malicious contract/RPC server already controls the full response/event value on these two sinks"]
mechanism_brief = "scValToNative scvMap decode (scval.ts:403-409) uses Object.fromEntries with no non-primitive-key guard, so decoded structured keys (scvMap->object, scvVec->Array, scvBytes->Uint8Array, scvAddress->string) coerce via ToPropertyKey to '[object Object]' or joined strings, collapsing distinct structured keys to one JS property with attacker-ordered last-write-wins"
why_failed_brief = "real lossy-decode behavior but no confused-deputy and no SDK security decision on the collapsed map; injector already fully controls the decoded value on both named sinks, so impact is Low/informational data-fidelity, below the Medium floor and out of scope"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "not_found"
source = "src/base/scval.ts:scValToNative"
guarantee = "no branch in the scvMap decode arm detects or rejects a non-primitive decoded key before assigning it as a property; Object.fromEntries performs no collision guard"

[[blockers]]
kind = "scope_no_escalation"
source = "src/base/events.ts:extractEvent and src/rpc/server.ts:getSACBalance"
guarantee = "on both named sinks the party able to inject structured colliding ScVal keys (malicious contract for events, malicious RPC server for ledger entries) already fully controls the decoded value and no SDK signing/auth decision consumes the collapsed map, so the collapse yields no capability beyond existing full response control"
```
