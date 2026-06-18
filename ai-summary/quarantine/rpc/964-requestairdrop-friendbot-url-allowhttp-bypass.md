# R964: requestAirdrop trusts remote getNetwork().friendbotUrl, bypassing the allowHttp/https policy

**Date**: 2026-06-18
**Subsystem**: rpc
**Source Hypothesis Batch**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/hypothesis/rpc/963-hypothesis-batch.md
**Candidate ID**: C2
**Verdict**: VIABLE
**Severity**: Medium
**Reviewed by**: claude-opus-4-8, high

## Trace Summary

Traced the `requestAirdrop` default-branch transport path in current source; it is the sibling of R963 (C1) on the same uncovered transport.

- **requestAirdrop defaults friendbotUrl to the remote response.** `requestAirdrop` (src/rpc/server.ts:1239-1281) computes `account` from the address argument (server.ts:1243), then `friendbotUrl = friendbotUrl || (await this.getNetwork()).friendbotUrl` (server.ts:1244). Unlike `fundAddress`, there is no `StrKey` validation here at all.
- **POST to the remote URL with no scheme re-check.** It POSTs `` `${friendbotUrl}?addr=${encodeURIComponent(account)}` `` via `this.httpClient.post` (server.ts:1250-1252). `encodeURIComponent` encodes only the `addr` value.
- **getNetwork returns the raw remote result.** `getNetwork` (server.ts:937-943) → `jsonrpc.postObject` (src/rpc/jsonrpc.ts:49-67) returns `response.data.result` unvalidated; `friendbotUrl` is remote-controlled.
- **No transport-layer scheme enforcement.** As in R963, the constructor's `https:`/`allowHttp` gate (server.ts:176-180) covers only `serverURL`, `allowHttp` is never passed to `createHttpClient` (server.ts:175), and `buildBoundedUrl` (src/http-client/fetch-client.ts:105-117) performs no scheme check.
- **Error branch does not constrain the URL.** The 400-error handler (server.ts:1271-1278) only re-loads the account on `createAccountAlreadyExist`; it does not validate or sanitize the URL.

Expected behavior (the discovered friendbot URL should be subject to the configured `https:`/`allowHttp` policy) is correct and the code genuinely deviates. `requestAirdrop` is `@deprecated` (server.ts:1225-1226) in favor of `fundAddress`, but it remains a live exported production method on `Server`, so the transport flaw is reachable.

## Findings

**Impact (Medium): HTTPS/allowHttp policy bypass for Friendbot requests via the `requestAirdrop` entrypoint (plus SSRF to attacker-chosen hosts).** Identical mechanism to R963: a malicious/compromised/MITM'd RPC server connected to under `allowHttp=false` can return `friendbotUrl = "http://attacker.example/"` or an internal host from `getNetwork`, and `requestAirdrop(address)` (no explicit `friendbotUrl`) issues the POST off-policy. Maps to the in-scope impact category "HTTPS policy or allowHttp gate bypass ... for ... Friendbot requests" (Medium floor).

Deprecation reduces but does not eliminate exposure: the export is reachable and shares the exact uncovered path with `fundAddress`. R963 (C1, the non-deprecated equivalent) carries the primary severity; this record documents the sibling so the same typed route is recognized on both entrypoints.

## Novelty

Checked against the injected PRIOR INVESTIGATIONS brief. Records [1]-[4] all concern response decoding/serialization/auth-adoption leaf-value trust, not the `getNetwork().friendbotUrl -> httpClient.post` URL-selection / allowHttp-bypass flow. No typed duplicate or subsumption for this entrypoint. Novel.

## PoC Guidance

- **Test file**: append to an existing `test/unit/server/*` airdrop/friendbot test using the mocked-`httpClient` pattern.
- **Setup**: `new Server("https://rpc.example", {})` (allowHttp false). Stub `getNetwork` so `result.friendbotUrl = "http://attacker.internal/"`. Spy on `server.httpClient.post`. Stub the friendbot response so `result_meta_xdr` is present (avoids the `getTransaction` follow-up) or stub `getTransaction` to SUCCESS.
- **Steps**: call `await server.requestAirdrop(<valid G... address>)` with no explicit `friendbotUrl`.
- **Assertion**: assert `httpClient.post` was invoked with a URL beginning `http://attacker.internal/?addr=...`, demonstrating a plaintext-HTTP POST despite `allowHttp=false`.

```toml-index
schema = 1
verdict = "VIABLE"
failed_at = "reviewer"
subsystem = "rpc"
route_id = "js-sdk-c7ee0ae8709778ef50975329"
weakness = "https/allowHttp policy bypass via remote-selected friendbot URL (requestAirdrop sibling)"
record_kind = "single_path"
path = ["<anonymous>", "client.post"]
sink = "client.post"
sink_role = "network_request"
impact_class = "network_integrity"
route_family = "network_request"
material_effect = "network_request"
target_functions = ["src/rpc/server.ts:requestAirdrop", "src/rpc/server.ts:getNetwork"]
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
rules_out = ["source trace confirms the constructor https/allowHttp gate (server.ts:176) covers only serverURL and the 400-error branch (server.ts:1271-1278) does not validate the URL, so neither blocks the remote-selected friendbotUrl POST in requestAirdrop"]
does_not_rule_out = ["fundAddress friendbot URL sibling (C1 / R963)", "SSRF reachability to specific internal hosts beyond the plaintext-HTTP downgrade demonstration"]
assumptions = ["application connected to the RPC server under allowHttp=false and calls requestAirdrop without an explicit friendbotUrl", "remote RPC getNetwork response is attacker-influenced per the subsystem trust model", "deprecated method remains a reachable exported production API"]
mechanism_brief = "requestAirdrop POSTs to friendbotUrl taken verbatim from the remote getNetwork() response with no scheme/allowHttp re-validation; same uncovered transport path as fundAddress."
why_failed_brief = "viable; not failed"
confidence = "medium"

[[sanitizer_guarantees]]
kind = "checked_guard"
source = "src/rpc/server.ts:Server.constructor"
guarantee = "constructor https/allowHttp gate covers serverURL only (server.ts:176); allowHttp is not propagated to createHttpClient (server.ts:175)"

[[blockers]]
kind = "not_found"
source = "src/rpc/server.ts:requestAirdrop"
guarantee = "no scheme/allowHttp validation found on the requestAirdrop friendbotUrl path; the 400-error branch (server.ts:1271-1278) does not constrain the URL"
```
