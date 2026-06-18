# F964: unionToNative tuple positional/arity decode (residual D964)

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/964-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Full decode path source-traced in current source:

- `src/contract/spec.ts:funcResToNative:612-637` — for a single non-result UDT
  output, line 636 feeds the remote-supplied `val` into
  `scValToNative(val, output)`. Reachable from a malicious/compromised RPC or
  Horizon response with no extra auth gate. Confirmed.
- `src/contract/spec.ts:scValToNative:998-999` — a UDT-typed output dispatches to
  `scValUdtToNative`, which at `:1105-1106` routes a union entry to
  `unionToNative(scv, entry.udtUnionV0())`. Confirmed.
- `src/contract/spec.ts:unionToNative:1114-1145` — guards present: `vec` exists
  (`:1116`), `vec.length===0 && cases!==0` (`:1119`), `vec[0]` is a symbol
  (`:1125`), and `findCase(name)` membership (`:1128`). The tuple branch at
  `:1141` does `ty.map((e, i) => this.scValToNative(vec![i + 1], e))`. Confirmed
  there is no `vec.length === ty.length + 1` arity check and no per-element tag
  pre-check; per-element decode is delegated to `scValToNative`.
- `src/contract/spec.ts:scValToNative:1065-1069` returns `scv.value()` for
  `scvBool`/`scvU32`/`scvI32`/`scvBytes` switching on the incoming ScVal tag with
  no comparison to declared type `e`; `:1006-1007` returns `null` for `scvVoid`
  regardless of declared type. Confirmed.

## Why It Failed

The candidate explicitly scopes its novel claim to the *union-specific
positional/arity decode at `:1141`*, deliberately excluding the generic
`scValToNative` per-element weakness. Once scoped that way, the residual delta is
not materially wrong at the Medium floor:

1. **Tuples are inherently positional.** Unlike `structToNative` (record [1],
   VIABLE because *named* struct fields are positionally mis-paired against
   `fields[i]` with no `entry.key()`-vs-`field.name()` comparison, causing
   value/name mislabeling), a union tuple case has no element names. Decoding
   `vec[i+1]` as `ty[i]` is the protocol-correct positional decode. No
   name/value mislabeling mechanism exists in the tuple branch.
2. **Over-long payload is non-material.** Trailing `vec` elements past
   `ty.length` are silently dropped, but the declared tuple arity is honored and
   positions `1..ty.length` decode correctly. The application receives exactly
   the values its declared type specifies; dropped extras were never part of the
   declared interface. No materially-wrong return value.
3. **Short payload is below floor.** `vec[i+1]` is `undefined`, so
   `scValToNative(undefined, e)` throws on `.switch()` — a local throw,
   DoS-class, below this objective's Medium floor (the candidate concedes this).

Every materially-wrong scenario the candidate describes (a declared `bool`
element receiving `scvU32`, a declared `Address` receiving `scvBool`, `scvVoid`
yielding `null`) reduces to `scValToNative`'s decode-by-incoming-tag /
no-declared-type-comparison weakness at `:1005-1069`. That weakness is already
recorded **VIABLE under route `js-sdk-26a2c419baf9cb084b019288`** (prior brief
record [4]), and the candidate itself scopes it out. Crediting it makes this a
typed subsumption of that finding; this mirrors the established precedent where
the `scvVoid->null` branch was ruled NOT_VIABLE as a typed subsumption of the
same generic finding (record [4]).

## What This Rules Out

The `unionToNative` tuple branch at `spec.ts:1141` adds no independent
material-floor decode weakness over the already-VIABLE generic `scValToNative`
no-declared-type-comparison finding (`js-sdk-26a2c419baf9cb084b019288`): the
union-specific positional/arity delta is non-material (over-long truncation
honors the declared tuple arity; short-vec throws below floor; tuples carry no
name/value mislabeling).

## What This Does Not Rule Out

- The generic `scValToNative` per-element no-declared-type-comparison weakness
  itself remains VIABLE under `js-sdk-26a2c419baf9cb084b019288`; this disposition
  does not disturb that record.
- The `structToNative` positional/key-mismatch finding remains VIABLE under
  `js-sdk-6ddf125939e0256890e41b49` (record [1]); the struct branch's distinct
  name/value mislabeling mechanism is unaffected by this union-branch decision.
- Any future union *struct-case* (`scSpecUdtUnionCaseVoidV0` vs other case
  kinds) or nested-UDT decode shape not on this exact tuple-branch path remains
  unassessed.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-6ddf125939e0256890e41b49"
weakness = "contract_spec_conversion"
record_kind = "single_path"
path = ["funcResToNative", "scValToNative", "scValUdtToNative", "unionToNative"]
sink = "unionToNative"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/spec.ts:unionToNative", "src/contract/spec.ts:scValToNative", "src/contract/spec.ts:funcResToNative"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "not_exploitable_under_scope"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["union_tuple_positional_arity_decode_not_materially_wrong", "per_element_decode_typed_subsumption_of_js-sdk-26a2c419baf9cb084b019288"]
rules_out = ["union tuple branch at spec.ts:1141 adds no independent material-floor weakness: over-long tuple payloads are silently truncated but honor the declared arity (positions 1..ty.length decode correctly, extras the app never declared are dropped), short payloads throw below the Medium floor, and tuples are inherently positional so there is no struct-style name/value mislabeling", "the only materially-wrong per-element decode reachable through the tuple branch is scValToNative decode-by-incoming-tag with no declared-type comparison (spec.ts:1005-1069), a typed subsumption of the already-VIABLE js-sdk-26a2c419baf9cb084b019288 that the candidate explicitly scopes out"]
does_not_rule_out = ["generic scValToNative no-declared-type-comparison weakness remains VIABLE under js-sdk-26a2c419baf9cb084b019288", "structToNative positional/key-mismatch finding remains VIABLE under js-sdk-6ddf125939e0256890e41b49 (record [1])", "union case kinds other than the tuple branch and nested-UDT decode shapes off this exact path remain unassessed"]
assumptions = ["funcResToNative val_or_base64 is attacker-controllable by a malicious/compromised RPC within the declared trust boundary (source-confirmed at spec.ts:612-636)", "declared union output type comes from the trusted contract spec"]
mechanism_brief = "unionToNative tuple branch (spec.ts:1141) maps declared tuple types ty over attacker vec[i+1] positionally; tuples have no element names so positional decode is protocol-correct, over-long payloads honor the declared arity (extras dropped, not materially wrong), short payloads throw below floor, and the only material per-element type confusion is the generic scValToNative decode-by-tag weakness already VIABLE under js-sdk-26a2c419baf9cb084b019288"
why_failed_brief = "union-specific positional/arity delta is non-material at Medium floor; the material per-element decode is a typed subsumption of the already-VIABLE generic scValToNative finding that the candidate scopes out"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:unionToNative"
guarantee = "findCase(name) at spec.ts:1128 validates the vec[0] case-tag symbol; the tuple branch then decodes vec[1..ty.length] positionally, which for nameless tuples is the protocol-correct decode, so over-long payloads honor the declared arity and short payloads throw below floor"

[[blockers]]
kind = "typed_subsumption"
source = "src/contract/spec.ts:scValToNative"
guarantee = "the only materially-wrong per-element decode reachable (decode-by-incoming-tag, no declared-type comparison at spec.ts:1005-1069) is already recorded VIABLE under js-sdk-26a2c419baf9cb084b019288 and is explicitly scoped out by this candidate"
```
