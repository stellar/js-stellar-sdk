import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  LedgerFootprint,
  type LedgerFootprintWire,
} from "./ledger-footprint.js";

export interface SorobanResourcesWire {
  footprint: LedgerFootprintWire;
  instructions: number;
  diskReadBytes: number;
  writeBytes: number;
}

/**
 * ```xdr
 * struct SorobanResources
 * {
 *     // The ledger footprint of the transaction.
 *     LedgerFootprint footprint;
 *     // The maximum number of instructions this transaction can use
 *     uint32 instructions;
 *
 *     // The maximum number of bytes this transaction can read from disk backed entries
 *     uint32 diskReadBytes;
 *     // The maximum number of bytes this transaction can write to ledger
 *     uint32 writeBytes;
 * };
 * ```
 */
export class SorobanResources extends XdrValue {
  readonly footprint: LedgerFootprint;
  readonly instructions: number;
  readonly diskReadBytes: number;
  readonly writeBytes: number;

  static readonly schema: XdrType<SorobanResourcesWire> = struct(
    "SorobanResources",
    {
      footprint: LedgerFootprint.schema,
      instructions: uint32(),
      diskReadBytes: uint32(),
      writeBytes: uint32(),
    },
  );

  constructor(input: {
    footprint: LedgerFootprint;
    instructions: number;
    diskReadBytes: number;
    writeBytes: number;
  }) {
    super();
    this.footprint = input.footprint;
    this.instructions = input.instructions;
    this.diskReadBytes = input.diskReadBytes;
    this.writeBytes = input.writeBytes;
  }

  toXdrObject(): SorobanResourcesWire {
    return {
      footprint: this.footprint.toXdrObject(),
      instructions: this.instructions,
      diskReadBytes: this.diskReadBytes,
      writeBytes: this.writeBytes,
    };
  }

  static fromXdrObject(wire: SorobanResourcesWire): SorobanResources {
    return new SorobanResources({
      footprint: LedgerFootprint.fromXdrObject(wire.footprint),
      instructions: wire.instructions,
      diskReadBytes: wire.diskReadBytes,
      writeBytes: wire.writeBytes,
    });
  }
}
