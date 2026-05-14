import {
  ClaimPredicate,
  Claimant as XdrClaimant,
  ClaimantV0,
} from "./generated/index.js";
import { Keypair } from "./keypair.js";
import { StrKey } from "./strkey.js";

function isClaimPredicate(predicate: unknown): predicate is ClaimPredicate {
  return (
    typeof predicate === "object" &&
    predicate !== null &&
    "type" in predicate &&
    typeof predicate.type === "string"
  );
}

/**
 * Claimant class represents an XdrClaimant
 *
 * The claim predicate is optional, it defaults to unconditional if none is specified.
 */
export class Claimant {
  private _destination: string;
  private _predicate: ClaimPredicate;

  /**
   * @param destination - The destination account ID.
   * @param predicate - The claim predicate.
   */
  constructor(destination: string, predicate?: ClaimPredicate) {
    if (!StrKey.isValidEd25519PublicKey(destination)) {
      throw new Error("Destination is invalid");
    }
    this._destination = destination;

    if (!predicate) {
      this._predicate = ClaimPredicate.claimPredicateUnconditional();
    } else if (isClaimPredicate(predicate)) {
      this._predicate = predicate;
    } else {
      throw new Error("Predicate should be an ClaimPredicate");
    }
  }

  /**
   * Returns an unconditional claim predicate
   */
  static predicateUnconditional(): ClaimPredicate {
    return ClaimPredicate.claimPredicateUnconditional();
  }

  /**
   * Returns an `and` claim predicate
   * @param left - an ClaimPredicate
   * @param right - an ClaimPredicate
   */
  static predicateAnd(
    left: ClaimPredicate,
    right: ClaimPredicate,
  ): ClaimPredicate {
    if (!isClaimPredicate(left)) {
      throw new Error("left Predicate should be an ClaimPredicate");
    }
    if (!isClaimPredicate(right)) {
      throw new Error("right Predicate should be an ClaimPredicate");
    }

    return ClaimPredicate.claimPredicateAnd([left, right]);
  }

  /**
   * Returns an `or` claim predicate
   * @param left - an ClaimPredicate
   * @param right - an ClaimPredicate
   */
  static predicateOr(
    left: ClaimPredicate,
    right: ClaimPredicate,
  ): ClaimPredicate {
    if (!isClaimPredicate(left)) {
      throw new Error("left Predicate should be an ClaimPredicate");
    }
    if (!isClaimPredicate(right)) {
      throw new Error("right Predicate should be an ClaimPredicate");
    }

    return ClaimPredicate.claimPredicateOr([left, right]);
  }

  /**
   * Returns a `not` claim predicate
   * @param predicate - an ClaimPredicate
   */
  static predicateNot(predicate: ClaimPredicate): ClaimPredicate {
    if (!isClaimPredicate(predicate)) {
      throw new Error("Predicate should be an ClaimPredicate");
    }

    return ClaimPredicate.claimPredicateNot(predicate);
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
  static predicateBeforeAbsoluteTime(absBefore: string): ClaimPredicate {
    return ClaimPredicate.claimPredicateBeforeAbsoluteTime(BigInt(absBefore));
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
  static predicateBeforeRelativeTime(seconds: string): ClaimPredicate {
    return ClaimPredicate.claimPredicateBeforeRelativeTime(BigInt(seconds));
  }

  /**
   * Returns a claimant object from its XDR object representation.
   * @param claimantXdr - The claimant xdr object.
   */
  static fromXDR(claimantXdr: XdrClaimant): Claimant {
    switch (claimantXdr.type) {
      case "claimantTypeV0": {
        const value = claimantXdr.v0;
        return new this(
          StrKey.encodeEd25519PublicKey(Buffer.from(value.destination.ed25519)),
          value.predicate,
        );
      }
      default:
        throw new Error(`Invalid claimant type: ${claimantXdr.type}`);
    }
  }

  /**
   * Returns the xdr object for this claimant.
   */
  toXDRObject(): XdrClaimant {
    const claimant: ClaimantV0 = {
      destination: Keypair.fromPublicKey(this._destination).xdrAccountId(),
      predicate: this._predicate,
    };

    return XdrClaimant.claimantTypeV0(claimant);
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

  set predicate(_value: ClaimPredicate) {
    throw new Error("Claimant is immutable");
  }
}
