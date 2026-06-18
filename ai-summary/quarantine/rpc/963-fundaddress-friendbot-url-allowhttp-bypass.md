# R963: fundAddress trusts remote getNetwork().friendbotUrl, bypassing the allowHttp/https policy

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/963-hypothesis-batch.md
**Candidate ID**: C1
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the full default-branch transport path for `fundAddress` in current source:

- **Constructor gate is serverURL-only.** `Server` constructor (src/rpc/server.ts:170-181) builds `this.serverURL = new URL(serverURL)` and throws only when
  `this.serverURL.protocol !== "https:" && !opts.allowHttp` (server.ts:176-180). The http client is created with `createHttpClient(opts.headers)` (server.ts:175) — `allowHttp` is **not** propagated to the transport layer, so the policy exists solely as a one-time check on the constructor URL.
- **getNetwork returns the raw result.** `getNetwork` (server.ts:937-943) returns `jsonrpc.postObject(..., "getNetwork")` verbatim; `postObject` (src/rpc/jsonrpc.ts:49-67) returns `response.data.result` with no field validation. `friendbotUrl` is therefore fully remote-controlled.
- **fundAddress POSTs to the remote URL with no scheme re-check.** `fundAddress` (server.ts:1317-1354) validates only the `address` argument via `StrKey.isValidEd25519PublicKey`/`isValidContract` (server.ts:1321-1328). It then assigns `friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl` (server.ts:1330) and POSTs `` `${friendbotUrl}?addr=${encodeURIComponent(address)}` `` directly via `this.httpClient.post` (server.ts:1336-1338). `encodeURIComponent` encodes only the `addr` value, not the base URL.
- **Transport layer performs no scheme enforcement.** `buildBoundedUrl` (src/http-client/fetch-client.ts:105-117) only prefixes a `baseURL` (none is set on the RPC client) and appends query params; there is no `https:`/`allowHttp` check on any code path in fetch-client.ts. `jsonrpc.postObject` likewise applies none.

The hypothesis's "Expected Behavior" is correct: an SDK constructed with `allowHttp=false` (the production default) opts into "no plaintext-HTTP requests from this instance." The actual behavior genuinely deviates — a remote response can redirect the funding POST to an `http://` or arbitrary-host URL. This is a real gap, not working-as-designed: the discovered friendbot URL is subject to no equivalent of the constructor gate.

## Findings

**Impact (Medium): HTTPS/allowHttp policy bypass for Friendbot requests, plus SSRF to attacker-chosen hosts.** A malicious, compromised, or MITM'd RPC server that the application connected to under the documented `allowHttp=false` policy can return `friendbotUrl = "http://attacker.example/"` (plaintext downgrade) or an internal target (`http://169.254.169.254/...`, `http://localhost:.../`) from `getNetwork`. The SDK issues the funding POST to that URL with the SDK's HTTPS policy fully bypassed. No caller misconfiguration is required beyond the normal usage contract of trusting the RPC endpoint and calling `fundAddress(address)` without an explicit `friendbotUrl`.

This maps directly to the objective's in-scope impact category "HTTPS policy or allowHttp gate bypass for federation, stellar.toml, RPC, Horizon, or Friendbot requests" (severity floor Medium). `fundAddress` is the non-deprecated, recommended production API (the deprecation note on `requestAirdrop` points callers here), so it carries the primary severity.

The funding POST body carries only the public `addr`, so this is not a secret-exfiltration vector by itself; the material effect is the off-policy/plaintext outbound POST and SSRF reachability. The returned `response.data.hash` is re-read via `getTransaction` against the trusted `serverURL` (server.ts:1340), so the decoded-response trust break is not the primary issue here — the URL/scheme-selection break is.

## Novelty

Checked against the injected PRIOR INVESTIGATIONS brief. Records [1]/[2] (js-sdk-c92e450a, `_sendTransaction` hash/status leaf values), [3] (js-sdk-3504706c, `toXDR` serialization), and [4] (js-sdk-4acdcae9, `assembleTransaction` auth adoption) all treat decoded responses as leaf/return values; none traces the `getNetwork().friendbotUrl -> httpClient.post` URL-selection / allowHttp-bypass flow. No typed duplicate or subsumption. Novel.

## PoC Guidance

- **Test file**: append to an existing `test/unit/server/*` RPC server test (e.g. a friendbot/airdrop or fund test) using the established mocked-`httpClient` pattern.
- **Setup**: construct `new Server("https://rpc.example", {})` (allowHttp defaults to false). Stub the JSON-RPC `getNetwork` response so `result.friendbotUrl = "http://attacker.internal/"`. Spy on/mocked `server.httpClient.post`.
- **Steps**: call `await server.fundAddress(<valid G... address>)` with no explicit `friendbotUrl` (stub the subsequent `getTransaction` to a SUCCESS so the call completes).
- **Assertion**: assert that `httpClient.post` was invoked with a URL beginning `http://attacker.internal/?addr=...` — i.e. a plaintext-HTTP request was issued despite `allowHttp=false`, demonstrating the policy bypass. Optionally assert no scheme guard throws.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-c7ee0ae8709778ef50975329"
weakness = "https/allowHttp policy bypass via remote-selected friendbot URL"
record_kind = "single_path"
path = ["<anonymous>", "client.post"]
sink = "client.post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/rpc/server.ts:fundAddress", "src/rpc/server.ts:getNetwork", "src/http-client/fetch-client.ts:buildBoundedUrl"]
scope.trust_boundary = "remote_rpc_server"
scope.protocol_phase = "rpc_response_parse_and_transaction_submission"
scope.auth_state = "server_selected_by_caller"
scope.attacker_control = "remote_response_and_caller_supplied_transaction"
scope.parser_state = "json_or_xdr_decoded"
scope.size_class = "bounded_by_rpc_response_and_xdr"
input_shape_tags = []
defense_tags = ["https_allowhttp_policy"]
negative_claim.claim_kind = "viable_candidate_not_blocked"
negative_claim.conditional = false
negative_claim.rules_out_codes = ["candidate_not_blocked_after_source_trace"]
rules_out = ["source trace confirms the constructor https/allowHttp gate (server.ts:176) covers only serverURL and the StrKey check (server.ts:1321-1328) covers only the address arg, so neither blocks the remote-selected friendbotUrl POST"]
does_not_rule_out = ["requestAirdrop friendbot URL sibling (C2 / R964)", "SSRF reachability to specific internal hosts beyond the plaintext-HTTP downgrade demonstration"]
assumptions = ["application connected to the RPC server under allowHttp=false and calls fundAddress without an explicit friendbotUrl (normal usage)", "remote RPC getNetwork response is attacker-influenced per the subsystem trust model"]
mechanism_brief = "fundAddress POSTs to friendbotUrl taken verbatim from the remote getNetwork() response; the https/allowHttp gate is enforced only on serverURL in the constructor and allowHttp is never passed to the http client, so a malicious RPC server can redirect the outbound POST to an http:// or internal URL."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/server.ts:Server.constructor"
guarantee = "constructor https/allowHttp gate covers serverURL only (server.ts:176); StrKey check covers the address arg only (server.ts:1321-1328); neither constrains the friendbotUrl"

[[blockers]]
kind = "not_found"
source = "src/http-client/fetch-client.ts:buildBoundedUrl"
guarantee = "no scheme/allowHttp validation found on the friendbotUrl path in fundAddress, getNetwork, jsonrpc.postObject, or buildBoundedUrl"
```
