# H976: Hypothesis batch for spec-driven Client constructor identifier collision / field shadowing

**Date**: 2026-06-18
**Subsystem**: contract
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/contract/976-residual-seed.md
**Hypothesis by**: claude-opus-4-8, high

## Shared Path Context

Path: `Client.from` / `Client.fromWasmHash` -> `Client.fromWasm` -> `Spec.fromWasm(wasm)` -> `new Client(spec, options)`.

Trust boundary: the spec consumed by the constructor is decoded from a contract
wasm binary. For `Client.from({contractId, rpcUrl})` and `Client.fromWasmHash`
the wasm is fetched from an RPC server (`server.getContractWasmByContractId` /
`getContractWasmByHash`) and is authored by the contract deployer; for
`Client.fromWasm(wasm, options)` the app passes the wasm directly. Prior VIABLE
record `js-sdk-d6ede4f50f471c78ff302843` already established that there is no
`sha256(wasm)==wasmHash` verification, so even a "trusted" contractId yields an
attacker-substitutable wasm/spec. Therefore the **spec function names are
attacker-controlled** at the constructor.

The constructor (`src/contract/client.ts:92-136`) iterates every spec function
and does:

```js
this[sanitizeIdentifier(method)] = ...assembleTransaction wrapper...
```

`method = xdrFn.name().toString()` is the raw spec function name.
`ScSpecFunctionV0.name` is an XDR `string<30>`, NOT a restricted Soroban
`Symbol`, so it may contain arbitrary bytes (spaces, `-`, `.`, dunders) up to 30
chars. `sanitizeIdentifier` (`src/bindings/utils.ts:65-83`) only:
1. replaces chars outside `[a-zA-Z0-9_$]` with `_` (lossy, many->one),
2. appends `_` if the result is a JS keyword or `constructor`,
3. prepends `_` if it starts with a digit,
4. returns `_unnamed` if empty or **all** underscores.

It does **not** reserve the Client's own instance members (`txFromJSON`,
`txFromXDR`, `spec`, `options`), and its all-underscore fallback misses
`__proto__` (which contains letters).

Critical ordering fact (verified empirically at `target: es2022`, native class
fields): for a base class the instance field initializers (`txFromJSON`,
`txFromXDR` at client.ts:201/214) and parameter-property assignments
(`spec`, `options`) run **before** the explicit constructor body. The `forEach`
loop runs last and therefore **overwrites** any of those own properties when a
spec function sanitizes to the same key. Runtime check:
`new C(); c.txFromJSON === "WRAPPER"`, `c.spec === "WRAPPER"`, and
`this["__proto__"]=fn` flips the instance prototype (`c instanceof C === false`).

Prior memory: route NOT_VIABLE `js-sdk-25ba1e1365cc508195eff159` covered only
the wasm **parser** cluster (`parseWasmCustomSections`/`specFromWasm`/
`processSpecEntryStream`) and explicitly deferred this constructor question for
lack of budget. The mechanisms below live in the **Client constructor**, a
distinct sink from the parser cluster, and are not the sha256-integrity gap
already recorded VIABLE.

## Candidate 1

**Candidate ID**: C1
**Severity**: Medium
**Impact**: Remote/spec trust confusion — attacker spec silently replaces the SDK's own transaction-deserialization methods (`txFromJSON`/`txFromXDR`)
**Mechanism**: A spec function literally named `txFromJSON` (or `txFromXDR`) sanitizes unchanged and the constructor `forEach` overwrites the instance field that holds the deserializer with a contract-method wrapper.
**Trigger**: App constructs a Client from an attacker-authored/RPC-substituted contract whose spec exports a function named `txFromJSON`/`txFromXDR`, then later calls `client.txFromJSON(storedJson)` to rehydrate a previously built `AssembledTransaction`.
**Target Functions**:
- `src/contract/client.ts:Client.constructor:105-135`
- `src/contract/client.ts:Client.txFromJSON:201-212`
- `src/bindings/utils.ts:sanitizeIdentifier:65-83`

