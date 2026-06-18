# F948: Path blocked: funcResToNative/structToNative decode weakness does not reach the signing sink

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/948-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> t.sign`

Escalated residual question: does the `funcResToNative`/`structToNative` ScVal
field-order / cross-type decode weakness (route
`js-sdk-26a2c419baf9cb084b019288`) create a signing-integrity divergence on the
`t.sign` sink (route `js-sdk-f987d575b40d886a548457f2`)?

## Blocker

The two named symbols ARE source-confirmed weak as decoders, but they are
result decoders only. `structToNative` (spec.ts:1156-1162) assigns
`res[fields[i].name()] = scValToNative(entry.val(), fields[i].type())` by map
entry index without comparing `entry.key()` to `fields[i].name()`, and
`scValToNative` primitive branches (spec.ts:1065-1069) return by the ScVal's
own tag with no declared-spec-type comparison. However this decode runs only
inside `get result` → `parseResultXdr` (`funcResToNative`) on
`simulationData.result.retval`, producing the application-facing native return
value. The signing sink `sign()` signs `this.built.toXDR()`, built from the
envelope plus simulation `transactionData`/`sorobanData`, with no dependency on
the decoded native result. The decoded value never re-enters `this.built` nor
the bytes forwarded to `signTransaction`, so signed bytes still equal submitted
bytes — the decode weakness cannot move funds or alter authorization on the
signing path.

## Evidence

- `src/contract/assembled_transaction.ts:834-835` - `sign()` forwards `this.built.toXDR()` to the caller signer; input is the built envelope, not any decoded result.
- `src/contract/assembled_transaction.ts:815-821` - pre-sign rebuild pulls only `sorobanData`/fee/timebounds from simulation, never the native-decoded `result`.
- `src/contract/assembled_transaction.ts:738-743` - `get result` is the sole consumer of `parseResultXdr`/`funcResToNative`, returning the app-facing value out-of-band from signing.
- `src/contract/spec.ts:1156-1162` - `structToNative` positional field assignment confirms the decode weakness, but it is reached only via the result-decode path.

## Negative Scope

- Rules out: signing-sink integrity divergence (`t.sign`/`signAndSend`/`signAuthEntries`) caused by the `funcResToNative`/`structToNative` field-order or cross-type decode weakness; the decode is post-signing and out-of-band from the signed bytes.
- Does not rule out: the decode weakness itself as a remote-response integrity bug on the result-decode route `js-sdk-26a2c419baf9cb084b019288` (`<anonymous> -> Assembled...fromXDR -> funcResToNative`), already adjudicated VIABLE; that route is where the material effect lives.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-f987d575b40d886a548457f2"
weakness = "transaction_signing"
record_kind = "residual_escalation"
path = ["<anonymous>", "t.sign"]
sink = "t.sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/assembled_transaction.ts:sign", "src/contract/assembled_transaction.ts:result", "src/contract/spec.ts:structToNative", "src/contract/spec.ts:funcResToNative"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["signed_bytes_equal_submitted_bytes_forwarded_to_caller_signer", "result_decode_out_of_band_from_signing_sink"]
rules_out = ["funcResToNative/structToNative decode weakness causing signing-sink (t.sign/signAndSend/signAuthEntries) integrity divergence between caller-authorized bytes and submitted transaction"]
does_not_rule_out = ["funcResToNative/structToNative field-order and cross-type decode weakness as a remote-response return-value integrity bug on result-decode route js-sdk-26a2c419baf9cb084b019288"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "structToNative (spec.ts:1156-1162) and scValToNative primitives (spec.ts:1065-1069) decode by position/own-tag without key or spec-type checks, but this runs only in get result -> parseResultXdr -> funcResToNative on retval; sign() signs this.built.toXDR() (834-835) rebuilt only from envelope+sorobanData (815-821), so the decoded native result never reaches the signed bytes."
why_failed_brief = "decode weakness is real but is a post-signing, application-facing result decoder; it is out-of-band from the t.sign signing sink and cannot alter signed/submitted bytes."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "sign() forwards this.built.toXDR() (assembled_transaction.ts:834-835); the pre-sign rebuild (815-821) pulls only sorobanData/fee/timebounds from simulation, never the native-decoded result."

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "funcResToNative is reached only via get result -> parseResultXdr (assembled_transaction.ts:738-743), the sole consumer, which is out-of-band from the signing sink."

[[blockers]]
kind = "data_flow_isolation"
guarantee = "decoded native result from funcResToNative/structToNative never re-enters this.built nor the bytes passed to signTransaction, so the decode weakness cannot affect the signing sink."
```
