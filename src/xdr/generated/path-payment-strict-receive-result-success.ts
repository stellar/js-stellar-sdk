import { struct } from "../types/struct.js";
import { array } from "../types/array.js";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ClaimAtom, type ClaimAtomWire } from "./claim-atom.js";
import {
  SimplePaymentResult,
  type SimplePaymentResultWire,
} from "./simple-payment-result.js";

export interface PathPaymentStrictReceiveResultSuccessWire {
  offers: ClaimAtomWire[];
  last: SimplePaymentResultWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         ClaimAtom offers<>;
 *         SimplePaymentResult last;
 *     }
 * ```
 */
export class PathPaymentStrictReceiveResultSuccess extends XdrValue {
  readonly offers: ClaimAtom[];
  readonly last: SimplePaymentResult;

  static readonly schema: XdrType<PathPaymentStrictReceiveResultSuccessWire> =
    struct("PathPaymentStrictReceiveResultSuccess", {
      offers: array(ClaimAtom.schema, UNBOUNDED_MAX_LENGTH),
      last: SimplePaymentResult.schema,
    });

  constructor(input: { offers: ClaimAtom[]; last: SimplePaymentResult }) {
    super();
    this.offers = input.offers;
    this.last = input.last;
  }

  toXdrObject(): PathPaymentStrictReceiveResultSuccessWire {
    return {
      offers: this.offers.map((v) => v.toXdrObject()),
      last: this.last.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: PathPaymentStrictReceiveResultSuccessWire,
  ): PathPaymentStrictReceiveResultSuccess {
    return new PathPaymentStrictReceiveResultSuccess({
      offers: wire.offers.map((w) => ClaimAtom.fromXdrObject(w)),
      last: SimplePaymentResult.fromXdrObject(wire.last),
    });
  }
}
