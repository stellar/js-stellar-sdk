import { int64, struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { ExtensionPoint, type ExtensionPointWire } from "./extension-point.js";

export interface SorobanTransactionMetaExtV1Wire {
  ext: ExtensionPointWire;
  totalNonRefundableResourceFeeCharged: bigint;
  totalRefundableResourceFeeCharged: bigint;
  rentFeeCharged: bigint;
}

/**
 * ```xdr
 * struct SorobanTransactionMetaExtV1
 * {
 *     ExtensionPoint ext;
 *
 *     // The following are the components of the overall Soroban resource fee
 *     // charged for the transaction.
 *     // The following relation holds:
 *     // `resourceFeeCharged = totalNonRefundableResourceFeeCharged + totalRefundableResourceFeeCharged`
 *     // where `resourceFeeCharged` is the overall fee charged for the
 *     // transaction. Also, `resourceFeeCharged` <= `sorobanData.resourceFee`
 *     // i.e.we never charge more than the declared resource fee.
 *     // The inclusion fee for charged the Soroban transaction can be found using
 *     // the following equation:
 *     // `result.feeCharged = resourceFeeCharged + inclusionFeeCharged`.
 *
 *     // Total amount (in stroops) that has been charged for non-refundable
 *     // Soroban resources.
 *     // Non-refundable resources are charged based on the usage declared in
 *     // the transaction envelope (such as `instructions`, `readBytes` etc.) and
 *     // is charged regardless of the success of the transaction.
 *     int64 totalNonRefundableResourceFeeCharged;
 *     // Total amount (in stroops) that has been charged for refundable
 *     // Soroban resource fees.
 *     // Currently this comprises the rent fee (`rentFeeCharged`) and the
 *     // fee for the events and return value.
 *     // Refundable resources are charged based on the actual resources usage.
 *     // Since currently refundable resources are only used for the successful
 *     // transactions, this will be `0` for failed transactions.
 *     int64 totalRefundableResourceFeeCharged;
 *     // Amount (in stroops) that has been charged for rent.
 *     // This is a part of `totalNonRefundableResourceFeeCharged`.
 *     int64 rentFeeCharged;
 * };
 * ```
 */
export class SorobanTransactionMetaExtV1 extends XdrValue {
  readonly ext: ExtensionPoint;
  readonly totalNonRefundableResourceFeeCharged: bigint;
  readonly totalRefundableResourceFeeCharged: bigint;
  readonly rentFeeCharged: bigint;

  static readonly schema: XdrType<SorobanTransactionMetaExtV1Wire> = struct(
    "SorobanTransactionMetaExtV1",
    {
      ext: ExtensionPoint.schema,
      totalNonRefundableResourceFeeCharged: int64(),
      totalRefundableResourceFeeCharged: int64(),
      rentFeeCharged: int64(),
    },
  );

  constructor(input: {
    ext: ExtensionPoint;
    totalNonRefundableResourceFeeCharged: bigint;
    totalRefundableResourceFeeCharged: bigint;
    rentFeeCharged: bigint;
  }) {
    super();
    this.ext = input.ext;
    this.totalNonRefundableResourceFeeCharged =
      input.totalNonRefundableResourceFeeCharged;
    this.totalRefundableResourceFeeCharged =
      input.totalRefundableResourceFeeCharged;
    this.rentFeeCharged = input.rentFeeCharged;
  }

  toXdrObject(): SorobanTransactionMetaExtV1Wire {
    return {
      ext: this.ext.toXdrObject(),
      totalNonRefundableResourceFeeCharged:
        this.totalNonRefundableResourceFeeCharged,
      totalRefundableResourceFeeCharged: this.totalRefundableResourceFeeCharged,
      rentFeeCharged: this.rentFeeCharged,
    };
  }

  static fromXdrObject(
    wire: SorobanTransactionMetaExtV1Wire,
  ): SorobanTransactionMetaExtV1 {
    return new SorobanTransactionMetaExtV1({
      ext: ExtensionPoint.fromXdrObject(wire.ext),
      totalNonRefundableResourceFeeCharged:
        wire.totalNonRefundableResourceFeeCharged,
      totalRefundableResourceFeeCharged: wire.totalRefundableResourceFeeCharged,
      rentFeeCharged: wire.rentFeeCharged,
    });
  }
}
