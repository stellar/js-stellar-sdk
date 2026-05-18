import { struct } from "../types/struct.js";
import { uint32 } from "../types/uint32.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";

export interface ConfigSettingScpTimingWire {
  ledgerTargetCloseTimeMilliseconds: number;
  nominationTimeoutInitialMilliseconds: number;
  nominationTimeoutIncrementMilliseconds: number;
  ballotTimeoutInitialMilliseconds: number;
  ballotTimeoutIncrementMilliseconds: number;
}

/**
 * ```xdr
 * struct ConfigSettingSCPTiming {
 *     uint32 ledgerTargetCloseTimeMilliseconds;
 *     uint32 nominationTimeoutInitialMilliseconds;
 *     uint32 nominationTimeoutIncrementMilliseconds;
 *     uint32 ballotTimeoutInitialMilliseconds;
 *     uint32 ballotTimeoutIncrementMilliseconds;
 * };
 * ```
 */
export class ConfigSettingScpTiming extends XdrValue {
  readonly ledgerTargetCloseTimeMilliseconds: number;
  readonly nominationTimeoutInitialMilliseconds: number;
  readonly nominationTimeoutIncrementMilliseconds: number;
  readonly ballotTimeoutInitialMilliseconds: number;
  readonly ballotTimeoutIncrementMilliseconds: number;

  static readonly schema: XdrType<ConfigSettingScpTimingWire> = struct(
    "ConfigSettingScpTiming",
    {
      ledgerTargetCloseTimeMilliseconds: uint32(),
      nominationTimeoutInitialMilliseconds: uint32(),
      nominationTimeoutIncrementMilliseconds: uint32(),
      ballotTimeoutInitialMilliseconds: uint32(),
      ballotTimeoutIncrementMilliseconds: uint32(),
    },
  );

  constructor(input: {
    ledgerTargetCloseTimeMilliseconds: number;
    nominationTimeoutInitialMilliseconds: number;
    nominationTimeoutIncrementMilliseconds: number;
    ballotTimeoutInitialMilliseconds: number;
    ballotTimeoutIncrementMilliseconds: number;
  }) {
    super();
    this.ledgerTargetCloseTimeMilliseconds =
      input.ledgerTargetCloseTimeMilliseconds;
    this.nominationTimeoutInitialMilliseconds =
      input.nominationTimeoutInitialMilliseconds;
    this.nominationTimeoutIncrementMilliseconds =
      input.nominationTimeoutIncrementMilliseconds;
    this.ballotTimeoutInitialMilliseconds =
      input.ballotTimeoutInitialMilliseconds;
    this.ballotTimeoutIncrementMilliseconds =
      input.ballotTimeoutIncrementMilliseconds;
  }

  toXdrObject(): ConfigSettingScpTimingWire {
    return {
      ledgerTargetCloseTimeMilliseconds: this.ledgerTargetCloseTimeMilliseconds,
      nominationTimeoutInitialMilliseconds:
        this.nominationTimeoutInitialMilliseconds,
      nominationTimeoutIncrementMilliseconds:
        this.nominationTimeoutIncrementMilliseconds,
      ballotTimeoutInitialMilliseconds: this.ballotTimeoutInitialMilliseconds,
      ballotTimeoutIncrementMilliseconds:
        this.ballotTimeoutIncrementMilliseconds,
    };
  }

  static fromXdrObject(
    wire: ConfigSettingScpTimingWire,
  ): ConfigSettingScpTiming {
    return new ConfigSettingScpTiming({
      ledgerTargetCloseTimeMilliseconds: wire.ledgerTargetCloseTimeMilliseconds,
      nominationTimeoutInitialMilliseconds:
        wire.nominationTimeoutInitialMilliseconds,
      nominationTimeoutIncrementMilliseconds:
        wire.nominationTimeoutIncrementMilliseconds,
      ballotTimeoutInitialMilliseconds: wire.ballotTimeoutInitialMilliseconds,
      ballotTimeoutIncrementMilliseconds:
        wire.ballotTimeoutIncrementMilliseconds,
    });
  }
}
