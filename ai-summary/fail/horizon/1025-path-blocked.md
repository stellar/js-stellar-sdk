# F1025: Path blocked: Async/sibling Horizon request issuance to caller-selected server

**Subsystem**: horizon
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/horizon/1025-path-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`submitAsyncTransaction -> this.ht ...   .post`

(area_seed; sibling request-issuance targets traced together: `submitAsyncTransaction`, `submitTransaction`/`post`, `_sendNormalRequest`/`httpClient.get`, `fetchTimebounds`, `getCurrentServerTime`.)

## Blocker

The network-request-integrity effects on this sibling set are either already
covered by a prior VIABLE finding or source-proven inert. The only attacker
lever on `fetchTimebounds` is `maxTime` (`minTime` is hardcoded `0`,
`server.ts:168,176`), and server-time injection into the signed envelope is
already the VIABLE finding on `route_id` `js-sdk-26e2014cc473b795c741c78d`
(far-future `date` header, no sanity bound). The far-past direction is
availability-only (tx_too_late, prior [2]). All decoded submit responses
(`result_xdr`/`offerResults`) are leaf return values never re-read by the SDK
for signing/fee/auth/sequence (`server.ts:355-527,584`). `_sendNormalRequest`
forces protocol/host to the constructor-validated server, blocking `_links`
SSRF/downgrade (`call_builder.ts:391-393`); `allowHttp` is validated once in the
constructor (`server.ts:120-122`). No distinct in-scope mechanism survives.

## Per-Target Disposition

- `fetchTimebounds` / `getCurrentServerTime`: server-time→signed-envelope is the
  known VIABLE finding; do not re-report. Both `maxTime` directions covered
  (future = VIABLE [4], past = availability NOT_VIABLE [2]). No third mode.
- `submitAsyncTransaction` / `submitTransaction` / `post`: response decoded and
  returned to caller; never re-read by SDK. Leaf return (prior [1]/[3]).
- `_sendNormalRequest` / `httpClient.get`: protocol+host forced to validated
  server on every link/pagination follow; SSRF/downgrade blocked (prior [3]).
- `checkMemoRequired` bridge: SEP-29 trusts the caller-selected server's own
  account data; a malicious server defeating it is inherent protocol trust,
  out of scope (no other SDK truth source; `server.ts:885-907`).

## Evidence

- `src/horizon/server.ts:155-184` - `fetchTimebounds` sets `minTime:0`, `maxTime = currentTime + seconds`; only lever is server-supplied `currentTime`.
- `src/horizon/horizon_axios_client.ts:73-110` - server time recorded with only NaN + 5-min staleness guards, no magnitude bound (already-VIABLE mechanism).
- `src/horizon/server.ts:355-527` - submit decodes `result_xdr`/`offerResults` and returns them as leaf values; not re-read by SDK.
- `src/horizon/call_builder.ts:387-399` - `_sendNormalRequest` forces `url.protocol`/`url.host` to validated server, blocking `_links` host/protocol rewrite.
- `src/horizon/server.ts:120-122` - constructor rejects insecure protocol unless `allowHttp`; protocol forced on subsequent requests.

## Negative Scope

- Rules out: distinct (non-time) network-request-integrity vuln on this sibling
  request-issuance set — result-XDR decode is leaf-return, `_links` SSRF/downgrade
  is host/protocol-forced, and `allowHttp` is constructor-validated.
- Does not rule out: the already-VIABLE server-time→signed-`maxTime` injection on
  `route_id` `js-sdk-26e2014cc473b795c741c78d`; downstream caller misuse of
  faithfully-decoded leaf results; SEP-29 memo-required reliance on server data.

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "horizon"
route_id = "js-sdk-3e3082d9789604107875d9c9"
weakness = "remote network-request integrity / response trust boundary"
record_kind = "area_seed"
path = ["submitAsyncTransaction", "this.ht ...   .post"]
sink = "this.ht ...   .post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["<anonymous>", "get", "this.ht ...    .get", "submitAsyncTransaction", "post", "this.ht ...   .post", "fetchTimebounds", "this.httpClient.get", "_sendNormalRequest", "getCurrentServerTime", "checkMemoRequired"]
scope.trust_boundary = "remote_horizon_server"
scope.protocol_phase = "horizon_request_response_and_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_horizon_response_and_xdr"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["decode_output_is_leaf_return_value", "remote_links_host_protocol_rewrite", "allowhttp_validated_in_constructor"]
rules_out = ["distinct non-time network-request-integrity vuln on async/sync submission and read request-issuance siblings: decoded result XDR is leaf-return, _links host/protocol is forced to validated server, allowHttp is constructor-validated"]
does_not_rule_out = ["already-VIABLE server-time injection into signed maxTime (route js-sdk-26e2014cc473b795c741c78d)", "downstream caller misuse of faithfully-decoded leaf results", "SEP-29 memo-required reliance on caller-selected server account data"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "Sibling Horizon request-issuance entry points either feed the already-VIABLE server-time injection, return faithfully-decoded leaf results the SDK never re-reads, or have protocol/host forced to the validated server."
why_failed_brief = "Only live network-integrity mechanism (server-time into signed maxTime) is already VIABLE elsewhere; remaining siblings are source-confirmed leaf-decode or protocol/host-forced."
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "_sendNormalRequest forces url.protocol and url.host to the constructor-validated server URL on every _links/pagination follow (call_builder.ts:391-393), and the constructor rejects insecure protocol unless allowHttp (server.ts:120-122)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "submitTransaction/submitAsyncTransaction decoded result_xdr/offerResults are returned to the caller and never re-read by the SDK for signing, fee, auth, sequence, or resubmission (server.ts:355-527,584)"

[[blockers]]
kind = "leaf_return_value"
guarantee = "decoded remote responses on the submission/read siblings are terminal return values; the only response field that re-enters SDK security logic is server time, which is the already-VIABLE finding on route js-sdk-26e2014cc473b795c741c78d"
```
