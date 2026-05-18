import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ClaimableBalanceId,
  type ClaimableBalanceIdWire,
} from "./claimable-balance-id.js";

export interface LedgerKeyClaimableBalanceWire {
  balanceId: ClaimableBalanceIdWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         ClaimableBalanceID balanceID;
 *     }
 * ```
 */
export class LedgerKeyClaimableBalance extends XdrValue {
  readonly balanceId: ClaimableBalanceId;

  static readonly schema: XdrType<LedgerKeyClaimableBalanceWire> = struct(
    "LedgerKeyClaimableBalance",
    {
      balanceId: ClaimableBalanceId.schema,
    },
  );

  constructor(input: { balanceId: ClaimableBalanceId }) {
    super();
    this.balanceId = input.balanceId;
  }

  toXdrObject(): LedgerKeyClaimableBalanceWire {
    return {
      balanceId: this.balanceId.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: LedgerKeyClaimableBalanceWire,
  ): LedgerKeyClaimableBalance {
    return new LedgerKeyClaimableBalance({
      balanceId: ClaimableBalanceId.fromXdrObject(wire.balanceId),
    });
  }
}
