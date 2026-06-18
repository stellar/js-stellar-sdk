# F930: Path blocked: recursive nested ScSpecTypeDef decode stack overflow (below Medium)

**Subsystem**: bindings
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/bindings/930-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> fromXDR`

Concretely: `Spec(buffer)` constructor -> `processSpecEntryStream` -> `xdr.ScSpecEntry.read(reader)` (and the sibling `xdr.ScSpecEntry.fromXDR` array path), decoding attacker-controlled contract spec bytes fetched via RPC during binding generation.

## Residual Question Resolved (concrete yes/no)

**Does recursive nested `ScSpecTypeDef` decode cause a stack overflow? YES — the mechanism is real and reachable.** `ScSpecTypeDef` is a self-recursive XDR union: its `option`, `result`, `vec`, `map`, and `tuple` arms each embed one or more nested `ScSpecTypeDef` (curr_generated.js:8290-8408). Decoding `Option<Option<...>>` (or `Vec<Vec<...>>`) recurses synchronously once per nesting level, ~4 bytes of discriminant per level, with no depth guard in the `@stellar/js-xdr` reader. A spec of ~40-50 KB (≈10.8k nesting levels at Node's default stack) overflows the JS call stack.

**Is it a viable finding? NO — below the Medium severity floor.** The overflow surfaces as a synchronous, catchable `RangeError` ("Maximum call stack size exceeded"). It is fail-closed: no malformed type is accepted, no transaction/auth/fee decision is corrupted, no fund movement, no unbounded loop or memory blowup. The work is strictly linear in input size (attacker must transmit ~N bytes to crash at depth N — no amplification). The missing depth guard is a `@stellar/js-xdr` dependency defect, not an SDK source guard. Decode happens at developer-time/build-time `Spec` construction during binding generation; handling errors from parsing untrusted remote spec data is documented caller responsibility. This matches the consistent prior-record treatment of catchable throws as "Low robustness/availability, below the Medium severity floor."

## Blocker

Severity threshold. The confirmed mechanism produces only a catchable, fail-closed `RangeError` whose cost is linear in attacker-supplied byte count (no amplification, no acceptance of malicious data, no hang, no corrupted security decision). Per the objective, low/availability-only issues and dependency defects without a Medium-class repo-specific impact are out of scope, and error handling of untrusted remote spec parsing is caller responsibility. The residual lead's own framing ("below Medium") is confirmed from source.

## Evidence

- `src/contract/utils.ts:181-189` - `processSpecEntryStream` loops `xdr.ScSpecEntry.read(reader)` until eof; this is the decode sink for spec bytes.
- `src/contract/spec.ts:520-537` - `Spec` constructor decodes attacker-controlled `Buffer`/base64 spec bytes via `processSpecEntryStream` / `xdr.ScSpecEntry.fromXDR`, reachable during binding generation from remote WASM/contract.
- `node_modules/@stellar/stellar-base/lib/generated/curr_generated.js:8290-8408` (dependency, mechanism only) - `ScSpecTypeDef` union arms `option`/`result`/`vec`/`map`/`tuple` each `xdr.lookup("ScSpecTypeDef")`, proving self-recursion with no depth bound in the reader.

## Negative Scope

- Rules out: catchable linear-work stack-overflow `RangeError` from recursive nested `ScSpecTypeDef` decode at the `fromXDR`/`ScSpecEntry.read` sink during binding generation as a Medium+ parse-integrity or DoS finding (fail-closed, no amplification, dependency-level missing depth guard, caller-responsibility error handling).
- Does not rule out: (a) an uncaught `RangeError` crashing a long-running caller process that constructs `Spec` from attacker-controlled remote spec without `try/catch`, if a future policy treats it as Medium availability; (b) super-linear/exponential amplification in `TypeGenerator`/`scValToNative` output generation (not traced — decode throws before generation runs).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "bindings"
route_id = "js-sdk-2c1fa47cdec31c940fd6e54c"
weakness = "xdr_decode"
record_kind = "single_path"
path = ["<anonymous>", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "parse_integrity"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/contract/utils.ts:processSpecEntryStream", "src/contract/spec.ts:Spec.constructor"]
scope.trust_boundary = "contract_spec_or_rpc_server"
scope.protocol_phase = "binding_generation"
scope.auth_state = "none"
scope.attacker_control = "contract_spec_names_types_and_wasm_bytes"
scope.parser_state = "spec_decoded"
scope.size_class = "bounded_by_contract_spec"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["recursive_scspectypedef_decode_catchable_rangeerror_below_medium"]
rules_out = ["catchable linear-work stack-overflow RangeError from recursive nested ScSpecTypeDef decode at fromXDR/ScSpecEntry.read during binding generation as a Medium+ finding"]
does_not_rule_out = ["uncaught RangeError process crash in a caller constructing Spec from attacker-controlled remote spec without try/catch", "exponential output amplification in TypeGenerator/scValToNative (not traced)"]
assumptions = ["no additional assumptions beyond cited source evidence", "Node.js synchronous deep recursion yields a catchable RangeError, consistent with prior records treating catchable throws as below Medium"]
mechanism_brief = "ScSpecTypeDef is a self-recursive XDR union (option/result/vec/map/tuple arms embed nested ScSpecTypeDef); xdr.ScSpecEntry.read recurses ~4 bytes/level with no depth guard, so a ~40-50KB nested spec overflows the JS stack and throws a catchable RangeError during Spec construction/binding generation."
why_failed_brief = "Mechanism confirmed reachable, but worst effect is a catchable, fail-closed, linear-work RangeError during developer-time binding decode; missing depth guard is a @stellar/js-xdr dependency defect; below the Medium severity floor."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "fail_closed_throw"
guarantee = "deep recursion raises a synchronous catchable RangeError; no malformed type is accepted and no downstream signing/fee/auth decision is corrupted"

[[blockers]]
kind = "severity_threshold"
guarantee = "catchable, fail-closed, strictly linear-work (no amplification) RangeError during developer-time spec decode; dependency-level missing depth guard with caller-responsibility error handling; below the Medium severity floor"
```
