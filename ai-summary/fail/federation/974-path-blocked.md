# F974: Path blocked: federation _sendRequest redirect=follow residual (existing VIABLE)

**Subsystem**: federation
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/federation/974-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`_sendRequest -> httpCli ...    .get`

## Residual Question Resolved

The escalated residual asks for a concrete yes/no on "existing VIABLE
redirect=follow SSRF js-sdk-cda4d93790ffd066b1523001". **Yes — confirmed from
source as reachable and unguarded.** `_sendRequest` calls
`httpClient.get(url, { maxContentLength: FEDERATION_RESPONSE_MAX_SIZE, timeout })`
with **no** `maxRedirects` (server.ts:221-228). The adapter selector routes any
request with `maxContentLength` defined into `boundedFetchAdapter`
(fetch-client.ts:482-490). Inside the adapter `maxRedirects === undefined` sets
`managedRedirects=false`, so `redirect="follow"` (fetch-client.ts:348-359). The
manual hop loop that performs `stripCrossOriginAuth` and host/scheme handling
(fetch-client.ts:406-412) only runs for `redirect==="manual"`, so on this path
native fetch follows 3xx redirects with no host allowlist, same-origin check,
hop cap, or HTTPS-downgrade guard. This is identical scheme/host SSRF to the
reviewed VIABLE.

## Blocker

The confirmed mechanism is the exact reviewed VIABLE
`js-sdk-cda4d93790ffd066b1523001` (redirect=follow scheme/host SSRF on the
federation GET path). The no-re-report rule suppresses re-reporting an existing
VIABLE finding for the same path/sink/scope. Hunting for a DISTINCT Medium+
mechanism on the same path found none: bounded-response DoS is source-ruled-out
by `readBodyBounded`, which enforces the `FEDERATION_RESPONSE_MAX_SIZE` cap both
on the `content-length` header (fetch-client.ts:158-161) and on the streamed
running total with an early `reader.cancel()` (fetch-client.ts:176-181). The
only other response surface, the memo check (server.ts:229-236), validates only
that `memo` is a string and leaves `memo_type` unchecked; that is within the
trusted-resolver model and below the Medium floor, so it does not yield a
distinct in-scope finding here.

## Evidence

- `src/federation/server.ts:221-228` - `_sendRequest` passes `maxContentLength` and `timeout` only; no `maxRedirects`.
- `src/http-client/fetch-client.ts:348-359` - `maxRedirects===undefined` forces `redirect="follow"`, skipping managed hops.
- `src/http-client/fetch-client.ts:406-412` - host/scheme handling and `stripCrossOriginAuth` run only in the manual loop, never reached on this path.
- `src/http-client/fetch-client.ts:158-181` - `readBodyBounded` enforces the size cap via header and streamed total, closing bounded-response DoS.
- `src/federation/server.ts:229-236` - response handling only requires `memo` be a string; no distinct decoding gate beyond trusted-resolver model.

## Negative Scope

- Rules out: a NEW distinct Medium+ network-integrity or DoS mechanism on `_sendRequest -> get` beyond the reviewed VIABLE redirect=follow SSRF; bounded-response DoS is source-closed by `readBodyBounded` dual cap.
- Does not rule out: the redirect=follow scheme/host/HTTPS-downgrade SSRF itself, which remains VIABLE under `js-sdk-cda4d93790ffd066b1523001` (confirmed here, not re-reported); and the unchecked `memo_type` response surface as a possible lower-severity response-trust variant.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "federation"
route_id = "js-sdk-b9a6d6c3f02dabc691adcde3"
weakness = "network_request"
record_kind = "residual_escalation"
path = ["_sendRequest", "httpCli ...    .get"]
sink = "httpCli ...    .get"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "re-investigate residual lead"
target_functions = ["src/federation/server.ts:_sendRequest", "src/http-client/fetch-client.ts:boundedFetchAdapter", "src/http-client/fetch-client.ts:readBodyBounded"]
scope.trust_boundary = "remote_federation_server"
scope.protocol_phase = "federation_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_address_and_remote_response"
scope.parser_state = "json_decoded"
scope.size_class = "bounded_by_federation_response_limit"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["exact_typed_duplicate_of_prior_viable_js-sdk-cda4d93790ffd066b1523001", "federation_response_size_enforced"]
rules_out = ["new distinct Medium+ mechanism on _sendRequest->get beyond reviewed VIABLE redirect=follow SSRF", "bounded-response DoS on _sendRequest GET path (readBodyBounded enforces FEDERATION_RESPONSE_MAX_SIZE via header and streamed-total checks)"]
does_not_rule_out = ["redirect=follow scheme/host/HTTPS-downgrade SSRF remains VIABLE under js-sdk-cda4d93790ffd066b1523001 (confirmed, not re-reported)", "unchecked memo_type response-trust surface as a possible lower-severity variant"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "_sendRequest passes maxContentLength but no maxRedirects, so boundedFetchAdapter sets redirect=follow and native fetch follows cross-origin/HTTPS-downgrade redirects with no host/scheme/hop guard; this is the exact reviewed VIABLE redirect=follow SSRF, and no distinct Medium+ mechanism remains (bounded DoS source-closed by readBodyBounded)."
why_failed_brief = "confirmed residual SSRF is the exact reviewed VIABLE js-sdk-cda4d93790ffd066b1523001 (no-re-report); no distinct Medium+ mechanism survives on this path."
confidence = "high"

[[sanitizer_guarantees]]
kind = "size_cap"
guarantee = "readBodyBounded enforces FEDERATION_RESPONSE_MAX_SIZE on both the content-length header (fetch-client.ts:158-161) and the streamed running total with early cancel (fetch-client.ts:176-181), closing bounded-response DoS on this GET path."

[[blockers]]
kind = "duplicate_of_prior_viable"
guarantee = "redirect=follow scheme/host SSRF on the federation GET path (server.ts:221-228 -> fetch-client.ts:348-359, host/auth guard at 406-412 unreached) is the exact reviewed VIABLE js-sdk-cda4d93790ffd066b1523001; re-reporting is suppressed by the no-re-report rule."
```
