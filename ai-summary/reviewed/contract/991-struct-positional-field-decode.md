# R991: structToNative decodes ScMap fields by position, ignoring entry keys

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/991-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

`funcResToNative(name, val_or_base64)` (`src/contract/spec.ts:612-636`) decodes a
remote-supplied base64 ScVal (`xdr.ScVal.fromXDR(val_or_base64, "base64")`,
`spec.ts:613-616`) and dispatches to `scValToNative(val, output)`
(`spec.ts:636`). For a UDT output, `scValToNative` reaches the UDT branch
(`spec.ts:998-999`) and calls `scValUdtToNative` (`spec.ts:1098-1112`), which for
a struct entry calls `structToNative(scv, entry.udtStructV0())`
(`spec.ts:1103-1104`).

`structToNative` (`spec.ts:1147-1164`) has two branches:
- Numeric (tuple-like) fields: decoded from `val.vec()` positionally
  (`spec.ts:1150-1155`).
- Named fields: the map branch (`spec.ts:1156-1162`):

```js
val.map()?.forEach((entry, i) => {
  const field = fields[i];
  res[field.name().toString()] = this.scValToNative(entry.val(), field.type());
});
```

This pairs each ScMap entry to a spec field strictly by positional index `i`,
uses `fields[i].type()` to decode the value, and stores it under
`fields[i].name()`. It never reads `entry.key()`, so the actual map key carried
in the response is discarded and never compared to the spec field name.

The encode counterpart `nativeToStruct` (`spec.ts:945-953`) emits the ScMap with
an explicit symbol key per field
(`key: this.nativeToScVal(name, scSpecTypeSymbol())`), confirming the SDK's own
serialization contract is keyed/named. The decode path drops that key invariant.

## Findings

The decode-side trust boundary for `funcResToNative` is a remote RPC server's
simulate/send result (`spec.ts:612-616`); the ScVal bytes are attacker-controlled
when the RPC server is malicious or compromised. js-xdr's `ScVal.fromXDR`
preserves entry order as encoded and does not impose semantic key matching, so a
crafted response can deliver an `scvMap` whose entries are reordered relative to
the spec field declaration order.

Because pairing is positional and keys are ignored:
- For two adjacent fields of the **same** ScSpec type (a common shape: two
  `address` fields such as `from`/`to`, or two `i128` fields such as
  `amount`/`fee`), swapping the corresponding map entries produces a struct whose
  values are silently transposed. No type mismatch occurs, so no exception is
  raised, and the application receives a semantically wrong struct under correct
  field names.
- Fields of differing types may throw inside `scValToNative` when a swapped value
  fails its expected type, which limits silent confusion to same-typed fields but
  does not add any key-matching guard.

There is no entry-count check: if the response carries fewer entries than
declared fields, `forEach` simply stops early and the missing fields are absent
from the result; if it carries the same count but reordered, the swap is silent.

This is an SDK integrity gap on a remote-response decode path that can yield a
materially wrong return value handed to the application as a valid struct,
matching the Medium impact category "Remote RPC/Horizon response decoded into a
materially wrong ... return value." It is distinct from the prior VIABLE
primitive-scalar decode finding (`js-sdk-26a2c419baf9cb084b019288`), which covers
the scalar branches of `scValToNative` and does not touch the UDT struct map
branch, and from the prior VIABLE enum-domain finding
(`js-sdk-a7b32e6177a6e7a129c7468b`), which covers `enumToNative`.

## PoC Guidance

- **Test file**: append to an existing `test/unit/spec_test.js` /
  `test/unit/spec/*` style suite that already builds a `contract.Spec` from
  `ScSpecEntry`s.
- **Setup**: build a `Spec` containing (a) a `scSpecEntryUdtStructV0` UDT with two
  same-typed named fields in a known declaration order (e.g. `from`, `to`, both
  `scSpecTypeAddress`), and (b) a function entry returning that UDT.
- **Steps**: hand-construct an `xdr.ScVal.scvMap([...])` whose two `ScMapEntry`s
  carry the correct symbol keys but in **reversed** order relative to the spec
  field order, base64-encode it, and call
  `spec.funcResToNative("fn", base64Result)`.
- **Assertion**: assert that `result.from` and `result.to` are swapped relative to
  the entry keys (i.e. the value whose key is `to` ends up under `from`),
  demonstrating that decode ignores `entry.key()`. Optionally assert a
  short-map case (one entry) leaves a declared field undefined.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-6ddf125939e0256890e41b49"
weakness = "contract spec conversion / struct field type-and-name confusion"
record_kind = "single_path"
path = ["funcResToNative", "scValToNative", "scValUdtToNative", "structToNative"]
sink = "structToNative"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["src/contract/spec.ts:structToNative", "src/contract/spec.ts:scValUdtToNative", "src/contract/spec.ts:funcResToNative"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace of structToNative map branch (spec.ts:1156-1162) confirms positional fields[i] pairing with no entry.key()-vs-field.name() comparison and no entry-count check, so no guard blocks a reordered/short remote scvMap on this exact decode path", "this struct UDT map branch is not covered by the prior VIABLE primitive-scalar finding js-sdk-26a2c419baf9cb084b019288 nor the enum finding js-sdk-a7b32e6177a6e7a129c7468b"]
does_not_rule_out = ["enum domain validation gap on enumToNative is a separate path already recorded VIABLE (js-sdk-a7b32e6177a6e7a129c7468b / C1)", "unionToNative tuple positional decode at spec.ts:1141 remains unassessed here", "exact js-xdr ScMap decode ordering behavior was not byte-traced; silent swap is established for same-typed fields"]
assumptions = ["remote RPC simulate/send response ScVal bytes are attacker-controlled at funcResToNative (spec.ts:612-616)", "js-xdr ScVal.fromXDR preserves encoded ScMap entry order and does not re-key entries to spec field order on decode", "a struct with two or more same-typed adjacent named fields exists in a realistic contract spec"]
mechanism_brief = "structToNative map branch (spec.ts:1156-1162) assigns ScMap entries to spec fields by positional index and never reads entry.key(); a reordered remote scvMap swaps same-typed field values silently and a short map drops fields, while encode nativeToStruct (spec.ts:945-953) emits keyed entries."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:structToNative"
guarantee = "no entry.key()-vs-field.name() comparison and no entry-count check exist on the structToNative named-field map decode path (spec.ts:1156-1162)"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:scValUdtToNative"
guarantee = "scValUdtToNative passes only entry.udtStructV0() and the raw scv to structToNative (spec.ts:1103-1104); no source-proven ScMap key-matching or ordering guard blocks this exact decode path"
```
