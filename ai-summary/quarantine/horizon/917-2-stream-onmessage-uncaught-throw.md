# R917-2: Unguarded JSON.parse/_parseRecord in SSE onMessage handler escapes as uncaught throw

**Date**: 2026-06-17
**Subsystem**: horizon
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/horizon/917-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the streaming handler in `call_builder.ts:stream()`:

- Line 1: `import { EventSource } from "eventsource"` — the SDK depends on
  `eventsource ^4.1.0` (package.json:183), whose `EventSource` follows WHATWG
  dispatch semantics in Node.
- Lines 192-209 (`onMessage`): for a non-`close` frame,
  `const result = message.data ? this._parseRecord(JSON.parse(message.data)) : message;`
  (lines 198-200). There is **no** surrounding try/catch and **no** shape guard.
- Line 201: `if (result.paging_token)` dereferences `result` immediately after.
- Lines 217-224: `onMessage` is registered with
  `es.addEventListener("message", onMessage.bind(this))` (or `es.onmessage = ...`).
  It is **not** inside a promise chain, so a synchronous throw is not routed to
  any `.catch`.
- Lines 211-215 (`onError`): only invoked for the `"error"` event; it does not
  observe synchronous throws raised inside `onMessage`. `onClose` (180-190)
  likewise only handles close. So the documented `onerror` callback does not
  cover this failure.
- `_parseRecord` (lines 354-385): begins `if (!json._links)` (line 355). On a
  `null` argument this is `null._links`, a TypeError.

I empirically confirmed the throwing inputs:
- malformed/non-JSON `data` (e.g. `"{bad"`) → `JSON.parse` throws **SyntaxError**.
- `data === "null"` → `JSON.parse` yields `null` → `_parseRecord(null)` throws
  **TypeError** at line 355.
- A primitive such as `data === "42"` does **not** throw (`(42)._links` is
  `undefined`, `_parseRecord` returns `42`, and `result.paging_token` is a safe
  `undefined`). The reliable crash vectors are therefore malformed JSON and the
  `null` literal, not arbitrary primitives — the SyntaxError path is the
  simplest and most robust.

Validated expected behavior: `stream()` exposes an `onerror` callback
(EventSourceOptions, lines 19-25; doc at 101-110) as the documented channel for
streaming failures. A malformed frame from the server should surface through
`onerror`/recoverable handling, not as an uncaught synchronous throw. The code
deviates from that contract.

In Node, an uncaught throw from an EventTarget/EventEmitter listener is reported
through the uncaught-exception (or unhandled-rejection, if raised inside the
library's async read loop) mechanism, which terminates the process by default.
This is the concrete availability impact.

## Findings

A malicious or compromised Horizon server — or a MITM under `allowHttp` — that
the application is streaming from can send a single malformed SSE `message`
frame (non-JSON body, or the literal `null`) and crash the Node consumer of the
SDK. The application cannot intercept this through the SDK's documented `onerror`
handler because the throw originates synchronously inside the message listener,
not on the `error` event.

This is a remote-triggerable denial of service from a single in-scope response
frame, meeting the Medium floor for "bounded but material resource
exhaustion"/availability and the "JSON ... response processing ... exploitable
by a realistic remote server" impact category. Severity is held at Medium (not
High): no fund movement or transaction-content corruption occurs, and browser
consumers are unaffected (a throwing listener there is reported, not fatal) —
the process-crash impact is Node-specific, which is the reason for medium
confidence.

Not a duplicate: prior horizon json_deserialization records cover only
`submitTransaction` XDR leaf-return decoding, where throws are **catchable** by
the caller's `.catch` and rated Low. This finding is materially different — the
throw is **uncatchable** by application code (event listener, not promise) and
escapes to the runtime's uncaught-exception path. No prior record touches the
streaming `onMessage` handler.

## PoC Guidance

- **Test file**: append to the existing streaming tests in
  `test/unit/call_builder_test.js` (or the server stream tests) that already
  mock `EventSource`.
- **Setup**: replace/stub `EventSource` so the test can fire a synthetic
  `message` event with attacker-controlled `data`. Call a `.stream({...})`
  builder with an `onerror` spy.
- **Steps**: dispatch a `message` event with `data: "{bad"` (SyntaxError path)
  and, in a second case, `data: "null"` (TypeError-in-`_parseRecord` path).
- **Assertion**: assert that invoking the registered `onMessage` listener with
  the malformed frame **throws** (SyntaxError / TypeError) synchronously and
  that the `onerror` spy is **not** called — demonstrating the failure escapes
  the documented error channel. (Asserting the throw at the listener boundary is
  sufficient and avoids actually crashing the test process.)

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "horizon"
route_id = "js-sdk-1081a18ffde6555aa858c026"
weakness = "json_deserialization"
record_kind = "single_path"
path = ["onMessage", "JSON.parse"]
sink = "JSON.parse"
sink_role = "json_deserialization"
impact_class = "availability_uncaught_throw"
route_family = "json_deserialization"
material_effect = "json_deserialization"
target_functions = ["call_builder.ts:stream", "call_builder.ts:_parseRecord"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["onError (call_builder.ts:211-215) and onClose (180-190) handle only the error/close events and do not observe synchronous throws inside onMessage; there is no try/catch or shape guard around JSON.parse/_parseRecord (lines 198-200, 355), so a malformed or null frame throws uncaught"]
does_not_rule_out = ["Date.parse timebound integrity (see C1/R917-1)", "browser-only consumers where a throwing listener is reported but non-fatal", "primitive non-object frames (e.g. a bare number) which do not throw"]
assumptions = ["Node consumer where an uncaught listener throw / unhandled rejection terminates the process by default", "the connected server's SSE data is attacker-influenced consistent with the seed remote_horizon_server trust boundary"]
mechanism_brief = "SSE onMessage parses message.data with JSON.parse and dereferences via _parseRecord with no try/catch or shape guard; a malformed or null frame throws synchronously inside the event listener and escapes the documented onerror channel as an uncaught exception, crashing a Node consumer."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "call_builder.ts:stream"
guarantee = "onError/onClose handlers cover error/close events only, not synchronous throws inside onMessage"

[[blockers]]
kind = "not_found"
source = "call_builder.ts:stream"
guarantee = "no try/catch or shape validation around JSON.parse/_parseRecord in the streaming handler"
```
