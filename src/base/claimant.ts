import xdr from "./xdr.js";
import { Keypair } from "./keypair.js";
import { StrKey } from "./strkey.js";

/**
 * Claimant class represents an xdr.Claimant
 *
 * The claim predicate is optional, it defaults to unconditional if none is specified.
 */
export class Claimant {
  private _destination: string;
  private _predicate: xdr.ClaimPredicate;

  /**
   * @param destination - The destination account ID.
   * @param predicate - The claim predicate.
   */
  constructor(destination: string, predicate?: xdr.ClaimPredicate) {
    if (!StrKey.isValidEd25519PublicKey(destination)) {
      throw new Error("Destination is invalid");
    }
    this._destination = destination;

    if (!predicate) {
      this._predicate = xdr.ClaimPredicate.claimPredicateUnconditional();
    } else if (predicate instanceof xdr.ClaimPredicate) {
      this._predicate = predicate;
    } else {
      throw new Error("Predicate should be an xdr.ClaimPredicate");
    }
  }

  /**
   * Returns an unconditional claim predicate
   */
  static predicateUnconditional(): xdr.ClaimPredicate {
    return xdr.ClaimPredicate.claimPredicateUnconditional();
  }

  /**
   * Returns an `and` claim predicate
   * @param left - an xdr.ClaimPredicate
   * @param right - an xdr.ClaimPredicate
   */
  static predicateAnd(
    left: xdr.ClaimPredicate,
    right: xdr.ClaimPredicate,
  ): xdr.ClaimPredicate {
    if (!(left instanceof xdr.ClaimPredicate)) {
      throw new Error("left Predicate should be an xdr.ClaimPredicate");
    }
    if (!(right instanceof xdr.ClaimPredicate)) {
      throw new Error("right Predicate should be an xdr.ClaimPredicate");
    }

    return xdr.ClaimPredicate.claimPredicateAnd([left, right]);
  }

  /**
   * Returns an `or` claim predicate
   * @param left - an xdr.ClaimPredicate
   * @param right - an xdr.ClaimPredicate
   */
  static predicateOr(
    left: xdr.ClaimPredicate,
    right: xdr.ClaimPredicate,
  ): xdr.ClaimPredicate {
    if (!(left instanceof xdr.ClaimPredicate)) {
      throw new Error("left Predicate should be an xdr.ClaimPredicate");
    }
    if (!(right instanceof xdr.ClaimPredicate)) {
      throw new Error("right Predicate should be an xdr.ClaimPredicate");
    }

    return xdr.ClaimPredicate.claimPredicateOr([left, right]);
  }

  /**
   * Returns a `not` claim predicate
   * @param predicate - an xdr.ClaimPredicate
   */
  static predicateNot(predicate: xdr.ClaimPredicate): xdr.ClaimPredicate {
    if (!(predicate instanceof xdr.ClaimPredicate)) {
      throw new Error("Predicate should be an xdr.ClaimPredicate");
    }

    return xdr.ClaimPredicate.claimPredicateNot(predicate);
  }

  /**
   * Returns a `BeforeAbsoluteTime` claim predicate
   *
   * This predicate will be fulfilled if the closing time of the ledger that
   * includes the CreateClaimableBalance operation is less than this (absolute)
   * Unix timestamp (expressed in seconds).
   *
   * @param absBefore - Unix epoch (in seconds) as a string
   */
  static predicateBeforeAbsoluteTime(absBefore: string): xdr.ClaimPredicate {
    return xdr.ClaimPredicate.claimPredicateBeforeAbsoluteTime(
      xdr.Int64.fromString(absBefore),
    );
  }

  /**
   * Returns a `BeforeRelativeTime` claim predicate
   *
   * This predicate will be fulfilled if the closing time of the ledger that
   * includes the CreateClaimableBalance operation plus this relative time delta
   * (in seconds) is less than the current time.
   *
   * @param seconds - seconds since closeTime of the ledger in which the ClaimableBalanceEntry was created (as string)
   */
  static predicateBeforeRelativeTime(seconds: string): xdr.ClaimPredicate {
    return xdr.ClaimPredicate.claimPredicateBeforeRelativeTime(
      xdr.Int64.fromString(seconds),
    );
  }

  /**
   * Returns a claimant object from its XDR object representation.
   * @param claimantXdr - The claimant xdr object.
   */
  static fromXDR(claimantXdr: xdr.Claimant): Claimant {
    let value;
    switch (claimantXdr.switch()) {
      case xdr.ClaimantType.claimantTypeV0():
        value = claimantXdr.v0();
        return new this(
          StrKey.encodeEd25519PublicKey(value.destination().ed25519()),
          value.predicate(),
        );
      default:
        throw new Error(`Invalid claimant type: ${claimantXdr.switch().name}`);
    }
  }

  /**
   * Returns the xdr object for this claimant.
   */
  toXDRObject(): xdr.Claimant {
    const claimant = new xdr.ClaimantV0({
      destination: Keypair.fromPublicKey(this._destination).xdrAccountId(),
      predicate: this._predicate,
    });

    return xdr.Claimant.claimantTypeV0(claimant);
  }

  /**
   * The destination account ID.
   */
  get destination() {
    return this._destination;
  }

  set destination(_value: string) {
    throw new Error("Claimant is immutable");
  }

  /**
   * The claim predicate.
   */
  get predicate() {
    return this._predicate;
  }

  set predicate(_value: xdr.ClaimPredicate) {
    throw new Error("Claimant is immutable");
  }
}
