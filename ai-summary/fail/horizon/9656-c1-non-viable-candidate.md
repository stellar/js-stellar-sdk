# F9656-C1: Memo-required gate "fails open" on altered data_attr response

**Date**: 2026-06-18
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/9656-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`submitTransaction` (server.ts:328-337) and `submitAsyncTransaction`
(server.ts:559-568) both call `this.checkMemoRequired(transaction)` by default
(only skipped when the caller sets `skipMemoRequiredCheck`). Confirmed in
source: the gate is an SDK default, not a caller opt-in, so the hypothesis is
correct on that point.

`checkMemoRequired` (server.ts:849-909):
- returns early if the transaction already carries a memo (856-858);
- iterates payment/pathPayment*/accountMerge destinations, skips `M...`
  muxed addresses (881-883);
- for each remaining destination calls `loadAccount` (886) and throws
  `AccountRequiresMemoError` only when
  `account.data_attr["config.memo_required"] === ACCOUNT_REQUIRES_MEMO`
  where `ACCOUNT_REQUIRES_MEMO = "MQ=="` (server.ts:57, 887-895).

`loadAccount` (server.ts:796-800) maps the remote account JSON into
`AccountResponse`; `data_attr` is copied from the remote response. The strict
`=== "MQ=="` comparison is real and any other shape yields "no memo required".

## Why It Failed

The candidate's stated **Expected Behavior** ("fail closed when it cannot
positively confirm the destination is safe") is not the correct expected
behavior, so this is working-as-designed, not a bug.

1. **Fail-closed on absence is not a viable design and is not SEP-29.** The
   `config.memo_required` data attribute is *absent* on the overwhelming
   majority of Stellar accounts (only accounts that explicitly opt into SEP-29
   set it). If `checkMemoRequired` threw on anything other than the exact
   `"MQ=="` value, it would block essentially every legitimate memo-less
   payment to every normal account, making the SDK unusable. The strict
   present-and-equal check (server.ts:887-888) is the only correct SEP-29
   semantics: absence/other-value means "this account did not request a memo".

2. **The threat model defeats the entire feature regardless of
   implementation.** The check is fundamentally a query to the
   caller-selected Horizon server; the SDK has no independent source of truth
   for `config.memo_required`. Under the hypothesis's posited adversarial /
   MITM'd Horizon, the server controls *all* SDK-consumed data — account
   existence, balances, sequence numbers, submission results, and this flag
   alike. A Byzantine server that wants the memo gate to pass simply returns
   the destination account without the flag; there is no fail-closed design
   that can defend a server-data-dependent advisory check against the server
   itself. The gate's contract is "warn if Horizon honestly reports the flag",
   which it satisfies (it fires correctly on an honest server returning
   `"MQ=="`). There is no SDK-level unsafe default and no misleading API
   contract.

3. **Out of scope per objective.** The objective excludes behavior that is an
   honest-server advisory with no SDK validation bug, and network/trust-model
   attacks without an SDK validation defect. The memo gate is SEP-29 compliant
   and contains no validation defect on the honest-server path.

## What This Rules Out

A non-`"MQ=="` / missing `config.memo_required` value in the remote account
response causing the default memo gate to fail open is *intended* SEP-29
behavior, not a Medium+ finding: failing closed on absence would block all
normal payments, and against an adversarial Horizon no fail-closed design is
possible because the flag has no SDK-independent source of truth.

## What This Does Not Rule Out

- A defect where `data_attr` decoding itself is incorrect for an *honest*
  server (e.g. a real account that sets `"MQ=="` but the SDK fails to fire) —
  not observed here, but a distinct honest-server correctness claim.
- The 404 / NotFound input shape is adjudicated separately as C2.
- Envelope-corruption variants already adjudicated on route js-sdk-865e0d63.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-2c414395835c0e06dd693296"
weakness = "memo-required safety gate fails open on adversarial remote account response"
record_kind = "single_path"
path = ["submitAsyncTransaction", "post"]
sink = "post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/horizon/server.ts:checkMemoRequired", "src/horizon/server.ts:loadAccount", "src/horizon/server.ts:submitAsyncTransaction"]
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
negative_claim.rules_out_codes = ["working_as_designed_sep29_advisory", "no_failclosed_possible_for_server_dependent_advisory", "wrong_expected_behavior"]
rules_out = ["non-MQ==/missing config.memo_required causing memo gate to pass is intended SEP-29 behavior: failing closed on absence would block all normal payments and there is no SDK-independent source of truth for the flag against an adversarial server"]
does_not_rule_out = ["honest-server decoding correctness of data_attr for a genuine MQ== account", "404/NotFound input shape adjudicated as C2", "envelope-corruption variant on route js-sdk-865e0d63"]
assumptions = ["config.memo_required is absent on the majority of accounts (SEP-29 opt-in); loadAccount data_attr is the sole SDK source for the flag (server.ts:796-800,886-888)"]
mechanism_brief = "checkMemoRequired (server.ts:887-888) throws only on exact data_attr['config.memo_required'] === 'MQ=='; any other value passes. This is correct SEP-29 semantics: absence means not-required, and the check is an honest-server-dependent advisory with no SDK-independent source of truth, so it cannot fail closed against the server it queries."
why_failed_brief = "working-as-designed SEP-29 advisory; hypothesis's fail-closed expected behavior is incorrect and no fail-closed design is possible against an adversarial Horizon"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/horizon/server.ts:checkMemoRequired"
guarantee = "strict === 'MQ==' is correct SEP-29 present-and-equal semantics; firing on any other value would block all normal memo-less payments"

[[blockers]]
kind = "design_invariant"
source = "src/horizon/server.ts:checkMemoRequired"
guarantee = "config.memo_required has no SDK-independent source of truth; an advisory gate that queries Horizon cannot fail closed against an adversarial Horizon, and the honest-server path is correct"
```
