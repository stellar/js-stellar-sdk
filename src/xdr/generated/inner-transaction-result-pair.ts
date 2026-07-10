import { struct } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { Hash, type HashWire } from "./hash.js";
import {
  InnerTransactionResult,
  type InnerTransactionResultWire,
} from "./inner-transaction-result.js";

export interface InnerTransactionResultPairWire {
  transactionHash: HashWire;
  result: InnerTransactionResultWire;
}

/**
 * ```xdr
 * struct InnerTransactionResultPair
 * {
 *     Hash transactionHash;          // hash of the inner transaction
 *     InnerTransactionResult result; // result for the inner transaction
 * };
 * ```
 */
export class InnerTransactionResultPair extends XdrValue {
  readonly transactionHash: Hash;
  readonly result: InnerTransactionResult;

  static readonly schema: XdrType<InnerTransactionResultPairWire> = struct(
    "InnerTransactionResultPair",
    {
      transactionHash: Hash.schema,
      result: InnerTransactionResult.schema,
    },
  );

  constructor(input: {
    transactionHash: Hash | Uint8Array | string;
    result: InnerTransactionResult;
  }) {
    super();
    this.transactionHash =
      input.transactionHash instanceof Hash
        ? input.transactionHash
        : new Hash(input.transactionHash);
    this.result = input.result;
  }

  toXdrObject(): InnerTransactionResultPairWire {
    return {
      transactionHash: this.transactionHash.toXdrObject(),
      result: this.result.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: InnerTransactionResultPairWire,
  ): InnerTransactionResultPair {
    return new InnerTransactionResultPair({
      transactionHash: Hash.fromXdrObject(wire.transactionHash),
      result: InnerTransactionResult.fromXdrObject(wire.result),
    });
  }
}
