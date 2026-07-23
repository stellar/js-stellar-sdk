import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  ClaimableBalanceId,
  type ClaimableBalanceIdWire,
} from "./claimable-balance-id.js";

export interface ClawbackClaimableBalanceOpWire {
  balanceId: ClaimableBalanceIdWire;
}

/**
 * ```xdr
 * struct ClawbackClaimableBalanceOp
 * {
 *     ClaimableBalanceID balanceID;
 * };
 * ```
 */
export class ClawbackClaimableBalanceOp extends XdrValue {
  readonly balanceId: ClaimableBalanceId;

  static readonly schema: XdrType<ClawbackClaimableBalanceOpWire> = struct(
    "ClawbackClaimableBalanceOp",
    {
      balanceId: ClaimableBalanceId.schema,
    },
  );

  constructor(input: { balanceId: ClaimableBalanceId }) {
    super();
    this.balanceId = input.balanceId;
  }

  toXdrObject(): ClawbackClaimableBalanceOpWire {
    return {
      balanceId: this.balanceId.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: ClawbackClaimableBalanceOpWire,
  ): ClawbackClaimableBalanceOp {
    return new ClawbackClaimableBalanceOp({
      balanceId: ClaimableBalanceId.fromXdrObject(wire.balanceId),
    });
  }
}
