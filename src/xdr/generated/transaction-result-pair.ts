import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  TransactionResult,
  type TransactionResultWire,
} from "./transaction-result.js";

export interface TransactionResultPairWire {
  transactionHash: HashWire;
  result: TransactionResultWire;
}

/**
 * ```xdr
 * struct TransactionResultPair
 * {
 *     Hash transactionHash;
 *     TransactionResult result; // result for the transaction
 * };
 * ```
 */
export class TransactionResultPair extends XdrValue {
  readonly transactionHash: Hash;
  readonly result: TransactionResult;

  static readonly schema: XdrType<TransactionResultPairWire> = struct(
    "TransactionResultPair",
    {
      transactionHash: Hash.schema,
      result: TransactionResult.schema,
    },
  );

  constructor(input: {
    transactionHash: Hash | Uint8Array | string;
    result: TransactionResult;
  }) {
    super();
    this.transactionHash =
      input.transactionHash instanceof Hash
        ? input.transactionHash
        : new Hash(input.transactionHash);
    this.result = input.result;
  }

  toXdrObject(): TransactionResultPairWire {
    return {
      transactionHash: this.transactionHash.toXdrObject(),
      result: this.result.toXdrObject(),
    };
  }

  static fromXdrObject(wire: TransactionResultPairWire): TransactionResultPair {
    return new TransactionResultPair({
      transactionHash: Hash.fromXdrObject(wire.transactionHash),
      result: TransactionResult.fromXdrObject(wire.result),
    });
  }
}
