import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ClaimAtom, type ClaimAtomWire } from "./claim-atom.js";
import {
  SimplePaymentResult,
  type SimplePaymentResultWire,
} from "./simple-payment-result.js";

export interface PathPaymentStrictSendResultSuccessWire {
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
export class PathPaymentStrictSendResultSuccess extends XdrValue {
  readonly offers: ClaimAtom[];
  readonly last: SimplePaymentResult;

  static readonly schema: XdrType<PathPaymentStrictSendResultSuccessWire> =
    struct("PathPaymentStrictSendResultSuccess", {
      offers: array(ClaimAtom.schema, UNBOUNDED_MAX_LENGTH),
      last: SimplePaymentResult.schema,
    });

  constructor(input: { offers: ClaimAtom[]; last: SimplePaymentResult }) {
    super();
    this.offers = input.offers;
    this.last = input.last;
  }

  toXdrObject(): PathPaymentStrictSendResultSuccessWire {
    return {
      offers: this.offers.map((v) => v.toXdrObject()),
      last: this.last.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: PathPaymentStrictSendResultSuccessWire,
  ): PathPaymentStrictSendResultSuccess {
    return new PathPaymentStrictSendResultSuccess({
      offers: wire.offers.map((w) => ClaimAtom.fromXdrObject(w)),
      last: SimplePaymentResult.fromXdrObject(wire.last),
    });
  }
}
