import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";

export interface HashIdPreimageOperationIdWire {
  sourceAccount: PublicKeyWire;
  seqNum: bigint;
  opNum: number;
}

/**
 * ```xdr
 * struct
 *     {
 *         AccountID sourceAccount;
 *         SequenceNumber seqNum;
 *         uint32 opNum;
 *     }
 * ```
 */
export class HashIdPreimageOperationId extends XdrValue {
  readonly sourceAccount: PublicKey;
  readonly seqNum: bigint;
  readonly opNum: number;

  static readonly schema: XdrType<HashIdPreimageOperationIdWire> = struct(
    "HashIdPreimageOperationId",
    {
      sourceAccount: PublicKey.schema,
      seqNum: int64(),
      opNum: uint32(),
    },
  );

  constructor(input: {
    sourceAccount: PublicKey;
    seqNum: bigint;
    opNum: number;
  }) {
    super();
    this.sourceAccount = input.sourceAccount;
    this.seqNum = input.seqNum;
    this.opNum = input.opNum;
  }

  toXdrObject(): HashIdPreimageOperationIdWire {
    return {
      sourceAccount: this.sourceAccount.toXdrObject(),
      seqNum: this.seqNum,
      opNum: this.opNum,
    };
  }

  static fromXdrObject(
    wire: HashIdPreimageOperationIdWire,
  ): HashIdPreimageOperationId {
    return new HashIdPreimageOperationId({
      sourceAccount: PublicKey.fromXdrObject(wire.sourceAccount),
      seqNum: wire.seqNum,
      opNum: wire.opNum,
    });
  }
}
