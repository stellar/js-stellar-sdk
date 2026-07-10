import { struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Value, type ValueWire } from "./value.js";

export interface ScpBallotWire {
  counter: number;
  value: ValueWire;
}

/**
 * ```xdr
 * struct SCPBallot
 * {
 *     uint32 counter; // n
 *     Value value;    // x
 * };
 * ```
 */
export class ScpBallot extends XdrValue {
  readonly counter: number;
  readonly value: Value;

  static readonly schema: XdrType<ScpBallotWire> = struct("ScpBallot", {
    counter: uint32(),
    value: Value.schema,
  });

  constructor(input: { counter: number; value: Value | Uint8Array | string }) {
    super();
    this.counter = input.counter;
    this.value =
      input.value instanceof Value ? input.value : new Value(input.value);
  }

  toXdrObject(): ScpBallotWire {
    return {
      counter: this.counter,
      value: this.value.toXdrObject(),
    };
  }

  static fromXdrObject(wire: ScpBallotWire): ScpBallot {
    return new ScpBallot({
      counter: wire.counter,
      value: Value.fromXdrObject(wire.value),
    });
  }
}