### Expected Behavior

`client.txFromJSON(json)` should deserialize a stored AssembledTransaction via
`AssembledTransaction.fromJSON`. After shadowing it instead executes
`assembleTransaction(args = json, methodOptions = undefined)`, i.e.
`AssembledTransaction.build({ method: "txFromJSON", args: spec.funcArgsToScVals("txFromJSON", json) ... })`.

### Evidence

- `src/contract/client.ts:201` / `:214` declare `txFromJSON`/`txFromXDR` as
  instance arrow-function fields (own properties).
- `src/contract/client.ts:131` `this[sanitizeIdentifier(method)] = wrapper`
  overwrites own properties because the loop runs after field init (verified at
  runtime, es2022 native fields).
- `src/bindings/utils.ts:2-58` reserved list contains only JS keywords +
  `constructor`; `txFromJSON`/`txFromXDR` pass through unchanged
  (`src/bindings/utils.ts:67-82`).

### Anti-Evidence

The replacement deserializer receives a JSON **string** where the wrapper
expects a named-args `Record`, so `funcArgsToScVals` may throw rather than build
a fully attacker-shaped tx — making the most reliable outcome a broken/incorrect
deserialization (a resume/rehydrate flow silently fails or mis-builds) rather
than guaranteed silent fund movement. This keeps the floor at Medium (integrity
loss / unsafe app behavior) and does not block the mechanism itself.

```toml-index
schema = 1
verdict = "CANDIDATE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "spec_function_name_shadows_sdk_deserializer"
record_kind = "single_path"
path = ["from", "Client.fromWasm", "Client.constructor"]
sink = "Client.constructor"
sink_role = "runtime_binding_method_assignment"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor", "src/contract/client.ts:Client.txFromJSON", "src/bindings/utils.ts:sanitizeIdentifier"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = ["spec name collision between two contract functions (C4)", "spec name overwriting spec/options state (C2)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "spec function named txFromJSON/txFromXDR overwrites Client instance deserialization fields via this[sanitizeIdentifier(method)] in constructor forEach run after field init"
why_failed_brief = "not failed; candidate survived checked blockers"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "sanitizeIdentifier reserved list (utils.ts:2-58) covers only JS keywords + constructor; txFromJSON/txFromXDR are not reserved and pass unchanged"

[[blockers]]
kind = "not_found"
guarantee = "no source-proven guard prevents a spec function name from overwriting an own instance property in the constructor forEach"
```

## Candidate 2

**Candidate ID**: C2
**Severity**: Medium
**Impact**: Remote/spec trust confusion — attacker spec overwrites the Client's `spec`/`options` state, corrupting all later decode/sign/submit operations on that Client
**Mechanism**: A spec function named `spec` or `options` sanitizes unchanged and the constructor `forEach` overwrites the readonly parameter-property `this.spec`/`this.options` with a wrapper function.
**Trigger**: App constructs a Client from an attacker-authored/RPC-substituted contract whose spec exports a function named `spec` or `options`.
**Target Functions**:
- `src/contract/client.ts:Client.constructor:92-135`
- `src/bindings/utils.ts:sanitizeIdentifier:65-83`

### Expected Behavior

`this.spec` should remain the decoded `Spec`; `this.options` should remain the
`ClientOptions`. Every later call that reads `this.spec.funcResToNative` /
`this.options` (e.g. `txFromJSON`/`txFromXDR`) relies on them.

### Evidence

- `src/contract/client.ts:92-94` declares `public readonly spec`,
  `public readonly options` (own data properties set before the body).
- `src/contract/client.ts:131` overwrites own properties; runtime check shows
  `c.spec === "WRAPPER"` after a forEach assigning `this["spec"]`.
- The loop body itself reads the **closure** param `spec`, not `this.spec`
  (client.ts:116-127), so it keeps running; only later instance use breaks —
  confirming the corruption is latent and reaches `txFromJSON`/`txFromXDR`
  (client.ts:208/215 read `this.spec`/`this.options`).

