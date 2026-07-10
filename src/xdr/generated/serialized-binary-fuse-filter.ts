import { struct, uint32, varOpaque } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  BinaryFuseFilterType,
  type BinaryFuseFilterTypeWire,
} from "./binary-fuse-filter-type.js";
import { ShortHashSeed, type ShortHashSeedWire } from "./short-hash-seed.js";

export interface SerializedBinaryFuseFilterWire {
  type: BinaryFuseFilterTypeWire;
  inputHashSeed: ShortHashSeedWire;
  filterSeed: ShortHashSeedWire;
  segmentLength: number;
  segementLengthMask: number;
  segmentCount: number;
  segmentCountLength: number;
  fingerprintLength: number;
  fingerprints: Uint8Array;
}

/**
 * ```xdr
 * struct SerializedBinaryFuseFilter
 * {
 *     BinaryFuseFilterType type;
 *
 *     // Seed used to hash input to filter
 *     ShortHashSeed inputHashSeed;
 *
 *     // Seed used for internal filter hash operations
 *     ShortHashSeed filterSeed;
 *     uint32 segmentLength;
 *     uint32 segementLengthMask;
 *     uint32 segmentCount;
 *     uint32 segmentCountLength;
 *     uint32 fingerprintLength; // Length in terms of element count, not bytes
 *
 *     // Array of uint8_t, uint16_t, or uint32_t depending on filter type
 *     opaque fingerprints<>;
 * };
 * ```
 */
export class SerializedBinaryFuseFilter extends XdrValue {
  readonly type: BinaryFuseFilterType;
  readonly inputHashSeed: ShortHashSeed;
  readonly filterSeed: ShortHashSeed;
  readonly segmentLength: number;
  readonly segementLengthMask: number;
  readonly segmentCount: number;
  readonly segmentCountLength: number;
  readonly fingerprintLength: number;
  readonly fingerprints: Uint8Array;

  static readonly schema: XdrType<SerializedBinaryFuseFilterWire> = struct(
    "SerializedBinaryFuseFilter",
    {
      type: BinaryFuseFilterType.schema,
      inputHashSeed: ShortHashSeed.schema,
      filterSeed: ShortHashSeed.schema,
      segmentLength: uint32(),
      segementLengthMask: uint32(),
      segmentCount: uint32(),
      segmentCountLength: uint32(),
      fingerprintLength: uint32(),
      fingerprints: varOpaque(UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: {
    type: BinaryFuseFilterType;
    inputHashSeed: ShortHashSeed;
    filterSeed: ShortHashSeed;
    segmentLength: number;
    segementLengthMask: number;
    segmentCount: number;
    segmentCountLength: number;
    fingerprintLength: number;
    fingerprints: Uint8Array;
  }) {
    super();
    this.type = input.type;
    this.inputHashSeed = input.inputHashSeed;
    this.filterSeed = input.filterSeed;
    this.segmentLength = input.segmentLength;
    this.segementLengthMask = input.segementLengthMask;
    this.segmentCount = input.segmentCount;
    this.segmentCountLength = input.segmentCountLength;
    this.fingerprintLength = input.fingerprintLength;
    this.fingerprints = input.fingerprints;
  }

  toXdrObject(): SerializedBinaryFuseFilterWire {
    return {
      type: this.type.toXdrObject(),
      inputHashSeed: this.inputHashSeed.toXdrObject(),
      filterSeed: this.filterSeed.toXdrObject(),
      segmentLength: this.segmentLength,
      segementLengthMask: this.segementLengthMask,
      segmentCount: this.segmentCount,
      segmentCountLength: this.segmentCountLength,
      fingerprintLength: this.fingerprintLength,
      fingerprints: this.fingerprints,
    };
  }

  static fromXdrObject(
    wire: SerializedBinaryFuseFilterWire,
  ): SerializedBinaryFuseFilter {
    return new SerializedBinaryFuseFilter({
      type: BinaryFuseFilterType.fromXdrObject(wire.type),
      inputHashSeed: ShortHashSeed.fromXdrObject(wire.inputHashSeed),
      filterSeed: ShortHashSeed.fromXdrObject(wire.filterSeed),
      segmentLength: wire.segmentLength,
      segementLengthMask: wire.segementLengthMask,
      segmentCount: wire.segmentCount,
      segmentCountLength: wire.segmentCountLength,
      fingerprintLength: wire.fingerprintLength,
      fingerprints: wire.fingerprints,
    });
  }
}
