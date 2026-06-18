# F1035: Path blocked: caller transaction serialization on RPC submission path

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/1035-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`_sendTransaction -> toXDR`

Area seed covering the `transaction_serialization` sibling set: `_sendTransaction`,
`_simulateTransaction`, `transaction.toXDR`, `assembleTransaction`, `toEnvelope`,
`toXDR`, `getLedgerEntries`, `getContractData`, `key.toXDR`, `raw.toEnvelope`.

## Blocker

Every `toXDR`/`toEnvelope` sink in this set serializes a **caller-owned** object
with no remote response mixed into the bytes at the sink. `_sendTransaction`
serializes the caller's transaction verbatim (`server.ts:1202`); the RPC
response is parsed only afterward and is a leaf (prior `js-sdk-c92e450a`).
`_simulateTransaction` serializes the caller transaction (`server.ts:1051`).
`getContractData`/`getLedgerEntries` build the ledger key purely from caller
args before `key.toXDR` (`server.ts:508-514`, `523`, `667`). The only point
where remote simulation data enters a pre-serialization object is
`assembleTransaction`, and its remote auth-entry adoption is already reviewed
**VIABLE** under `js-sdk-014c7e2b1c426cfa3f7f5c02` (transaction.ts:115) — not a
distinct new finding. No other sink folds attacker-controlled bytes into the
serialized envelope.

## Per-Target Disposition

- `_sendTransaction` / `transaction.toXDR` / `toXDR`: faithful caller
  serialization, no remote influence at sink (`server.ts:1194-1205`).
- `_simulateTransaction` / `transaction.toXDR`: faithful caller serialization
  (`server.ts:1041-1051`).
- `assembleTransaction` / `raw.toEnvelope` / `toEnvelope`: remote simulation
  flows in; auth-entry adoption already VIABLE (`014c…`), do not re-report.
  Residual fee/sorobanData variant noted below.
- `getContractData` / `getLedgerEntries` / `getLedgerEntry` / `key.toXDR`:
  ledger key built from caller args only; remote bytes never reach the
  serialized key (`server.ts:477-525`, `657-677`).
- `prepareTransaction`: returns an **unsigned** builder result; caller signs
  (prior `js-sdk-d8fe6898`), so no SDK auto-sign of attacker state.

## Evidence

- `src/rpc/server.ts:1194-1205` - `_sendTransaction` serializes the
  caller-supplied transaction with `transaction.toXDR()`; remote response parsed
  after the sink.
- `src/rpc/server.ts:1041-1051` - `_simulateTransaction` serializes the
  caller transaction; remote simulation returned, not serialized here.
- `src/rpc/server.ts:508-525` - `getContractData` ledger key composed solely
  from caller `contract`/`key`/`durability` before `key.toXDR`.
- `src/rpc/transaction.ts:100-118` - the only remote-influenced pre-serialization
  mutation is the simulation auth/sorobanData adoption; auth path is the known
  VIABLE `014c…`.

## Negative Scope

- Rules out: remote RPC response bytes corrupting the serialized caller
  transaction/key/envelope at any `toXDR`/`toEnvelope` sink on the send,
  simulate, assemble, or ledger-entry helpers (sinks serialize caller-owned
  objects; remote data is parsed downstream as leaf).
- Rules out: re-reporting the `assembleTransaction` remote auth-entry adoption
  (transaction.ts:115) as a new finding — already VIABLE `js-sdk-014c…`.
- Does not rule out: a DISTINCT integrity variant in `assembleTransaction`
  where `success.transactionData.build()` (sorobanData footprint + resourceFee)
  is applied verbatim from a malicious simulation even on the advanced-auth
  path, folding a simulation-chosen `resourceFee`/footprint into the fee of the
  tx the caller signs (`transaction.ts:75-97`). Not promoted: resourceFee is a
  ceiling (network charges actual), the behavior is documented simulation
  adoption, and the fee-overcharge magnitude was not source-confirmed Medium+.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-f1b97e20c571fe578a444b9e"
weakness = "transaction integrity / serialization"
record_kind = "area_seed"
path = ["_sendTransaction", "toXDR"]
sink = "toXDR"
sink_role = "transaction_serialization"
impact_class = "transaction_integrity"
route_family = "transaction_serialization"
material_effect = "transaction_serialization"
target_functions = ["_simulateTransaction", "transaction.toXDR", "<anonymous>", "_sendTransaction", "assembleTransaction", "toEnvelope", "toXDR", "getLedgerEntry", "key.toXDR", "raw.toEnvelope", "getContractData"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["faithful_caller_state_serialization_at_toxdr_sink", "remote_bytes_parsed_as_leaf_after_send_sink", "ledger_key_built_from_caller_args_only", "authentry_adoption_typed_duplicate_js-sdk-014c"]
rules_out = ["remote RPC response bytes corrupting the serialized caller transaction/key/envelope at any toXDR/toEnvelope sink on send/simulate/assemble/ledger-entry helpers", "re-reporting assembleTransaction remote auth-entry adoption (transaction.ts:115) as a new finding"]
does_not_rule_out = ["assembleTransaction applying simulation transactionData (sorobanData footprint + resourceFee) verbatim even on the advanced-auth path, folding a simulation-chosen resourceFee/footprint into the fee of the tx the caller signs"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "All toXDR/toEnvelope sinks in the area serialize caller-owned objects; the only remote-influenced pre-serialization mutation (assembleTransaction auth adoption) is already reviewed VIABLE js-sdk-014c, so no distinct serialization-integrity candidate survives."
why_failed_brief = "send/simulate/ledger-entry sinks faithfully serialize caller state with remote data parsed as leaf afterward; assemble auth gap is a typed duplicate of an existing VIABLE finding"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_sendTransaction and _simulateTransaction call toXDR on the caller-supplied transaction with no remote response merged before the sink (server.ts:1202, 1051)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "getContractData/getLedgerEntries serialize a ledger key composed only from caller args (server.ts:508-514, 667)"

[[blockers]]
kind = "leaf_value"
guarantee = "remote sendTransaction response is parsed after the toXDR sink and never re-read into the serialized envelope (prior js-sdk-c92e450a)"

[[blockers]]
kind = "typed_duplicate"
guarantee = "assembleTransaction remote auth-entry adoption at transaction.ts:115 is already reviewed VIABLE under js-sdk-014c7e2b1c426cfa3f7f5c02"
```
