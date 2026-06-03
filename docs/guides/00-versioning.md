---
title: Versioning & Compatibility
description:
  Why to use the latest @stellar/stellar-sdk, where these docs apply, and how to
  find older docs and release notes.
---

# Versioning & Compatibility

## Use the latest version

We recommend always using the latest version of `@stellar/stellar-sdk` so your
application keeps working as expected on the Stellar network. The network
upgrades its protocol periodically, and an older SDK may not handle newer data —
for example, newer XDR will fail to decode when an older SDK version is used.

You can check the protocol version a network currently runs from its Horizon
root endpoint, in the `current_protocol_version` field — for example,
[horizon.stellar.org](https://horizon.stellar.org/) for Mainnet. Each network
(Testnet, Futurenet) exposes its own Horizon root.

## These docs cover the latest version only

This site documents only the latest version of `@stellar/stellar-sdk`. To read
docs for an older version, find its Git tag on the
[releases page](https://github.com/stellar/js-stellar-sdk/releases) and browse
the `docs/` directory at that ref on GitHub.

## What's new in each version

See the [release notes](https://github.com/stellar/js-stellar-sdk/releases) for
what changed in each release — breaking changes are clearly marked.
