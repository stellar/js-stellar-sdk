# R931: BytesN<N> string argument encoded without fixed-length validation

**Date**: 2026-06-18
**Subsystem**: contract
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/contract/931-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

The argument-encode path was traced end to end in current source:

- `src/contract/spec.ts:590-594` — `funcArgsToScVals` builds contract-call
  arguments via `this.nativeToScVal(readObj(args, input), input.type())`. The
  type comes from the spec (`input.type()` → `xdr.ScSpecTypeDef`), so for a
  method declaring a `BytesN<N>` parameter this is the live, signed/submitted
  argument path.
- `src/contract/spec.ts:844-845` — when the supplied value is a `string`,
  `nativeToScVal` dispatches to `stringToScVal(val, t)`, where `t = ty.switch()`
  is only the `xdr.ScSpecType` tag.
- `src/contract/spec.ts:91-93` — inside `stringToScVal`, `scSpecTypeBytes` and
  `scSpecTypeBytesN` fall through to a single branch:
  `return xdr.ScVal.scvBytes(Buffer.from(str, "base64"))`. There is **no**
  comparison of the decoded length against the declared `N`. (Note: within
  `stringToScVal` the width is not even reachable — the function receives the
  `ScSpecType` tag, not the `ScSpecTypeDef`, so `bytesN().n()` is unavailable
  here; fixing this requires threading the def/width down, not just adding a
  check. The hypothesis slightly overstated reachability, but the gap stands.)
- `src/contract/spec.ts:715-735` — for the **identical** type switch, the
  `Uint8Array || Buffer.isBuffer(val)` branch enforces the invariant:
  `if (copy.length !== bytesN.n()) throw new TypeError(...)` for
  `scSpecTypeBytesN`, proving the fixed-length invariant is intended and that the
  string path is an asymmetric gap.

The deviation is real and source-proven: the SDK enforces the `BytesN<N>`
fixed-length invariant on one input shape (binary) and silently skips it on the
other (string/base64).

## Findings

**Security impact: contract binding type confusion / encoding integrity
(Medium).** A `BytesN<N>` argument (hash, salt, key, address-bytes) supplied as a
base64 string is encoded into an `scvBytes` of arbitrary length, never validated
against the declared `N`. The same argument supplied as `Uint8Array`/`Buffer`
would be rejected if its length differed from `N`. Two further amplifiers were
confirmed in source:

1. The branch is shared with plain `Bytes`, so there is no type-specific
   handling — the width is structurally ignored.
2. Node's `Buffer.from(str, "base64")` is lenient: it silently drops non-base64
   characters and tolerates missing padding, so distinct strings can decode to
   the same or shortened payloads. This compounds the length divergence and means
   the encoded bytes can differ from any reasonable interpretation of the input
   string.

Result: an application that trusts the SDK's declared `BytesN` typing can build
and submit a transaction whose contract argument has a length the SDK's own type
system claims to guarantee but does not. The declared `N` originates from the
contract spec, which on `Client.fromWasmHash`/`deploy` is RPC-fetched
(`getContractWasmByHash`), so `N` is remote-influenced; the SDK takes
responsibility for the check on the binary path, so this is an SDK validation
gap, not pure caller responsibility.

Severity is held at Medium (not High): the argument *value* is caller-supplied,
so this is a binding/encoding-integrity type-confusion gap rather than a
remote-injection primitive that rewrites an intended argument behind the
application's back. It is above Low because it violates an SDK-enforced invariant
on the normal contract-call path and can silently produce wrong-length
fixed-width arguments in submitted transactions.

## PoC Guidance

- **Test file**: append to the existing spec conversion unit tests under
  `test/unit` that already exercise `Spec`/`nativeToScVal` (the
  `spec`/`nativeToScVal` suite).
- **Setup**: construct a `Spec` (or minimal `xdr.ScSpecTypeDef.scSpecTypeBytesN`
  with `n = 32`). Build via `yarn build:node`, run with
  `yarn test:node -- <path>`.
- **Steps**:
  1. Call `nativeToScVal(someBase64String, bytesN32Type)` with a string whose
     base64 decodes to a length other than 32 (e.g. a short string, or one with
     stripped non-base64 chars).
  2. Call `nativeToScVal(new Uint8Array(10), bytesN32Type)` for contrast.
- **Assertion**:
  - The `Uint8Array` call throws `TypeError` (`expected 32 bytes, but got 10`).
  - The string call does **not** throw and returns an `scvBytes` whose
    `.bytes().length !== 32`, demonstrating the asymmetric missing length check.
  - Optionally assert lenient base64: two distinct strings (one with an injected
    non-base64 char) decode to the same `scvBytes` payload.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "contract"
route_id = "js-sdk-3d586da60823b3f0f83266b1"
weakness = "buffer_decode"
record_kind = "single_path"
path = ["funcArgsToScVals", "nativeToScVal", "stringToScVal", "Buffer.from"]
sink = "Buffer.from"
sink_role = "buffer_decode"
impact_class = "encoding_integrity"
route_family = "buffer_decode"
material_effect = "buffer_decode"
target_functions = ["src/contract/spec.ts:stringToScVal", "src/contract/spec.ts:nativeToScVal", "src/contract/spec.ts:funcArgsToScVals"]
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
rules_out = ["source trace of spec.ts:70-103, 715-735, and 844-845 confirms the string/base64 BytesN encode path has no length-vs-N or base64-strictness guard, while the binary path enforces copy.length===bytesN.n(); no upstream guard blocks this exact path", "this argument-encode mechanism is distinct from the result-decode finding js-sdk-26a2c419baf9cb084b019288 (funcResToNative/scValToNative), so it is not a duplicate or subsumed"]
does_not_rule_out = ["nearby variants outside this exact reviewed path remain unassessed, including malicious-RPC WASM spec parse resource/shape issues in parseWasmCustomSections/processSpecEntryStream", "whether the Soroban host independently rejects wrong-length scvBytes for a BytesN parameter at execution time"]
assumptions = ["funcArgsToScVals/nativeToScVal is the normal contract-call argument-build path feeding signed/submitted transactions (source-confirmed at spec.ts:590-594)", "input.type() yields the declared ScSpecTypeDef including BytesN width from the spec"]
mechanism_brief = "stringToScVal encodes BytesN via Buffer.from(str,'base64') sharing the Bytes branch with no length-vs-N check, while the Uint8Array path for the same type enforces copy.length===bytesN.n(); base64 decode is also lenient, so a fixed-width BytesN argument is silently encoded at the wrong length on the string input path."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/contract/spec.ts:nativeToScVal"
guarantee = "BytesN length is enforced only on the Uint8Array/Buffer input path (spec.ts:715-735, copy.length===bytesN.n()); the string/base64 path (spec.ts:91-93) has no equivalent length or base64-strictness guard"

[[blockers]]
kind = "not_found"
source = "src/contract/spec.ts:stringToScVal"
guarantee = "no source-proven length or encoding guard blocks the string->BytesN encode path; stringToScVal only receives the ScSpecType tag and has no width check"
```
