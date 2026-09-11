# Release & Support Policy

This policy describes how `@stellar/stellar-sdk` is versioned, how long each release line is supported, and how the SDK tracks changes to the Stellar protocol. It applies to all releases from version 17 onward.

## Goals

- Developers can adopt protocol upgrades without being forced into a breaking SDK upgrade.  
- Breaking changes are rare, deliberate, and announced well in advance.  
- Every release line has a clear, published support status and end date.

## Versioning

The SDK follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

| Change type | Version bump |
| :---- | :---- |
| Breaking change to the SDK's public API, minimum runtime, or build/distribution format | **Major** |
| New protocol support (non-breaking), new SDK features, new deprecations | **Minor** |
| Bug fixes, security fixes, protocol parsing fixes, XDR updates that add no new public surface | **Patch** |

### Protocol changes are decoupled from major versions

SDK releases are independent of Stellar protocol releases. Support for a new protocol version ships in a **minor** release of every supported line, provided the change is non-breaking at the SDK API layer. A protocol upgrade requires a major SDK release only when it introduces breaking changes to the XDR definitions.

If a protocol change *cannot* be supported without breaking the SDK API, support for that protocol lands in the next major version only. This will be announced ahead of the protocol's mainnet activation so affected users can plan an upgrade.

## Release lines & support tiers

At any time the SDK has one **Active** line and may have one or more **Maintenance** lines.

| Tier | What it receives |
| :---- | :---- |
| **Active** | All new features, protocol support, bug fixes, and security fixes. This is where development happens. |
| **Maintenance** | Non-breaking protocol support (XDR updates, parsing fixes) and critical security fixes only. No new SDK features or general bug fixes are backported. |
| **End of Life (EOL)** | No updates of any kind. Users should upgrade to a supported line. |

### Support windows

- When a new major version is released, the previous major moves from Active to Maintenance and its end-of-support date is published at the same time, in the support table below.  
- The length of the Maintenance window is set per major release based on the scope of the breaking changes it introduces. Larger migrations receive longer windows.  
- Once published, an end-of-support date may be extended but will not be shortened.  
- A new major release does not extend the support window of any existing Maintenance line. The previous Active line becomes the Maintenance line going forward; any older Maintenance line continues only until its already-published end date, then moves to EOL.

Maintenance for a given line depends on protocol changes remaining non-breaking at the SDK API layer. See *Protocol changes are decoupled from major versions* above.

## Deprecation

- An API is deprecated by marking it `@deprecated` in JSDoc/TypeScript, documenting the replacement, and listing it in the changelog. Deprecation happens in a **minor** release.  
- Deprecated APIs continue to work for **at least one full major version** after the release in which they were deprecated. An API deprecated during `N.x` is not removed before `N+2.0.0`.  
- Removal of deprecated APIs is a breaking change and only happens in a major release.

## Runtime support

- The minimum supported Node.js version for a major line is fixed at that line's `.0.0` release and does not increase within the line.  
- Raising the minimum Node.js version is a breaking change and requires a major release.  
- Supported Node.js versions track the [Node.js release schedule](https://github.com/nodejs/release#release-schedule); the SDK targets versions that are in Active LTS or Maintenance LTS at the time of a major release.

## Communication

- Breaking changes and deprecations are announced in the changelog, GitHub release notes, and a migration guide published with each major release.  
- Changes to support dates are announced at least 60 days before a line moves to EOL.  
- The support table below is the source of truth for current status.

---

## Currently supported versions

| Version | Status | Released | Support ends |
| :---- | :---- | :---- | :---- |
| 17.x | Active | 2026-08-20 | — |
| 16.x | Maintenance | 2026-06-15 | 2027-03-31 |
| ≤ 15.x | End of Life | — | — |