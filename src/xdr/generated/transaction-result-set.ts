import { array, struct } from "@stellar/js-xdr";
import { UNBOUNDED_MAX_LENGTH, type XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import {
  TransactionResultPair,
  type TransactionResultPairWire,
} from "./transaction-result-pair.js";

export interface TransactionResultSetWire {
  results: TransactionResultPairWire[];
}

/**
 * ```xdr
 * struct TransactionResultSet
 * {
 *     TransactionResultPair results<>;
 * };
 * ```
 */
export class TransactionResultSet extends XdrValue {
  readonly results: TransactionResultPair[];

  static readonly schema: XdrType<TransactionResultSetWire> = struct(
    "TransactionResultSet",
    {
      results: array(TransactionResultPair.schema, UNBOUNDED_MAX_LENGTH),
    },
  );

  constructor(input: { results: TransactionResultPair[] }) {
    super();
    this.results = input.results;
  }

  toXdrObject(): TransactionResultSetWire {
    return {
      results: this.results.map((v) => v.toXdrObject()),
    };
  }

  static fromXdrObject(wire: TransactionResultSetWire): TransactionResultSet {
    return new TransactionResultSet({
      results: wire.results.map((w) => TransactionResultPair.fromXdrObject(w)),
    });
  }
}
