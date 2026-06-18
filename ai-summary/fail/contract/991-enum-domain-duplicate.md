# F991: Enum decode (enumToNative) lacks domain validation — typed duplicate

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/991-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: NOT_VIABLE
**Failed At**: reviewer
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`funcResToNative` (`src/contract/spec.ts:612-636`) decodes a remote-supplied
base64 ScVal and calls `scValToNative(val, output)` (`spec.ts:636`). For a UDT
output, `scValToNative` reaches the UDT branch (`spec.ts:998-999`) and calls
`scValUdtToNative` (`spec.ts:1098-1112`). For an enum entry it calls
`this.enumToNative(scv)` (`spec.ts:1102`) **without** passing the declared
`udtEnumV0` entry or its cases.

`enumToNative(scv)` (`spec.ts:1166-1172`) checks only that the ScVal tag is
`scvU32` and then `return num` — it never receives or consults the enum spec
cases, so no membership/domain check is possible. The encode-side
`nativeToEnum` (`spec.ts:956-960`) does enforce
`enum_.cases().some(entry => entry.value() === val)`, confirming the asymmetry.
The source trace of the candidate is accurate.

## Why It Failed

This exact typed route is already recorded VIABLE in prior structured memory as
`js-sdk-a7b32e6177a6e7a129c7468b` (injected prior-investigations brief, entry
[1], stage=reviewed, verdict=VIABLE). That record's path is
`funcResToNative; scValToNative; scValUdtToNative; enumToNative`, with the same
trust boundary / protocol phase / parser-state scope, and its `rules_out` cites
the identical source facts: "enumToNative (spec.ts:1166-1172) checks only the
scvU32 tag and is called at spec.ts:1102 without the declared udtEnumV0 entry, so
no enum-case membership guard blocks an out-of-domain u32 on this path."

Candidate C1 (path `funcResToNative -> scValUdtToNative -> enumToNative`, sink
`enumToNative`, mechanism "enumToNative returns the raw u32 without verifying it
is a declared enum case") is the same sink, same path, same scope, and same
mechanism. Per the reviewer procedure, an exact typed duplicate of an existing
VIABLE record is NOT_VIABLE for this candidate to avoid re-reporting the same
typed route. (The hypothesis author's narrower injected brief listed only
`js-sdk-3d586da60823b3f0f83266b1` and `js-sdk-26a2c419baf9cb084b019288` and so
believed the enum helper was novel; the reviewer's prior-investigations brief
shows the enum route is already covered.)

## What This Rules Out

Re-reporting the enum-domain decode gap on the
`funcResToNative -> scValToNative -> scValUdtToNative -> enumToNative` path as a
new finding. The underlying bug is real and already captured VIABLE under
`js-sdk-a7b32e6177a6e7a129c7468b`; this candidate adds no distinct typed route.

## What This Does Not Rule Out

- The struct named-field positional decode gap in `structToNative`
  (`spec.ts:1156-1162`), which is a distinct sink and is recorded VIABLE under
  C2 of this batch.
- `unionToNative` tuple positional decode (`spec.ts:1141`), unassessed here.
- The prior VIABLE primitive-scalar cross-type decode finding
  (`js-sdk-26a2c419baf9cb084b019288`), a separate set of branches.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-6ddf125939e0256890e41b49"
weakness = "contract spec conversion / enum domain validation gap"
record_kind = "single_path"
path = ["funcResToNative", "scValToNative", "scValUdtToNative", "enumToNative"]
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
rules_out = ["the enumToNative no-domain-validation decode weakness on the funcResToNative -> scValToNative -> scValUdtToNative -> enumToNative path is already recorded VIABLE under route js-sdk-a7b32e6177a6e7a129c7468b sharing trust boundary, protocol phase, parser state, sink, and mechanism, so C1 is an exact typed duplicate"]
does_not_rule_out = ["structToNative positional named-field decode (C2 / VIABLE) which is a distinct sink", "unionToNative tuple positional decode at spec.ts:1141", "primitive scalar cross-type decode js-sdk-26a2c419baf9cb084b019288"]
assumptions = ["injected prior-investigations entry [1] js-sdk-a7b32e6177a6e7a129c7468b is current and accurately reflects the same enum decode route", "source trace confirms enumToNative (spec.ts:1166-1172) is called at spec.ts:1102 without the udtEnumV0 entry"]
mechanism_brief = "enumToNative returns the raw u32 from a remote-supplied ScVal without verifying membership in the declared enum cases; encode-side nativeToEnum (spec.ts:956-960) enforces membership but decode drops it."
why_failed_brief = "exact typed duplicate of existing VIABLE record js-sdk-a7b32e6177a6e7a129c7468b for the same enumToNative decode path, sink, scope, and mechanism."
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:nativeToEnum"
guarantee = "encode-side nativeToEnum validates enum-case membership (spec.ts:956-960); the symmetric check is absent on decode, matching the already-recorded VIABLE finding rather than constituting a new route"

[[blockers]]
kind = "prior_record"
source = "src/contract/spec.ts:enumToNative"
guarantee = "prior VIABLE record js-sdk-a7b32e6177a6e7a129c7468b already covers this exact enum decode domain gap (path funcResToNative; scValToNative; scValUdtToNative; enumToNative), making C1 a typed duplicate"
```
