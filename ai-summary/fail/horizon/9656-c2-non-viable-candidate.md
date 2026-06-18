# F9656-C2: Memo-required gate "fails open" on 404 destination lookup

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/9656-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

In `checkMemoRequired` (server.ts:885-907) the per-destination `loadAccount`
call is wrapped in try/catch:

- `AccountRequiresMemoError` is re-thrown (897-899) — fail-closed when the
  flag is present.
- Any error that is **not** a `NotFoundError` is re-thrown (901-904) —
  fail-closed on unexpected/transport errors.
- `NotFoundError` (404 from `accounts().accountId(dest).call()`) falls through
  to `continue` (906), treating that destination as not-memo-required.

The comment on server.ts:901 ("fail if the error is different to account not
found") confirms the 404 → `continue` branch is intentional.

## Why It Failed

This is working-as-designed SEP-29 behavior, and the candidate's claimed
Expected Behavior is not the correct expected behavior.

1. **A non-existent account cannot require a memo.** SEP-29's
   `config.memo_required` is a data attribute on an existing account. If the
   destination returns 404, there is no account and therefore no
   `config.memo_required` flag to honor; skipping it is the only correct
   semantics. The deliberate design (re-throw everything except NotFound)
   keeps the gate fail-closed for genuine errors while allowing the
   not-yet-created-destination case to proceed, which is exactly the SEP-29
   contract.

2. **Same self-defeating threat model as C1.** The 404 is only a "lever"
   under an adversarial/MITM'd Horizon. But that server controls *all*
   SDK-consumed data; a malicious server can equally return the destination
   account without the flag (C1) or fabricate a successful submission. The
   memo gate is an honest-server-dependent advisory with no SDK-independent
   source of truth for either account existence or the flag, so no
   fail-closed design can defend it against the server it queries. There is no
   SDK validation defect and no misleading API contract.

3. **Out of scope per objective.** Honest-server advisory behavior with no SDK
   validation bug, and trust-model attacks against the queried server, are out
   of scope.

## What This Rules Out

A 404 / `NotFoundError` destination lookup causing the default memo gate to
`continue` (treat destination as not-memo-required) is intended SEP-29
behavior, not a Medium+ finding: a non-existent account has no
`config.memo_required` flag, the catch block re-throws all non-NotFound
errors (fail-closed), and against an adversarial Horizon no fail-closed design
is possible.

## What This Does Not Rule Out

- The body-field input shape (missing/altered `data_attr`) adjudicated
  separately as C1.
- A defect where a non-`NotFoundError` is mis-classified and wrongly swallowed
  on an honest server — not observed here (server.ts:901-904 re-throws all
  non-NotFound errors).
- Envelope-corruption variants already adjudicated on route js-sdk-865e0d63.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-2c414395835c0e06dd693296"
weakness = "memo-required safety gate fails open on 404 destination lookup from adversarial remote server"
record_kind = "single_path"
path = ["submitAsyncTransaction", "post"]
sink = "post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/horizon/server.ts:checkMemoRequired", "src/horizon/server.ts:loadAccount"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["working_as_designed_sep29_advisory", "notfound_means_no_account_no_flag", "no_failclosed_possible_for_server_dependent_advisory"]
rules_out = ["404/NotFoundError on a destination lookup making the memo gate continue is intended SEP-29 behavior: a non-existent account has no config.memo_required, all non-NotFound errors are re-thrown fail-closed, and no fail-closed design is possible against an adversarial Horizon"]
does_not_rule_out = ["missing/altered data_attr body-field input shape adjudicated as C1", "honest-server mis-classification of a non-NotFound error", "envelope-corruption variant on route js-sdk-865e0d63"]
assumptions = ["accounts().accountId(dest).call() raises NotFoundError on HTTP 404; a 404 destination has no account and therefore no config.memo_required attribute (server.ts:885-907)"]
mechanism_brief = "checkMemoRequired catch (server.ts:896-907) re-throws AccountRequiresMemoError and all non-NotFound errors (fail-closed) but lets NotFoundError continue. A non-existent (404) account cannot carry config.memo_required, so skipping it is correct SEP-29 semantics; the 404 lever only exists under an adversarial Horizon that already controls all SDK-consumed data."
why_failed_brief = "working-as-designed SEP-29 advisory; non-existent account has no memo flag and the gate cannot fail closed against the server it queries"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/server.ts:checkMemoRequired"
guarantee = "catch re-throws AccountRequiresMemoError (897-899) and all non-NotFound errors (901-904); only genuine 404 continues, which is correct since a non-existent account has no memo flag"

[[blockers]]
kind = "design_invariant"
source = "src/horizon/server.ts:checkMemoRequired"
guarantee = "the 404 lever requires an adversarial Horizon that already controls all SDK-consumed data; a server-dependent advisory check has no SDK-independent source of truth and cannot fail closed against that server"
```
