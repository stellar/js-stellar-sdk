/**
 * A minimal implementation of Rust's `Result` type. Used for contract
 * methods that return Results, to maintain their distinction from methods
 * that simply either return a value or throw.
 */
export interface Result<T, E extends ErrorMessage = ErrorMessage> {
  unwrap(): T;
  unwrapErr(): E;
  isOk(): boolean;
  isErr(): boolean;
}

/**
 * Error interface containing the error message. Matches Rust's implementation.
 * Part of implementing {@link Result}, a minimal implementation of Rust's
 * `Result` type. Used for contract methods that return Results, to maintain
 * their distinction from methods that simply either return a value or throw.
 */
export interface ErrorMessage {
  message: string;
}

/**
 * Part of implementing {@link Result}, a minimal implementation of Rust's
 * `Result` type. Used for contract methods that return Results, to maintain
 * their distinction from methods that simply either return a value or throw.
 */
export class Ok<T> implements Result<T, never> {
  constructor(readonly value: T) {}
  unwrapErr(): never { throw new Error("No error") }
  unwrap() { return this.value }
  isOk() { return true }
  isErr() { return false }
}

/**
 * Part of implementing {@link Result}, a minimal implementation of Rust's
 * `Result` type. Used for contract methods that return Results, to maintain
 * their distinction from methods that simply either return a value or throw.
 */
export class Err<E extends ErrorMessage> implements Result<never, E> {
  constructor(readonly error: E) {}
  unwrapErr() { return this.error }
  unwrap(): never { throw new Error(this.error.message) }
  isOk() { return false }
  isErr() { return true }
}