### Anti-Evidence

Outcome is primarily integrity corruption / DoS of the constructed Client (later
calls throw or misbehave) rather than guaranteed silent malicious submission;
floor stays Medium. No guard checked that blocks it.

```toml-index
schema = 1
verdict = "CANDIDATE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "spec_function_name_overwrites_client_state"
record_kind = "single_path"
path = ["from", "Client.fromWasm", "Client.constructor"]
sink = "Client.constructor"
sink_role = "runtime_binding_method_assignment"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor", "src/bindings/utils.ts:sanitizeIdentifier"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = ["deserializer shadowing (C1)", "prototype corruption via __proto__ (C3)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "spec function named spec/options overwrites readonly Client parameter-properties via constructor forEach assignment, corrupting later decode/sign/submit"
why_failed_brief = "not failed; candidate survived checked blockers"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "sanitizeIdentifier does not reserve instance state names spec/options (utils.ts:2-58)"

[[blockers]]
kind = "not_found"
guarantee = "no source-proven guard prevents overwriting this.spec/this.options in the constructor forEach"
```

## Candidate 3

**Candidate ID**: C3
**Severity**: Medium
**Impact**: Integrity corruption — attacker spec corrupts the Client instance prototype, breaking `instanceof Client` and removing inherited methods; a clear sanitizer-bypass of the intended dunder fallback
**Mechanism**: A spec function named `__proto__` is NOT caught by the `/^_+$/` all-underscore fallback (it contains letters), so it passes through unchanged; `this["__proto__"] = wrapperFn` invokes the `__proto__` accessor and, since a function is an object, replaces the instance's `[[Prototype]]`.
**Trigger**: App constructs a Client from an attacker-authored/RPC-substituted contract whose spec exports a function named `__proto__`.
**Target Functions**:
- `src/contract/client.ts:Client.constructor:105-135`
- `src/bindings/utils.ts:sanitizeIdentifier:65-83`

### Expected Behavior

The `_unnamed` fallback (utils.ts:78-80) is clearly intended to neutralize
underscore/dunder names; `__proto__` should be defused. Instead the instance
prototype is replaced.

### Evidence

- `src/bindings/utils.ts:78` `/^_+$/.test("__proto__")` is `false` (verified) so
  the fallback does not fire; `__proto__` is returned verbatim.
- `src/contract/client.ts:131` `this["__proto__"] = fn` — runtime check shows
  `Object.getPrototypeOf(c)` is changed and `c instanceof C === false`.

### Anti-Evidence

This is single-instance prototype corruption, not global `Object.prototype`
pollution: the wrapper value is a fresh function, and the assignment uses the
proto setter rather than creating an enumerable own `__proto__` key. Client has
no behavior-critical methods on its prototype (deploy/from/fromWasm are static;
txFromJSON/txFromXDR are own fields), so impact is mostly `instanceof`/inherited-
method breakage plus loss of `Object.prototype` helpers on the instance. Floor
held at Medium as an integrity/defense-bypass; not a prototype-pollution gadget.

```toml-index
schema = 1
verdict = "CANDIDATE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "sanitizeIdentifier_dunder_fallback_bypass_proto"
record_kind = "single_path"
path = ["from", "Client.fromWasm", "Client.constructor"]
sink = "Client.constructor"
sink_role = "runtime_binding_method_assignment"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor", "src/bindings/utils.ts:sanitizeIdentifier"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = ["global Object.prototype pollution (not demonstrated here)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "spec function named __proto__ bypasses the all-underscore _unnamed fallback and replaces the Client instance prototype via this['__proto__']=fn in the constructor forEach"
why_failed_brief = "not failed; candidate survived checked blockers"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "all-underscore fallback /^_+$/ at utils.ts:78 does not match __proto__ (verified)"

[[blockers]]
kind = "not_found"
guarantee = "no guard rejects __proto__ as a spec function key before this['__proto__'] assignment"
```

