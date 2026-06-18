# F908: Path blocked: catchable throw from toEnvelope on a malformed caller transaction

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/908-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> toEnvelope`

Escalated residual re-investigation of the specific lead: can `Transaction.toEnvelope()`
throw a catchable error on a malformed caller transaction during Horizon
submission, and does that reach Medium severity?

## Blocker

`toEnvelope` (src/base/transaction.ts:279-308) builds the envelope solely from
caller-construction state: `this.tx.toXDR()` (line 280), a copy of
`this.signatures` (line 281), and a switch on `this._envelopeType`. The three
throw sites — `this.tx.toXDR()` marshalling, `xdr.Transaction(V0).fromXDR(rawTx)`
round-trip (lines 288/296), and the default-branch `throw new Error(...)` (lines
302-304) — depend only on a caller-supplied, locally-constructed `Transaction`.
At the submission call sites (server.ts:340, 571) `toEnvelope` runs synchronously
inside the async method **before** any network POST, so the remote Horizon
response cannot influence it, and any throw fail-closes into a catchable promise
rejection with no envelope sent. Producing the throw requires the caller to
malform their own transaction (a buggy/malicious application against its own
submission): Low availability, below the Medium floor and out of scope.

## Evidence

- `src/base/transaction.ts:279-308` - toEnvelope reads only `this.tx`, `this.signatures`, `this._envelopeType`; default arm throws an Error, fromXDR/toXDR are the only other throw sites, all caller-state driven.
- `src/horizon/server.ts:339-341` - submitTransaction serializes `transaction.toEnvelope()` synchronously before the POST; a throw rejects the returned promise (catchable, fail-closed, no network effect).
- `src/horizon/server.ts:571` - submitAsyncTransaction has the identical pre-POST serialize ordering, so the same fail-closed property holds.

## Negative Scope

- Rules out: a remote Horizon response, or any post-network state, corrupting or triggering a throw inside `toEnvelope`; and treating a caller-malformed-transaction catchable throw as a Medium+ availability/integrity finding.
- Does not rule out: downstream decode-path behavior on `result_xdr` after the POST (server.ts:359-386), which is a distinct sink already covered by separate route records.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-6875e3823921de2ccc10a578"
weakness = "transaction_serialization"
record_kind = "residual_escalation"
path = ["<anonymous>", "toEnvelope"]
sink = "toEnvelope"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/base/transaction.ts:toEnvelope", "src/horizon/server.ts:submitTransaction", "src/horizon/server.ts:submitAsyncTransaction"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["faithful_caller_state_serialization", "serialize_before_network_io", "catchable_throw_fail_closed"]
rules_out = ["remote Horizon response (or any post-network state) triggering or corrupting a throw inside toEnvelope: serialization at server.ts:340/571 runs before the POST and reads only construction-time this.tx/this.signatures/this._envelopeType (transaction.ts:279-308)", "treating a caller-malformed-transaction catchable throw from toEnvelope as Medium+ severity: it is a fail-closed Low-availability throw requiring the caller to malform its own submission"]
does_not_rule_out = ["downstream result_xdr decode behavior after the POST (server.ts:359-386), a distinct already-recorded sink"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "toEnvelope can throw (default-arm Error at transaction.ts:302, or toXDR/fromXDR marshalling) only on caller-supplied malformed transaction state; it runs synchronously before the network POST so the throw is catchable and fail-closed and the remote response cannot reach it"
why_failed_brief = "catchable fail-closed throw is Low availability, requires caller to malform its own transaction (out of scope), and remote response cannot influence pre-POST serialization; below Medium floor"
confidence = "high"

[[sanitizer_guarantees]]
kind = "ordering_guard"
guarantee = "toEnvelope serialization at server.ts:340/571 executes synchronously before any network POST, so the remote response cannot influence or trigger the throw"

[[sanitizer_guarantees]]
kind = "faithful_serialization"
guarantee = "toEnvelope derives the envelope only from caller construction state (this.tx round-trip, copied this.signatures, this._envelopeType) with no external input (transaction.ts:279-308)"

[[blockers]]
kind = "severity_floor"
guarantee = "the worst observable effect is a catchable, fail-closed throw (Low availability) requiring a caller-malformed transaction against its own submission, below the Medium severity floor and within the malicious/buggy-developer out-of-scope exclusion"
```
