# F967: Path blocked: txFromJSON JSON deserialization area (parse sink)

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/967-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`txFromJSON -> parse`

Area seed targets traced: `txFromJSON`, `parse`/`JSON.parse`, `fromJSON`,
`<anonymous>` (the `parseResultXdr` closure).

## Per-Target Disposition

- **`txFromJSON` / `JSON.parse` (client.ts:201-212)**: plain `JSON.parse(json)`
  followed by `const { method, ...tx } = ...`. No prototype pollution: keys
  produced by `JSON.parse` and copied by object spread become own data
  properties (CreateDataProperty semantics), not prototype writes. The security-
  relevant inputs `networkPassphrase` and `contractId` are read from the client's
  own `options`, never from the JSON, so the parse step adds no trust boundary
  beyond what `fromJSON` enforces.
- **`fromJSON` (assembled_transaction.ts:433-475)**: binds the JSON `method` to
  the envelope's `functionName()` (throws at :458 on mismatch) and binds the
  operation to the configured `contractId` via `validateInvokeContractOp`
  (:451-454). The only JSON field decoded and later trusted without a provenance
  check is `simulationResult.retval` (:468) consumed by `get result()` (:738-743)
  — this is the ALREADY-VIABLE finding on route `js-sdk-3c0364b06a3b262ea8bd65a6`
  and is intentionally not re-reported. `simulationTransactionData`/sorobanData
  is the prior NOT_VIABLE (signed bytes == submitted bytes, wallet-visible);
  auth-entry signing via `signAuthEntries` reads `rawInvokeHostFunctionOp.auth`
  from the built tx and forwards the preimage to the wallet (prior NOT_VIABLE).
- **`<anonymous>` (parseResultXdr closure, client.ts:207-208)**: uses the
  envelope-bound `method`, so no method/type confusion remains after the :458
  guard.

## Blocker

After source tracing every target in this sibling set, the JSON-deserialization
sink introduces no DISTINCT new vulnerability for this route. `method` and
`contractId` are bound at `fromJSON` (:458, :451-454); `networkPassphrase` is
caller-supplied, not from JSON; `JSON.parse`+spread cannot pollute the prototype.
The single decode-trust mechanism (JSON-supplied `retval` accepted by
`get result()` with no provenance flag) is the existing VIABLE finding on a
different route_id and must not be duplicated. The only remaining JSON-driven
control-flow field, `isReadCall` (auth.length + footprint, :1089-1096), produces
no material effect independent of that retval-trust outcome.

## Evidence

- `src/contract/client.ts:201-212` - `JSON.parse` + `{method,...tx}`; passphrase/contractId from client options, not JSON.
- `src/contract/assembled_transaction.ts:458` - throws unless JSON `method` equals the envelope `functionName()`.
- `src/contract/assembled_transaction.ts:451-454` - `validateInvokeContractOp` binds the op to the configured `contractId`.
- `src/contract/assembled_transaction.ts:738-743` - `get result()` decodes JSON `retval` (the known VIABLE route; not re-reported here).
- `src/contract/assembled_transaction.ts:1089-1096` - `isReadCall` derives from JSON auth/footprint but yields no effect distinct from the retval-trust route.

## Negative Scope

- Rules out: a NEW (non-duplicate) parse/JSON.parse-level deserialization vuln on `txFromJSON -> parse` for route `js-sdk-500a631bc8106478c89fe491` (prototype pollution, method/contractId/passphrase confusion via the JSON decode).
- Does not rule out: the already-VIABLE `retval`-trust mechanism on route `js-sdk-3c0364b06a3b262ea8bd65a6` (`get result()` / `funcResToNative`); the `isReadCall` classification field as an amplifier of that retval-trust outcome.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-500a631bc8106478c89fe491"
weakness = "json_deserialization"
record_kind = "area_seed"
path = ["txFromJSON", "parse"]
sink = "parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["txFromJSON", "parse", "JSON.parse", "fromJSON", "<anonymous>"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["json_parse_no_prototype_pollution", "method_bound_to_envelope_functionname", "contractid_bound_via_validateinvokecontractop", "passphrase_from_caller_options_not_json"]
rules_out = ["new non-duplicate parse-level json_deserialization vuln on txFromJSON->parse (prototype pollution, method/contractId/passphrase confusion)"]
does_not_rule_out = ["existing VIABLE retval-trust route js-sdk-3c0364b06a3b262ea8bd65a6 via get result()/funcResToNative", "isReadCall classification field (assembled_transaction.ts:1089-1096) as amplifier of the retval-trust outcome"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "txFromJSON runs JSON.parse then delegates to fromJSON, which binds method (:458) and contractId (:451-454); passphrase comes from caller options; JSON.parse+spread cannot pollute prototype; the only decode-trust mechanism (retval) is an existing VIABLE finding on a different route_id."
why_failed_brief = "no distinct new deserialization vuln on this route after binding checks; the only material decode-trust mechanism is the already-VIABLE retval route and must not be duplicated."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "fromJSON throws unless JSON method equals envelope functionName (assembled_transaction.ts:458) and binds the op to the configured contractId via validateInvokeContractOp (:451-454)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "networkPassphrase is taken from caller-supplied client options, not from the deserialized JSON, so TransactionBuilder.fromXDR uses a trusted passphrase"

[[blockers]]
kind = "language_semantics"
guarantee = "JSON.parse and object spread create own data properties (CreateDataProperty), so a __proto__ key in the JSON does not write Object.prototype"

[[blockers]]
kind = "duplicate_known_viable"
guarantee = "the only JSON field trusted without provenance (simulationResult.retval via get result()) is already the VIABLE finding on route js-sdk-3c0364b06a3b262ea8bd65a6 and is not re-reported"
```