## Candidate 4

**Candidate ID**: C4
**Severity**: High
**Impact**: Methods that misrepresent the contract interface — two distinct spec function names collapse to one JS identifier, so `client.<name>` invokes a different on-chain function than the spec/UI/allowlist displays
**Mechanism**: `sanitizeIdentifier` is lossy (every char outside `[a-zA-Z0-9_$]` -> `_`), and `ScSpecFunctionV0.name` is an arbitrary `string<30>`. Two entries such as `transfer_fee` and `transfer-fee` both sanitize to `transfer_fee`; the later iterated entry overwrites the earlier `this.transfer_fee`, and the wrapper closes over the **raw** `method` name used for `funcArgsToScVals(method,...)` and `AssembledTransaction.build({method})`.
**Trigger**: App constructs a Client from an attacker-authored contract whose spec contains two functions that sanitize to the same identifier, then calls the benign-named method `client.transfer_fee(args)`, which actually invokes the malicious raw-named function (or vice versa, depending on spec order).
**Target Functions**:
- `src/contract/client.ts:Client.constructor:105-135`
- `src/bindings/utils.ts:sanitizeIdentifier:65-83`

### Expected Behavior

Each contract function should map to a distinct, faithfully-named client method
so that `client.<name>` invokes the function the app/reviewer believes it does.

### Evidence

- `src/bindings/utils.ts:67` collapses many raw names to one identifier; no
  collision detection or de-duplication exists in `sanitizeIdentifier` or in the
  constructor loop.
- `src/contract/client.ts:131` assigns by sanitized key with no
  already-present check, so the last colliding entry wins (last-write).
- `src/contract/client.ts:106,116,127` the wrapper uses the raw `method` for
  `funcArgsToScVals` and `parseResultXdr`, so the executed invocation follows the
  surviving raw name, not the name the app reasoned about.

### Anti-Evidence

Both colliding functions live on the same already-chosen contract, so for a
fully-malicious contract the operator could make the named function malicious
directly. The material High-floor case is interface misrepresentation that
defeats a spec-name allowlist / review / wallet display that enumerates
`spec.funcs()` names — the invoked function differs from the displayed one. No
guard checked that prevents the collision.

```toml-index
schema = 1
verdict = "CANDIDATE"
failed_at = "hypothesis"
subsystem = "contract"
route_id = "js-sdk-25ba1e1365cc508195eff159"
weakness = "lossy_sanitizeIdentifier_method_name_collision"
record_kind = "single_path"
path = ["from", "Client.fromWasm", "Client.constructor"]
sink = "Client.constructor"
sink_role = "runtime_binding_method_assignment"
impact_class = "contract_interface_integrity"
route_family = "contract_wasm_parse"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/client.ts:Client.constructor", "src/bindings/utils.ts:sanitizeIdentifier"]
scope.trust_boundary = "application_input_or_remote_rpc_server"
scope.protocol_phase = "contract_transaction_assembly"
scope.auth_state = "caller_key_or_wallet_required"
scope.attacker_control = "contract_spec_wasm_json_and_rpc_response"
scope.parser_state = "json_xdr_or_wasm_decoded"
scope.size_class = "bounded_by_contract_spec_and_transaction"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = []
rules_out = []
does_not_rule_out = ["shadowing of SDK own members (C1/C2)"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "lossy sanitizeIdentifier maps two distinct ScSpecFunctionV0 string<30> names to one JS key; last-write wins and client.<name> invokes a different raw contract function than displayed"
why_failed_brief = "not failed; candidate survived checked blockers"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "sanitizeIdentifier performs lossy [^a-zA-Z0-9_$]->_ mapping with no collision detection (utils.ts:67)"

[[blockers]]
kind = "not_found"
guarantee = "no de-duplication or already-present check in the constructor loop (client.ts:105-135)"
```
