# F921: Path blocked: expected-args accepted then unenforced before sign

**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/921-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> fromXDR -> validateInvokeContractOp -> sign`

Residual question: a future variant where an expected-args parameter is
accepted and then unenforced before the transaction is signed.

## Blocker

No path both accepts application-expressed contract args and then signs a
deviating set. On the deserialize routes (`fromJSON`, `fromXDR`) the options
type is `Omit<...,'args'>`, so no expected-args intent exists for the SDK to
bind against — exactly the prior NOT_VIABLE basis, re-confirmed from source. On
the build route, `options.args` are encoded locally into the host function via
`Contract.call(method, ...args)` and that `func` is carried verbatim through
simulation: `assembleTransaction` preserves `func: invokeOp.func` from the
locally built operation and only replaces `auth`/`sorobanData` from the RPC
response, never the function arguments. `validateInvokeContractOp` adds a
contract-address and (in `fromJSON`) method-name binding, and its lack of an
args check is immaterial because its only callers carry no expected args. The
signed bytes (`this.built.toXDR()`) therefore always reflect the locally chosen
args, so the "accepted-then-unenforced" variant has no source instance.

## Evidence

- `src/contract/assembled_transaction.ts:433-462` - `fromJSON` options are `Omit<...,'args'>`; checks method-name binding (458-461) but accepts no expected args.
- `src/contract/assembled_transaction.ts:492-520` - `fromXDR` options are `Omit<...,'args'|'method'|'parseResultXdr'>`; method derived from envelope, no expected args.
- `src/contract/assembled_transaction.ts:577` / `667-672` - build and restore-rebuild encode `options.args` locally into `func` via `Contract.call`.
- `src/rpc/transaction.ts:104-116` - `assembleTransaction` preserves `func: invokeOp.func` from the raw local op; only `auth` (when none present) and `sorobanData` come from the RPC simulation, never the function args.
- `src/contract/assembled_transaction.ts:689` / `835` - simulate replaces `this.built` via `assembleTransaction(...).build()`, then `sign` signs `this.built.toXDR()` — the locally built `func`.

## Negative Scope

- Rules out: an RPC simulation response or deserialized envelope silently substituting contract function arguments that deviate from app-expressed `options.args` before `sign`/`signAndSend`.
- Does not rule out: (a) RPC-supplied auth entries (`transaction.ts:115`) whose `rootInvocation` args differ — signer-inspection responsibility, prior route `signAuthEntries`; (b) cross-type/positional decode of returned ScVals in `spec.structToNative`/`funcResToNative` (separate VIABLE route `js-sdk-26a2c419baf9cb084b019288`).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-0c7fd0f9cb24e9cff64db9ee"
weakness = "transaction_signing"
record_kind = "residual_escalation"
path = ["<anonymous>", "fromXDR", "validateInvokeContractOp", "sign"]
sink = "sign"
sink_role = "transaction_signing"
impact_class = "parse_integrity"
route_family = "transaction_signing"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/assembled_transaction.ts:validateInvokeContractOp", "src/contract/assembled_transaction.ts:fromXDR", "src/contract/assembled_transaction.ts:fromJSON", "src/rpc/transaction.ts:assembleTransaction", "src/contract/assembled_transaction.ts:sign"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["expected_args_omitted_from_deserialize_options", "func_preserved_through_simulation_assemble"]
rules_out = ["deserialize routes Omit 'args' so no application-expressed arg intent exists, and the build route's func (contract+method+args) is preserved verbatim by assembleTransaction (only auth/sorobanData come from RPC), so no accepted-then-unenforced arg deviation reaches sign"]
does_not_rule_out = ["RPC-supplied auth entry rootInvocation args via assembleTransaction auth substitution (signAuthEntries signer-inspection route)", "cross-type/positional ScVal decode in spec.structToNative/funcResToNative (route js-sdk-26a2c419baf9cb084b019288)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "expected contract args, when present, are encoded locally into func and preserved through simulate/assemble to sign; deserialize routes carry no expected args (Omit), so there is no accepted-but-unenforced args variant"
why_failed_brief = "func arguments are never replaced by attacker-controlled RPC/envelope data before sign, and the only args-omitting routes express no arg intent to enforce"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "data_preservation"
guarantee = "assembleTransaction (src/rpc/transaction.ts:107-116) rebuilds the invokeHostFunction op with func: invokeOp.func from the locally built op; only auth (when none present) and sorobanData are taken from the RPC simulation, so function arguments cannot be substituted by the server"

[[sanitizer_guarantees]]
kind = "type_constraint"
guarantee = "fromJSON (Omit<...,'args'>) and fromXDR (Omit<...,'args'|'method'|'parseResultXdr'>) accept no application-supplied args, so no expected-args intent exists on the deserialize routes for an attacker-decoded envelope to deviate from"

[[blockers]]
kind = "binding_check"
guarantee = "validateInvokeContractOp (src/contract/assembled_transaction.ts:377-431) binds the envelope's single invokeHostFunction/invokeContract op to the configured contractId, and fromJSON additionally binds the method name (458-461), before any signing"
```
