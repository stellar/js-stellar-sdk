import { enumType } from "../types/enum.js";
import { XdrError } from "../core/error.js";
import { EnumValue, enumLookup } from "../values/enum-value.js";

export type TxSetComponentTypeWire = number;

export type TxSetComponentTypeName = "txsetCompTxsMaybeDiscountedFee";

/**
 * ```xdr
 * enum TxSetComponentType
 * {
 *   // txs with effective fee <= bid derived from a base fee (if any).
 *   // If base fee is not specified, no discount is applied.
 *   TXSET_COMP_TXS_MAYBE_DISCOUNTED_FEE = 0
 * };
 * ```
 */
export class TxSetComponentType extends EnumValue<TxSetComponentTypeName> {
  static readonly txsetCompTxsMaybeDiscountedFee = new TxSetComponentType(
    "txsetCompTxsMaybeDiscountedFee",
    0,
  );

  private static readonly byValue: Readonly<
    Record<number, TxSetComponentType>
  > = {
    0: TxSetComponentType.txsetCompTxsMaybeDiscountedFee,
  };

  static readonly schema = enumType("TxSetComponentType", {
    txsetCompTxsMaybeDiscountedFee: 0,
  });

  static fromValue(value: number): TxSetComponentType {
    return enumLookup(
      "TxSetComponentType",
      TxSetComponentType.byValue,
      value,
    ) as TxSetComponentType;
  }

  static fromName(name: TxSetComponentTypeName): TxSetComponentType {
    switch (name) {
      case "txsetCompTxsMaybeDiscountedFee":
        return TxSetComponentType.txsetCompTxsMaybeDiscountedFee;
      default:
        throw new XdrError(`TxSetComponentType: unknown name ${name}`);
    }
  }

  static fromXdrObject(wire: number): TxSetComponentType {
    return TxSetComponentType.fromValue(wire);
  }
}
