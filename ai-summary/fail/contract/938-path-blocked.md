# F938: Path blocked: residual caller-side display/logging confusion in txFromJSON->sign

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/938-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`txFromJSON -> fromJSON -> sign -> signTransaction`

## Residual Question Resolved

"caller-side display/logging confusion below Medium floor" -> resolved **NO** at
the objective's Medium floor.

## Blocker

The authoritative caller display surface on this route is the wallet at sign
time, and it receives the exact bytes that will be signed and submitted. `sign`
rebuilds `this.built` via `cloneFrom` (splicing the JSON-supplied
`simulationTransactionData` as `sorobanData`) and then passes the resulting
`this.built.toXDR()` directly to the caller's `signTransaction` wallet
(assembled_transaction.ts:834-835); the signed envelope is reconstructed from
that same returned XDR (841-844), so authorized bytes == submitted bytes and the
full resource/auth/method/fee section is inspectable by the wallet. `fromJSON`
binds `contractId` and method (validateInvokeContractOp 377-431; method check
458-462) and accepts no application-supplied `args` (`Omit<...,"args">`), so no
SDK-honored "intended" value exists for a separate display to diverge from. The
SDK exposes no human-readable transaction rendering or logger that a caller would
trust for the sign/no-sign decision instead of the wallet's view; `toJSON`
(360-371) only re-serializes the validated `built.toXDR()` and the sim data
verbatim. Any residual mismatch is therefore caller-side display only and below
the Medium floor (Low / out of scope).

## Evidence

- `src/contract/assembled_transaction.ts:834-844` - sign forwards the real
  post-cloneFrom `built.toXDR()` to the wallet and rebuilds `signed` from the
  returned XDR; the wallet inspects exactly what is signed and submitted.
- `src/contract/assembled_transaction.ts:433-475` - fromJSON binds contractId
  and method and accepts no caller `args`, so there is no app-expressed intent
  for a display to contradict.
- `src/contract/assembled_transaction.ts:360-371` - toJSON re-serializes the
  validated built XDR and sim data faithfully; no divergent rendering/log surface
  is produced.

## Negative Scope

- Rules out: a Medium+ caller-side display/logging confusion on the
  txFromJSON->fromJSON->sign->signTransaction route where a benign-looking
  rendered/logged transaction diverges from the actually-signed bytes (the wallet
  receives the real bytes at sign time).
- Does not rule out: the distinct already-VIABLE retval route
  (`txFromJSON -> fromJSON -> result -> funcResToNative`), where the JSON-supplied
  `retval` is decoded and trusted via `get result()` and is absent from the signed
  envelope so sign-time inspection cannot catch it; that is a separate finding,
  not re-reported here.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-3c0364b06a3b262ea8bd65a6"
weakness = "json_deserialization"
record_kind = "residual_escalation"
path = ["txFromJSON", "fromJSON", "sign", "signTransaction"]
sink = "signTransaction"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/assembled_transaction.ts:sign", "src/contract/assembled_transaction.ts:fromJSON", "src/contract/assembled_transaction.ts:validateInvokeContractOp", "src/contract/assembled_transaction.ts:toJSON"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["signed_bytes_equal_submitted_bytes_visible_to_wallet_at_sign_time", "no_sdk_trusted_display_surface_separate_from_wallet"]
rules_out = ["medium_plus_caller_display_or_logging_confusion_on_sign_route_where_rendered_tx_diverges_from_signed_bytes"]
does_not_rule_out = ["distinct_viable_retval_route_txFromJSON_fromJSON_result_funcResToNative_decoded_and_trusted_absent_from_signed_envelope"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "On the sign route, the wallet receives the actual post-cloneFrom built.toXDR() (signed==submitted), fromJSON binds contractId+method and accepts no caller args, and toJSON re-serializes faithfully; no SDK-trusted display/log surface diverges from the signed bytes, so any residual confusion is caller-side display only and below the Medium floor."
why_failed_brief = "authoritative caller display is the wallet which inspects the real signed/submitted bytes; residual display/logging confusion does not reach the Medium floor"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "sign() forwards the exact post-cloneFrom built.toXDR() to the caller's signTransaction wallet and rebuilds signed from the returned XDR, so authorized bytes equal submitted bytes and are wallet-inspectable at sign time (assembled_transaction.ts:834-844)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "fromJSON binds contractId and method (validateInvokeContractOp 377-431; method check 458-462) and accepts Omit<...,'args'>, so there is no application-expressed intent for a separate display to diverge from (assembled_transaction.ts:433-475)"

[[blockers]]
kind = "no_trusted_alternate_display"
guarantee = "the SDK exposes no human-readable transaction rendering or logger that a caller would trust for the sign decision instead of the wallet's view of the signed bytes; toJSON re-serializes the validated built XDR and sim data verbatim (assembled_transaction.ts:360-371)"
```
