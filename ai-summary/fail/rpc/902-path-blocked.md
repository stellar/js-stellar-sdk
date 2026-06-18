# F902: Path blocked: ScVal.fromXDR recursion depth in parseRawEvents

**Subsystem**: rpc
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/rpc/902-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`parseRawEvents -> fromXDR`

Concretely: `Server.getEvents` (public) -> `parseRawEvents` -> `xdr.ScVal.fromXDR`
on attacker-controlled base64 `evt.topic[]` and `evt.value` from a remote RPC
`getEvents` response.

## Blocker

The escalated residual question — a confirmed recursion-depth/stack-overflow bug
inside js-xdr `ScVal.fromXDR` — is refuted at source. The repo pins
`@stellar/js-xdr` to exactly `4.0.0`, whose decoder enforces a hard recursion
bound: `NestedXdrType.DEFAULT_MAX_DEPTH = 200`, and `NestedXdrType.checkDepth`
throws a catchable `XdrReaderError('exceeded max decoding depth')` once
`remainingDepth < 0`. Every nested read on the ScVal recursion chain
(`Union.read` for the ScVal union, `VarArray.read` for the `vec`/`map` arms)
calls `checkDepth` and recurses with `remainingDepth - 1`, and
`XdrType.fromXDR` enters `read` with the default depth of 200. A maliciously
nested ScVal therefore throws after ~200 frames — far below Node's default call
stack ceiling — propagating as an ordinary rejected promise from `getEvents`,
which is documented remote-response parse error handling, not a stack overflow
or unbounded recursion. The wide-but-shallow variant is bounded by
`VarArray`'s `remainingBytes()` fast-fail and `_maxLength`, i.e. linear in the
already-received response (already ruled out by prior route memory).

## Evidence

- `node_modules/@stellar/js-xdr/src/xdr-type.js:160-174` - `checkDepth` throws `XdrReaderError` at `remainingDepth < 0`; `DEFAULT_MAX_DEPTH = 200`.
- `node_modules/@stellar/js-xdr/src/union.js:68-79` - ScVal union read calls `checkDepth` and recurses with `remainingDepth - 1`.
- `node_modules/@stellar/js-xdr/src/var-array.js:19-39` - vec/map arm read calls `checkDepth`, recurses with `remainingDepth - 1`, and fast-fails on `remainingBytes()`.
- `node_modules/@stellar/js-xdr/src/xdr-type.js:68-71` - `static fromXDR` enters `read(reader)` with default depth 200.
- `src/rpc/parsers.ts:106-119` - `parseRawEvents` calls `xdr.ScVal.fromXDR` on attacker base64 topic/value with no SDK-side guard.
- `src/rpc/server.ts:890-893` - public `getEvents` pipes raw RPC response through `parseRawEvents`.
- `package.json` `@stellar/js-xdr` `"4.0.0"` (exact pin) - the depth-capped version is the one in use.

## Negative Scope

- Rules out: deep-nesting recursion / stack-overflow DoS via `ScVal.fromXDR` on the `parseRawEvents` (getEvents) path; bounded at depth 200 with a catchable throw.
- Does not rule out: other `fromXDR` decode sinks on sibling parsers (e.g. `parseTransactionInfo`, `parseRawSimulation`, `parseRawLedgerEntries`) if a future js-xdr downgrade or a type whose generated `_maxDepth` is overridden weakens the cap; and non-recursion failure modes on the same sink (already-covered linear cost).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "rpc"
route_id = "js-sdk-aa9b65c61d46ef89d4540f22"
weakness = "xdr_decode"
record_kind = "residual_escalation"
path = ["parseRawEvents", "fromXDR"]
sink = "fromXDR"
sink_role = "xdr_decode"
impact_class = "resource_exhaustion"
route_family = "xdr_decode"
material_effect = "re-investigate residual lead"
target_functions = ["src/rpc/parsers.ts:parseRawEvents", "node_modules/@stellar/js-xdr/src/xdr-type.js:fromXDR"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["xdr_decode_depth_capped_at_200", "recursion_depth_bounded_catchable_throw"]
rules_out = ["deep-nesting recursion/stack-overflow DoS via ScVal.fromXDR on the parseRawEvents getEvents path: js-xdr 4.0.0 caps decode recursion at DEFAULT_MAX_DEPTH=200 and throws a catchable XdrReaderError before any stack overflow"]
does_not_rule_out = ["sibling fromXDR decode sinks (parseTransactionInfo, parseRawSimulation, parseRawLedgerEntries) under a future js-xdr downgrade or overridden _maxDepth", "non-recursion linear-cost processing of uncapped response arrays (covered by prior route memory)"]
assumptions = ["no additional assumptions beyond cited source evidence", "the exact-pinned @stellar/js-xdr 4.0.0 in node_modules is the version resolved at install"]
mechanism_brief = "Server.getEvents -> parseRawEvents -> xdr.ScVal.fromXDR decodes attacker base64; js-xdr 4.0.0 bounds recursion at depth 200 (checkDepth throws XdrReaderError), so deeply nested ScVal throws long before stack overflow."
why_failed_brief = "js-xdr 4.0.0 enforces DEFAULT_MAX_DEPTH=200 with a decrementing remainingDepth checked on every nested read; recursion is bounded and the throw is a normal rejected promise, not a crash."
confidence = "high"

[[sanitizer_guarantees]]
kind = "constant_bound"
guarantee = "NestedXdrType.DEFAULT_MAX_DEPTH=200 with checkDepth throwing XdrReaderError at remainingDepth<0 bounds ScVal decode recursion well below Node's stack ceiling"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "VarArray.read fast-fails when declared length exceeds reader.remainingBytes(), bounding array width to the received response size"

[[blockers]]
kind = "depth_cap"
guarantee = "Union.read and VarArray.read call checkDepth and recurse with remainingDepth-1; fromXDR enters read with default depth 200, so nested ScVal throws a catchable error at ~200 levels"
```
