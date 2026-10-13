import { array, lazy, struct, uint32 } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { OWNED } from "../values/owned.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface ScpQuorumSetWire {
  threshold: number;
  validators: PublicKeyWire[];
  innerSets: ScpQuorumSetWire[];
}

/**
 * ```xdr
 * struct SCPQuorumSet
 * {
 *     uint32 threshold;
 *     NodeID validators<>;
 *     SCPQuorumSet innerSets<>;
 * };
 * ```
 */
export class ScpQuorumSet extends XdrValue {
  readonly threshold: number;
  readonly validators: PublicKey[];
  readonly innerSets: ScpQuorumSet[];

  static readonly schema: XdrType<ScpQuorumSetWire> = struct("ScpQuorumSet", {
    threshold: uint32(),
    validators: array(PublicKey.schema, UNBOUNDED_MAX_LENGTH),
    innerSets: array(
      lazy(() => ScpQuorumSet.schema),
      UNBOUNDED_MAX_LENGTH,
    ),
  });

  constructor(
    input: {
      threshold: number;
      validators: PublicKey[];
      innerSets: ScpQuorumSet[];
    },
    owned?: typeof OWNED,
  ) {
    super();
    this.threshold = input.threshold;
    this.validators =
      owned === OWNED ? input.validators : input.validators.slice();
    this.innerSets =
      owned === OWNED ? input.innerSets : input.innerSets.slice();
  }

  toXdrObject(): ScpQuorumSetWire {
    return {
      threshold: this.threshold,
      validators: this.validators.map((v) => v.toXdrObject()),
      innerSets: this.innerSets.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: ScpQuorumSetWire): ScpQuorumSet {
    return new ScpQuorumSet(
      {
        threshold: wire.threshold,
        validators: wire.validators.map((w) => PublicKey.fromXdrObject(w)),
        innerSets: wire.innerSets.map((w) => ScpQuorumSet.fromXdrObject(w)),
      },
      OWNED,
    );
  }
}
