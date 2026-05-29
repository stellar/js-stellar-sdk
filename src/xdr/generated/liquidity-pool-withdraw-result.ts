/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union } from "../types/union.js";
import { void as voidType } from "../types/void.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { LiquidityPoolWithdrawResultCode } from "./liquidity-pool-withdraw-result-code.js";

export type LiquidityPoolWithdrawResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 };

export type LiquidityPoolWithdrawResultVariantName =
  | "liquidityPoolWithdrawSuccess"
  | "liquidityPoolWithdrawMalformed"
  | "liquidityPoolWithdrawNoTrust"
  | "liquidityPoolWithdrawUnderfunded"
  | "liquidityPoolWithdrawLineFull"
  | "liquidityPoolWithdrawUnderMinimum"
  | "liquidityPoolWithdrawTrustlineFrozen";

/**
 * ```xdr
 * union LiquidityPoolWithdrawResult switch (LiquidityPoolWithdrawResultCode code)
 * {
 * case LIQUIDITY_POOL_WITHDRAW_SUCCESS:
 *     void;
 * case LIQUIDITY_POOL_WITHDRAW_MALFORMED:
 * case LIQUIDITY_POOL_WITHDRAW_NO_TRUST:
 * case LIQUIDITY_POOL_WITHDRAW_UNDERFUNDED:
 * case LIQUIDITY_POOL_WITHDRAW_LINE_FULL:
 * case LIQUIDITY_POOL_WITHDRAW_UNDER_MINIMUM:
 * case LIQUIDITY_POOL_WITHDRAW_TRUSTLINE_FROZEN:
 *     void;
 * };
 * ```
 */
abstract class LiquidityPoolWithdrawResultBase extends XdrValue {
  abstract readonly type: LiquidityPoolWithdrawResultVariantName;

  static readonly schema: XdrType<LiquidityPoolWithdrawResultWire> = union(
    "LiquidityPoolWithdrawResult",
    {
      switchOn: LiquidityPoolWithdrawResultCode.schema,
      cases: [
        case_("liquidityPoolWithdrawSuccess", 0, voidType()),
        case_("liquidityPoolWithdrawMalformed", -1, voidType()),
        case_("liquidityPoolWithdrawNoTrust", -2, voidType()),
        case_("liquidityPoolWithdrawUnderfunded", -3, voidType()),
        case_("liquidityPoolWithdrawLineFull", -4, voidType()),
        case_("liquidityPoolWithdrawUnderMinimum", -5, voidType()),
        case_("liquidityPoolWithdrawTrustlineFrozen", -6, voidType()),
      ],
      switchKey: "code",
    },
  );

  static liquidityPoolWithdrawSuccess(): LiquidityPoolWithdrawResultSuccess {
    return new LiquidityPoolWithdrawResultSuccess();
  }

  static liquidityPoolWithdrawMalformed(): LiquidityPoolWithdrawResultMalformed {
    return new LiquidityPoolWithdrawResultMalformed();
  }

  static liquidityPoolWithdrawNoTrust(): LiquidityPoolWithdrawResultNoTrust {
    return new LiquidityPoolWithdrawResultNoTrust();
  }

  static liquidityPoolWithdrawUnderfunded(): LiquidityPoolWithdrawResultUnderfunded {
    return new LiquidityPoolWithdrawResultUnderfunded();
  }

  static liquidityPoolWithdrawLineFull(): LiquidityPoolWithdrawResultLineFull {
    return new LiquidityPoolWithdrawResultLineFull();
  }

  static liquidityPoolWithdrawUnderMinimum(): LiquidityPoolWithdrawResultUnderMinimum {
    return new LiquidityPoolWithdrawResultUnderMinimum();
  }

  static liquidityPoolWithdrawTrustlineFrozen(): LiquidityPoolWithdrawResultTrustlineFrozen {
    return new LiquidityPoolWithdrawResultTrustlineFrozen();
  }

  static fromXdrObject(
    wire: LiquidityPoolWithdrawResultWire,
  ): LiquidityPoolWithdrawResult {
    switch (wire.code) {
      case 0:
        return new LiquidityPoolWithdrawResultSuccess();
      case -1:
        return new LiquidityPoolWithdrawResultMalformed();
      case -2:
        return new LiquidityPoolWithdrawResultNoTrust();
      case -3:
        return new LiquidityPoolWithdrawResultUnderfunded();
      case -4:
        return new LiquidityPoolWithdrawResultLineFull();
      case -5:
        return new LiquidityPoolWithdrawResultUnderMinimum();
      case -6:
        return new LiquidityPoolWithdrawResultTrustlineFrozen();
    }
  }

  abstract toXdrObject(): LiquidityPoolWithdrawResultWire;
}

export class LiquidityPoolWithdrawResultSuccess extends LiquidityPoolWithdrawResultBase {
  readonly type = "liquidityPoolWithdrawSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolWithdrawResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class LiquidityPoolWithdrawResultMalformed extends LiquidityPoolWithdrawResultBase {
  readonly type = "liquidityPoolWithdrawMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolWithdrawResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class LiquidityPoolWithdrawResultNoTrust extends LiquidityPoolWithdrawResultBase {
  readonly type = "liquidityPoolWithdrawNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolWithdrawResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class LiquidityPoolWithdrawResultUnderfunded extends LiquidityPoolWithdrawResultBase {
  readonly type = "liquidityPoolWithdrawUnderfunded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolWithdrawResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class LiquidityPoolWithdrawResultLineFull extends LiquidityPoolWithdrawResultBase {
  readonly type = "liquidityPoolWithdrawLineFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolWithdrawResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class LiquidityPoolWithdrawResultUnderMinimum extends LiquidityPoolWithdrawResultBase {
  readonly type = "liquidityPoolWithdrawUnderMinimum" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolWithdrawResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class LiquidityPoolWithdrawResultTrustlineFrozen extends LiquidityPoolWithdrawResultBase {
  readonly type = "liquidityPoolWithdrawTrustlineFrozen" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolWithdrawResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export type LiquidityPoolWithdrawResult =
  | LiquidityPoolWithdrawResultSuccess
  | LiquidityPoolWithdrawResultMalformed
  | LiquidityPoolWithdrawResultNoTrust
  | LiquidityPoolWithdrawResultUnderfunded
  | LiquidityPoolWithdrawResultLineFull
  | LiquidityPoolWithdrawResultUnderMinimum
  | LiquidityPoolWithdrawResultTrustlineFrozen;
export const LiquidityPoolWithdrawResult = LiquidityPoolWithdrawResultBase;
