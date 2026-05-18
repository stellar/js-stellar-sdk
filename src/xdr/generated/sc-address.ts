/* eslint-disable @typescript-eslint/no-use-before-define */
// Abstract base ↔ concrete subclass references below are intentional and safe
// under class hoisting — every reference site runs after both classes are fully
// initialized.
import { case as case_, field, union } from "../types/union.js";
import type { XdrType } from "../core/xdr-type.js";
import { XdrValue } from "../values/xdr-value.js";
import { ScAddressType } from "./sc-address-type.js";
import { PublicKey, type PublicKeyWire } from "./public-key.js";
import { Hash, type HashWire } from "./hash.js";
import {
  MuxedEd25519Account,
  type MuxedEd25519AccountWire,
} from "./muxed-ed25519-account.js";
import {
  ClaimableBalanceId,
  type ClaimableBalanceIdWire,
} from "./claimable-balance-id.js";

export type ScAddressWire =
  | { type: 0; accountId: PublicKeyWire }
  | { type: 1; contractId: HashWire }
  | { type: 2; muxedAccount: MuxedEd25519AccountWire }
  | { type: 3; claimableBalanceId: ClaimableBalanceIdWire }
  | { type: 4; liquidityPoolId: HashWire };

export type ScAddressVariantName =
  | "scAddressTypeAccount"
  | "scAddressTypeContract"
  | "scAddressTypeMuxedAccount"
  | "scAddressTypeClaimableBalance"
  | "scAddressTypeLiquidityPool";

/**
 * ```xdr
 * union SCAddress switch (SCAddressType type)
 * {
 * case SC_ADDRESS_TYPE_ACCOUNT:
 *     AccountID accountId;
 * case SC_ADDRESS_TYPE_CONTRACT:
 *     ContractID contractId;
 * case SC_ADDRESS_TYPE_MUXED_ACCOUNT:
 *     MuxedEd25519Account muxedAccount;
 * case SC_ADDRESS_TYPE_CLAIMABLE_BALANCE:
 *     ClaimableBalanceID claimableBalanceId;
 * case SC_ADDRESS_TYPE_LIQUIDITY_POOL:
 *     PoolID liquidityPoolId;
 * };
 * ```
 */
abstract class ScAddressBase extends XdrValue {
  abstract readonly type: ScAddressVariantName;

  static readonly schema: XdrType<ScAddressWire> = union("ScAddress", {
    switchOn: ScAddressType.schema,
    cases: [
      case_("scAddressTypeAccount", 0, field("accountId", PublicKey.schema)),
      case_("scAddressTypeContract", 1, field("contractId", Hash.schema)),
      case_(
        "scAddressTypeMuxedAccount",
        2,
        field("muxedAccount", MuxedEd25519Account.schema),
      ),
      case_(
        "scAddressTypeClaimableBalance",
        3,
        field("claimableBalanceId", ClaimableBalanceId.schema),
      ),
      case_(
        "scAddressTypeLiquidityPool",
        4,
        field("liquidityPoolId", Hash.schema),
      ),
    ],
  });

  static scAddressTypeAccount(accountId: PublicKey): ScAddressAccount {
    return new ScAddressAccount(accountId);
  }

  static scAddressTypeContract(contractId: Hash): ScAddressContract {
    return new ScAddressContract(contractId);
  }

  static scAddressTypeMuxedAccount(
    muxedAccount: MuxedEd25519Account,
  ): ScAddressMuxedAccount {
    return new ScAddressMuxedAccount(muxedAccount);
  }

  static scAddressTypeClaimableBalance(
    claimableBalanceId: ClaimableBalanceId,
  ): ScAddressClaimableBalance {
    return new ScAddressClaimableBalance(claimableBalanceId);
  }

  static scAddressTypeLiquidityPool(
    liquidityPoolId: Hash,
  ): ScAddressLiquidityPool {
    return new ScAddressLiquidityPool(liquidityPoolId);
  }

  static fromXdrObject(wire: ScAddressWire): ScAddress {
    switch (wire.type) {
      case 0:
        return new ScAddressAccount(PublicKey.fromXdrObject(wire.accountId));
      case 1:
        return new ScAddressContract(Hash.fromXdrObject(wire.contractId));
      case 2:
        return new ScAddressMuxedAccount(
          MuxedEd25519Account.fromXdrObject(wire.muxedAccount),
        );
      case 3:
        return new ScAddressClaimableBalance(
          ClaimableBalanceId.fromXdrObject(wire.claimableBalanceId),
        );
      case 4:
        return new ScAddressLiquidityPool(
          Hash.fromXdrObject(wire.liquidityPoolId),
        );
    }
  }

  abstract toXdrObject(): ScAddressWire;
}

export class ScAddressAccount extends ScAddressBase {
  readonly type = "scAddressTypeAccount" as const;
  readonly accountId: PublicKey;

  constructor(accountId: PublicKey) {
    super();
    this.accountId = accountId;
  }

  get value(): PublicKey {
    return this.accountId;
  }

  toXdrObject(): Extract<ScAddressWire, { type: 0 }> {
    return { type: 0, accountId: this.accountId.toXdrObject() };
  }
}

export class ScAddressContract extends ScAddressBase {
  readonly type = "scAddressTypeContract" as const;
  readonly contractId: Hash;

  constructor(contractId: Hash) {
    super();
    this.contractId = contractId;
  }

  get value(): Hash {
    return this.contractId;
  }

  toXdrObject(): Extract<ScAddressWire, { type: 1 }> {
    return { type: 1, contractId: this.contractId.toXdrObject() };
  }
}

export class ScAddressMuxedAccount extends ScAddressBase {
  readonly type = "scAddressTypeMuxedAccount" as const;
  readonly muxedAccount: MuxedEd25519Account;

  constructor(muxedAccount: MuxedEd25519Account) {
    super();
    this.muxedAccount = muxedAccount;
  }

  get value(): MuxedEd25519Account {
    return this.muxedAccount;
  }

  toXdrObject(): Extract<ScAddressWire, { type: 2 }> {
    return { type: 2, muxedAccount: this.muxedAccount.toXdrObject() };
  }
}

export class ScAddressClaimableBalance extends ScAddressBase {
  readonly type = "scAddressTypeClaimableBalance" as const;
  readonly claimableBalanceId: ClaimableBalanceId;

  constructor(claimableBalanceId: ClaimableBalanceId) {
    super();
    this.claimableBalanceId = claimableBalanceId;
  }

  get value(): ClaimableBalanceId {
    return this.claimableBalanceId;
  }

  toXdrObject(): Extract<ScAddressWire, { type: 3 }> {
    return {
      type: 3,
      claimableBalanceId: this.claimableBalanceId.toXdrObject(),
    };
  }
}

export class ScAddressLiquidityPool extends ScAddressBase {
  readonly type = "scAddressTypeLiquidityPool" as const;
  readonly liquidityPoolId: Hash;

  constructor(liquidityPoolId: Hash) {
    super();
    this.liquidityPoolId = liquidityPoolId;
  }

  get value(): Hash {
    return this.liquidityPoolId;
  }

  toXdrObject(): Extract<ScAddressWire, { type: 4 }> {
    return { type: 4, liquidityPoolId: this.liquidityPoolId.toXdrObject() };
  }
}

export type ScAddress =
  | ScAddressAccount
  | ScAddressContract
  | ScAddressMuxedAccount
  | ScAddressClaimableBalance
  | ScAddressLiquidityPool;
export const ScAddress = ScAddressBase;
