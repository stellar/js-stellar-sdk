# F934: Path blocked: custom authorizeEntry override bypasses needsNonInvokerSigningBy gating

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/934-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`signAuthEntry -> keypair\n      .sign`

Residual question (escalated): does a custom `authorizeEntry` override path bypass
`needsNonInvokerSigningBy` gating in `AssembledTransaction.signAuthEntries`?

## Blocker

Concrete answer to the residual question: YES, the gating block at
`assembled_transaction.ts:1019-1036` (the `needsNonInvokerSigningBy` length check,
the `address`-membership check, and the `signAuthEntry` presence check) only runs
when `authorizeEntry === stellarBaseAuthorizeEntry`, so passing a custom
`authorizeEntry` skips all three checks. But this is not attacker-reachable: a
`grep` over `src/contract/` shows `authorizeEntry` exists ONLY as a call-time
parameter of `signAuthEntries`, defaulting to the safe `stellarBaseAuthorizeEntry`.
It is never a field of `ClientOptions`/`MethodOptions` (`types.ts`) and is never
deserialized from JSON, XDR, WASM spec, or any RPC/Horizon response. The only way
to set a custom value is the application developer deliberately calling
`signAuthEntries({ authorizeEntry: fn })` — an explicitly documented "pro use-case"
override (lines 1008-1013) where the docs also state `signAuthEntry` is then
ignored. The default path retains full gating. This requires the developer to
intentionally disable a documented control, which is out of scope.

## Evidence

- `src/contract/assembled_transaction.ts:990` - `authorizeEntry = stellarBaseAuthorizeEntry` is the parameter default; safe stellar-base function unless caller overrides.
- `src/contract/assembled_transaction.ts:1019-1036` - gating checks run only inside `if (authorizeEntry === stellarBaseAuthorizeEntry)`; a custom function skips them.
- `src/contract/assembled_transaction.ts:1008-1013` - JSDoc documents the override as an intentional caller "pro use-case" that overrides defaults and causes `signAuthEntry` to be ignored.
- `grep authorizeEntry src/contract/` - symbol appears only in `assembled_transaction.ts` as the local parameter; absent from `types.ts` option shapes, so no deserialized/attacker-controlled injection point exists.

## Negative Scope

- Rules out: a remote RPC response, contract spec/WASM, or JSON/XDR transaction state injecting or selecting a custom `authorizeEntry` to bypass the `needsNonInvokerSigningBy` gating in `signAuthEntries`.
- Does not rule out: wrong-bytes/auth-entry trust confusion on the DEFAULT `stellarBaseAuthorizeEntry` path where attacker-influenced `rawInvokeHostFunctionOp.auth` entries reach the `signAuthEntry`/`keypair.sign` callback (a distinct route; see prior records on auth rootInvocation binding).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-21a283f9416b523123d156ca"
weakness = "transaction_signing"
record_kind = "residual_escalation"
path = ["signAuthEntry", "keypair\n      .sign"]
sink = "keypair\n      .sign"
sink_role = "transaction_signing"
impact_class = "authorization_integrity"
route_family = "transaction_signing"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/assembled_transaction.ts:signAuthEntries"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["authorizeentry_override_is_calltime_param_not_deserialized", "custom_authorizeentry_is_documented_caller_optin_not_sdk_default"]
rules_out = ["a remote/spec/JSON/XDR attacker cannot inject or select a custom authorizeEntry function to bypass needsNonInvokerSigningBy gating, because authorizeEntry is a call-time parameter defaulting to stellarBaseAuthorizeEntry and is never part of any deserialized option/state"]
does_not_rule_out = ["wrong-bytes or auth-entry trust confusion on the default stellarBaseAuthorizeEntry path where attacker-influenced rawInvokeHostFunctionOp.auth entries reach signAuthEntry/keypair.sign"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "signAuthEntries skips the needsNonInvokerSigningBy/address/signAuthEntry gating when a custom authorizeEntry is passed, but authorizeEntry is a documented caller-supplied call-time parameter (default stellarBaseAuthorizeEntry) that is never deserialized from any attacker-controlled spec/JSON/XDR/RPC source, so the bypass requires the application developer to intentionally disable a documented control"
why_failed_brief = "gating bypass is real but reachable only via deliberate caller-supplied authorizeEntry override (out of scope); no attacker-controlled injection point for the function parameter"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "authorizeEntry parameter defaults to stellarBaseAuthorizeEntry (assembled_transaction.ts:990); the needsNonInvokerSigningBy/address/signAuthEntry gating at lines 1019-1036 runs on this default path"

[[sanitizer_guarantees]]
kind = "no_injection_point"
guarantee = "authorizeEntry is absent from ClientOptions/MethodOptions (types.ts) and is never deserialized from JSON/XDR/WASM/RPC; grep over src/contract shows it only as the local signAuthEntries parameter"

[[blockers]]
kind = "out_of_scope_policy"
guarantee = "setting a custom authorizeEntry requires the application developer to deliberately call signAuthEntries with their own function, a documented pro-use-case override (assembled_transaction.ts:1008-1013); disabling a documented control by intentional developer action is out of scope"
```
