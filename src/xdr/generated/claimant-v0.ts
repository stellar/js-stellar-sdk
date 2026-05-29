import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { ClaimPredicate, type ClaimPredicateWire } from "./claim-predicate.js";

export interface ClaimantV0Wire {
  destination: PublicKeyWire;
  predicate: ClaimPredicateWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         AccountID destination;    // The account that can use this condition
 *         ClaimPredicate predicate; // Claimable if predicate is true
 *     }
 * ```
 */
export class ClaimantV0 extends XdrValue {
  readonly destination: PublicKey;
  readonly predicate: ClaimPredicate;

  static readonly schema: XdrType<ClaimantV0Wire> = struct("ClaimantV0", {
    destination: PublicKey.schema,
    predicate: ClaimPredicate.schema,
  });

  constructor(input: { destination: PublicKey; predicate: ClaimPredicate }) {
    super();
    this.destination = input.destination;
    this.predicate = input.predicate;
  }

  toXdrObject(): ClaimantV0Wire {
    return {
      destination: this.destination.toXdrObject(),
      predicate: this.predicate.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ClaimantV0Wire): ClaimantV0 {
    return new ClaimantV0({
      destination: PublicKey.fromXdrObject(wire.destination),
      predicate: ClaimPredicate.fromXdrObject(wire.predicate),
    });
  }
}
