# F903: Path blocked: downstream type/shape confusion in web-auth/federation TOML consumers

**Subsystem**: stellartoml
**Source Dispatch Seed**: /Users/sagar/code/Stellar/JS-SDK/ai-summary/dispatch/stellartoml/903-residual-seed.md
**Verdict**: NOT_VIABLE

## Path Checked

`<anonymous> -> parse` (decoded `stellar.toml` object consumed by federation and web-auth)

Residual question: *downstream type/shape confusion in web-auth/federation consumers reading SIGNING_KEY/WEB_AUTH_ENDPOINT/FEDERATION_SERVER from the decoded object without type re-validation.*

## Blocker

The decoded object (`parse(response.data)`, index.ts:70) is typed `Api.StellarToml` but receives no runtime type check, so a malicious server can emit non-string TOML values for these fields. However, the only in-SDK consumer of the decoded object is `FederationServer.createForDomain`, which feeds `FEDERATION_SERVER` into `new URL(serverURL)` (server.ts:142) followed by an unconditional `protocol !== "https:"` gate (server.ts:154). Any non-string TOML value (number, bool, datetime, inline table) either coerces to a string-equivalent URL (e.g. a single-element array → same string the domain owner already controls) or throws `Invalid URL`; the https policy is never bypassed. web-auth never reads the decoded object: `src/webauth/` has no `Resolver`/TOML import, and `serverAccountID` is a caller-supplied `string` validated by `Keypair.fromPublicKey` (challenge_transaction.ts:439). SIGNING_KEY/WEB_AUTH_ENDPOINT extraction is application (caller) responsibility — out of scope.

## Evidence

- `src/stellartoml/index.ts:68-71` - `parse(response.data)` returns the object with no runtime field-type validation; TS types are advisory only.
- `src/federation/server.ts:128-134` - sole in-SDK consumer; `!tomlObject.FEDERATION_SERVER` falsy-guard then constructs `FederationServer` with the raw field.
- `src/federation/server.ts:142,154` - `new URL(serverURL)` normalizes/validates and the `protocol !== "https:" && !allowHttp` gate throws; type confusion cannot bypass the scheme policy.
- `src/webauth/challenge_transaction.ts:165,421,439` - `serverAccountID` is a caller-passed `string` validated via `Keypair.fromPublicKey`; no decoded-TOML field is read inside the SDK.

## Negative Scope

- Rules out: SDK-level type/shape confusion from non-string `FEDERATION_SERVER`/`SIGNING_KEY`/`WEB_AUTH_ENDPOINT` TOML values producing an unsafe URL, scheme-policy bypass, or unvalidated server key inside federation/web-auth SDK code.
- Does not rule out: application/caller code that reads these decoded fields directly without re-validation (out of scope as caller responsibility); the separately-tracked federation redirect scheme-preservation route (route_id js-sdk-3210675ec7643a3184fe756f).

```toml-index
schema = 1
verdict = "NOT_VIABLE"
failed_at = "hypothesis"
subsystem = "stellartoml"
route_id = "js-sdk-cf63bb7d677c95e5892218bb"
weakness = "json_deserialization"
record_kind = "residual_escalation"
path = ["<anonymous>", "parse"]
sink = "parse"
sink_role = "json_deserialization"
impact_class = "parse_integrity"
route_family = "json_deserialization"
material_effect = "re-investigate residual lead"
target_functions = ["src/stellartoml/index.ts:Resolver.resolve", "src/federation/server.ts:FederationServer.createForDomain", "src/federation/server.ts:FederationServer.constructor"]
scope.trust_boundary = "remote_domain_well_known_file"
scope.protocol_phase = "stellar_toml_resolution"
scope.auth_state = "https_required_unless_opted_out"
scope.attacker_control = "domain_and_toml_body"
scope.parser_state = "toml_decoded"
scope.size_class = "bounded_by_stellar_toml_max_size"
input_shape_tags = []
defense_tags = []
negative_claim.rules_out_codes = ["federation_server_url_normalized_by_url_ctor", "federation_https_protocol_gate_unconditional", "webauth_no_sdk_toml_consumer"]
rules_out = ["non-string FEDERATION_SERVER/SIGNING_KEY/WEB_AUTH_ENDPOINT TOML values causing SDK-level type/shape confusion, unsafe URL construction, or https scheme-policy bypass in federation/web-auth SDK code"]
does_not_rule_out = ["application/caller code reading decoded TOML fields without re-validation (caller responsibility)", "federation redirect scheme-preservation route js-sdk-3210675ec7643a3184fe756f"]
assumptions = ["no additional assumptions beyond cited source evidence"]
mechanism_brief = "decoded toml fields lack runtime type checks, but the only SDK consumer (federation FEDERATION_SERVER) normalizes via new URL() and an unconditional https protocol gate; web-auth reads no toml field in-SDK (serverAccountID is caller-supplied and key-validated)"
why_failed_brief = "type confusion either coerces to a string-equivalent URL or throws Invalid URL with no scheme-policy bypass; no in-SDK web-auth toml consumer exists"
confidence = "high"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "FederationServer constructor runs new URL(serverURL) then throws unless URL.protocol is https: (or allowHttp opted in), normalizing/rejecting any non-string FEDERATION_SERVER value (server.ts:142,154)"

[[sanitizer_guarantees]]
kind = "checked_guard"
guarantee = "web-auth validates the caller-supplied serverAccountID via Keypair.fromPublicKey and never reads SIGNING_KEY/WEB_AUTH_ENDPOINT from the decoded toml inside the SDK (challenge_transaction.ts:439)"

[[blockers]]
kind = "type_normalization"
guarantee = "new URL() coerces non-string FEDERATION_SERVER to a string-equivalent URL or throws Invalid URL, so type confusion yields no distinct unsafe behavior beyond an attacker-controlled string the domain owner already controls by design"
```
