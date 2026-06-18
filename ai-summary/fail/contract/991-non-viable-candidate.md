# F991: Enum decode returns out-of-domain u32 without membership check

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/991-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate's mechanism is source-accurate. `funcResToNative`
(`src/contract/spec.ts:612-637`) decodes a remote base64 ScVal and calls
`scValToNative(val, output)` (`spec.ts:636`). For an enum UDT output,
`scValToNative` dispatches to `scValUdtToNative` (`spec.ts:998-999`), which on the
`scSpecEntryUdtEnumV0` branch calls `this.enumToNative(scv)` (`spec.ts:1102`)
WITHOUT passing the resolved `udtEnumV0()` entry. `enumToNative`
(`spec.ts:1166-1172`) verifies only that the ScVal tag is `scvU32` and then
`return num`, with no comparison against declared enum case values. The encode
counterpart `nativeToEnum` (`spec.ts:956-960`) does enforce membership
(`enum_.cases().some((e) => e.value() === val)`), confirming the decode-side
asymmetry the candidate describes.

## Why It Failed

This exact typed route is already recorded VIABLE in the injected PRIOR
INVESTIGATIONS brief as `js-sdk-a7b32e6177a6e7a129c7468b` (stage=reviewed,
verdict=VIABLE). That record's path is
`funcResToNative; scValToNative; scValUdtToNative; enumToNative`, identical to
C1's path and sink, with the same trust boundary and parser-state scope, and its
`rules_out` cites the same source facts: "enumToNative (spec.ts:1166-1172) checks
only the scvU32 tag and is called at spec.ts:1102 without the declared udtEnumV0
entry, so no enum-case membership guard blocks an out-of-domain u32." C1 is an
exact typed duplicate of that prior finding and is therefore NOT_VIABLE for this
batch. (The hypothesis batch's prior-memory brief listed only the primitive
scalar and string->BytesN findings as covering this area and did not surface the
enum record; the fuller PRIOR INVESTIGATIONS brief resolves it as a duplicate.)

## What This Rules Out

Re-reporting the enum-domain decode gap as a novel finding: the no-membership
`enumToNative` decode weakness on the `funcResToNative -> scValUdtToNative ->
enumToNative` path is already typed and confirmed VIABLE under route
`js-sdk-a7b32e6177a6e7a129c7468b`.

## What This Does Not Rule Out

The structurally distinct `structToNative` positional-decode gap (C2), which is
a separate sink and mechanism and is reported VIABLE in this batch.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-6ddf125939e0256890e41b49"
weakness = "contract spec conversion / enum domain decode type confusion"
record_kind = "single_path"
path = ["funcResToNative", "scValUdtToNative", "enumToNative"]
sink = "enumToNative"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["src/contract/spec.ts:enumToNative", "src/contract/spec.ts:scValUdtToNative", "src/contract/spec.ts:funcResToNative"]
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
negative_claim.rules_out_codes = ["typed_duplicate_of_js-sdk-a7b32e6177a6e7a129c7468b"]
rules_out = ["the enum-domain no-membership decode weakness on funcResToNative -> scValUdtToNative -> enumToNative (spec.ts:1102, 1166-1172) is an exact typed duplicate of prior VIABLE route js-sdk-a7b32e6177a6e7a129c7468b sharing path, sink, mechanism, and scope"]
does_not_rule_out = ["structToNative positional ScMap decode gap (C2, distinct sink, reported VIABLE in this batch)"]
assumptions = ["the PRIOR INVESTIGATIONS record js-sdk-a7b32e6177a6e7a129c7468b accurately represents an already-confirmed VIABLE finding for the enum decode path"]
mechanism_brief = "enumToNative returns the raw u32 from a remote-supplied ScVal without verifying it is a declared enum case (spec.ts:1166-1172), called without the udtEnumV0 entry at spec.ts:1102; mechanism is real but already recorded VIABLE under another route."
why_failed_brief = "exact typed duplicate of prior VIABLE enum-decode finding js-sdk-a7b32e6177a6e7a129c7468b"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:nativeToEnum"
guarantee = "encode-side nativeToEnum validates membership (spec.ts:956-960) but the symmetric decode check is absent in enumToNative; mechanism confirmed yet already covered by a prior VIABLE record"

[[blockers]]
kind = "duplicate"
source = "src/contract/spec.ts:enumToNative"
guarantee = "prior VIABLE route js-sdk-a7b32e6177a6e7a129c7468b already records this exact enum-domain decode gap, making C1 a typed duplicate"
```
