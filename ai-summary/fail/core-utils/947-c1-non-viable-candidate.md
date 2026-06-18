# F947: scvMap cross-type primitive key collision in standalone scValToNative

**Date**: 2026-06-18
**Subsystem**: core-utils
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/core-utils/947-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The decode sink is confirmed in current source. `scValToNative`
(`src/base/scval.ts:375`) handles `scvMap` at lines 403-409 by building a plain
object with `Object.fromEntries` over `[scValToNative(key), scValToNative(val)]`
pairs. There is no dedup, no collision throw, no canonicalization, and no
decode-side sort. The cross-type key coercions claimed by the candidate are real:

- `scvU32`/`scvI32` both return `scv.value()` as a JS `number` (scval.ts:412-416),
  so `scvU32(1)`/`scvI32(1)` both coerce to the property `"1"`.
- `scvU64`/`scvI64` return `toBigInt()` (scval.ts:384-386) and `scvU128`…`scvI256`
  return `scValToBigInt` (scval.ts:391-395); `1n` also coerces to `"1"`.
- `scvSymbol` (scval.ts:427-440) and `scvString` (scval.ts:441-454) both decode to
  the same JS `string`, so `scvSymbol("amount")`/`scvString("amount")` both coerce
  to `"amount"`.

`Object.fromEntries` therefore lets a later entry silently overwrite an earlier
one for any colliding key, with raw map order deciding the winner.

Remote reachability of the standalone function is also confirmed for the two
sinks named in the candidate:

- `src/base/events.ts:extractEvent:14-33` calls `scValToNative` on every topic
  (line 29) and on event `data` (line 31); reached by the exported
  `humanizeEvents` (events.ts:48-60).
- `src/rpc/server.ts:1476` (`getSACBalance`) calls `scValToNative` on a
  `getLedgerEntries` contractData value and the SDK then reads `entry.amount`,
  `entry.authorized`, `entry.clawback` (server.ts:1486-1488).

## Why It Failed

The collapse behavior is genuine, but it confers **no escalation over the
capability the injecting party already holds**, and no in-scope sink turns it
into a security decision. It is therefore at most a Low/informational
data-fidelity / undocumented-lossy-decode issue, which is below the Medium floor
and explicitly out of scope.

1. **No confused deputy on either sink.** A key collision only becomes a
   vulnerability when an honest party constructs/commits the full map and a
   second party then acts on the collapsed map. On these paths the only party
   able to inject distinct-but-colliding ScVal keys is the *same* party whose
   value the victim consumes:
   - `humanizeEvents`/`extractEvent` decodes on-chain event data. A malicious
     contract that emits a colliding-key map already fully controls its own
     emitted event data — it can simply emit whatever single value it wants. The
     SDK does not verify the decoded events against any contract-authenticated
     hash here; it decodes whatever XDR it is handed. A malicious RPC server
     rewriting an honest contract's events likewise already controls the full
     response bytes, so the collision adds nothing.
   - `getSACBalance` decodes a `getLedgerEntries` response. A malicious/compromised
     RPC server already fully controls the returned balance fields and can lie
     about `amount`/`authorized`/`clawback` directly; the SAC balance struct uses
     distinct, non-colliding keys, so the collision yields no extra power.

2. **No SDK-internal security decision consumes the collapsed map.**
   `humanizeEvents` is explicitly a "human-readable" presentation helper
   (events.ts:35-47) and the SDK makes no signing/auth decision on it.
   `getSACBalance` returns caller-requested data from a server the caller chose
   to trust. Neither path signs or hashes the raw ScVal map and then acts on the
   collapsed native version (contrast the genuine display-vs-signed divergence in
   prior reviewed records [2]/[3] for `allowTrust`, where the SDK signs raw bytes
   that diverge from a masked decode).

