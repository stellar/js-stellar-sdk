---
title: Versioning & Compatibility
description: How SDK versions map to Stellar protocol versions, and why this site documents only the current major.
---

# Versioning & Compatibility

## SDK ↔ Protocol mapping

Each major version of `@stellar/stellar-sdk` is built against a
specific Stellar protocol version. From v27 onwards the SDK major
matches the protocol major (v27 → Protocol 27, v28 → Protocol 28, …).
For majors before v27, the protocol target is documented in the
[release notes](https://github.com/stellar/js-stellar-sdk/releases) of
the relevant tag.

| SDK major | Protocol | Status |
| --- | --- | --- |
| 15.x | (see release notes) | Current |

> The mapping table is intentionally minimal pre-v27. After v27 the
> table becomes 1:1 and self-explanatory.

## Why older majors aren't network-compatible

The Stellar network upgrades its protocol periodically. Once an
upgrade ships, transactions built with an SDK major that targets an
older protocol may use deprecated XDR shapes or fail validation. A
keypair or strkey doesn't depend on the protocol version, so basic key
manipulation remains usable across majors — but anything that
constructs, signs, or submits a transaction is protocol-bound.

Always use the SDK major that matches the protocol of the network
you're targeting (mainnet, testnet, or futurenet — each may run a
different protocol during a rollout window).

## Single-version docs policy

This site documents only the **current major** of
`@stellar/stellar-sdk`. We do not maintain a documentation archive
for older majors. The maintenance cost — keeping multiple parallel
reference trees in sync, ensuring cross-version links don't rot,
running multiple builds — outweighs the benefit, given that older
majors are rarely the right choice for new development (per the
network-compatibility note above).

## Finding docs for older versions

To browse documentation for a specific older SDK version:

1. Find the matching Git tag in the
   [stellar/js-stellar-sdk releases](https://github.com/stellar/js-stellar-sdk/releases)
   page.
2. Browse the `docs/` directory at that ref on GitHub. The reference
   pages under `docs/reference/` are committed at each release and
   their inline source links point to the source files at that
   release's commit SHA, so the link targets resolve correctly even
   when the docs site itself only shows the current major.
