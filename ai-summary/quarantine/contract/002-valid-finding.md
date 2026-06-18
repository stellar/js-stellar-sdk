# R002: Struct decode pairs ScMap entries to declared fields by position without matching keys to field names

**Date**: 2026-06-17
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/001-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The candidate claims `Spec.structToNative` pairs the i-th ScMap entry with the
i-th declared struct field positionally, never comparing `entry.key()` to
`fields[i].name()`, so a malicious RPC can reorder map entries to swap decoded
field values. Source confirms this exactly.

`src/contract/spec.ts:1147-1164` `structToNative`:

```js
const fields = udt.fields();
if (fields.some(isNumeric)) {
  const r = val.vec()?.map((entry, i) => this.scValToNative(entry, fields[i].type()));
  return r;
}
val.map()?.forEach((entry, i) => {
  const field = fields[i];
  res[field.name().toString()] = this.scValToNative(entry.val(), field.type());
});
```

For the named-field (non-numeric) branch, the field used for both the output key
name and the decode type is selected by the **map entry index `i`**;
`entry.key()` is never read or compared to `fields[i].name()`. The all-numeric
(tuple-like) branch at lines 1150-1154 likewise decodes purely positionally from
`val.vec()`.

Routing and reachability:
- `src/contract/spec.ts:1098-1104` `scValUdtToNative` routes a struct UDT entry
  to `structToNative` (line 1104).
- `src/contract/spec.ts:998-999` — `scValToNative` dispatches any declared `Udt`
  output to `scValUdtToNative`.
- Same remote-controlled retval path as R001: `src/contract/assembled_transaction.ts:743`
  (simulate retval) and `src/contract/sent_transaction.ts:137-139` (getTransaction
  returnValue) feed `parseResultXdr` → `funcResToNative` (`src/contract/spec.ts:634,636`)
  → `scValToNative`, wired at `src/contract/client.ts:126-127` and
  `src/contract/assembled_transaction.ts:515-516`.

## Findings

Expected behavior: each struct field should be located by matching the map
entry's key to the declared field name, rejecting missing/duplicated/extra keys.
The decoder instead trusts positional alignment, which only holds for an honest
Soroban host that emits canonical sorted ScMap order. The objective's trust
boundary explicitly includes a malicious or compromised RPC server, which is not
bound by host canonicalization and can craft an arbitrary `scvMap` in a simulate
or getTransaction response. The SDK performs no key-name or key-order validation
of its own, so the canonical-order assumption is unverified at this boundary.

Material impact: for a struct whose adjacent fields share a type — a very common
shape such as `{ from: Address, to: Address, ... }` or multiple `i128` amount
fields — a malicious server returns the same number of entries with the values
reordered. Each value still decodes cleanly under the (matching) positional
field type, so no error is raised, and the application receives a struct in which
security-relevant fields (owner/recipient/amount) are silently swapped. This is
"remote-response trust confusion / incorrect result decoding that can cause
unsafe application behavior," meeting the Medium floor. It is not High because
the swapped value is a decoded result on the read path and does not by itself
alter the signed/submitted envelope or move funds.

## PoC Guidance

- **Test file**: append to an existing `test/unit/spec` test or a new
  `test/unit/spec_struct_decode_test.ts`. No network needed.
- **Setup**: build a `Spec` containing a struct UDT with two same-typed
  named fields in declared order `[from: Address, to: Address]` and a function
  returning that struct.
- **Steps**: construct an `xdr.ScVal.scvMap([...])` whose two entries carry the
  correct keys but with the **values swapped** relative to declared field order
  (or whose entries are reordered), and call `spec.funcResToNative("fn", scVal)`.
- **Assertion**: assert the decoded `result.from` equals the address the server
  placed for `to` (and vice versa), demonstrating that field assignment ignores
  `entry.key()`. Optionally assert that swapping keys without swapping declared
  positions has no effect on the output, confirming keys are never consulted.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-26a2c419baf9cb084b019288"
weakness = "Struct decode pairs ScMap entries to declared fields by position without matching map keys to field names"
record_kind = "single_path"
path = ["<anonymous>", "Assembl ... fromXDR"]
sink = "Assembl ... fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "decodes attacker-controlled XDR"
target_functions = ["src/contract/spec.ts:structToNative", "src/contract/spec.ts:scValUdtToNative"]
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
rules_out = ["source trace confirms structToNative (spec.ts:1156-1162) selects fields[i] by map entry index and never compares entry.key() to fields[i].name(), so no key/order guard blocks a reordered ScMap from a malicious RPC on this exact path"]
does_not_rule_out = ["primitive/bigint type confusion (see C1/R001)", "union case decode confusion in unionToNative", "robustness gaps when entry count differs from fields.length", "nearby variants outside this exact reviewed path remain unassessed"]
assumptions = ["RPC retval is attacker-controlled per the objective's compromised-RPC trust boundary, confirmed reachable via assembled_transaction.ts:743 and sent_transaction.ts:137-139", "a struct UDT with two or more same-typed adjacent named fields exists so a value swap decodes without a type error", "Soroban host canonical ScMap ordering is not enforced by the SDK at this boundary, confirmed by absence of any key check in structToNative"]
mechanism_brief = "structToNative (spec.ts:1156-1162) assigns map entry i to declared field i by position and never compares entry.key() to fields[i].name(), so a reordered ScMap from a malicious RPC swaps decoded struct field values among same-typed fields; reachable via scValUdtToNative for any struct UDT output."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:structToNative"
guarantee = "no key-to-field-name matching or key-order validation is performed on struct map decode; field selection is purely positional"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:scValUdtToNative"
guarantee = "no source-proven key/order validation exists before positional field assignment on this exact viable path"
```