3. **Severity floor.** Because the collision grants no capability beyond the
   attacker's existing full control of the same response/event, and changes no
   SDK security decision, the realistic impact is data-fidelity / documentation
   only — Low/informational. The objective sets a Medium minimum and lists
   "Low and informational issues" and "behavior that is documented as caller
   responsibility and has no SDK-level unsafe default" as out of scope.

This is consistent with prior memory [1] (same `route_id`
`js-sdk-63809a71507c05b9211d309d`), which ruled out prototype pollution and the
encode-side path but left the decode-side key-collision mode open; the trace
above disposes of the decode-side mode on the merits (no escalation / below
severity floor) rather than as a typed duplicate.

## What This Rules Out

The specific cross-type primitive key-collision mode (`scvU32`/`scvI32`/`scvU64`/
`scvU128` → same numeric/bigint property; `scvSymbol`/`scvString` → same string
property) in standalone `scValToNative` `scvMap` decode, reached via
`humanizeEvents` (event topics/data) and `getSACBalance` (ledger contractData),
as a Medium-or-higher remote-response-trust-confusion finding: ruled out because
the injecting party already controls the decoded value and no SDK security
decision diverges.

## What This Does Not Rule Out

- The same collision reaching a *different* sink where an honest party commits
  the full map and a separate SDK security decision consumes the collapsed map
  (e.g., auth-entry display via `buildInvocationTree` in
  `src/base/invocation.ts:120` vs raw signed XDR) — not assessed under this
  candidate's named sinks.
- `Spec.scValToNative` typed map decode (`src/contract/spec.ts:985,1050`), a
  separate method, remains unassessed here.
- Application-layer security decisions keyed on the decoded object remain the
  application's responsibility and could still be unsafe in caller code.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "core-utils"
route_id = "js-sdk-63809a71507c05b9211d309d"
weakness = "remote_scval_map_decode_key_collision"
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
rules_out = ["cross-type primitive scvMap key collision in standalone scValToNative via humanizeEvents and getSACBalance as a Medium+ remote-response-trust-confusion finding: the only party able to inject colliding distinct ScVal keys on these paths already fully controls the decoded value, so the collision grants no escalation, and no SDK signing/auth decision consumes the collapsed map"]
does_not_rule_out = ["same collision reaching a sink with an honest map constructor and a separate SDK security decision on the collapsed map (e.g. buildInvocationTree auth-entry display vs raw signed XDR in src/base/invocation.ts:120)", "Spec.scValToNative typed map decode in src/contract/spec.ts:985", "application-layer decisions keyed on the decoded object"]
assumptions = ["events.ts and rpc/server.ts decode attacker-controlled remote ScVal as source-confirmed", "the SDK does not verify decoded humanizeEvents output against a contract-authenticated hash on this path", "a malicious contract/RPC server already controls the full response/event value on these two sinks"]
mechanism_brief = "scValToNative scvMap decode (scval.ts:403-409) uses Object.fromEntries with no dedup/collision/sort, so distinct cross-type primitive ScVal keys (scvU32/scvI32/scvU64/scvU128 -> same number/bigint property; scvSymbol/scvString -> same string property) collapse to one JS property with attacker-ordered last-write-wins"
why_failed_brief = "real lossy-decode behavior but no confused-deputy and no SDK security decision on the collapsed map; injector already fully controls the decoded value on both named sinks, so impact is Low/informational data-fidelity, below the Medium floor and out of scope"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/base/scval.ts:scValToNative"
guarantee = "Object.fromEntries defines an own __proto__ rather than mutating the prototype (blocks prototype pollution) but performs no dedup/collision/sort, so it does not prevent same-name key overwrite"

[[blockers]]
kind = "scope_no_escalation"
source = "src/base/events.ts:extractEvent and src/rpc/server.ts:getSACBalance"
guarantee = "on both named sinks the party able to inject colliding ScVal keys (malicious contract for events, malicious RPC server for ledger entries) already fully controls the decoded value and no SDK signing/auth decision consumes the collapsed map, so the collision yields no capability beyond existing full response control"
```
