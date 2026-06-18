# F1023: Path blocked: contract spec value conversion across the RPC trust boundary

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/1023-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> nativeToScVal`

Area seed targets re-traced from source: `nativeToScVal`, `scValToNative`,
`getSACBalance`, and the generic `<anonymous>` conversion entrypoints.

## Blocker

In `src/rpc`, `nativeToScVal`/`scValToNative` are reachable only through
`getSACBalance` (server.ts:1447, 1476). The forward call converts a constant
`"Balance"` symbol plus a StrKey-validated contract address
(server.ts:1435,1447-1449; scval.ts:288-298) — no remote or unvalidated
attacker value crosses into key construction, so it cannot forge a divergent
ledger key. The reverse `scValToNative` decodes a ledger entry the remote RPC
server already fully authoritatively controls with no signature or cross-check
(server.ts:1464-1490): conversion confusion in either direction yields only a
validly-typed value the server could already return, granting no new capability
above Medium. The map decode uses `Object.fromEntries`
(CreateDataProperty semantics — scval.ts:404-409), so no prototype pollution;
unbounded recursion (scval.ts:398,406) only throws a catchable RangeError = Low.

## Evidence

- `src/rpc/server.ts:1435` - `StrKey.isValidContract` gates the only
  caller-supplied input to the forward conversion.
- `src/rpc/server.ts:1447-1449` - key built from a constant symbol + validated
  address; no remote field participates.
- `src/rpc/server.ts:1464-1490` - decoded entry is the server's authoritative
  balance, returned with no cross-check or signature.
- `src/base/scval.ts:288-298` - string/symbol/address forward conversion paths
  for the key are type-hint driven, no remote influence.
- `src/base/scval.ts:404-409` - scvMap reverse decode via `Object.fromEntries`
  (no `__proto__` setter invocation), and `src/base/scval.ts:398,406` -
  unbounded but only RangeError-throwing recursion.

## Negative Scope

- Rules out: remote-server or caller influence on the
  `getSACBalance -> nativeToScVal` forward key conversion, and prototype
  pollution / type-confusion in the `scValToNative` reverse decode, producing a
  Medium+ forged-key, capability-grant, or pollution effect.
- Does not rule out: spec-driven contract-binding conversion in
  `src/contract/spec.ts` (a distinct sink not exercised by the rpc subsystem),
  and the below-Medium catchable RangeError on deeply nested server ScVals.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-7aea41b1dd99d10a80ac9754"
weakness = "contract spec value conversion integrity"
record_kind = "area_seed"
path = ["<anonymous>", "nativeToScVal"]
sink = "nativeToScVal"
sink_role = "contract_spec_conversion"
impact_class = "contract_interface_integrity"
route_family = "contract_spec_conversion"
material_effect = "contract_spec_conversion"
target_functions = ["<anonymous>", "scValToNative", "getSACBalance", "nativeToScVal"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["getSACBalance_forward_key_constant_symbol_strkey_validated_address", "scValToNative_map_objectfromentries_no_proto_pollution", "scValToNative_decode_server_authoritative_no_cross_check"]
rules_out = ["remote/caller influence on getSACBalance->nativeToScVal forward key conversion forging a ledger key (server.ts:1447-1449)", "prototype pollution or Medium+ type confusion in scValToNative reverse decode of the SAC balance entry (scval.ts:404-409, server.ts:1476)"]
does_not_rule_out = ["spec-driven binding conversion in src/contract/spec.ts (distinct sink outside rpc)", "below-Medium catchable RangeError on deeply nested server-controlled ScVals (scval.ts:398,406)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "In rpc, nativeToScVal/scValToNative are reached only via getSACBalance: forward key uses a constant symbol plus StrKey-validated address, reverse decode reads a server-authoritative entry with no cross-check; map decode via Object.fromEntries avoids prototype pollution."
why_failed_brief = "Forward conversion has no remote/unvalidated input; reverse conversion only reproduces values the authoritative server already controls; map decode is pollution-safe; only residual effect is a Low catchable RangeError."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "input_validation"
guarantee = "getSACBalance validates the caller address with StrKey.isValidContract before the forward nativeToScVal key build (server.ts:1435)"

[[sanitizer_guarantees]]
kind = "safe_api"
guarantee = "scValToNative map decode uses Object.fromEntries CreateDataProperty semantics, creating an own __proto__ data property without invoking the prototype setter (scval.ts:404-409)"

[[blockers]]
kind = "trust_model"
guarantee = "the remote RPC server is the sole authoritative source of the SAC balance entry with no signature or cross-check, so reverse-conversion confusion grants no capability beyond a value the server could already return (server.ts:1464-1490)"

[[blockers]]
kind = "severity_threshold"
guarantee = "unbounded scValToNative recursion on nested server ScVals only throws a catchable RangeError, rated Low and below the Medium objective minimum (scval.ts:398,406)"
```
