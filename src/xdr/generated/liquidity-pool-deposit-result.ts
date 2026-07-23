/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, union, void as voidType } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { LiquidityPoolDepositResultCode } from "./liquidity-pool-deposit-result-code.js";

export type LiquidityPoolDepositResultWire =
  | { code: 0 }
  | { code: -1 }
  | { code: -2 }
  | { code: -3 }
  | { code: -4 }
  | { code: -5 }
  | { code: -6 }
  | { code: -7 }
  | { code: -8 };

export type LiquidityPoolDepositResultVariantName =
  | "liquidityPoolDepositSuccess"
  | "liquidityPoolDepositMalformed"
  | "liquidityPoolDepositNoTrust"
  | "liquidityPoolDepositNotAuthorized"
  | "liquidityPoolDepositUnderfunded"
  | "liquidityPoolDepositLineFull"
  | "liquidityPoolDepositBadPrice"
  | "liquidityPoolDepositPoolFull"
  | "liquidityPoolDepositTrustlineFrozen";

/**
 * ```xdr
 * union LiquidityPoolDepositResult switch (LiquidityPoolDepositResultCode code)
 * {
 * case LIQUIDITY_POOL_DEPOSIT_SUCCESS:
 *     void;
 * case LIQUIDITY_POOL_DEPOSIT_MALFORMED:
 * case LIQUIDITY_POOL_DEPOSIT_NO_TRUST:
 * case LIQUIDITY_POOL_DEPOSIT_NOT_AUTHORIZED:
 * case LIQUIDITY_POOL_DEPOSIT_UNDERFUNDED:
 * case LIQUIDITY_POOL_DEPOSIT_LINE_FULL:
 * case LIQUIDITY_POOL_DEPOSIT_BAD_PRICE:
 * case LIQUIDITY_POOL_DEPOSIT_POOL_FULL:
 * case LIQUIDITY_POOL_DEPOSIT_TRUSTLINE_FROZEN:
 *     void;
 * };
 * ```
 */
abstract class LiquidityPoolDepositResultBase extends XdrValue {
  abstract readonly type: LiquidityPoolDepositResultVariantName;

  static readonly schema: XdrType<LiquidityPoolDepositResultWire> = union(
    "LiquidityPoolDepositResult",
    {
      switchOn: LiquidityPoolDepositResultCode.schema,
      cases: [
        case_("liquidityPoolDepositSuccess", 0, voidType()),
        case_("liquidityPoolDepositMalformed", -1, voidType()),
        case_("liquidityPoolDepositNoTrust", -2, voidType()),
        case_("liquidityPoolDepositNotAuthorized", -3, voidType()),
        case_("liquidityPoolDepositUnderfunded", -4, voidType()),
        case_("liquidityPoolDepositLineFull", -5, voidType()),
        case_("liquidityPoolDepositBadPrice", -6, voidType()),
        case_("liquidityPoolDepositPoolFull", -7, voidType()),
        case_("liquidityPoolDepositTrustlineFrozen", -8, voidType()),
      ],
      switchKey: "code",
    },
  );

  static liquidityPoolDepositSuccess(): LiquidityPoolDepositResultSuccess {
    return new LiquidityPoolDepositResultSuccess();
  }

  static liquidityPoolDepositMalformed(): LiquidityPoolDepositResultMalformed {
    return new LiquidityPoolDepositResultMalformed();
  }

  static liquidityPoolDepositNoTrust(): LiquidityPoolDepositResultNoTrust {
    return new LiquidityPoolDepositResultNoTrust();
  }

  static liquidityPoolDepositNotAuthorized(): LiquidityPoolDepositResultNotAuthorized {
    return new LiquidityPoolDepositResultNotAuthorized();
  }

  static liquidityPoolDepositUnderfunded(): LiquidityPoolDepositResultUnderfunded {
    return new LiquidityPoolDepositResultUnderfunded();
  }

