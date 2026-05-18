import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ScEnvMetaEntryInterfaceVersionWire {
  protocol: number;
  preRelease: number;
}

/**
 * ```xdr
 * struct {
 *         uint32 protocol;
 *         uint32 preRelease;
 *     }
 * ```
 */
export class ScEnvMetaEntryInterfaceVersion extends XdrValue {
  readonly protocol: number;
  readonly preRelease: number;

  static readonly schema: XdrType<ScEnvMetaEntryInterfaceVersionWire> = struct(
    "ScEnvMetaEntryInterfaceVersion",
    {
      protocol: uint32(),
      preRelease: uint32(),
    },
  );

  constructor(input: { protocol: number; preRelease: number }) {
    super();
    this.protocol = input.protocol;
    this.preRelease = input.preRelease;
  }

  toXdrObject(): ScEnvMetaEntryInterfaceVersionWire {
    return {
      protocol: this.protocol,
      preRelease: this.preRelease,
    };
  }

  static fromXdrObject(
    wire: ScEnvMetaEntryInterfaceVersionWire,
  ): ScEnvMetaEntryInterfaceVersion {
    return new ScEnvMetaEntryInterfaceVersion({
      protocol: wire.protocol,
      preRelease: wire.preRelease,
    });
  }
}
