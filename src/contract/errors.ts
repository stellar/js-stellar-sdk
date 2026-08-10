// Declared here rather than inline in the `Errors` maps that expose them, so
// the emitted declarations reference them by name. TypeScript infers and emits
// the full static side of an inline class expression, which drags
// `NodeJS.CallSite` (from `@types/node`'s `ErrorConstructor.prepareStackTrace`)
// into our public types.

// contract.AssembledTransaction.Errors
export class ExpiredStateError extends Error {}
export class RestoreFailureError extends Error {}
export class NeedsMoreSignaturesError extends Error {}
export class NoSignatureNeededError extends Error {}
export class NoUnsignedNonInvokerAuthEntriesError extends Error {}
export class NoSignerError extends Error {}
export class NotYetSimulatedError extends Error {}
export class FakeAccountError extends Error {}
export class SimulationFailedError extends Error {}
export class InternalWalletError extends Error {}
export class ExternalServiceError extends Error {}
export class InvalidClientRequestError extends Error {}
export class UserRejectedError extends Error {}

// contract.SentTransaction.Errors
export class SendFailedError extends Error {}
export class SendResultOnlyError extends Error {}
export class TransactionStillPendingError extends Error {}