  static liquidityPoolDepositLineFull(): LiquidityPoolDepositResultLineFull {
    return new LiquidityPoolDepositResultLineFull();
  }

  static liquidityPoolDepositBadPrice(): LiquidityPoolDepositResultBadPrice {
    return new LiquidityPoolDepositResultBadPrice();
  }

  static liquidityPoolDepositPoolFull(): LiquidityPoolDepositResultPoolFull {
    return new LiquidityPoolDepositResultPoolFull();
  }

  static liquidityPoolDepositTrustlineFrozen(): LiquidityPoolDepositResultTrustlineFrozen {
    return new LiquidityPoolDepositResultTrustlineFrozen();
  }

  static fromXdrObject(
    wire: LiquidityPoolDepositResultWire,
  ): LiquidityPoolDepositResult {
    switch (wire.code) {
      case 0:
        return new LiquidityPoolDepositResultSuccess();
      case -1:
        return new LiquidityPoolDepositResultMalformed();
      case -2:
        return new LiquidityPoolDepositResultNoTrust();
      case -3:
        return new LiquidityPoolDepositResultNotAuthorized();
      case -4:
        return new LiquidityPoolDepositResultUnderfunded();
      case -5:
        return new LiquidityPoolDepositResultLineFull();
      case -6:
        return new LiquidityPoolDepositResultBadPrice();
      case -7:
        return new LiquidityPoolDepositResultPoolFull();
      case -8:
        return new LiquidityPoolDepositResultTrustlineFrozen();
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete LiquidityPoolDepositResult variant.
   * Use this instead of `instanceof LiquidityPoolDepositResult`: the exported `LiquidityPoolDepositResult` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `LiquidityPoolDepositResult.is(x)` narrows to the union.
   */
  static is(value: unknown): value is LiquidityPoolDepositResult {
    return value instanceof LiquidityPoolDepositResultBase;
  }

  abstract toXdrObject(): LiquidityPoolDepositResultWire;
}

export class LiquidityPoolDepositResultSuccess extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositSuccess" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: 0 }> {
    return { code: 0 };
  }
}

export class LiquidityPoolDepositResultMalformed extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositMalformed" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: -1 }> {
    return { code: -1 };
  }
}

export class LiquidityPoolDepositResultNoTrust extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositNoTrust" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: -2 }> {
    return { code: -2 };
  }
}

export class LiquidityPoolDepositResultNotAuthorized extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositNotAuthorized" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: -3 }> {
    return { code: -3 };
  }
}

export class LiquidityPoolDepositResultUnderfunded extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositUnderfunded" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: -4 }> {
    return { code: -4 };
  }
}

export class LiquidityPoolDepositResultLineFull extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositLineFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: -5 }> {
    return { code: -5 };
  }
}

export class LiquidityPoolDepositResultBadPrice extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositBadPrice" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: -6 }> {
    return { code: -6 };
  }
}

export class LiquidityPoolDepositResultPoolFull extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositPoolFull" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: -7 }> {
    return { code: -7 };
  }
}

export class LiquidityPoolDepositResultTrustlineFrozen extends LiquidityPoolDepositResultBase {
  readonly type = "liquidityPoolDepositTrustlineFrozen" as const;

  get value(): null {
    return null;
  }

  toXdrObject(): Extract<LiquidityPoolDepositResultWire, { code: -8 }> {
    return { code: -8 };
  }
}

export type LiquidityPoolDepositResult =
  | LiquidityPoolDepositResultSuccess
  | LiquidityPoolDepositResultMalformed
  | LiquidityPoolDepositResultNoTrust
  | LiquidityPoolDepositResultNotAuthorized
  | LiquidityPoolDepositResultUnderfunded
  | LiquidityPoolDepositResultLineFull
  | LiquidityPoolDepositResultBadPrice
  | LiquidityPoolDepositResultPoolFull
  | LiquidityPoolDepositResultTrustlineFrozen;
export const LiquidityPoolDepositResult = LiquidityPoolDepositResultBase;
