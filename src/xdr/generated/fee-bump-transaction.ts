import { struct } from "../types/struct.js";
import { int64 } from "../types/int64.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { MuxedAccount, type MuxedAccountWire } from "./muxed-account.js";
import {
  FeeBumpTransactionInnerTx,
  type FeeBumpTransactionInnerTxWire,
} from "./fee-bump-transaction-inner-tx.js";
import {
  FeeBumpTransactionExt,
  type FeeBumpTransactionExtWire,
} from "./fee-bump-transaction-ext.js";

export interface FeeBumpTransactionWire {
  feeSource: MuxedAccountWire;
  fee: bigint;
  innerTx: FeeBumpTransactionInnerTxWire;
  ext: FeeBumpTransactionExtWire;
}

/**
 * ```xdr
 * struct FeeBumpTransaction
 * {
 *     MuxedAccount feeSource;
 *     int64 fee;
 *     union switch (EnvelopeType type)
 *     {
 *     case ENVELOPE_TYPE_TX:
 *         TransactionV1Envelope v1;
 *     }
 *     innerTx;
 *     union switch (int v)
 *     {
 *     case 0:
 *         void;
 *     }
 *     ext;
 * };
 * ```
 */
export class FeeBumpTransaction extends XdrValue {
  readonly feeSource: MuxedAccount;
  readonly fee: bigint;
  readonly innerTx: FeeBumpTransactionInnerTx;
  readonly ext: FeeBumpTransactionExt;

  static readonly schema: XdrType<FeeBumpTransactionWire> = struct(
    "FeeBumpTransaction",
    {
      feeSource: MuxedAccount.schema,
      fee: int64(),
      innerTx: FeeBumpTransactionInnerTx.schema,
      ext: FeeBumpTransactionExt.schema,
    },
  );

  constructor(input: {
    feeSource: MuxedAccount;
    fee: bigint;
    innerTx: FeeBumpTransactionInnerTx;
    ext: FeeBumpTransactionExt;
  }) {
    super();
    this.feeSource = input.feeSource;
    this.fee = input.fee;
    this.innerTx = input.innerTx;
    this.ext = input.ext;
  }

  toXdrObject(): FeeBumpTransactionWire {
    return {
      feeSource: this.feeSource.toXdrObject(),
      fee: this.fee,
      innerTx: this.innerTx.toXdrObject(),
      ext: this.ext.toXdrObject(),
    };
  }

  static fromXdrObject(wire: FeeBumpTransactionWire): FeeBumpTransaction {
    return new FeeBumpTransaction({
      feeSource: MuxedAccount.fromXdrObject(wire.feeSource),
      fee: wire.fee,
      innerTx: FeeBumpTransactionInnerTx.fromXdrObject(wire.innerTx),
      ext: FeeBumpTransactionExt.fromXdrObject(wire.ext),
    });
  }
}
