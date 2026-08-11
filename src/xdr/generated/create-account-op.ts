import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface CreateAccountOpWire {
  destination: PublicKeyWire;
  startingBalance: bigint;
}

/**
 * ```xdr
 * struct CreateAccountOp
 * {
 *     AccountID destination; // account to create
 *     int64 startingBalance; // amount they end up with
 * };
 * ```
 */
export class CreateAccountOp extends XdrValue {
  readonly destination: PublicKey;
  readonly startingBalance: bigint;

  static readonly schema: XdrType<CreateAccountOpWire> = struct(
    "CreateAccountOp",
    {
      destination: PublicKey.schema,
      startingBalance: int64(),
    },
  );

  constructor(input: { destination: PublicKey; startingBalance: bigint }) {
    super();
    this.destination = input.destination;
    this.startingBalance = input.startingBalance;
  }

  toXdrObject(): CreateAccountOpWire {
    return {
      destination: this.destination.toXdrObject(),
      startingBalance: this.startingBalance,
    };
  }

  static fromXdrObject(wire: CreateAccountOpWire): CreateAccountOp {
    return new CreateAccountOp({
      destination: PublicKey.fromXdrObject(wire.destination),
      startingBalance: wire.startingBalance,
    });
  }
}
