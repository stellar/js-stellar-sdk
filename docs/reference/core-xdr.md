---
title: Core / XDR
description: XDR encoding utilities and hashing helpers used by the SDK internally and re-exported for callers.
---

# Core / XDR

## hash

Computes the SHA-256 hash of the given data.

```ts
hash(data: string | Buffer<ArrayBufferLike>): Buffer
```

**Parameters**

- **`data`** — `string | Buffer<ArrayBufferLike>` (required) — the data to hash

**Source:** [src/base/hashing.ts:8](https://github.com/stellar/js-stellar-sdk/blob/master/src/base/hashing.ts#L8)
