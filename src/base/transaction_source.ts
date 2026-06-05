/**
 * The contract that {@link TransactionBuilder} requires of a transaction's
 * source account: a way to read the account's address and sequence number, and
 * to advance the sequence number in place (the builder calls
 * {@link TransactionSource.incrementSequenceNumber} when it builds a
 * transaction).
 *
 * Both the concrete {@link Account} and {@link MuxedAccount} classes implement
 * this, as does Horizon's `AccountResponse`. Implement it yourself if you manage
 * sequence numbers out-of-band (e.g. a server-side sequence pool) and want to
 * pass a custom source to {@link TransactionBuilder}.
 *
 * This is intentionally a brand-free structural interface: assignability is by
 * shape, not by class identity, so any account-like object that honors the
 * contract is accepted.
 */
export interface TransactionSource {
  /**
   * The source account's address — a `G…` account address or, for a muxed
   * source, its `M…` address.
   */
  accountId(): string;

  /** The current sequence number, as a string. */
  sequenceNumber(): string;

  /**
   * Increments the sequence number in place by one. {@link TransactionBuilder}
   * calls this when building a transaction so that the next transaction built
   * from the same source uses the next sequence number.
   */
  incrementSequenceNumber(): void;
}
