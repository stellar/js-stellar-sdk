import { int64, struct, uint32 } from "@stellar/js-xdr";
import type { XdrType } from "@stellar/js-xdr";
import { XdrValue } from "../values/xdr-value.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { PoolId, type PoolIdWire } from "./pool-id.js";
import { Asset, type AssetWire } from "./asset.js";

export interface HashIdPreimageRevokeIdWire {
  sourceAccount: PublicKeyWire;
  seqNum: bigint;
  opNum: number;
  liquidityPoolId: PoolIdWire;
  asset: AssetWire;
}

/**
 * ```xdr
 * struct
 *     {
 *         AccountID sourceAccount;
 *         SequenceNumber seqNum;
 *         uint32 opNum;
 *         PoolID liquidityPoolID;
 *         Asset asset;
 *     }
 * ```
 */
export class HashIdPreimageRevokeId extends XdrValue {
  readonly sourceAccount: PublicKey;
  readonly seqNum: bigint;
  readonly opNum: number;
  readonly liquidityPoolId: PoolId;
  readonly asset: Asset;

  static readonly schema: XdrType<HashIdPreimageRevokeIdWire> = struct(
    "HashIdPreimageRevokeId",
    {
      sourceAccount: PublicKey.schema,
      seqNum: int64(),
      opNum: uint32(),
      liquidityPoolId: PoolId.schema,
      asset: Asset.schema,
    },
  );

  constructor(input: {
    sourceAccount: PublicKey;
    seqNum: bigint;
    opNum: number;
    liquidityPoolId: PoolId;
    asset: Asset;
  }) {
    super();
    this.sourceAccount = input.sourceAccount;
    this.seqNum = input.seqNum;
    this.opNum = input.opNum;
    this.liquidityPoolId = input.liquidityPoolId;
    this.asset = input.asset;
  }

  toXdrObject(): HashIdPreimageRevokeIdWire {
    return {
      sourceAccount: this.sourceAccount.toXdrObject(),
      seqNum: this.seqNum,
      opNum: this.opNum,
      liquidityPoolId: this.liquidityPoolId.toXdrObject(),
      asset: this.asset.toXdrObject(),
    };
  }

  static fromXdrObject(
    wire: HashIdPreimageRevokeIdWire,
  ): HashIdPreimageRevokeId {
    return new HashIdPreimageRevokeId({
      sourceAccount: PublicKey.fromXdrObject(wire.sourceAccount),
      seqNum: wire.seqNum,
      opNum: wire.opNum,
      liquidityPoolId: PoolId.fromXdrObject(wire.liquidityPoolId),
      asset: Asset.fromXdrObject(wire.asset),
    });
  }
}
