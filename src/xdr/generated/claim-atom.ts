/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ClaimAtomType } from "./claim-atom-type.js";
import {
  ClaimOfferAtomV0,
  type ClaimOfferAtomV0Wire,
} from "./claim-offer-atom-v0.js";
import { ClaimOfferAtom, type ClaimOfferAtomWire } from "./claim-offer-atom.js";
import {
  ClaimLiquidityAtom,
  type ClaimLiquidityAtomWire,
} from "./claim-liquidity-atom.js";

export type ClaimAtomWire =
  | { type: 0; v0: ClaimOfferAtomV0Wire }
  | { type: 1; orderBook: ClaimOfferAtomWire }
  | { type: 2; liquidityPool: ClaimLiquidityAtomWire };

export type ClaimAtomVariantName =
  | "claimAtomTypeV0"
  | "claimAtomTypeOrderBook"
  | "claimAtomTypeLiquidityPool";

/**
 * ```xdr
 * union ClaimAtom switch (ClaimAtomType type)
 * {
 * case CLAIM_ATOM_TYPE_V0:
 *     ClaimOfferAtomV0 v0;
 * case CLAIM_ATOM_TYPE_ORDER_BOOK:
 *     ClaimOfferAtom orderBook;
 * case CLAIM_ATOM_TYPE_LIQUIDITY_POOL:
 *     ClaimLiquidityAtom liquidityPool;
 * };
 * ```
 */
abstract class ClaimAtomBase extends XdrValue {
  abstract readonly type: ClaimAtomVariantName;

  static readonly schema: XdrType<ClaimAtomWire> = union("ClaimAtom", {
    switchOn: ClaimAtomType.schema,
    cases: [
      case_("claimAtomTypeV0", 0, field("v0", ClaimOfferAtomV0.schema)),
      case_(
        "claimAtomTypeOrderBook",
        1,
        field("orderBook", ClaimOfferAtom.schema),
      ),
      case_(
        "claimAtomTypeLiquidityPool",
        2,
        field("liquidityPool", ClaimLiquidityAtom.schema),
      ),
    ],
  });

  static claimAtomTypeV0(v0: ClaimOfferAtomV0): ClaimAtomV0 {
    return new ClaimAtomV0(v0);
  }

  static claimAtomTypeOrderBook(orderBook: ClaimOfferAtom): ClaimAtomOrderBook {
    return new ClaimAtomOrderBook(orderBook);
  }

  static claimAtomTypeLiquidityPool(
    liquidityPool: ClaimLiquidityAtom,
  ): ClaimAtomLiquidityPool {
    return new ClaimAtomLiquidityPool(liquidityPool);
  }

  static fromXdrObject(wire: ClaimAtomWire): ClaimAtom {
    switch (wire.type) {
      case 0:
        return new ClaimAtomV0(ClaimOfferAtomV0.fromXdrObject(wire.v0));
      case 1:
        return new ClaimAtomOrderBook(
          ClaimOfferAtom.fromXdrObject(wire.orderBook),
        );
      case 2:
        return new ClaimAtomLiquidityPool(
          ClaimLiquidityAtom.fromXdrObject(wire.liquidityPool),
        );
    }
  }

  /**
   * Type guard narrowing an unknown value to a concrete ClaimAtom variant.
   * Use this instead of `instanceof ClaimAtom`: the exported `ClaimAtom` value
   * is the abstract base, so `instanceof` narrows to the base (not the
   * variant union) and forces a cast. `ClaimAtom.is(x)` narrows to the union.
   */
  static is(value: unknown): value is ClaimAtom {
    return value instanceof ClaimAtomBase;
  }

  abstract toXdrObject(): ClaimAtomWire;
}

export class ClaimAtomV0 extends ClaimAtomBase {
  readonly type = "claimAtomTypeV0" as const;
  readonly v0: ClaimOfferAtomV0;

  constructor(v0: ClaimOfferAtomV0) {
    super();
    this.v0 = v0;
  }

  get value(): ClaimOfferAtomV0 {
    return this.v0;
  }

  toXdrObject(): Extract<ClaimAtomWire, { type: 0 }> {
    return { type: 0, v0: this.v0.toXdrObject() };
  }
}

export class ClaimAtomOrderBook extends ClaimAtomBase {
  readonly type = "claimAtomTypeOrderBook" as const;
  readonly orderBook: ClaimOfferAtom;

  constructor(orderBook: ClaimOfferAtom) {
    super();
    this.orderBook = orderBook;
  }

  get value(): ClaimOfferAtom {
    return this.orderBook;
  }

  toXdrObject(): Extract<ClaimAtomWire, { type: 1 }> {
    return { type: 1, orderBook: this.orderBook.toXdrObject() };
  }
}

export class ClaimAtomLiquidityPool extends ClaimAtomBase {
  readonly type = "claimAtomTypeLiquidityPool" as const;
  readonly liquidityPool: ClaimLiquidityAtom;

  constructor(liquidityPool: ClaimLiquidityAtom) {
    super();
    this.liquidityPool = liquidityPool;
  }

  get value(): ClaimLiquidityAtom {
    return this.liquidityPool;
  }

  toXdrObject(): Extract<ClaimAtomWire, { type: 2 }> {
    return { type: 2, liquidityPool: this.liquidityPool.toXdrObject() };
  }
}

export type ClaimAtom =
  | ClaimAtomV0
  | ClaimAtomOrderBook
  | ClaimAtomLiquidityPool;
export const ClaimAtom = ClaimAtomBase;
