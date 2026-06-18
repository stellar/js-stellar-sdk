# R991: structToNative decodes named-struct ScMap by positional index, ignoring entry keys

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/991-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Decode entry: `funcResToNative(name, val_or_base64)` (`src/contract/spec.ts:612-637`)
accepts a base64-encoded ScVal that, on the decode path, originates from a remote
simulate/send RPC response. It base64-decodes the ScVal (`spec.ts:613-616`),
resolves the single declared output type (`spec.ts:629`), and calls
`scValToNative(val, output)` (`spec.ts:636`).

For a function whose output is a named-struct UDT, `scValToNative`
(`spec.ts:985-999`) detects the UDT type (`spec.ts:998`) and dispatches to
`scValUdtToNative(scv, typeDef.udt())` (`spec.ts:998-999`), which resolves the
struct spec entry and calls `this.structToNative(scv, entry.udtStructV0())`
(`spec.ts:1103-1104`).

`structToNative` (`spec.ts:1147-1164`):
- For numeric (tuple) field names it decodes from `val.vec()` positionally
  (`spec.ts:1150-1155`).
- For named fields it runs the map branch (`spec.ts:1156-1162`):
  ```ts
  val.map()?.forEach((entry, i) => {
    const field = fields[i];
    res[field.name().toString()] = this.scValToNative(entry.val(), field.type());
  });
  ```
  This pairs the i-th ScMap entry with the i-th spec field by POSITION. It never
  reads `entry.key()`, performs no key==field-name comparison, and performs no
  entry-count vs field-count check.

The symmetric encode path `nativeToStruct` (`spec.ts:945-953`) emits each
ScMapEntry with an explicit symbol key derived from the spec field name, proving
that the canonical struct representation is keyed and named — a property the
decode path discards.

## Findings

Trust boundary: the decoded ScVal bytes are attacker-controlled at the remote RPC
response boundary (per the dispatch seed and confirmed by `funcResToNative`
accepting a base64 ScVal from a simulate/send result). The map-entry ordering of
the returned `scvMap` is fully attacker-controlled; js-xdr decodes an ScMap as an
ordered vector of entries and imposes no semantic key ordering at decode time, so
the SDK cannot rely on canonical sorting having been preserved by an adversarial
server.

Because `structToNative` binds value to field by position and ignores keys:
- A reordered `scvMap` causes each value to be assigned under the wrong field
  name and decoded with the wrong field's type.
- For two fields of the same declared type (e.g. two `address` fields such as
  `from`/`to`, or two `i128` fields), reordering swaps their values SILENTLY with
  no type error — the application receives a struct whose semantically distinct
  fields are transposed.
- For differently-typed fields the mismatch interacts with the already-confirmed
  decode-by-ScVal-tag weakness (prior VIABLE `js-sdk-26a2c419baf9cb084b019288`):
  scalar branches return on the ScVal's own tag rather than the declared field
  type, so a transposed value can still decode without throwing and land under
  the wrong field name.

This is an SDK integrity gap, not caller misuse: the SDK presents the decoded
object as a faithful native rendering of the contract's typed struct output, but
the field-to-value mapping is determined by attacker-controlled map ordering
rather than by the spec field names. This matches the IMPACT_CATEGORIES row
"Remote RPC/Horizon response decoded into a materially wrong ... return value"
(Medium), and is distinct from the enum-domain and primitive-scalar findings on
the same area.

## What This Rules Out

The decode path has no ScMap key-vs-field-name comparison and no entry-count
guard; positional binding of remote-controlled struct map entries is unguarded.

## What This Does Not Rule Out

Behavior of the tuple/`vec` branch (`spec.ts:1150-1155`) under length mismatch,
the `unionToNative` path (`spec.ts:1114-1145`), and the enum-domain gap (C1,
already covered by prior VIABLE `js-sdk-a7b32e6177a6e7a129c7468b`).

## PoC Guidance

- **Test file**: append to an existing `test/unit/spec*.test.{js,ts}` covering
  `Spec`/`funcResToNative` (mirror the existing native<->ScVal round-trip tests;
  no network).
- **Setup**: build a `Spec` containing a function whose single output is a named
  struct UDT with two same-typed fields in a fixed spec order (e.g. fields
  `a: address`, `b: address`, declared in that order).
- **Steps**: hand-construct an `xdr.ScVal.scvMap([...])` for that struct with the
  two `ScMapEntry`s in REVERSED order (key `b` first, then key `a`), each carrying
  a distinct address value. Base64-encode it and pass it to
  `spec.funcResToNative(funcName, base64)`.
- **Assertion**: assert the returned object has `a`/`b` swapped relative to the
  keys actually present in the map (i.e. `result.a` equals the value the attacker
  labeled `b`), demonstrating that decoding follows positional order and ignores
  `entry.key()`. Optionally assert that no error is thrown for the same-typed
  swap.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-6ddf125939e0256890e41b49"
weakness = "contract spec conversion / struct field positional decode type confusion"
record_kind = "single_path"
path = ["funcResToNative", "scValUdtToNative", "structToNative"]
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
rules_out = ["source trace confirms structToNative map branch (spec.ts:1156-1162) binds ScMap entries to spec fields by positional index i, never reads entry.key(), and has no entry-count check, so no key-matching guard blocks a reordered remote scvMap on this exact path"]
does_not_rule_out = ["tuple/vec struct branch length-mismatch behavior (spec.ts:1150-1155)", "unionToNative decode path (spec.ts:1114-1145)", "enum domain gap C1 already covered by prior VIABLE js-sdk-a7b32e6177a6e7a129c7468b"]
assumptions = ["remote RPC simulate/send response ScVal bytes are attacker-controlled at the funcResToNative decode boundary", "js-xdr decodes ScMap as an ordered entry vector and does not re-impose canonical key ordering on decode"]
mechanism_brief = "structToNative named-struct branch pairs ScMap entries to spec fields by positional index and ignores entry.key(); a reordered remote scvMap swaps field values/types silently, while encode-side nativeToStruct emits explicit keyed entries."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:structToNative"
guarantee = "no key-vs-fieldname comparison and no entry-count check exist on the structToNative map decode path (spec.ts:1156-1162); encode-side nativeToStruct keys entries but decode never re-validates"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:scValUdtToNative"
guarantee = "no source-proven ScMap key-matching or ordering guard blocks this exact decode path between funcResToNative and structToNative"
```
