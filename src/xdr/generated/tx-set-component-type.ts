import { enumType } from "@stellar/js-xdr";
import {
  EnumValue,
  enumFromName,
  enumFromValue,
} from "../values/enum-value.js";

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

  static readonly schema = enumType("TxSetComponentType", {
    txsetCompTxsMaybeDiscountedFee: 0,
  });

  static fromValue(value: number): TxSetComponentType {
    return enumFromValue(
      "TxSetComponentType",
      TxSetComponentType.schema,
      TxSetComponentType,
      value,
    );
  }

  static fromName(name: TxSetComponentTypeName): TxSetComponentType {
    return enumFromName("TxSetComponentType", TxSetComponentType, name);
  }

  static fromXdrObject(wire: number): TxSetComponentType {
    return TxSetComponentType.fromValue(wire);
  }
}
