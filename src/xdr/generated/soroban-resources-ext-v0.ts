import { array, struct, uint32 } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";

export interface SorobanResourcesExtV0Wire {
  archivedSorobanEntries: number[];
}

/**
 * ```xdr
 * struct SorobanResourcesExtV0
 * {
 *     // Vector of indices representing what Soroban
 *     // entries in the footprint are archived, based on the
 *     // order of keys provided in the readWrite footprint.
 *     uint32 archivedSorobanEntries<>;
 * };
 * ```
 */
export class SorobanResourcesExtV0 extends XdrValue {
  readonly archivedSorobanEntries: number[];

  static readonly schema: XdrType<SorobanResourcesExtV0Wire> = struct(
    "SorobanResourcesExtV0",
    {
      archivedSorobanEntries: array(uint32(), UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { archivedSorobanEntries: number[] }) {
    super();
    this.archivedSorobanEntries = input.archivedSorobanEntries;
  }

  toXdrObject(): SorobanResourcesExtV0Wire {
    return {
      archivedSorobanEntries: this.archivedSorobanEntries,
    };
  }

  static fromXdrObject(wire: SorobanResourcesExtV0Wire): SorobanResourcesExtV0 {
    return new SorobanResourcesExtV0({
      archivedSorobanEntries: wire.archivedSorobanEntries,
    });
  }
}
