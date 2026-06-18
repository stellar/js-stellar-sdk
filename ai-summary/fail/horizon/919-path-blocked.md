# F919: Path blocked: checkMemoRequired SEP-29 memo-required gating as a remote-driven route

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/919-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> transac ... nvelope`

Concretely investigated downstream of the seed's serialization sink:
`submitTransaction/submitAsyncTransaction -> checkMemoRequired -> loadAccount`
(SEP-29 memo-required gate, the residual lead the seed asked to resolve).

## Blocker

`checkMemoRequired` (server.ts:849-909) is a pre-serialization, best-effort
SEP-29 safety gate that never mutates the transaction: the envelope is built at
server.ts:339-340 (and :571) solely from construction-time state, after the
gate. The gate's only remote-driven decision compares the caller-selected
Horizon's `data_attr["config.memo_required"]` against the exact constant
`"MQ=="` (server.ts:57,888). A false-negative (server omits the flag, or 404 →
`NotFoundError` → `continue` at :902-906) merely silences an advisory net whose
trust model, by SEP-29 design, is the same Horizon the user already trusts for
submission; the submitted envelope stays exactly app-intended, so this is
documented caller/protocol responsibility, not an SDK integrity defect. The
false-positive direction (server fabricates the flag) is a catchable,
fail-closed `AccountRequiresMemoError` throw (:890-894) — availability only,
below the Medium floor. The loop is deduped (:875-878) and bounded by the
caller's own ≤100 operations, one sequential `loadAccount` each, so no
remote-amplified exhaustion.

## Evidence

- `src/horizon/server.ts:334-340` - memo gate runs before serialization; envelope built only from construction-time `transaction.toEnvelope()`, gate does not mutate the tx.
- `src/horizon/server.ts:849-909` - `checkMemoRequired`: dedups destinations, skips muxed `M` accounts, loads each from the same Horizon, throws on the flag, `continue`s on `NotFoundError`.
- `src/horizon/server.ts:57,888` - exact `"MQ=="` (base64 of "1") comparison against remote `data_attr["config.memo_required"]`; no encoding ambiguity an attacker can exploit to the user's net detriment beyond simply omitting the flag.

## Negative Scope

- Rules out: remote Horizon `data_attr` / memo-required gating corrupting or substituting the serialized caller envelope on `submitTransaction`/`submitAsyncTransaction`, and the gate producing a Medium+ transaction-integrity defect within the SDK trust boundary.
- Does not rule out: the inherent SEP-29 best-effort limitation that a fully malicious/compromised but caller-trusted Horizon can suppress the memo warning (out-of-scope advisory/caller-responsibility), and unrelated `loadAccount`/account-response decoding routes not on this serialization path.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-5fb6f805af186b3710202761"
weakness = "transaction_serialization"
record_kind = "residual_escalation"
path = ["<anonymous>", "transac ... nvelope"]
sink = "transac ... nvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/horizon/server.ts:checkMemoRequired", "src/horizon/server.ts:submitTransaction", "src/horizon/server.ts:loadAccount"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["faithful_caller_state_serialization", "advisory_gate_no_tx_mutation", "catchable_throw_fail_closed"]
rules_out = ["remote Horizon memo-required data_attr corrupting or substituting the serialized caller envelope on submitTransaction/submitAsyncTransaction", "checkMemoRequired mutating the transaction before toEnvelope serialization (server.ts:334-340,849-909)"]
does_not_rule_out = ["inherent SEP-29 best-effort: a malicious/compromised but caller-trusted Horizon suppresses the memo warning (advisory/caller-responsibility, out of scope)", "unrelated loadAccount/account_response decoding routes off this serialization path"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "SEP-29 memo gate reads remote data_attr config.memo_required and exact-compares to MQ==; it runs before and does not mutate the serialized envelope, so it cannot corrupt the submitted transaction; false-negative is the documented best-effort trust-the-Horizon limitation and false-positive is a fail-closed Low throw."
why_failed_brief = "gate is pre-serialization, non-mutating, advisory; envelope is faithful caller state; only material bad outcome requires a malicious caller-trusted server (out of scope) and the availability direction is below the Medium floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "envelope serialized at server.ts:339-340/571 from construction-time transaction.toEnvelope() only; checkMemoRequired performs no mutation of the transaction"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "memo-required decision is an exact-string compare of remote data_attr['config.memo_required'] to 'MQ==' (server.ts:57,888); NotFoundError handled as no-memo per SEP-29 (server.ts:902-906)"

[[blockers]]
kind = "design_trust_model"
guarantee = "SEP-29 gate by design only trusts the same caller-selected Horizon used for submission; defeating it requires a malicious trusted server, which is documented caller/protocol responsibility and out of scope"

[[blockers]]
kind = "severity_floor"
guarantee = "false-positive direction is a catchable fail-closed AccountRequiresMemoError throw (availability, Low), below the Medium severity floor; the loop is deduped and bounded by caller's <=100 operations with no remote amplification"
```
