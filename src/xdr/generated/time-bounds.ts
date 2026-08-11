import { struct, uint64 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface TimeBoundsWire {
  minTime: bigint;
  maxTime: bigint;
}

/**
 * ```xdr
 * struct TimeBounds
 * {
 *     TimePoint minTime;
 *     TimePoint maxTime; // 0 here means no maxTime
 * };
 * ```
 */
export class TimeBounds extends XdrValue {
  readonly minTime: bigint;
  readonly maxTime: bigint;

  static readonly schema: XdrType<TimeBoundsWire> = struct("TimeBounds", {
    minTime: uint64(),
    maxTime: uint64(),
  });

  constructor(input: { minTime: bigint; maxTime: bigint }) {
    super();
    this.minTime = input.minTime;
    this.maxTime = input.maxTime;
  }

  toXdrObject(): TimeBoundsWire {
    return {
      minTime: this.minTime,
      maxTime: this.maxTime,
    };
  }

  static fromXdrObject(wire: TimeBoundsWire): TimeBounds {
    return new TimeBounds({
      minTime: wire.minTime,
      maxTime: wire.maxTime,
    });
  }
}
