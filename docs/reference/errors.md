---
title: Errors
category: Errors
---

# Errors

## AccountRequiresMemoError

AccountRequiresMemoError is raised when a transaction is trying to submit an
operation to an account which requires a memo. See
[SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md)
for more information.

This error contains two attributes to help you identify the account requiring
the memo and the operation where the account is the destination

```ts
class AccountRequiresMemoError extends Error
```

**Source:** [src/errors/account_requires_memo.ts:20](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/errors/account_requires_memo.ts#L20)

## BadRequestError

BadRequestError is raised when a request made to Horizon is invalid in some
way (incorrect timebounds for trade call builders, for example.)

```ts
class BadRequestError extends NetworkError
```

**Source:** [src/errors/bad_request.ts:10](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/errors/bad_request.ts#L10)

## BadResponseError

BadResponseError is raised when a response from a
{@link Horizon} or {@link Federation}
server is invalid in some way. For example, a federation response may exceed
the maximum allowed size, or a transaction submission may have failed with
Horizon.

```ts
class BadResponseError extends NetworkError
```

**Source:** [src/errors/bad_response.ts:13](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/errors/bad_response.ts#L13)

## NetworkError

NetworkError is raised when an interaction with a Horizon server has caused
some kind of problem.

```ts
class NetworkError extends Error
```

**Source:** [src/errors/network.ts:16](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/errors/network.ts#L16)

## NotFoundError

NotFoundError is raised when the resource requested from Horizon is
unavailable.

```ts
class NotFoundError extends NetworkError
```

**Source:** [src/errors/not_found.ts:10](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/errors/not_found.ts#L10)

## WebAuth.InvalidChallengeError

InvalidChallengeError is raised when a challenge transaction does not meet
the requirements for a SEP-10 challenge transaction (for example, a non-zero
sequence number).

```ts
class InvalidChallengeError extends Error
```

**Source:** [src/webauth/errors.ts:8](https://github.com/stellar/js-stellar-sdk/blob/fbaf2a75a73b202bcc45a77c9e84a1a04beeb666/src/webauth/errors.ts#L8)
