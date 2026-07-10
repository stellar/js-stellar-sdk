import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface InflationPayoutWire {
  destination: PublicKeyWire;
  amount: bigint;
}

/**
 * ```xdr
 * struct InflationPayout // or use PaymentResultAtom to limit types?
 * {
 *     AccountID destination;
 *     int64 amount;
 * };
 * ```
 */
export class InflationPayout extends XdrValue {
  readonly destination: PublicKey;
  readonly amount: bigint;

  static readonly schema: XdrType<InflationPayoutWire> = struct(
    "InflationPayout",
    {
      destination: PublicKey.schema,
      amount: int64(),
    },
  );

  constructor(input: { destination: PublicKey; amount: bigint }) {
    super();
    this.destination = input.destination;
    this.amount = input.amount;
  }

  toXdrObject(): InflationPayoutWire {
    return {
      destination: this.destination.toXdrObject(),
      amount: this.amount,
    };
  }

  static fromXdrObject(wire: InflationPayoutWire): InflationPayout {
    return new InflationPayout({
      destination: PublicKey.fromXdrObject(wire.destination),
      amount: wire.amount,
    });
  }
}
