import { struct } from "../types/struct.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import {
  ClaimableBalanceId,
  type ClaimableBalanceIdWire,
} from "./claimable-balance-id.js";

export interface ClaimClaimableBalanceOpWire {
  balanceId: ClaimableBalanceIdWire;
}

/**
 * ```xdr
 * struct ClaimClaimableBalanceOp
 * {
 *     ClaimableBalanceID balanceID;
 * };
 * ```
 */
export class ClaimClaimableBalanceOp extends XdrValue {
  readonly balanceId: ClaimableBalanceId;

  static readonly schema: XdrType<ClaimClaimableBalanceOpWire> = struct(
    "ClaimClaimableBalanceOp",
    {
      balanceId: ClaimableBalanceId.schema,
    },
  );

  constructor(input: { balanceId: ClaimableBalanceId }) {
    super();
    this.balanceId = input.balanceId;
  }

  toXdrObject(): ClaimClaimableBalanceOpWire {
    return {
      balanceId: this.balanceId.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: ClaimClaimableBalanceOpWire,
  ): ClaimClaimableBalanceOp {
    return new ClaimClaimableBalanceOp({
      balanceId: ClaimableBalanceId.fromXdrObject(wire.balanceId),
    });
  }
}
