# F1013: Path blocked: Async/sync submission transaction serialization cluster

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/1013-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`submitAsyncTransaction -> transaction.toEnvelope().toXDR()` (and the sibling
`submitTransaction -> transaction.toEnvelope().toXDR()`)

## Blocker

The caller envelope is serialized to XDR **before** any network I/O on both
submission entrypoints (`server.ts:340`, `server.ts:571`), and the serializer
`Transaction.toEnvelope` is deterministic on caller construction state only: it
rebuilds the envelope from a `this.tx.toXDR()` round-trip plus a copy of
`this.signatures` (`transaction.ts:279-308`). The single pre-serialization step,
`checkMemoRequired`, is read-only — it iterates `transaction.operations`, loads
destination accounts, and throws `AccountRequiresMemoError`/propagates errors
fail-closed without mutating the transaction (`server.ts:849-909`). Decoded
`result_xdr`/`offerResults` are returned to the caller and never re-read by the
SDK for signing, fee, auth, sequence, or resubmission (`server.ts:355-527`,
async returns raw `response.data` at `server.ts:584`). No remote Horizon
response or pre-serialization memo load can alter the exact transaction the
caller serialized and submitted.

## Per-Target Disposition

- `submitTransaction` / `submitAsyncTransaction`: serialization runs pre-POST;
  remote response cannot affect serialized bytes. Blocked.
- `toEnvelope`: deterministic from `this.tx` round-trip + copied signatures.
  Blocked.
- `toXDR`: thin wrapper over `toEnvelope().toXDR()` (`transaction_base.ts:240`).
  Blocked transitively.
- `transac ... nvelope` / `transac ... ).toXDR` / `<anonymous>`: same shared
  serializer; covered by the toEnvelope invariant.
- Result-XDR decoding (`server.ts:355-527`): a different (downstream)
  response-decode sink; output is a leaf return value, fail-closed on parse
  error. Left open as a distinct route, see Negative Scope.

## Evidence

- `src/horizon/server.ts:340` - sync `transaction.toEnvelope().toXDR()` runs before the POST at 349-353.
- `src/horizon/server.ts:571` - async `transaction.toEnvelope().toXDR()` runs before the POST at 580-583; `.then` returns raw `response.data` (584).
- `src/base/transaction.ts:279-308` - `toEnvelope` builds envelope from `this.tx.toXDR()` round-trip and `this.signatures.slice()`; no remote input.
- `src/horizon/server.ts:849-909` - `checkMemoRequired` reads operations/memo, loads accounts read-only, throws fail-closed; no tx mutation.
- `src/horizon/server.ts:355-527` - decoded `result_xdr`/`offerResults` returned to caller, never re-read by SDK.

## Negative Scope

- Rules out: remote Horizon response or pre-serialization memo-required account
  loads corrupting or substituting the serialized caller envelope on
  `submitTransaction`/`submitAsyncTransaction`, and decoded `result_xdr` being
  re-read by the SDK for signing/fee/auth/sequence/resubmission.
- Does not rule out: (a) resource/parse behavior of the downstream
  result-XDR/offerResults decode path on a malicious-server response
  (`server.ts:355-527`) as a distinct response-decode sink; (b) the separately
  reported VIABLE timebounds route `getCurrentServerTime`/`fetchTimebounds`
  setting `maxTime` from an unbounded server date (route
  `js-sdk-1081a18ffde6555aa858c026`); (c) SEP-29 trust in a malicious
  caller-selected Horizon, which is documented caller responsibility.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-865e0d639f2bb0ab25b1a662"
weakness = "transaction serialization integrity"
record_kind = "area_seed"
path = ["submitAsyncTransaction", "transac ... ).toXDR"]
sink = "transac ... ).toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["submitAsyncTransaction", "toXDR", "toEnvelope", "<anonymous>", "transac ... nvelope", "transac ... ).toXDR", "submitTransaction"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["serialize_before_network_io", "faithful_caller_state_serialization", "advisory_gate_no_tx_mutation", "decode_output_is_leaf_return_value"]
rules_out = ["remote Horizon response or pre-serialization memo-required loads corrupting or substituting the serialized caller envelope on submitTransaction/submitAsyncTransaction", "decoded result_xdr being re-read by the SDK for signing/fee/auth/sequence/resubmission"]
does_not_rule_out = ["downstream result_xdr/offerResults decode resource or parse behavior on a malicious-server response (server.ts:355-527)", "timebounds maxTime from unbounded server date route js-sdk-1081a18ffde6555aa858c026", "SEP-29 trust in malicious caller-selected Horizon (documented caller responsibility)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Caller envelope is serialized via toEnvelope/toXDR before the network POST and the serializer is deterministic on caller construction state, so no remote response or memo load can alter the submitted transaction."
why_failed_brief = "serialization runs pre-network and is deterministic from this.tx round-trip plus copied signatures; checkMemoRequired is read-only fail-closed; decoded results are leaf return values never re-read by the SDK."
confidence = "high"

[[sanitizer_guarantees]]
kind = "ordering_invariant"
guarantee = "toEnvelope().toXDR() serialization at server.ts:340/571 executes before the POST, so the remote response cannot influence serialized bytes"

[[sanitizer_guarantees]]
kind = "deterministic_serializer"
guarantee = "Transaction.toEnvelope builds the envelope only from this.tx.toXDR() round-trip and a copy of this.signatures (transaction.ts:279-308); no remote data enters"

[[sanitizer_guarantees]]
kind = "read_only_gate"
guarantee = "checkMemoRequired reads operations/memo and loads accounts read-only, throws fail-closed, and does not mutate the transaction (server.ts:849-909)"

[[blockers]]
kind = "leaf_return_value"
guarantee = "decoded result_xdr/offerResults are returned to the caller and never re-read by the SDK for signing/fee/auth/sequence/resubmission (server.ts:355-527; async returns raw response.data at 584)"
```
